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
import { computeDynamicSlotsForDate, PracticeScheduleSettings, getScheduleAvailabilitySummary } from '../resources/js/data/scheduleConfig';
import { findScheduleConflicts } from '../resources/js/utils/scheduleConflicts';
import { reviewRescheduleAvailability } from '../resources/js/utils/rescheduleApproval';
import { verifyInitialReceipt, appendReceivedPayment, canRecordReceivedPayment } from '../resources/js/utils/paymentWorkflow';
import { getMinimumBookingDate, getPracticeDate, timeSlotKey, findTimeSlot } from '../resources/js/utils/bookingPolicy';
import { readXsrfCookie } from '../resources/js/utils/csrf';
import { csvCell, csvRow, escapeHtml, spreadsheetText } from '../resources/js/utils/exportEncoding';
import { calculateInitialDp, FLAT_DP_AMOUNT, getRecordedCashIn, getTreatmentPlanBalance, getNextSessionBilling,
  getPlanBillingBalance, resolveBillingAppointment, buildCashInReportRows, getPaymentSummary,
  resolvePaymentAccount, syncPaymentAllocations } from '../resources/js/utils/payments';
import { PaymentProgress } from '../resources/js/components/common/PaymentProgress';
import { cancelPaidPlan } from '../resources/js/utils/appointmentWorkflow';
import { canRescheduleAppointment, rescheduleExistingAppointment, getScheduleVersion, assertScheduleVersion,
  requestPatientReschedule, applyPatientReschedule, getPatientRescheduleCount, requireRescheduleSlotSelection,
  assertRequestRevision } from '../resources/js/utils/reschedulePolicy';
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
  assert.match(markup, /aria-roledescription="carousel"/);
  assert.match(markup, /Menampilkan 1–1 dari 1/);
  assert.doesNotMatch(markup, /<dialog/);
});

test('service picker keeps pagination and the selected summary for a large catalog', () => {
  const packages = Array.from({ length: 15 }, (_, index) => catalogPackage(String(index).padStart(2, '0')));
  const markup = renderToStaticMarkup(createElement(ServicePicker, { packages, selectedId: packages[14].id, onSelect: () => {} }));
  assert.equal((markup.match(/<article/g) || []).length, 15);
  assert.match(markup, /Menampilkan 1–1 dari 15/);
  assert.match(markup, /Halaman 1 \/ 15/);
  assert.match(markup, /Pilihan layanan pasien berikutnya/);
  assert.equal((markup.match(/role="group"[^>]*aria-hidden="true"/g)||[]).length,14);
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
  assert.doesNotMatch(markup, /Tidak ada catatan tambahan\./);
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
  const clinicMove = rescheduleExistingAppointment(current, clinicAdmin, '2026-10-30', '10:00', '11:00', 'Klinik tutup', rescheduleNow, 'CLINIC');
  assert.equal(getPatientRescheduleCount(clinicMove), 3);
});

