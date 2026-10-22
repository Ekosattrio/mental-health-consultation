import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServicePicker } from '../resources/js/components/patient/ServicePicker';
import { INITIAL_APPOINTMENTS, INITIAL_USERS, INITIAL_LANDING_CMS, INITIAL_PATIENT_CMS } from '../resources/js/data/mockData';
import { AppProvider } from '../resources/js/context/AppContext';
import { Footer } from '../resources/js/components/layout/Footer';
import { OverviewTab } from '../resources/js/components/patient/tabs/OverviewTab';
import { RescheduleAudit } from '../resources/js/components/common/RescheduleAudit';
import { updateOwnAccountProfile } from '../resources/js/utils/accountProfile';
import { persistBrowserValue, validateLandingCms, mergePatientCms } from '../resources/js/utils/cms';
import { fitTooltip } from '../resources/js/utils/tooltipPosition';
import { Appointment, ConsultationPackage } from '../resources/js/types';
import { PatientEndpoints, BookAppointmentPayload } from '../resources/js/api/patientEndpoints';
import { PatientController } from '../resources/js/controllers/PatientController';
import { computeDynamicSlotsForDate, PracticeScheduleSettings } from '../resources/js/data/scheduleConfig';
import { getMinimumBookingDate, getPracticeDate, timeSlotKey, findTimeSlot } from '../resources/js/utils/bookingPolicy';
import { readXsrfCookie } from '../resources/js/utils/csrf';
import { csvCell, csvRow, escapeHtml, spreadsheetText } from '../resources/js/utils/exportEncoding';
import { calculateInitialDp, FLAT_DP_AMOUNT, getRecordedCashIn, getTreatmentPlanBalance, getNextSessionBilling,
  getPlanBillingBalance, resolveBillingAppointment, buildCashInReportRows } from '../resources/js/utils/payments';
import { cancelPaidPlan } from '../resources/js/utils/appointmentWorkflow';
import { canRescheduleAppointment, rescheduleExistingAppointment, getScheduleVersion, assertScheduleVersion,
  requestPatientReschedule, applyPatientReschedule, getPatientRescheduleCount } from '../resources/js/utils/reschedulePolicy';
import { correctInitialPaymentProof, rejectInitialPaymentProof } from '../resources/js/utils/paymentProof';
import { calculatePackagePayableAmount } from '../resources/js/utils/discounts';
import { TreatmentPlansTab } from '../resources/js/components/psychologist/tabs/TreatmentPlansTab';
import { BookingHold, WORKFLOW_STORAGE_KEY, WORKFLOW_UPDATED_EVENT, commitWorkflow,
  readWorkflowState, savePaymentReconciliation, withWorkflowLock, findActivePatientHold } from '../resources/js/utils/workflowStore';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  failWrites = false;
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new DOMException('Quota exceeded', 'QuotaExceededError');
    this.values.set(key, value);
  }
}

// Emulate the browser's exclusive lock queue, not a claim about distributed locking.
class ExclusiveLocks {
  private tail = Promise.resolve();
  request<T>(_name: string, _options: object, callback: () => T | Promise<T>): Promise<T> {
    const next = this.tail.then(callback);
    this.tail = next.then(() => undefined, () => undefined);
    return next;
  }
}

let storage: MemoryStorage;
beforeEach(() => {
  storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: new EventTarget(), configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: { locks: new ExclusiveLocks() }, configurable: true });
  commitWorkflow(() => ({ appointments: [], holds: [], walkInPatients: [], reconciliations: [] }));
});

const appointment = (id: string): Appointment => ({ ...structuredClone(INITIAL_APPOINTMENTS[0]), id, totalAmount: 300000 });
const hold = (): BookingHold => ({
  id: 'hold-1', patientId: 'patient-1', psychologistId: 'psy-1', packageId: 'pkg-1',
  date: getMinimumBookingDate(), startTime: '09:00', endTime: '10:00', totalAmount: 300000,
  expiresAt: new Date(Date.now() + 60000).toISOString(), status: 'HELD'
});
const settings: PracticeScheduleSettings = {
  weeklyDays: Array.from({ length: 7 }, (_, dayIndex) => ({ dayIndex, dayName: String(dayIndex), isOpen: true,
    startTime: '09:00', endTime: '17:00', maxPatients: 1 })), holidays: [], customDateOverrides: []
};

test('expired holds do not resume or block active selection and their proof history remains recoverable', () => {
  const expired = { ...hold(), expiresAt: new Date(Date.now() - 1000).toISOString() };
  commitWorkflow(current => ({ ...current, holds: [expired] }));
  assert.equal(findActivePatientHold(readWorkflowState().holds, expired.patientId), undefined);
  const fresh = { ...hold(), id: 'fresh' };
  commitWorkflow(current => ({ ...current, holds: [fresh, ...current.holds] }));
  assert.equal(findActivePatientHold(readWorkflowState().holds, fresh.patientId)?.id, fresh.id);
  const record = savePaymentReconciliation(expired, { id: expired.patientId, name: 'Pasien' }, {
    paymentProofUrl: 'data:image/png;base64,proof', transferSenderName: 'Pasien'
  });
  assert.equal(record.holdId, expired.id);
  assert.equal(readWorkflowState().holds.find(item => item.id === fresh.id)?.status, 'HELD');
  assert.equal(readWorkflowState().holds.length, 2);
});

test('parallel reschedules reject a stale appointment version without overwriting the first change', async () => {
  const source = { ...appointment('versioned'), psychologistId: 'psy-1', status: 'CONFIRMED' as const,
    date: '2026-10-20', startTime: '09:00', endTime: '10:00', rescheduleHistory: [] };
  const actor = { id: 'psy-1', name: 'Psikolog', role: 'PSYCHOLOGIST' as const };
  commitWorkflow(current => ({ ...current, appointments: [source] }));
  const expected = getScheduleVersion(source);
  const change = (date: string) => withWorkflowLock(() => {
    const latest = readWorkflowState().appointments[0];
    assertScheduleVersion(latest, expected);
    const next = rescheduleExistingAppointment(latest, actor, date, '10:00', '11:00', 'Kesepakatan', new Date('2026-10-22T04:00:00Z'));
    commitWorkflow(current => ({ ...current, appointments: [next] }));
  });
  const results = await Promise.allSettled([change('2026-10-23'), change('2026-10-24')]);
  assert.equal(results[0].status, 'fulfilled');
  assert.equal(results[1].status, 'rejected');
  assert.equal(readWorkflowState().appointments[0].date, '2026-10-23');
  assert.equal(readWorkflowState().appointments[0].rescheduleHistory?.length, 1);
});

