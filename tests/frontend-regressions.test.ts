import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServicePicker } from '../src/components/patient/ServicePicker';
import { INITIAL_APPOINTMENTS, INITIAL_USERS, INITIAL_LANDING_CMS, INITIAL_PATIENT_CMS } from '../src/data/mockData';
import { AppProvider } from '../src/context/AppContext';
import { Footer } from '../src/components/layout/Footer';
import { OverviewTab } from '../src/components/patient/tabs/OverviewTab';
import { RescheduleAudit } from '../src/components/common/RescheduleAudit';
import { updateOwnAccountProfile } from '../src/utils/accountProfile';
import { persistBrowserValue, validateLandingCms, mergePatientCms } from '../src/utils/cms';
import { fitTooltip } from '../src/utils/tooltipPosition';
import { Appointment, ConsultationPackage } from '../src/types';
import { PatientEndpoints, BookAppointmentPayload } from '../src/api/patientEndpoints';
import { PatientController } from '../src/controllers/PatientController';
import { computeDynamicSlotsForDate, PracticeScheduleSettings } from '../src/data/scheduleConfig';
import { getMinimumBookingDate, getPracticeDate, timeSlotKey, findTimeSlot } from '../src/utils/bookingPolicy';
import { readXsrfCookie } from '../src/utils/csrf';
import { csvCell, csvRow, escapeHtml, spreadsheetText } from '../src/utils/exportEncoding';
import { getRecordedCashIn } from '../src/utils/payments';
import { canRescheduleAppointment, rescheduleExistingAppointment, getScheduleVersion, assertScheduleVersion } from '../src/utils/reschedulePolicy';
import { BookingHold, WORKFLOW_STORAGE_KEY, WORKFLOW_UPDATED_EVENT, commitWorkflow,
  readWorkflowState, savePaymentReconciliation, withWorkflowLock, findActivePatientHold } from '../src/utils/workflowStore';

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

test('only the assigned psychologist may recover a missed session', () => {
  const source = missedSession();
  assert.equal(canRescheduleAppointment(source, reschedulePsychologist), true);
  for (const actor of [
    { id: 'admin', name: 'Admin', role: 'ADMIN' as const },
    { id: source.patientId, name: 'Pasien', role: 'PATIENT' as const },
    { ...reschedulePsychologist, id: 'other-psychologist' }
  ]) {
    assert.equal(canRescheduleAppointment(source, actor), false);
    assert.throws(() => rescheduleExistingAppointment(source, actor, '2026-10-23', '10:00', '11:00', 'Setuju', rescheduleNow));
  }
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
  const source = { ...missedSession(), status: 'CONFIRMED' as const };
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