test('a clinic change supersedes a pending patient request and stale approval never overwrites it', () => {
  const requested = requestPatientReschedule(sessionBill('stale'), patient, '2026-10-27', '10:00', '11:00', 'Alasan', rescheduleNow);
  const moved = rescheduleExistingAppointment(requested, clinicAdmin, '2026-10-28', '10:00', '11:00', 'Arahan klinik', rescheduleNow, 'CLINIC');
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

const verifiableBooking = (): Appointment => ({ ...proofBooking(), paymentMethod: 'BANK_TRANSFER',
  transferSenderName: 'Pasien', initialPaymentRecord: undefined });
const receipt = (key: string, amount: number) => ({ idempotencyKey: key, amount, method: 'BANK_TRANSFER' as const,
  channelDetail: 'BCA', receivedDate: '2026-10-22' });

test('initial verification records actual underpayments without confirming or assuming a flat DP receipt', () => {
  for (const amount of [1, 99999, 100000]) {
    const source = verifiableBooking();
    const verified = verifyInitialReceipt(source, clinicAdmin, amount, '2026-10-22', 1, '', rescheduleNow);
    assert.equal(verified.initialRequirementMet, amount >= 100000);
    assert.equal(verified.status, amount >= 100000 ? 'CONFIRMED' : 'PENDING');
    assert.equal(getRecordedCashIn(verified), amount);
    assert.equal(getTreatmentPlanBalance(verified).remainingAmount, source.totalAmount - amount);
    assert.equal(buildCashInReportRows([verified]).reduce((sum, row) => sum + row.cashInAmount, 0), amount);
    assert.equal(source.initialPaymentRecord, undefined);
    assert.throws(() => verifyInitialReceipt(verified, clinicAdmin, 100000, '2026-10-22', 1, '', rescheduleNow), /diproses/);
  }
});

test('initial verification caps the minimum at net cost, supports free services and retains overpayments', () => {
  const small = verifyInitialReceipt({ ...verifiableBooking(), totalAmount: 75000 }, clinicAdmin, 75000, '2026-10-22', 1, '', rescheduleNow);
  assert.equal(small.paymentStatus, 'PAID');
  assert.equal(small.initialRequirementMet, true);
  const excess = verifyInitialReceipt(verifiableBooking(), clinicAdmin, 600000, '2026-10-22', 1, '', rescheduleNow);
  assert.equal(excess.paymentStatus, 'PAID');
  assert.equal(getRecordedCashIn(excess), 600000);
  const free = verifyInitialReceipt({ ...verifiableBooking(), totalAmount: 0, paymentStatus: 'PAID' }, clinicAdmin, 0, '2026-10-22', 1, '', rescheduleNow);
  assert.equal(free.initialRequirementMet, true);
  assert.equal(free.status, 'CONFIRMED');
  assert.equal(getRecordedCashIn(free), 0);
});

test('verification rejects invalid actual amounts, future dates, stale proofs and unauthorized actors', () => {
  assert.equal(canRecordReceivedPayment(verifiableBooking()), false);
  assert.equal(canRecordReceivedPayment(sessionBill('unverified-first')), false);
  assert.equal(canRecordReceivedPayment({ ...sessionBill('continuation', 2), initialRequirementMet: true }), true);
  assert.equal(canRecordReceivedPayment({ ...sessionBill('unverified-continuation', 2), initialRequirementMet: false }), false);
  for (const amount of [NaN, Infinity, -1, 0, 1.5]) {
    assert.throws(() => verifyInitialReceipt(verifiableBooking(), clinicAdmin, amount, '2026-10-22', 1, '', rescheduleNow), /Nominal/);
  }
  assert.throws(() => verifyInitialReceipt(verifiableBooking(), patient, 100000, '2026-10-22', 1, '', rescheduleNow), /Admin/);
  assert.throws(() => verifyInitialReceipt(verifiableBooking(), clinicAdmin, 100000, '2026-10-23', 1, '', rescheduleNow), /Tanggal/);
  assert.throws(() => verifyInitialReceipt(verifiableBooking(), clinicAdmin, 100000, '2026-10-22', 0, '', rescheduleNow), /versi/);
  assert.throws(() => verifyInitialReceipt({ ...verifiableBooking(), totalAmount: -1 }, clinicAdmin, 100000, '2026-10-22', 1, '', rescheduleNow), /tagihan/);
});

test('a verified DP shortfall can be topped up exactly once and only confirms when the minimum is reached', () => {
  const short = verifyInitialReceipt(verifiableBooking(), clinicAdmin, 1, '2026-10-22', 1, '', rescheduleNow);
  assert.equal(canRecordReceivedPayment(short), true);
  const stillShort = appendReceivedPayment(short, clinicAdmin, receipt('topup-1', 99998), rescheduleNow);
  assert.equal(stillShort.status, 'PENDING');
  assert.equal(stillShort.initialRequirementMet, false);
  assert.equal(getRecordedCashIn(stillShort), 99999);
  const topped = appendReceivedPayment(stillShort, clinicAdmin, receipt('topup-2', 1), rescheduleNow);
  assert.equal(topped.status, 'CONFIRMED');
  assert.equal(topped.paymentStatus, 'DP_PAID');
  assert.equal(topped.initialRequirementMet, true);
  assert.equal(getRecordedCashIn(topped), 100000);
  assert.equal(topped.initialPaymentRecord?.amount, 1);
  assert.equal(appendReceivedPayment(topped, clinicAdmin, receipt('topup-2', 1), rescheduleNow), topped);
});

test('two actual transfers after PAID are retained while retries and conflicting operation keys are guarded', () => {
  const paid = verifyInitialReceipt(verifiableBooking(), clinicAdmin, 500000, '2026-10-22', 1, '', rescheduleNow);
  const extra = appendReceivedPayment(paid, clinicAdmin, receipt('extra-1', 100000), rescheduleNow);
  const second = appendReceivedPayment(extra, clinicAdmin, receipt('extra-2', 100000), rescheduleNow);
  assert.equal(second.paymentStatus, 'PAID');
  assert.equal(getRecordedCashIn(second), 700000);
  assert.equal(second.finalPaymentRecords?.length, 2);
  assert.deepEqual(second.initialPaymentRecord, paid.initialPaymentRecord);
  assert.equal(appendReceivedPayment(second, clinicAdmin, receipt('extra-1', 100000), rescheduleNow), second);
  assert.throws(() => appendReceivedPayment(second, clinicAdmin, receipt('extra-1', 90000), rescheduleNow), /berbeda/);
  assert.throws(() => appendReceivedPayment(second, patient, receipt('forged', 100000), rescheduleNow), /Admin/);
  assert.throws(() => appendReceivedPayment(second, clinicAdmin, { ...receipt('', 100000) }, rescheduleNow), /Identitas/);
  assert.throws(() => appendReceivedPayment(second, clinicAdmin, receipt('overflow', Number.MAX_SAFE_INTEGER), rescheduleNow), /batas nominal/);
  assert.equal(buildCashInReportRows([second]).reduce((sum, row) => sum + row.cashInAmount, 0), 700000);
});

test('additional receipts preserve legacy paid cash and never reactivate a cancelled service', () => {
  const source: Appointment = { ...sessionBill('legacy-paid'), billingMode: undefined, status: 'CANCELLED',
    treatmentPlanStatus: 'DISCONTINUED', paymentStatus: 'PAID', finalPaymentAmount: undefined,
    finalPaymentRecords: undefined, initialPaymentRecord: undefined };
  const updated = appendReceivedPayment(source, clinicAdmin, receipt('late-actual-transfer', 100000), rescheduleNow);
  assert.equal(getRecordedCashIn(updated), 600000);
  assert.equal(updated.status, 'CANCELLED');
  assert.equal(updated.treatmentPlanStatus, 'DISCONTINUED');
  assert.equal(getTreatmentPlanBalance(updated).remainingAmount, 0);
  assert.equal(buildCashInReportRows([updated]).reduce((sum, row) => sum + row.cashInAmount, 0), 600000);
});

test('Admin-assisted patient changes count against quota and clinic changes require an explicit origin', () => {
  let current = sessionBill('assisted');
  assert.throws(() => rescheduleExistingAppointment(current, clinicAdmin, '2026-10-25', '10:00', '11:00', 'Bantuan', rescheduleNow), /asal/);
  for (let index = 0; index < 3; index++) {
    current = rescheduleExistingAppointment(current, clinicAdmin, `2026-10-${25 + index}`, '10:00', '11:00', 'Pasien meminta bantuan', rescheduleNow, 'PATIENT');
  }
  assert.equal(getPatientRescheduleCount(current), 3);
  assert.equal(current.rescheduleHistory?.[0].actorRole, 'ADMIN');
  assert.throws(() => rescheduleExistingAppointment(current, clinicAdmin, '2026-10-29', '10:00', '11:00', 'Keempat', rescheduleNow, 'PATIENT'), /kuota/);
  const clinic = rescheduleExistingAppointment(current, clinicAdmin, '2026-10-29', '10:00', '11:00', 'Klinik tutup', rescheduleNow, 'CLINIC');
  assert.equal(getPatientRescheduleCount(clinic), 3);
  assert.throws(() => rescheduleExistingAppointment(sessionBill('forged'), patient, '2026-10-25', '10:00', '11:00', 'Bypass', rescheduleNow, 'CLINIC'), /kewenangan/);
  assert.throws(() => rescheduleExistingAppointment(sessionBill('forged-origin'), clinicAdmin, '2026-10-25', '10:00', '11:00', 'Bypass', rescheduleNow, 'INVALID' as 'PATIENT'), /kewenangan/);
});

test('assisted patient requests still enforce submission deadlines and every origin enforces H+1', () => {
  const source = sessionBill('late-assisted');
  assert.throws(() => rescheduleExistingAppointment(source, clinicAdmin, '2026-10-25', '10:00', '11:00', 'Terlambat',
    new Date('2026-10-24T00:00:00Z'), 'PATIENT'), /batas waktu/);
  assert.throws(() => rescheduleExistingAppointment(source, clinicAdmin, '2026-10-22', '10:00', '11:00', 'Klinik', rescheduleNow, 'CLINIC'), /H\+1/);
});

test('slot reselection preserves timely eligibility after delayed Admin processing, old slot and DP', () => {
  const source = sessionBill('reselect');
  const submitted = requestPatientReschedule(source, patient, '2026-10-25', '10:00', '11:00', 'Pindah', rescheduleNow);
  const late = new Date('2026-10-26T02:00:00Z');
  const reopened = requireRescheduleSlotSelection(submitted, clinicAdmin, submitted.rescheduleRequest!.id, 'Slot terisi', 0, late);
  assert.equal(reopened.date, source.date);
  assert.equal(reopened.rescheduleRequest?.requestedAt, rescheduleNow.toISOString());
  assert.equal(canRescheduleAppointment(reopened, patient, late), true);
  assert.throws(() => rescheduleExistingAppointment(reopened, clinicAdmin, '2026-10-28', '10:00', '11:00', 'Bantuan langsung', late, 'PATIENT'), /pengajuan aktif/);
  assert.throws(() => requestPatientReschedule(reopened, patient, '2026-10-28', '10:00', '11:00', 'Baru', late, 0), /berubah/);
  const selected = requestPatientReschedule(reopened, patient, '2026-10-28', '10:00', '11:00', 'Baru', late, 1);
  assert.equal(selected.rescheduleRequest?.id, submitted.rescheduleRequest?.id);
  assert.equal(selected.rescheduleRequest?.requestedAt, submitted.rescheduleRequest?.requestedAt);
  assert.equal(selected.rescheduleRequest?.revision, 2);
  assert.equal(getPatientRescheduleCount(selected), 0);
  assert.throws(() => assertRequestRevision(selected, 0), /berubah/);
  const applied = applyPatientReschedule(selected, clinicAdmin, selected.rescheduleRequest!.id, late);
  assert.equal(applied.date, '2026-10-28');
  assert.equal(getPatientRescheduleCount(applied), 1);
  assert.equal(applied.dpAmount, 100000);
  assert.equal(applied.totalAmount, source.totalAmount);
  assert.throws(() => applyPatientReschedule(applied, clinicAdmin, selected.rescheduleRequest!.id, late), /diproses/);
});

test('reselection cannot bypass ownership, stale schedule versions, no-show windows or a terminated plan', () => {
  const source = sessionBill('reselection-guards');
  const submitted = requestPatientReschedule(source, patient, '2026-10-25', '10:00', '11:00', 'Pindah', rescheduleNow);
  assert.throws(() => requireRescheduleSlotSelection(submitted, patient, submitted.rescheduleRequest!.id, 'Bypass', 0, rescheduleNow));
  assert.throws(() => requireRescheduleSlotSelection({ ...submitted, scheduleVersion: 1 }, clinicAdmin, submitted.rescheduleRequest!.id, 'Stale', 0, rescheduleNow), /Jadwal sudah berubah/);
  const reopened = requireRescheduleSlotSelection(submitted, clinicAdmin, submitted.rescheduleRequest!.id, 'Pilih ulang', 0, rescheduleNow);
  assert.equal(canRescheduleAppointment(reopened, { ...patient, id: 'another' }, rescheduleNow), false);
  assert.equal(canRescheduleAppointment({ ...reopened, treatmentPlanStatus: 'DISCONTINUED' }, patient, rescheduleNow), false);
  assert.throws(() => requestPatientReschedule(reopened, patient, '2026-10-22', '10:00', '11:00', 'Hari ini', rescheduleNow, 1), /H\+1/);
  const noShow = { ...source, status: 'NO_SHOW' as const, paymentStatus: 'DP_PAID' as const, date: '2026-10-20' };
  const timely = requestPatientReschedule(noShow, patient, '2026-10-26', '10:00', '11:00', 'No show', rescheduleNow);
  const late = new Date('2026-10-27T02:00:00Z');
  const again = requireRescheduleSlotSelection(timely, clinicAdmin, timely.rescheduleRequest!.id, 'Slot lama lewat', 0, late);
  assert.equal(canRescheduleAppointment(again, patient, late), true);
  const invalid = { ...again, rescheduleRequest: { ...again.rescheduleRequest!, requestedAt: late.toISOString() } };
  assert.equal(canRescheduleAppointment(invalid, patient, late), false);
});

test('cancellation closes requests waiting for slot reselection without dropping payment history', () => {
  const submitted = requestPatientReschedule(sessionBill('stop-reselect'), patient, '2026-10-25', '10:00', '11:00', 'Pindah', rescheduleNow);
  const reopened = requireRescheduleSlotSelection(submitted, clinicAdmin, submitted.rescheduleRequest!.id, 'Pilih ulang', 0, rescheduleNow);
  const result = cancelPaidPlan([{ ...reopened, paymentStatus: 'PAID', finalPaymentAmount: 400000 }], reopened.id, clinicAdmin, 'Berhenti');
  assert.equal(result.error, undefined);
  assert.equal(result.appointments?.[0].rescheduleRequest?.status, 'REJECTED');
  assert.equal(result.appointments?.[0].finalPaymentAmount, 400000);
});

test('explicit date overrides reopen holidays consistently with availability, conflict guards and summary', () => {
  const date = '2030-01-07';
  const holiday: PracticeScheduleSettings = { ...structuredClone(settings), holidays: [date] };
  assert.equal(computeDynamicSlotsForDate(date, holiday, [], 'psy-1').slots.length, 0);
  const opened: PracticeScheduleSettings = { ...holiday, customDateOverrides: [{ date, isOpen: true, maxPatients: 2,
    startTime: '10:00', endTime: '16:00', note: 'Praktik pengganti disepakati' }] };
  const booked: Appointment = { ...sessionBill('holiday-booking'), date, psychologistId: 'psy-1', startTime: '10:00', endTime: '11:00' };
  const available = computeDynamicSlotsForDate(date, opened, [booked], 'psy-1');
  assert.equal(available.isHoliday, false);
  assert.equal(available.remainingQuota, 1);
  assert.equal(available.slots.find(slot => slot.startTime === '10:00')?.isAvailable, false);
  assert.equal(available.slots.find(slot => slot.startTime === '11:00')?.isAvailable, true);
  assert.deepEqual(findScheduleConflicts(opened, [booked], 'psy-1'), []);
  const summary = getScheduleAvailabilitySummary(date, opened, [booked], 'psy-1');
  assert.equal(summary.isOpen, true);
  assert.equal(summary.totalOperatingMinutes, 300);
  assert.equal(summary.remainingFreeMinutes, 240);
  assert.equal(summary.operatingHours.startTime, '10:00');
  const full = computeDynamicSlotsForDate(date, { ...opened, customDateOverrides: [{ ...opened.customDateOverrides[0], maxPatients: 1 }] }, [booked], 'psy-1');
  assert.equal(full.isQuotaFull, true);
  const closed: PracticeScheduleSettings = { ...opened, customDateOverrides: [{ ...opened.customDateOverrides[0], isOpen: false }] };
  assert.equal(computeDynamicSlotsForDate(date, closed, [], 'psy-1').isHoliday, true);
  assert.ok(findScheduleConflicts(closed, [booked], 'psy-1').length > 0);
  assert.equal(getScheduleAvailabilitySummary(date, closed, [], 'psy-1').totalOperatingMinutes, 0);
});

test('actual approval reopens a taken target, retains the old slot and can later apply the new selection', () => {
  const submitted = requestPatientReschedule(sessionBill('taken-target'), patient, '2030-01-07', '10:00', '11:00', 'Pindah', rescheduleNow);
  const competing: Appointment = { ...submitted, id: 'other-patient', patientId: 'other', date: '2030-01-07',
    startTime: '10:00', endTime: '11:00', rescheduleRequest: undefined };
  const config = { ...settings, weeklyDays: settings.weeklyDays.map(day => ({ ...day, maxPatients: 5 })) };
  const reviewed = reviewRescheduleAvailability(submitted, clinicAdmin, submitted.rescheduleRequest!.id, 0, [submitted, competing], config, rescheduleNow);
  assert.equal(reviewed.applied, false);
  assert.equal(reviewed.appointment.date, submitted.date);
  assert.equal(reviewed.appointment.rescheduleRequest?.status, 'SLOT_SELECTION_REQUIRED');
  assert.equal(getPatientRescheduleCount(reviewed.appointment), 0);
  const updated = requestPatientReschedule(reviewed.appointment, patient, '2030-01-07', '11:00', '12:00', 'Slot lain', rescheduleNow, 1);
  assert.throws(() => reviewRescheduleAvailability(updated, clinicAdmin, updated.rescheduleRequest!.id, 0, [updated, competing], config, rescheduleNow), /berubah/);
  const accepted = reviewRescheduleAvailability(updated, clinicAdmin, updated.rescheduleRequest!.id, 2, [updated, competing], config, rescheduleNow);
  assert.equal(accepted.applied, true);
  assert.equal(accepted.appointment.startTime, '11:00');
  assert.equal(accepted.appointment.rescheduleRequest?.requestedAt, submitted.rescheduleRequest?.requestedAt);
  assert.equal(getPatientRescheduleCount(accepted.appointment), 1);
  assert.equal(accepted.appointment.dpAmount, submitted.dpAmount);
});

test('expired targets reopen for selection instead of rejecting a timely patient request', () => {
  const submitted = requestPatientReschedule(sessionBill('past-target'), patient, '2026-10-25', '10:00', '11:00', 'Pindah', rescheduleNow);
  const late = new Date('2026-10-26T02:00:00Z');
  const reviewed = reviewRescheduleAvailability(submitted, clinicAdmin, submitted.rescheduleRequest!.id, 0, [submitted], settings, late);
  assert.equal(reviewed.applied, false);
  assert.equal(reviewed.appointment.rescheduleRequest?.status, 'SLOT_SELECTION_REQUIRED');
  assert.equal(canRescheduleAppointment(reviewed.appointment, patient, late), true);
});

test('parallel approvals for one interval apply only one booking while the other can reselect', async () => {
  const makeRequest = (id: string) => requestPatientReschedule({ ...sessionBill(id), date: id === 'one' ? '2030-01-05' : '2030-01-06' },
    patient, '2030-01-07', '10:00', '11:00', 'Pindah', rescheduleNow);
  const one = makeRequest('one');
  const two = makeRequest('two');
  commitWorkflow(state => ({ ...state, appointments: [one, two] }));
  const config = { ...settings, weeklyDays: settings.weeklyDays.map(day => ({ ...day, maxPatients: 5 })) };
  const approve = (id: string) => withWorkflowLock(() => {
    const state = readWorkflowState();
    const source = state.appointments.find(item => item.id === id)!;
    const result = reviewRescheduleAvailability(source, clinicAdmin, source.rescheduleRequest!.id, 0, state.appointments, config, rescheduleNow);
    commitWorkflow(current => ({ ...current, appointments: current.appointments.map(item => item.id === id ? result.appointment : item) }));
    return result.applied;
  });
  assert.deepEqual(await Promise.all([approve('one'), approve('two')]), [true, false]);
  const final = readWorkflowState().appointments;
  assert.equal(final.filter(item => item.date === '2030-01-07' && item.startTime === '10:00').length, 1);
  assert.equal(final.find(item => item.id === 'two')?.rescheduleRequest?.status, 'SLOT_SELECTION_REQUIRED');
});

test('parallel payment retries record a single receipt and persistence failure keeps the old ledger', async () => {
  const paid = verifyInitialReceipt(verifiableBooking(), clinicAdmin, 500000, '2026-10-22', 1, '', rescheduleNow);
  commitWorkflow(state => ({ ...state, appointments: [paid] }));
  const save = () => withWorkflowLock(() => {
    const source = readWorkflowState().appointments[0];
    const updated = appendReceivedPayment(source, clinicAdmin, receipt('parallel-extra', 100000), rescheduleNow);
    if (updated !== source) commitWorkflow(current => ({ ...current, appointments: [updated] }));
  });
  await Promise.all([save(), save()]);
  assert.equal(readWorkflowState().appointments[0].finalPaymentRecords?.length, 1);
  assert.equal(getRecordedCashIn(readWorkflowState().appointments[0]), 600000);
  storage.failWrites = true;
  await assert.rejects(withWorkflowLock(() => {
    const source = readWorkflowState().appointments[0];
    const updated = appendReceivedPayment(source, clinicAdmin, receipt('failed-extra', 100000), rescheduleNow);
    commitWorkflow(current => ({ ...current, appointments: [updated] }));
  }), /belum tersimpan/);
  assert.equal(getRecordedCashIn(readWorkflowState().appointments[0]), 600000);
  assert.equal(readWorkflowState().appointments[0].finalPaymentRecords?.length, 1);
});

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
  const settled = verifyInitialReceipt({ ...first.data.appointment, paymentProofUrl: 'walk-in', transferSenderName: 'Kasir' }, clinicAdmin, 500000, getPracticeDate(), 1);
  const completed: Appointment = { ...settled, status: 'COMPLETED', treatmentPlanStatus: 'COMPLETED' };
  const repeat = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 }, [], [completed], [therapyPackage], INITIAL_USERS, {});
  assert.equal(repeat.success, true);
  assert.notEqual(repeat.data.appointment.treatmentPlanId, completed.treatmentPlanId);
  assert.equal(repeat.data.appointment.continuousSessionNumber, 1);
  assert.equal(repeat.data.appointment.dpAmount, 100000);
  assert.equal(repeat.data.appointment.totalAmount, 500000);
});