test('legacy reschedule histories receive a stable version and missing versions fail closed', () => {
  const source = appointment('legacy-version');
  delete source.scheduleVersion;
  source.rescheduleHistory = [];
  assert.equal(getScheduleVersion(source), 0);
  assert.doesNotThrow(() => assertScheduleVersion(source, 0));
  assert.throws(() => assertScheduleVersion(source), /Jadwal sudah berubah/);
  assert.throws(() => assertScheduleVersion({ ...source, scheduleVersion: 2 }, 0), /Jadwal sudah berubah/);
});

test('self profile update preserves role, SSO email, status and another account cannot be edited', () => {
  const user = { ...INITIAL_USERS.find(item => item.role === 'PATIENT')!, isProfileComplete: true, emergencyContact: 'Keluarga' };
  const changed = updateOwnAccountProfile(user, user, {
    name: ' Nama Baru ', phone: '081234567890', emergencyContact: 'Kerabat', role: 'ADMIN', email: 'changed@example.test'
  } as never);
  assert.equal(changed.name, 'Nama Baru');
  assert.equal(changed.phone, '081234567890');
  assert.equal(changed.role, user.role);
  assert.equal(changed.email, user.email);
  assert.equal(changed.status, user.status);
  assert.throws(() => updateOwnAccountProfile(user, { id: 'other', role: 'PATIENT' }, changed), /akun sendiri/);
  assert.throws(() => updateOwnAccountProfile(user, user, { name: '', phone: '081234567890', emergencyContact: 'Kerabat' }), /Nama/);
  assert.throws(() => updateOwnAccountProfile(user, user, { name: 'Nama', phone: 'invalid', emergencyContact: 'Kerabat' }), /telepon/);
});

test('CMS persistence failure does not replace previously saved configuration', () => {
  persistBrowserValue('landingCms', INITIAL_LANDING_CMS);
  const previous = storage.getItem('jiwasehat_v3_landingCms');
  storage.failWrites = true;
  assert.throws(() => persistBrowserValue('landingCms', { ...INITIAL_LANDING_CMS, clinicName: 'Changed' }));
  assert.equal(storage.getItem('jiwasehat_v3_landingCms'), previous);
});

test('CMS validates carousel timing, bank completeness and external links', () => {
  assert.doesNotThrow(() => validateLandingCms(INITIAL_LANDING_CMS));
  assert.throws(() => validateLandingCms({ ...INITIAL_LANDING_CMS, sliderIntervalSeconds: 0 }), /Interval/);
  assert.throws(() => validateLandingCms({ ...INITIAL_LANDING_CMS, bankAccountHolder: '' }), /rekening/);
  assert.throws(() => validateLandingCms({ ...INITIAL_LANDING_CMS, logoUrl: 'javascript:alert(1)' }), /URL gambar/);
  assert.throws(() => validateLandingCms({ ...INITIAL_LANDING_CMS, instagramUrl: 'https://not-instagram.example/' }), /Instagram/);
});

test('patient CMS preserves custom text while replacing the old false encryption placeholder', () => {
  assert.equal(mergePatientCms(INITIAL_PATIENT_CMS, { announcementText: 'Jadwal terbaru' }).announcementText, 'Jadwal terbaru');
  const legacy = 'Pemberitahuan: Seluruh data sesi konsultasi klinis privat terlindungi enkripsi end-to-end. Rekam medis Anda hanya dapat diakses secara rahasia oleh dr. Sarah Jenkins.';
  assert.equal(mergePatientCms(INITIAL_PATIENT_CMS, { announcementText: legacy }).announcementText, INITIAL_PATIENT_CMS.announcementText);
});

test('tooltip placement remains within mobile and desktop viewport boundaries', () => {
  for (const width of [320, 375, 430, 1280]) {
    const size = { width: Math.min(288, width - 16), height: 64 };
    for (const left of [0, width - 40]) {
      const anchor = { top: 5, bottom: 45, left, right: left + 40, width: 40, height: 40 };
      for (const position of ['top', 'bottom', 'left', 'right'] as const) {
        const fitted = fitTooltip(anchor, size, { width, height: 700 }, position);
        assert.ok(fitted.left >= 8 && fitted.top >= 8);
        assert.ok(fitted.left + size.width <= width - 8);
        assert.ok(fitted.top + size.height <= 692);
      }
    }
  }
});

