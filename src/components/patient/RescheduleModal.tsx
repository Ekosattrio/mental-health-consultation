import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Appointment } from '../../types';
import {
  CalendarClock,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { Tooltip } from '../common/Tooltip';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onConfirmReschedule: (
    aptId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    reason?: string
  ) => Promise<boolean>;
}

const AVAILABLE_TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '09:00 - 10:00 WIB (Pagi)' },
  { start: '10:30', end: '11:30', label: '10:30 - 11:30 WIB (Pagi)' },
  { start: '13:00', end: '14:00', label: '13:00 - 14:00 WIB (Siang)' },
  { start: '14:30', end: '15:30', label: '14:30 - 15:30 WIB (Sore)' },
  { start: '16:00', end: '17:00', label: '16:00 - 17:00 WIB (Sore)' }
];

const RESCHEDULE_REASONS = [
  { id: 'HEALTH', label: 'Kondisi Kesehatan / Sakit Mendadak' },
  { id: 'WORK', label: 'Tugas Pekerjaan / Dinas Luar Kota' },
  { id: 'FAMILY', label: 'Keperluan Keluarga Mendesak' },
  { id: 'TRANSPORT', label: 'Kendala Transportasi / Perjalanan' },
  { id: 'OTHER', label: 'Alasan Pribadi Lainnya' }
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onConfirmReschedule
}) => {
  // Hitung tanggal minimal H+1
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().slice(0, 10);

  // Default tanggal baru = H+2 dari hari ini
  const defaultNextDate = new Date();
  defaultNextDate.setDate(defaultNextDate.getDate() + 2);
  const defaultDateStr = defaultNextDate.toISOString().slice(0, 10);

  const [newDate, setNewDate] = useState<string>(defaultDateStr);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);
  const [selectedReason, setSelectedReason] = useState<string>('Kondisi Kesehatan / Sakit Mendadak');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !appointment) return null;

  const selectedSlot = AVAILABLE_TIME_SLOTS[selectedSlotIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) return;

    setIsSubmitting(true);
    const fullReason = note.trim()
      ? `${selectedReason}: ${note.trim()}`
      : selectedReason;

    const ok = await onConfirmReschedule(
      appointment.id,
      newDate,
      selectedSlot.start,
      selectedSlot.end,
      fullReason
    );

    setIsSubmitting(false);
    if (ok) {
      setIsSuccess(true);
    }
  };

  const handleCloseAndReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 max-h-[92vh] overflow-y-auto custom-scrollbar flex flex-col justify-between animate-in zoom-in-95 duration-200"
      >
        {isSuccess ? (
          /* STATE SUKSES */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Reschedule Berhasil Diterapkan!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Jadwal konsultasi Anda telah diperbarui pada sistem kalender klinik. Tidak ada biaya tambahan yang dikenakan.
              </p>
            </div>

            {/* Rincian Baru */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Kode Booking:</span>
                <span className="font-bold text-slate-900">{appointment.bookingCode}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Jadwal Baru:</span>
                <span className="font-black text-emerald-700">
                  {newDate} ({selectedSlot.start} - {selectedSlot.end} WIB)
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Psikolog:</span>
                <span className="font-bold text-slate-900">{appointment.psychologistName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Status DP / Pelunasan:</span>
                <span className="font-bold text-slate-800">Dialihkan Penuh (Aman)</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Selesai & Lihat Jadwal Saya
              </button>
            </div>
          </div>
        ) : (
          /* FORM FLOW RESCHEDULE */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Pengajuan Reschedule Jadwal
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Pindahkan sesi konsultasi Anda ke tanggal atau jam yang lebih sesuai.
                  </p>
                </div>
              </div>

              <Tooltip content="Tutup Jendela (Esc)" position="bottom">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup"
                  className="w-8 h-8 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>

            {/* Informasi Sesi Saat Ini */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Sesi yang Diubah:</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-black text-slate-900 text-[10px]">
                  #{appointment.bookingCode}
                </span>
              </div>

              <div className="font-bold text-slate-900 text-sm">
                {appointment.packageName}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Jadwal Lama: <strong className="text-rose-700 font-bold">{appointment.date} ({appointment.startTime} - {appointment.endTime} WIB)</strong>
                </span>
              </div>
            </div>

            {/* Kebijakan Reschedule H-1 */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Kebijakan Praktik:</strong> Pengajuan perubahan jadwal minimal H-1 (24 jam sebelum sesi dimulai). Uang muka (DP 50%) atau biaya pelunasan Anda otomatis dialihkan 100% ke jadwal baru tanpa biaya administrasi.
              </div>
            </div>

            {/* Langkah 1: Pilih Tanggal Baru */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-800">
                1. Pilih Tanggal Baru (Minimal H+1)
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={minDateStr}
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            {/* Langkah 2: Pilih Jam / Slot Waktu Baru */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-800">
                2. Pilih Jam Konsultasi Baru
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_TIME_SLOTS.map((slot, index) => {
                  const isSelected = selectedSlotIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedSlotIndex(index)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{slot.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Langkah 3: Alasan Permohonan Reschedule */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-800">
                3. Alasan Permohonan Reschedule
              </label>
              <select
                value={selectedReason}
                onChange={e => setSelectedReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white cursor-pointer"
              >
                {RESCHEDULE_REASONS.map(r => (
                  <option key={r.id} value={r.label}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Catatan Tambahan (Opsional) */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">
                Catatan Tambahan untuk Psikolog (Opsional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Misal: Mohon maaf dokter, ada jadwal rapat mendadak di kantor."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Ringkasan Perubahan */}
            <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Ringkasan Perubahan
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 line-through">
                  {appointment.date} ({appointment.startTime} WIB)
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-extrabold text-emerald-700">
                  {newDate} ({selectedSlot.start} WIB)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CalendarClock className="w-3.5 h-3.5" />
                    <span>Konfirmasi Reschedule Jadwal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