const agreedSession = (number = 1): Appointment => ({ ...sessionBill(`agreed-${number}`, number),
  paymentAgreement: { version: 1, accountAppointmentId: 'agreed-1', agreedAt: rescheduleNow.toISOString(),
    sessionCount: 4, sessionAmount: 500000, sessionSubtotal: 500000, sessionDiscount: 0, durationMinutes: 60 },
  ...(number === 1 ? { status: 'PENDING' as const, paymentStatus: 'DP_PENDING_VERIFICATION' as const,
    paymentMethod: 'BANK_TRANSFER' as const, paymentProofUrl: 'proof.jpg', transferSenderName: 'Pasien',
    paymentProofState: 'SUBMITTED' as const, paymentProofVersion: 1 } : { initialRequirementMet: true })
});
const paidAccount = (amount: number) => verifyInitialReceipt(agreedSession(), clinicAdmin, amount, '2026-10-22', 1, '', rescheduleNow);

test('new agreement permits full four-session prepayment but creates only the first invoice', async () => {
  const result = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_FULL', initialPaymentScope: 'PLAN', initialPaymentAmount: 2000000 },
    [], [], [therapyPackage], INITIAL_USERS, {});
  assert.equal(result.success, true);
  const pending = result.data.appointment;
  assert.equal(pending.totalAmount, 500000);
  assert.equal(pending.paymentAgreement?.sessionAmount, 500000);
  assert.equal(pending.initialPaymentRecord?.amount, 2000000);
  assert.equal(getRecordedCashIn(pending), 0);
  const verified = verifyInitialReceipt({ ...pending, paymentProofUrl: 'walk-in', transferSenderName: 'Kasir' }, clinicAdmin, 2000000, getPracticeDate(), 1);
  const summary = getPaymentSummary(verified, [verified]);
  assert.equal(summary.totalAmount, 500000);
  assert.equal(summary.cashReceived, 2000000);
  assert.equal(summary.prepaidAmount, 1500000);
  assert.equal(summary.remainingByFinal, 0);
});