test('footer renders the saved CMS address, brand and Instagram URL', () => {
  persistBrowserValue('landingCms', { ...INITIAL_LANDING_CMS, clinicName: 'Praktik Contoh',
    clinicAddress: 'Alamat dari CMS', clinicPhone: '0211234567', instagramUrl: 'https://www.instagram.com/praktik.contoh/' });
  const markup = renderToStaticMarkup(createElement(AppProvider, null, createElement(Footer)));
  assert.match(markup, /Praktik Contoh/);
  assert.match(markup, /Alamat dari CMS/);
  assert.match(markup, /instagram.com\/praktik.contoh\//);
  assert.doesNotMatch(markup, /Senopati No. 88/);
});

test('patient overview renders editable welcome, tip, announcement and contact labels', () => {
  const markup = renderToStaticMarkup(createElement(OverviewTab, { patientCms: { ...INITIAL_PATIENT_CMS,
    welcomeBannerTitle: 'Judul dari CMS', welcomeBannerSubtitle: 'Subjudul dari CMS',
    dailyMentalHealthTip: 'Tips dari pemilik', announcementText: 'Pengumuman praktik', crisisHotlineTitle: 'Kontak praktik' }, onNavigateTab: () => {} }));
  for (const value of ['Judul dari CMS', 'Subjudul dari CMS', 'Tips dari pemilik', 'Pengumuman praktik', 'Kontak praktik']) assert.ok(markup.includes(value));
});

test('reschedule audit renders every event, actor and both old and new dates', () => {
  const source = appointment('timeline');
  source.rescheduleHistory = Array.from({ length: 2 }, (_, index) => ({
    fromDate: `2026-10-${23 + index}`, fromStartTime: '09:00', fromEndTime: '10:00',
    toDate: `2026-10-${24 + index}`, toStartTime: '10:00', toEndTime: '11:00',
    at: '2026-10-22T04:00:00Z', actorId: 'psy-1', actorName: `Psikolog ${index}`, actorRole: 'PSYCHOLOGIST', reason: `Alasan ${index}`
  }));
  const markup = renderToStaticMarkup(createElement(RescheduleAudit, { appointment: source }));
  assert.equal((markup.match(/<li/g) || []).length, 2);
  for (const value of ['Psikolog 0', 'Psikolog 1', '2026-10-23', '2026-10-25', 'Alasan 1', 'WIB']) assert.ok(markup.includes(value));
});

const catalogPackage = (id: string): ConsultationPackage => ({
  id, name: `Konseling ${id}`, category: 'KONSELING', type: 'OFFLINE_CLINIC',
  durationMinutes: 60, price: 900000, description: 'Konsultasi terjadwal.',
  benefits: ['Pertemuan privat'], notes: 'Tambahan waktu per 15 menit sebesar 25%.\nLaporan terpisah Rp 200.000.',
  isActive: true, iconName: 'MessageCircle'
});

test('service picker shows full package notes before selection or opening details', () => {
  const pkg = catalogPackage('notes');
  const markup = renderToStaticMarkup(createElement(ServicePicker, { packages: [pkg], selectedId: '', onSelect: () => {} }));
  assert.match(markup, /Catatan layanan/);
  assert.ok(markup.includes(pkg.notes!));
  assert.match(markup, /whitespace-pre-line break-words/);
  assert.match(markup, /grid-flow-col/);
  assert.match(markup, /overflow-x-auto/);
  assert.match(markup, /Geser ke layanan berikutnya/);
  assert.doesNotMatch(markup, /<dialog/);
});

test('service picker keeps pagination and the selected summary for a large catalog', () => {
  const packages = Array.from({ length: 15 }, (_, index) => catalogPackage(String(index).padStart(2, '0')));
  const markup = renderToStaticMarkup(createElement(ServicePicker, { packages, selectedId: packages[14].id, onSelect: () => {} }));
  assert.equal((markup.match(/<article/g) || []).length, 6);
  assert.match(markup, /1-6 dari 15 layanan/);
  assert.match(markup, /1 \/ 3/);
  assert.match(markup, /Halaman layanan berikutnya/);
  assert.ok(markup.includes(packages[14].name));
});

test('service picker preserves per-session discounts, locked selection, and optional notes', () => {
  const pkg: ConsultationPackage = { ...catalogPackage('therapy'), type: 'PSYCHOTHERAPY', category: 'PSIKOTERAPI',
    price: 500000, discountType: 'PERCENT', discountValue: 10, discountLabel: 'Potongan psikolog',
    notes: undefined, isContinuousCare: true, sessionCount: 4 };
  const markup = renderToStaticMarkup(createElement(ServicePicker, { packages: [pkg], selectedId: pkg.id, disabled: true, onSelect: () => {} }));
  assert.match(markup, /Rp 450.000/);
  assert.match(markup, /\/ sesi/);
  assert.match(markup, /Rencana awal 4 sesi/);
  assert.match(markup, /type="radio"[^>]*disabled=""/);
  assert.match(markup, /Layanan dipilih/);
  assert.match(markup, /Tidak ada catatan tambahan\./);
});

test('parallel mutations preserve appointments from different dates', async () => {
  await Promise.all(['first', 'second'].map((id, index) => withWorkflowLock(async () => {
    const snapshot = readWorkflowState();
    await delay(index === 0 ? 15 : 1);
    commitWorkflow(current => ({ ...current, appointments: [...snapshot.appointments, appointment(id)] }));
  })));
  assert.deepEqual(readWorkflowState().appointments.map(item => item.id), ['first', 'second']);
});

test('booking and payment mutations cannot overwrite one another', async () => {
  commitWorkflow(current => ({ ...current, appointments: [{ ...appointment('billing'), paymentStatus: 'DP_PAID' }] }));
  await Promise.all([
    withWorkflowLock(async () => {
      const snapshot = readWorkflowState();
      await delay(15);
      commitWorkflow(current => ({ ...current, appointments: [...snapshot.appointments, appointment('booking')] }));
    }),
    withWorkflowLock(() => commitWorkflow(current => ({ ...current, appointments: current.appointments.map(item =>
      item.id === 'billing' ? { ...item, paymentStatus: 'PAID' } : item) })))
  ]);
  const result = readWorkflowState().appointments;
  assert.equal(result.length, 2);
  assert.equal(result.find(item => item.id === 'billing')?.paymentStatus, 'PAID');
});

test('storage quota failure preserves the complete old snapshot and emits no success event', () => {
  const before = storage.getItem(WORKFLOW_STORAGE_KEY);
  let updates = 0;
  window.addEventListener(WORKFLOW_UPDATED_EVENT, () => updates++);
  storage.failWrites = true;
  assert.throws(() => commitWorkflow(current => ({ ...current, appointments: [appointment('not-saved')],
    walkInPatients: [INITIAL_USERS[0]] })), /belum tersimpan/);
  assert.equal(storage.getItem(WORKFLOW_STORAGE_KEY), before);
  assert.equal(updates, 0);
});

test('legacy appointment arrays upgrade in place without losing records or duplicating the storage key', () => {
  storage.clear();
  storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify([appointment('legacy')]));
  commitWorkflow(current => ({ ...current, holds: [hold()] }));
  assert.equal(storage.length, 1);
  assert.equal(readWorkflowState().appointments[0].id, 'legacy');
  assert.equal(readWorkflowState().holds[0].id, 'hold-1');
});

test('corrupted workflow data is never silently replaced with demo appointments', () => {
  storage.setItem(WORKFLOW_STORAGE_KEY, '{invalid-json');
  assert.throws(() => readWorkflowState(), SyntaxError);
  assert.equal(storage.getItem(WORKFLOW_STORAGE_KEY), '{invalid-json');
});

test('reschedule selection remains the same time when earlier options disappear', () => {
  const first = { start: '09:00', end: '10:00' };
  const chosen = { start: '13:30', end: '14:30' };
  const later = { start: '15:00', end: '16:00' };
  const key = timeSlotKey(chosen);
  assert.equal(findTimeSlot([first, chosen, later], key), chosen);
  assert.equal(findTimeSlot([chosen, later], key), chosen);
  assert.equal(findTimeSlot([first, later], key), undefined);
});

