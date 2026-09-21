import React, { useState } from 'react';
import { ScheduleSlot } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface ScheduleTabProps {
  mySchedules: ScheduleSlot[];
  psychologistId: string;
  addScheduleSlot: (psychologistId: string, date: string, startTime: string, endTime: string) => Promise<boolean> | boolean;
  toggleSlotAvailability: (slotId: string) => void;
  deleteScheduleSlot: (slotId: string) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  mySchedules,
  psychologistId,
  addScheduleSlot,
  toggleSlotAvailability,
  deleteScheduleSlot
}) => {
  const [slotDate, setSlotDate] = useState('2026-09-17');
  const [slotStartTime, setSlotStartTime] = useState('16:00');
  const [slotEndTime, setSlotEndTime] = useState('17:00');
  const [slotSuccessMsg, setSlotSuccessMsg] = useState<string | null>(null);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addScheduleSlot(psychologistId, slotDate, slotStartTime, slotEndTime);
    if (success) {
      setSlotSuccessMsg('Slot jadwal baru berhasil ditambahkan!');
      setTimeout(() => setSlotSuccessMsg(null), 3000);
    } else {
      setSlotSuccessMsg('Gagal: Slot dengan jam tersebut sudah ada di tanggal ini.');
      setTimeout(() => setSlotSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Tambah Slot Baru */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Tambah Slot Jadwal Baru</h3>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Tentukan jam aktif praktik Anda. Sistem akan memblokir bentrok jam jika waktu tersebut sudah terdaftar.
          </p>

          {slotSuccessMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${
              slotSuccessMsg.startsWith('Gagal') 
                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                : 'bg-sky-50 text-sky-800 border-sky-200'
            }`}>
              {slotSuccessMsg}
            </div>
          )}

          <form onSubmit={handleAddSlot} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Praktik</label>
              <input
                type="date"
                required
                value={slotDate}
                onChange={e => setSlotDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                <input
                  type="time"
                  required
                  value={slotStartTime}
                  onChange={e => setSlotStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                <input
                  type="time"
                  required
                  value={slotEndTime}
                  onChange={e => setSlotEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Tambahkan Slot ke Kalender
            </button>
          </form>
        </div>

        {/* List Slot Aktif & Status */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Slot Jadwal & Ketersediaan Anda</h3>
              <p className="text-xs text-slate-500">Klik tombol status untuk mengaktifkan / menonaktifkan slot libur</p>
            </div>
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              {mySchedules.length} Total Slot
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {mySchedules.map(slot => (
              <div
                key={slot.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3 hover:bg-white transition-colors"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {slot.date} • {slot.startTime} - {slot.endTime} WIB
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {slot.isBooked ? (
                      <span className="text-rose-600 font-bold">● Terpesan Pasien (Terkunci)</span>
                    ) : slot.isAvailable ? (
                      <span className="text-emerald-700 font-semibold">● Terbuka untuk Booking</span>
                    ) : (
                      <span className="text-slate-400">● Nonaktif / Libur</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!slot.isBooked && (
                    <button
                      onClick={() => toggleSlotAvailability(slot.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        slot.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {slot.isAvailable ? 'Tersedia' : 'Nonaktif'}
                    </button>
                  )}
                  {!slot.isBooked && (
                    <button
                      onClick={() => deleteScheduleSlot(slot.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Hapus slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