test('FIFO allocation pays future invoices without receipts, second DP, or duplicate cash report rows', () => {
  const all = syncPaymentAllocations([paidAccount(2000000), agreedSession(2), agreedSession(3), agreedSession(4)]);
  for (const item of all) {
    assert.equal(getTreatmentPlanBalance(item, all).remainingAmount, 0);
    assert.equal(item.paymentStatus, 'PAID');
  }
  assert.equal(all[1].dpAmount, 0);
  assert.equal(all[1].initialPaymentRecord, undefined);
  assert.equal(getRecordedCashIn(all[1]), 0);
  assert.equal(buildCashInReportRows(all).length, 1);
  assert.equal(buildCashInReportRows(all).reduce((sum, row) => sum + row.cashInAmount, 0), 2000000);
  assert.deepEqual(getPlanBillingBalance(all), { totalAmount: 2000000, paidAmount: 2000000, remainingAmount: 0 });
});

test('installments before consultation allocate in session order and retries do not consume money twice', () => {
  let account = paidAccount(100000);
  const transfer = { amount: 600000, method: 'CASH' as const, receivedDate: '2026-10-22', idempotencyKey: 'installment-1' };
  account = appendReceivedPayment(account, clinicAdmin, transfer, rescheduleNow);
  assert.equal(appendReceivedPayment(account, clinicAdmin, transfer, rescheduleNow), account);
  const all = syncPaymentAllocations([account, agreedSession(2)]);
  assert.equal(getTreatmentPlanBalance(all[0], all).paidAmount, 500000);
  assert.equal(getTreatmentPlanBalance(all[1], all).paidAmount, 200000);
  assert.equal(getPaymentSummary(all[1], all).remainingByFinal, 1300000);
  assert.equal(getPaymentSummary(all[1], all).remainingAmount, 300000);
  assert.equal(resolvePaymentAccount(all[1], all).id, all[0].id);
  assert.equal(buildCashInReportRows(all).reduce((sum, row) => sum + row.cashInAmount, 0), 700000);
});