const reschedulePsychologist = { id: 'psy-1', name: 'Psikolog', role: 'PSYCHOLOGIST' as const };
const missedSession = (): Appointment => ({
  ...appointment('missed'), psychologistId: reschedulePsychologist.id, patientId: 'patient-1',
  date: '2026-10-20', startTime: '09:00', endTime: '10:00', status: 'NO_SHOW', paymentStatus: 'DP_PAID',
  dpAmount: 100000, remainingAmount: 200000, treatmentPlanId: 'plan-1', treatmentPlanStatus: 'ACTIVE',
  continuousSessionNumber: 2, continuousSessionTotal: 4,
  initialPaymentRecord: { id: 'initial', kind: 'DP', amount: 100000, method: 'BANK_TRANSFER',
    receivedAt: '2026-10-19', verifiedAt: '2026-10-19T10:00:00Z' },
  paymentVerifiedAt: '2026-10-19T10:00:00Z', paymentVerifiedByName: 'Admin',
  statusHistory: [{ from: 'CONFIRMED', to: 'NO_SHOW', at: '2026-10-20T04:00:00Z',
    actorId: reschedulePsychologist.id, actorName: reschedulePsychologist.name, reason: 'Pasien belum hadir' }]
});
const rescheduleNow = new Date('2026-10-22T04:00:00Z');

test('authorized clinic staff and the owning patient may recover or request a missed session within policy', () => {
  const source = missedSession();
  assert.equal(canRescheduleAppointment(source, reschedulePsychologist), true);
  for (const actor of [
    { id: source.patientId + '-other', name: 'Pasien lain', role: 'PATIENT' as const },
    { ...reschedulePsychologist, id: 'other-psychologist' }
  ]) {
    assert.equal(canRescheduleAppointment(source, actor), false);
    assert.throws(() => rescheduleExistingAppointment(source, actor, '2026-10-23', '10:00', '11:00', 'Setuju', rescheduleNow));
  }
  assert.equal(canRescheduleAppointment(source, { id: 'admin', name: 'Admin', role: 'ADMIN' }, rescheduleNow), true);
  assert.equal(canRescheduleAppointment(source, { id: source.patientId, name: 'Pasien', role: 'PATIENT' }, rescheduleNow), true);
});

test('manual recovery keeps the same session, quota, DP, and all payment audit', () => {
  const source = missedSession();
  const result = rescheduleExistingAppointment(source, reschedulePsychologist, '2026-10-23', '10:00', '11:00', 'Pasien dan psikolog sepakat', rescheduleNow);
  assert.equal(result.status, 'CONFIRMED');
  for (const key of ['id', 'bookingCode', 'treatmentPlanId', 'continuousSessionNumber', 'continuousSessionTotal',
    'treatmentPlanStatus', 'paymentStatus', 'totalAmount', 'dpAmount', 'remainingAmount', 'initialPaymentRecord',
    'finalPaymentRecords', 'paymentVerifiedAt', 'paymentVerifiedByName'] as const) {
    assert.deepEqual(result[key], source[key], key);
  }
  assert.equal(result.statusHistory?.[0].to, 'NO_SHOW');
  assert.equal(result.statusHistory?.[1].from, 'NO_SHOW');
  assert.equal(result.statusHistory?.[1].to, 'CONFIRMED');
  assert.equal(result.rescheduleHistory?.[0].actorRole, 'PSYCHOLOGIST');
  assert.equal(result.rescheduleHistory?.[0].fromDate, source.date);
  assert.equal(source.status, 'NO_SHOW');
  assert.equal(source.rescheduleHistory, undefined);
});

test('manual recovery still rejects H+0, invalid times, changed duration, and an empty reason', () => {
  const source = missedSession();
  assert.throws(() => rescheduleExistingAppointment(source, reschedulePsychologist, '2026-10-22', '10:00', '11:00', 'Setuju', rescheduleNow), /H\+1/);
  assert.throws(() => rescheduleExistingAppointment(source, reschedulePsychologist, '2026-10-23', '10:00', '11:30', 'Setuju', rescheduleNow), /durasi/);
  assert.throws(() => rescheduleExistingAppointment(source, reschedulePsychologist, '2026-10-23', '99:00', '11:00', 'Setuju', rescheduleNow), /durasi/);
  assert.throws(() => rescheduleExistingAppointment(source, reschedulePsychologist, '2026-10-23', '10:00', '11:00', '  ', rescheduleNow), /Alasan/);
});

test('cancelled, completed, discontinued, and unverified missed sessions cannot be reopened', () => {
  const source = missedSession();
  for (const target of [
    { ...source, status: 'CANCELLED' as const }, { ...source, status: 'COMPLETED' as const },
    { ...source, treatmentPlanStatus: 'DISCONTINUED' as const },
    { ...source, treatmentPlanStatus: 'COMPLETED' as const },
    { ...source, paymentStatus: 'DP_PENDING_VERIFICATION' as const }
  ]) assert.equal(canRescheduleAppointment(target, reschedulePsychologist), false);
});

test('ordinary patient reschedule requests reconfirmation without a second DP', () => {
  const source = { ...missedSession(), date: '2026-10-24', status: 'CONFIRMED' as const };
  const patient = { id: source.patientId, name: 'Pasien', role: 'PATIENT' as const };
  const result = rescheduleExistingAppointment(source, patient, '2026-10-23', '10:00', '11:00', 'Perjalanan', rescheduleNow);
  assert.equal(result.status, 'PENDING');
  assert.equal(result.dpAmount, source.dpAmount);
  assert.deepEqual(result.initialPaymentRecord, source.initialPaymentRecord);
  assert.equal(result.paymentVerifiedAt, source.paymentVerifiedAt);
  assert.equal(canRescheduleAppointment(source, { ...patient, id: 'other-patient' }), false);
});

test('without Web Locks, financial mutations fail closed', async () => {
  Object.defineProperty(globalThis, 'navigator', { value: {}, configurable: true });
  let called = false;
  await assert.rejects(withWorkflowLock(() => { called = true; }), /penguncian transaksi/);
  assert.equal(called, false);
});

test('active hold consumes quota, but its owner can validate the reserved slot', () => {
  const reserved = hold();
  commitWorkflow(current => ({ ...current, holds: [reserved] }));
  const other = computeDynamicSlotsForDate(reserved.date, settings, [], reserved.psychologistId, 60);
  assert.equal(other.isQuotaFull, true);
  const owner = computeDynamicSlotsForDate(reserved.date, settings, [], reserved.psychologistId, 60, reserved.id);
  assert.equal(owner.slots.find(slot => slot.startTime === reserved.startTime)?.isAvailable, true);
});