test('last consultation is due on its date and an unpaid completed plan stays awaiting settlement', () => {
  let all = syncPaymentAllocations([paidAccount(100000), agreedSession(2), agreedSession(3), agreedSession(4)]);
  const early = new Date('2026-10-23T05:00:00Z');
  assert.equal(getPaymentSummary(all[0], all, early).due, false);
  const due = new Date('2026-10-24T00:01:00+07:00');
  assert.equal(getPaymentSummary(all[0], all, due).due, true);
  all = all.map(item => ({ ...item, status: 'COMPLETED', treatmentPlanStatus: 'COMPLETED' }));
  assert.equal(getPaymentSummary(all[0], all, due).closurePending, true);
  assert.equal(getPaymentSummary(all[0], all, due).remainingByFinal, 1900000);
  const markup = renderToStaticMarkup(createElement(TreatmentPlansTab, { appointments: all,
    onScheduleNextSession: async () => false, onDiscontinuePlan: async () => false, onReschedule: async () => false }));
  assert.match(markup, /Menunggu pelunasan/);
  assert.doesNotMatch(markup, /Selesai &amp; lunas/);
  all[0] = appendReceivedPayment(all[0], clinicAdmin,
    { amount: 1900000, method: 'CASH', receivedDate: '2026-10-24', idempotencyKey: 'settle-last' }, due);
  all = syncPaymentAllocations(all);
  assert.equal(getPaymentSummary(all[0], all, due).closurePending, false);
  assert.equal(getPaymentSummary(all[0], all, due).remainingByFinal, 0);
  assert.ok(all.every(item => item.status === 'COMPLETED'));
});

test('rescheduling the last consultation moves the due date without changing the agreement or cash', () => {
  const first = paidAccount(100000);
  const last = { ...agreedSession(4), date: '2026-10-30' };
  const summary = getPaymentSummary(last, [first, last], new Date('2026-10-25T04:00:00Z'));
  assert.equal(summary.dueDate, '2026-10-30');
  assert.equal(summary.due, false);
  assert.equal(summary.cashReceived, 100000);
  assert.equal(summary.remainingByFinal, 1900000);
});

test('fixed agreement preserves session tariff after catalog edits without repricing legacy invoices', () => {
  const source = paidAccount(2000000);
  assert.equal(getNextSessionBilling(source, { ...therapyPackage, price: 750000 }).totalAmount, 500000);
  assert.equal(getNextSessionBilling(sessionBill('legacy'), { ...therapyPackage, price: 750000 }).totalAmount, 750000);
});

test('cancellation requires every created invoice settled but never creates debt for unbooked sessions', () => {
  const first = paidAccount(100000);
  assert.ok(cancelPaidPlan([first, agreedSession(2)], first.id, clinicAdmin, 'Berhenti').error);
  const settled = paidAccount(500000);
  const result = cancelPaidPlan([settled], settled.id, clinicAdmin, 'Berhenti sebelum sesi kedua');
  assert.equal(result.error, undefined);
  assert.equal(getPaymentSummary(result.appointments![0], result.appointments!).remainingByFinal, 0);
  const prepaid = paidAccount(2000000);
  const stopped = cancelPaidPlan([prepaid], prepaid.id, clinicAdmin, 'Berhenti');
  assert.equal(getRecordedCashIn(stopped.appointments![0]), 2000000);
  assert.equal(getPaymentSummary(stopped.appointments![0], stopped.appointments!).prepaidAmount, 1500000);
});