test('expired hold releases quota without altering payment records', () => {
  const expired = { ...hold(), expiresAt: new Date(Date.now() - 1000).toISOString() };
  commitWorkflow(current => ({ ...current, holds: [expired] }));
  const result = computeDynamicSlotsForDate(expired.date, settings, [], expired.psychologistId, 60);
  assert.equal(result.slots.find(slot => slot.startTime === expired.startTime)?.isAvailable, true);
  assert.equal(readWorkflowState().holds.length, 1);
});

test('late-transfer reconciliation preserves proof and is idempotent per hold', () => {
  const expired = { ...hold(), expiresAt: new Date(Date.now() - 1000).toISOString() };
  commitWorkflow(current => ({ ...current, holds: [expired] }));
  const proof = { paymentProofUrl: 'data:image/png;base64,cHJvb2Y=', paymentProofName: 'proof.png', transferSenderName: 'Pasien' };
  const first = savePaymentReconciliation(expired, { id: expired.patientId, name: 'Pasien' }, proof);
  const retry = savePaymentReconciliation(expired, { id: expired.patientId, name: 'Pasien' }, proof);
  assert.equal(first.id, retry.id);
  assert.equal(readWorkflowState().reconciliations.length, 1);
  assert.equal(readWorkflowState().reconciliations[0].paymentProofUrl, proof.paymentProofUrl);
  assert.equal(readWorkflowState().appointments.length, 0);
});

test('failed reconciliation save neither consumes the hold nor publishes a payment case', () => {
  const reserved = hold();
  commitWorkflow(current => ({ ...current, holds: [reserved] }));
  storage.failWrites = true;
  assert.throws(() => savePaymentReconciliation(reserved, { id: reserved.patientId, name: 'Pasien' }, {
    paymentProofUrl: 'data:image/png;base64,cHJvb2Y=', transferSenderName: 'Pasien'
  }), /belum tersimpan/);
  assert.equal(readWorkflowState().holds[0].status, 'HELD');
  assert.equal(readWorkflowState().reconciliations.length, 0);
});

test('CSRF cookie is URL-decoded, including embedded equals, and not confused with another cookie', () => {
  assert.equal(readXsrfCookie('other=1; XSRF-TOKEN=abc%2B123%3D%3D; session=2'), 'abc+123==');
  assert.equal(readXsrfCookie('not-XSRF-TOKEN=wrong'), undefined);
  assert.throws(() => readXsrfCookie('XSRF-TOKEN=%ZZ'), URIError);
});

test('CSV escapes quotes/newlines/hash and neutralizes spreadsheet formulas', () => {
  assert.equal(csvRow(['Nama "Pasien", #1\nBaru', 100000]), '"Nama ""Pasien"", #1\nBaru",100000');
  assert.equal(csvCell('=1+1'), '"\'=1+1"');
  assert.equal(csvCell('\t@SUM(1)'), '"\'\t@SUM(1)"');
  assert.equal(csvCell(-100), '-100');
});

test('HTML spreadsheet text cannot inject markup', () => {
  assert.equal(escapeHtml('<img src="x" onerror="bad()">&'), '&lt;img src=&quot;x&quot; onerror=&quot;bad()&quot;&gt;&amp;');
  assert.equal(spreadsheetText(' +1'), "' +1");
});

const pkg: ConsultationPackage = { id: 'test-package', name: 'Konseling', category: 'KONSELING', type: 'OFFLINE_CLINIC',
  price: 300000, durationMinutes: 60, description: '', benefits: [], isActive: true, iconName: 'Heart' };
const patient = INITIAL_USERS.find(user => user.role === 'PATIENT')!;
const psychologist = INITIAL_USERS.find(user => user.role === 'PSYCHOLOGIST')!;
const walkInPayload = (): BookAppointmentPayload => ({
  bookingSource: 'ADMIN_WALK_IN', patientId: patient.id, patientName: patient.name, patientEmail: patient.email,
  psychologistId: psychologist.id, packageId: pkg.id, date: getMinimumBookingDate(), slotId: 'test-slot',
  startTime: '09:00', endTime: '10:00', paymentMethod: 'CASH_FULL', initialPaymentAmount: 300000
});

test('initial DP is flat Rp100000, not fifty percent, and cannot exceed the net price', () => {
  assert.equal(FLAT_DP_AMOUNT, 100000);
  for (const price of [250000, 500000, 750000, 900000, 1500000, 2000000]) {
    assert.equal(calculateInitialDp(price), 100000);
  }
  assert.equal(calculateInitialDp(75000), 75000);
  assert.equal(calculateInitialDp(0), 0);
  assert.equal(calculateInitialDp(-1), 0);
});

test('walk-in DP uses Rp100000 instead of fifty percent of a Rp900000 service', async () => {
  const service = { ...pkg, price: 900000 };
  const payload = { ...walkInPayload(), paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 };
  const result = await PatientEndpoints.bookAppointment(payload, [], [], [service], INITIAL_USERS, {});
  assert.equal(result.success, true);
  assert.equal(result.data.appointment.dpAmount, 100000);
  assert.equal(result.data.appointment.totalAmount, 900000);
  assert.equal(result.data.appointment.remainingAmount, 900000);
  const verified: Appointment = { ...result.data.appointment, paymentStatus: 'DP_PAID',
    initialPaymentRecord: { ...result.data.appointment.initialPaymentRecord!, verifiedAt: new Date().toISOString() } };
  assert.equal(getTreatmentPlanBalance(verified).remainingAmount, 800000);
  const percentage = await PatientEndpoints.bookAppointment({ ...payload, initialPaymentAmount: 450000 }, [], [], [service], INITIAL_USERS, {});
  assert.equal(percentage.success, false);
});

test('preview refuses cancellation while the existing plan ledger is unpaid', () => {
  const source: Appointment = { ...appointment('unpaid'), psychologistId: psychologist.id,
    status: 'CONFIRMED', paymentStatus: 'DP_PAID', dpAmount: 100000, totalAmount: 500000,
    initialPaymentRecord: undefined, finalPaymentRecords: [], finalPaymentAmount: 0,
    continuousSessionNumber: 1, treatmentPlanId: 'plan-unpaid', treatmentPlanStatus: 'ACTIVE' };
  const result = cancelPaidPlan([source], source.id, psychologist, 'Pasien meminta berhenti');
  assert.match(result.error || '', /lunas/);
  assert.equal(result.appointments, undefined);
  assert.equal(source.status, 'CONFIRMED');
});