test('payment accounts cannot cross patients, packages, plans or silently disappear', () => {
  const first = paidAccount(2000000);
  for (const bad of [{ ...agreedSession(2), patientId: 'other' }, { ...agreedSession(2), packageId: 'other' },
    { ...agreedSession(2), treatmentPlanId: 'other' }]) {
    assert.throws(() => resolvePaymentAccount(bad, [first, bad]), /Ledger/);
  }
  assert.throws(() => getTreatmentPlanBalance(agreedSession(2)), /Ledger/);
  assert.equal(getRecordedCashIn({ ...sessionBill('other'), paymentStatus: 'PAID', finalPaymentAmount: 400000 }), 500000);
});

test('Admin-only receipt mutations and payment display keep prepaid funds out of Admin balances', () => {
  const first = paidAccount(2000000);
  assert.throws(() => rejectInitialPaymentProof(agreedSession(), psychologist, 'Tolak', 1, rescheduleNow), /Admin/);
  assert.throws(() => appendReceivedPayment(first, psychologist, { amount: 1000, method: 'CASH',
    idempotencyKey: 'owner-cannot-receive' }, rescheduleNow), /Admin/);
  const adminMarkup = renderToStaticMarkup(createElement(TreatmentPlansTab, { appointments: [first, agreedSession(2)],
    hideFinancialDetails: true, operatorRole: 'ADMIN', onScheduleNextSession: async () => false,
    onDiscontinuePlan: async () => false, onReschedule: async () => false }));
  assert.doesNotMatch(adminMarkup, /2\.000\.000|1\.500\.000|Rp|Diterima/);
  const patientMarkup = renderToStaticMarkup(createElement(PaymentProgress, { appointment: first, appointments: [first] }));
  assert.match(patientMarkup, /Prabayar sesi mendatang/);
  assert.match(patientMarkup, /Lunas seluruh layanan/);
});

test('new psychotherapy booking is refused when a completed plan still has unpaid created invoices', async () => {
  const all: Appointment[] = [paidAccount(100000), agreedSession(2), agreedSession(3), agreedSession(4)]
    .map(item => ({ ...item, status: 'COMPLETED', treatmentPlanStatus: 'COMPLETED' }));
  const result = await PatientEndpoints.bookAppointment({ ...walkInPayload(), packageId: therapyPackage.id,
    paymentMethod: 'CASH_DP', initialPaymentAmount: 100000 }, [], all, [therapyPackage], INITIAL_USERS, {});
  assert.equal(result.success, false);
  assert.match(result.message || '', /pelunasan/);
});

test('prepayment within the agreement is distinct from genuine excess cash and never moves to another plan', () => {
  const first = paidAccount(2500000);
  const summary = getPaymentSummary(first, [first]);
  assert.equal(summary.prepaidAmount, 1500000);
  assert.equal(summary.overpaidAmount, 500000);
  const another: Appointment = { ...agreedSession(), id: 'new-plan-first', treatmentPlanId: 'new-plan',
    paymentAgreement: { ...first.paymentAgreement!, accountAppointmentId: 'new-plan-first' } };
  assert.equal(getPaymentSummary(another, [first, another]).cashReceived, 0);
  assert.equal(getPaymentSummary(another, [first, another]).remainingByFinal, 2000000);
  assert.throws(() => appendReceivedPayment(agreedSession(2), clinicAdmin,
    { amount: 500000, method: 'CASH', idempotencyKey: 'wrong-account' }, rescheduleNow), /ledger awal/);
});

test('single consultation has the same final-day rule and upfront payment settles it without another DP', () => {
  const pending: Appointment = { ...verifiableBooking(), treatmentPlanId: undefined, continuousSessionNumber: undefined,
    continuousSessionTotal: undefined, packageType: 'OFFLINE_CLINIC', date: '2026-10-24', totalAmount: 900000 };
  const partial = verifyInitialReceipt(pending, clinicAdmin, 100000, '2026-10-22', 1, '', rescheduleNow);
  const now = new Date('2026-10-24T03:00:00Z');
  assert.equal(getPaymentSummary(partial, [partial], now).due, true);
  assert.equal(getPaymentSummary(partial, [partial], now).remainingByFinal, 800000);
  const full = verifyInitialReceipt(pending, clinicAdmin, 900000, '2026-10-22', 1, '', rescheduleNow);
  assert.equal(getPaymentSummary(full, [full], now).remainingByFinal, 0);
  assert.equal(getPaymentSummary(full, [full], now).due, false);
  assert.equal(full.dpAmount, 100000);
});

test('parallel payments from different sessions share one account and a failed save never publishes a new allocation', async () => {
  const first = paidAccount(100000);
  commitWorkflow(state => ({ ...state, appointments: [first, agreedSession(2)] }));
  const receive = (id: string, key: string) => withWorkflowLock(() => {
    const current = readWorkflowState().appointments;
    const account = resolvePaymentAccount(current.find(item => item.id === id)!, current);
    const updated = appendReceivedPayment(account, clinicAdmin,
      { amount: 500000, method: 'CASH', idempotencyKey: key, receivedDate: '2026-10-22' }, rescheduleNow);
    const allocated = syncPaymentAllocations(current.map(item => item.id === account.id ? updated : item));
    commitWorkflow(state => ({ ...state, appointments: allocated }));
  });
  const one = receive(first.id, 'parallel-plan-one');
  const two = receive('agreed-2', 'parallel-plan-two');
  await one;
  await two;
  const before = readWorkflowState().appointments;
  assert.equal(getPaymentSummary(before[0], before).cashReceived, 1100000);
  assert.equal(buildCashInReportRows(before).length, 3);
  storage.failWrites = true;
  await assert.rejects(receive('agreed-2', 'cannot-save'), /belum tersimpan/);
  assert.deepEqual(readWorkflowState().appointments, before);
});