test('paid preview cancellation stops the remaining plan, retains completed sessions and isolates other plans', () => {
  const first: Appointment = { ...appointment('first'), psychologistId: psychologist.id,
    status: 'COMPLETED', paymentStatus: 'PAID', totalAmount: 500000, dpAmount: 100000,
    initialPaymentRecord: undefined, finalPaymentRecords: [], finalPaymentAmount: 400000,
    continuousSessionNumber: 1, treatmentPlanId: 'paid-plan', treatmentPlanStatus: 'ACTIVE' };
  const next: Appointment = { ...first, id: 'next', status: 'CONFIRMED', totalAmount: 0,
    dpAmount: 0, finalPaymentAmount: 0, continuousSessionNumber: 2 };
  const other = { ...next, id: 'other', treatmentPlanId: 'another-plan' };
  const result = cancelPaidPlan([first, next, other], next.id, psychologist, 'Kesepakatan berhenti');
  assert.equal(result.error, undefined);
  assert.equal(result.appointments?.[0].status, 'COMPLETED');
  assert.equal(result.appointments?.[1].status, 'CANCELLED');
  assert.equal(result.appointments?.[1].treatmentPlanStatus, 'DISCONTINUED');
  assert.equal(result.appointments?.[0].finalPaymentAmount, 400000);
  assert.equal(result.appointments?.[2], other);
});

test('walk-in FULL uses actual amount and is not cash-in before verification', async () => {
  const bad = await PatientEndpoints.bookAppointment({ ...walkInPayload(), initialPaymentAmount: 250000 }, [], [], [pkg], INITIAL_USERS, {});
  assert.equal(bad.success, false);
  const valid = await PatientEndpoints.bookAppointment(walkInPayload(), [], [], [pkg], INITIAL_USERS, {});
  assert.equal(valid.success, true);
  assert.equal(valid.data.appointment.paymentStatus, 'DP_PENDING_VERIFICATION');
  assert.equal(valid.data.appointment.initialPaymentRecord?.amount, 300000);
  assert.equal(getRecordedCashIn(valid.data.appointment), 0);
  const verified: Appointment = { ...valid.data.appointment, paymentStatus: 'PAID', initialPaymentRecord: { ...valid.data.appointment.initialPaymentRecord!, verifiedAt: new Date().toISOString() } };
  assert.equal(getRecordedCashIn(verified), 300000);
});

test('booking rejects overlapping appointments and same-day dates', async () => {
  const initial = await PatientEndpoints.bookAppointment(walkInPayload(), [], [], [pkg], INITIAL_USERS, {});
  assert.equal(initial.success, true);
  const duplicate = await PatientEndpoints.bookAppointment(walkInPayload(), [], [initial.data.appointment], [pkg], INITIAL_USERS, {});
  assert.equal(duplicate.success, false);
  const sameDay = await PatientEndpoints.bookAppointment({ ...walkInPayload(), date: getPracticeDate() }, [], [], [pkg], INITIAL_USERS, {});
  assert.equal(sameDay.success, false);
});

test('booking preparation does not publish state or a success toast before the facade commits', async () => {
  let stateWrites = 0;
  const notifications: string[] = [];
  const recordWrite = () => { stateWrites++; };
  const controller = new PatientController(title => notifications.push(title), {
    setAppointments: recordWrite, setSchedules: recordWrite, setIntakeForms: recordWrite, setReviews: recordWrite
  });
  const result = await controller.bookAppointment(walkInPayload(), [], [], [pkg], INITIAL_USERS, {});
  assert.equal(result.success, true);
  assert.equal(stateWrites, 0);
  assert.deepEqual(notifications, []);
  assert.equal(readWorkflowState().appointments.length, 0);
});

const therapyPackage: ConsultationPackage = { ...pkg, id: 'therapy', name: 'Psikoterapi', type: 'PSYCHOTHERAPY',
  category: 'PSIKOTERAPI', price: 500000, sessionCount: 4, isContinuousCare: true };
const sessionBill = (id: string, number = 1): Appointment => ({ ...appointment(id), patientId: patient.id,
  psychologistId: psychologist.id, packageId: therapyPackage.id, packageType: 'PSYCHOTHERAPY',
  treatmentPlanId: 'per-session-plan', treatmentPlanStatus: 'ACTIVE', continuousSessionTotal: 4,
  continuousSessionNumber: number, billingMode: 'PER_SESSION', totalAmount: 500000,
  subtotalAmount: 500000, dpAmount: number === 1 ? 100000 : 0, status: 'CONFIRMED', paymentStatus: 'PENDING',
  initialPaymentRecord: undefined, finalPaymentRecords: [], finalPaymentAmount: 0,
  date: '2026-10-24', startTime: '09:00', endTime: '10:00', createdAt: '2026-10-22T00:00:00Z' });
const clinicAdmin = { id: 'admin', name: 'Admin', role: 'ADMIN' as const };

test('new psychotherapy pricing charges one session while retaining four planned sessions', async () => {
  const pricing = calculatePackagePayableAmount({ ...therapyPackage, discountType: 'FIXED', discountValue: 50000 });
  assert.equal(pricing.sessionCount, 4);
  assert.equal(pricing.subtotalAmount, 500000);
  assert.equal(pricing.discountAmount, 50000);
  assert.equal(pricing.totalAmount, 450000);
  const result = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 }, [], [], [therapyPackage], INITIAL_USERS, {});
  assert.equal(result.success, true);
  assert.equal(result.data.appointment.totalAmount, 500000);
  assert.equal(result.data.appointment.billingMode, 'PER_SESSION');
  assert.equal(result.data.appointment.continuousSessionTotal, 4);
});

test('Admin may record full payment of the first therapy session without charging unbooked sessions', async () => {
  const result = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_FULL', initialPaymentAmount: 500000 }, [], [], [therapyPackage], INITIAL_USERS, {});
  assert.equal(result.success, true);
  assert.equal(result.data.appointment.totalAmount, 500000);
  assert.equal(result.data.appointment.dpAmount, 100000);
  assert.equal(result.data.appointment.initialPaymentRecord?.kind, 'FULL');
  assert.equal(result.data.appointment.initialPaymentRecord?.amount, 500000);
  assert.equal(getRecordedCashIn(result.data.appointment), 0);
});

test('next session billing has its own snapshot and no second DP without repricing legacy plans', () => {
  const first = sessionBill('first');
  const next = getNextSessionBilling(first, { ...therapyPackage, price: 550000 });
  assert.equal(next.totalAmount, 550000);
  assert.equal(next.dpAmount, 0);
  assert.equal(next.remainingAmount, 550000);
  assert.equal(first.totalAmount, 500000);
  assert.equal(getNextSessionBilling({ ...first, billingMode: undefined }).totalAmount, 0);
  assert.throws(() => getNextSessionBilling(first, { ...therapyPackage, isActive: false }));
  assert.throws(() => getNextSessionBilling(first, { ...therapyPackage, durationMinutes: 90 }), /Durasi/);
});

test('session receipts and cash report include continuation payments exactly once', () => {
  const first: Appointment = { ...sessionBill('one'), paymentStatus: 'PAID', finalPaymentAmount: 400000 };
  const second: Appointment = { ...sessionBill('two', 2), paymentStatus: 'PAID', finalPaymentAmount: 500000 };
  assert.equal(resolveBillingAppointment(second, [first, second]).id, second.id);
  assert.deepEqual(getPlanBillingBalance([first, second]), { totalAmount: 1000000, paidAmount: 1000000, remainingAmount: 0 });
  const rows = buildCashInReportRows([first, second]);
  assert.equal(rows.reduce((total, row) => total + row.cashInAmount, 0), 1000000);
  assert.ok(rows.some(row => row.sourceAppointmentId === second.id));
  const legacyFirst = { ...first, billingMode: undefined, totalAmount: 2000000 };
  const legacySecond = { ...second, billingMode: undefined, totalAmount: 0 };
  assert.equal(resolveBillingAppointment(legacySecond, [legacyFirst, legacySecond]).id, first.id);
  assert.equal(getPlanBillingBalance([legacyFirst, legacySecond]).totalAmount, 2000000);
});

test('per-session cancellation checks every created invoice and Admin cannot bypass the unpaid continuation', () => {
  const first: Appointment = { ...sessionBill('one'), status: 'COMPLETED', paymentStatus: 'PAID', finalPaymentAmount: 400000 };
  const second = sessionBill('two', 2);
  assert.match(cancelPaidPlan([first, second], second.id, clinicAdmin, 'Berhenti').error || '', /lunas/);
  const settled: Appointment = { ...second, paymentStatus: 'PAID', finalPaymentAmount: 500000 };
  const cancelled = cancelPaidPlan([first, settled], settled.id, clinicAdmin, 'Berhenti');
  assert.equal(cancelled.error, undefined);
  assert.equal(cancelled.appointments?.[0].status, 'COMPLETED');
  assert.equal(cancelled.appointments?.[1].status, 'CANCELLED');
  assert.equal(getPlanBillingBalance(cancelled.appointments!).totalAmount, 1000000);
  assert.equal(cancelled.appointments?.length, 2);
});

test('Admin plan management hides balance, receipts and monetary progress', () => {
  const markup = renderToStaticMarkup(createElement(TreatmentPlansTab, { appointments: [sessionBill('one')],
    hideFinancialDetails: true, onScheduleNextSession: async () => false, onDiscontinuePlan: async () => false,
    onReschedule: async () => false }));
  assert.doesNotMatch(markup, /Terbayar|500[.,]000|Sisa Rp/);
  assert.match(markup, /Tagihan per sesi/);
});

test('patient request keeps the active interval, ledger, version and quota until Admin applies', () => {
  const source = sessionBill('request');
  const requested = requestPatientReschedule(source, patient, '2026-10-27', '10:00', '11:00', 'Kesepakatan', rescheduleNow);
  assert.equal(requested.date, source.date);
  assert.equal(requested.paymentStatus, source.paymentStatus);
  assert.equal(getScheduleVersion(requested), getScheduleVersion(source));
  assert.equal(getPatientRescheduleCount(requested), 0);
  assert.equal(requested.rescheduleRequest?.status, 'REQUESTED');
  assert.equal(canRescheduleAppointment(requested, patient, rescheduleNow), false);
  const applied = applyPatientReschedule(requested, clinicAdmin, requested.rescheduleRequest!.id, new Date('2026-10-24T08:00:00Z'));
  assert.equal(applied.date, '2026-10-27');
  assert.equal(applied.rescheduleRequest?.requestedAt, rescheduleNow.toISOString());
  assert.equal(applied.rescheduleRequest?.status, 'APPLIED');
  assert.equal(getPatientRescheduleCount(applied), 1);
  assert.equal(applied.dpAmount, 100000);
});

test('patient requests enforce the H-2 boundary, no-show four-day deadline, and ownership', () => {
  const source = sessionBill('boundaries');
  assert.equal(canRescheduleAppointment(source, patient, new Date('2026-10-23T23:59:59.999Z')), true);
  assert.equal(canRescheduleAppointment(source, patient, new Date('2026-10-24T00:00:00Z')), false);
  const missed = { ...source, date: '2026-10-20', status: 'NO_SHOW' as const, paymentStatus: 'DP_PAID' as const };
  assert.equal(canRescheduleAppointment(missed, patient, new Date('2026-10-24T16:59:59.999Z')), true);
  assert.equal(canRescheduleAppointment(missed, patient, new Date('2026-10-24T17:00:00Z')), false);
  assert.equal(canRescheduleAppointment(source, { ...patient, id: 'another' }, rescheduleNow), false);
  assert.throws(() => requestPatientReschedule(source, patient, '2026-10-22', '10:00', '11:00', 'Alasan', rescheduleNow), /H\+1/);
});

test('only applied patient-origin changes consume the three-change quota', () => {
  let current = sessionBill('quota');
  for (let index = 0; index < 3; index++) {
    const requested = requestPatientReschedule(current, patient, `2026-10-${25 + index}`, '10:00', '11:00', 'Alasan', rescheduleNow);
    current = applyPatientReschedule(requested, clinicAdmin, requested.rescheduleRequest!.id, rescheduleNow);
  }
  assert.equal(getPatientRescheduleCount(current), 3);
  assert.throws(() => requestPatientReschedule(current, patient, '2026-10-29', '10:00', '11:00', 'Keempat', rescheduleNow));
  const clinicMove = rescheduleExistingAppointment(current, clinicAdmin, '2026-10-30', '10:00', '11:00', 'Klinik tutup', rescheduleNow);
  assert.equal(getPatientRescheduleCount(clinicMove), 3);
});

test('a clinic change supersedes a pending patient request and stale approval never overwrites it', () => {
  const requested = requestPatientReschedule(sessionBill('stale'), patient, '2026-10-27', '10:00', '11:00', 'Alasan', rescheduleNow);
  const moved = rescheduleExistingAppointment(requested, clinicAdmin, '2026-10-28', '10:00', '11:00', 'Arahan klinik', rescheduleNow);
  assert.equal(moved.rescheduleRequest?.status, 'REJECTED');
  assert.throws(() => applyPatientReschedule(moved, clinicAdmin, requested.rescheduleRequest!.id, rescheduleNow));
  assert.equal(moved.date, '2026-10-28');
  assert.equal(getPatientRescheduleCount(moved), 0);
  const followUp = requestPatientReschedule(moved, patient, '2026-10-29', '10:00', '11:00', 'Usulan baru', rescheduleNow);
  assert.equal(followUp.rescheduleRequestHistory?.[0].id, requested.rescheduleRequest!.id);
  assert.equal(followUp.rescheduleRequestHistory?.[0].status, 'REJECTED');
});

const proofBooking = (): Appointment => ({ ...sessionBill('proof'), status: 'PENDING', paymentStatus: 'DP_PENDING_VERIFICATION',
  paymentProofState: 'SUBMITTED', paymentProofVersion: 1, paymentProofUrl: 'data:image/png;base64,iVBORw0KGgo=',
  paymentProofName: 'asal.png', paymentProofMimeType: 'image/png', paymentProofSubmittedAt: '2026-10-22T00:01:00Z' });
const replacementProof = { url: 'data:image/png;base64,iVBORw0KGgo=', name: 'koreksi.png', mimeType: 'image/png', senderName: 'Pasien' };

test('proof rejection and correction preserve old evidence, original timing, and booking ledger', () => {
  const source = proofBooking();
  const rejected = rejectInitialPaymentProof(source, clinicAdmin, 'Gambar kurang jelas', 1, rescheduleNow);
  const corrected = correctInitialPaymentProof(rejected, patient, replacementProof, 1, rescheduleNow);
  assert.equal(corrected.paymentProofVersion, 2);
  assert.equal(corrected.paymentProofState, 'SUBMITTED');
  assert.equal(corrected.paymentProofHistory?.[0].name, 'asal.png');
  assert.equal(corrected.paymentProofHistory?.[0].rejectionReason, 'Gambar kurang jelas');
  assert.equal(corrected.paymentProofSubmittedAt, source.paymentProofSubmittedAt);
  assert.equal(corrected.paymentProofLastUploadedAt, rescheduleNow.toISOString());
  assert.equal(corrected.paymentProofCorrectionDeadline, rejected.paymentProofCorrectionDeadline);
  assert.equal(corrected.paymentStatus, source.paymentStatus);
  assert.equal(corrected.totalAmount, source.totalAmount);
  assert.equal(corrected.dpAmount, source.dpAmount);
});

test('proof correction rejects stale versions, late files, forged formats and other patients', () => {
  const rejected = rejectInitialPaymentProof(proofBooking(), clinicAdmin, 'Perbaiki', 1, rescheduleNow);
  assert.throws(() => correctInitialPaymentProof(rejected, patient, replacementProof, 0, rescheduleNow), /Versi/);
  assert.throws(() => correctInitialPaymentProof(rejected, { ...patient, id: 'other' }, replacementProof, 1, rescheduleNow), /pemilik/);
  assert.throws(() => correctInitialPaymentProof(rejected, patient, replacementProof, 1, new Date(Date.parse(rejected.paymentProofCorrectionDeadline!) + 1)), /batas waktu/);
  assert.throws(() => correctInitialPaymentProof(rejected, patient, { ...replacementProof, url: 'data:image/png;base64,PGh0bWw+' }, 1, rescheduleNow), /format/);
  assert.throws(() => correctInitialPaymentProof(rejected, patient, { ...replacementProof, mimeType: 'text/html' }, 1, rescheduleNow));
  assert.throws(() => rejectInitialPaymentProof(rejected, clinicAdmin, 'Tolak lagi', 1, rescheduleNow), /sudah ditolak/);
});

test('verified money cannot be reset by proof rejection or reupload', () => {
  const verified: Appointment = { ...proofBooking(), paymentStatus: 'DP_PAID', paymentProofState: 'VERIFIED' };
  assert.throws(() => rejectInitialPaymentProof(verified, clinicAdmin, 'Tolak', 1, rescheduleNow), /sudah diproses/);
  assert.throws(() => correctInitialPaymentProof(verified, patient, replacementProof, 1, rescheduleNow), /sudah diproses/);
});

test('parallel Admin approvals apply one request exactly once and retain the original DP', async () => {
  const requested = requestPatientReschedule(sessionBill('concurrent-approval'), patient, '2026-10-27', '10:00', '11:00', 'Alasan', rescheduleNow);
  commitWorkflow(current => ({ ...current, appointments: [requested] }));
  const approve = () => withWorkflowLock(() => {
    const current = readWorkflowState().appointments[0];
    const applied = applyPatientReschedule(current, clinicAdmin, requested.rescheduleRequest!.id, rescheduleNow);
    commitWorkflow(state => ({ ...state, appointments: [applied] }));
  });
  const results = await Promise.allSettled([approve(), approve()]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const final = readWorkflowState().appointments[0];
  assert.equal(getPatientRescheduleCount(final), 1);
  assert.equal(getScheduleVersion(final), 1);
  assert.equal(final.dpAmount, 100000);
});

test('another psychotherapy purchase requires the previous plan to be terminal and creates a new plan with its own initial DP', async () => {
  const first = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 }, [], [], [therapyPackage], INITIAL_USERS, {});
  assert.equal(first.success, true);
  const duplicate = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 }, [], [first.data.appointment], [therapyPackage], INITIAL_USERS, {});
  assert.equal(duplicate.success, false);
  const completed: Appointment = { ...first.data.appointment, status: 'COMPLETED', treatmentPlanStatus: 'COMPLETED' };
  const repeat = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 }, [], [completed], [therapyPackage], INITIAL_USERS, {});
  assert.equal(repeat.success, true);
  assert.notEqual(repeat.data.appointment.treatmentPlanId, completed.treatmentPlanId);
  assert.equal(repeat.data.appointment.continuousSessionNumber, 1);
  assert.equal(repeat.data.appointment.dpAmount, 100000);
  assert.equal(repeat.data.appointment.totalAmount, 500000);
});
