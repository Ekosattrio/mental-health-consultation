import React, { useState, useEffect } from 'react';
import { ScheduleSlot, Appointment, ConsultationPackage } from '../../../types';
import {
  Calendar,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  CalendarOff,
  CalendarDays
} from 'lucide-react';
import {
  DayScheduleConfig,
  CustomDateOverride,
  PracticeScheduleSettings,
  loadScheduleSettings,
  saveScheduleSettings
} from '../../../data/scheduleConfig';

interface ScheduleTabProps {
  mySchedules: ScheduleSlot[];
  psychologistId: string;
  appointments?: Appointment[];
  packages?: ConsultationPackage[];
  addScheduleSlot: (psychologistId: string, date: string, startTime: string, endTime: string) => Promise<boolean> | boolean;
  toggleSlotAvailability: (slotId: string) => void;
  deleteScheduleSlot: (slotId: string) => void;
}

export const ScheduleTab: React.FC<ScheduleTabProps> = ({
  psychologistId
}) => {
  const [settings, setSettings] = useState<PracticeScheduleSettings>(loadScheduleSettings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Form states for Custom Date Override
  const [overrideDate, setOverrideDate] = useState('2026-10-15');
  const [overrideIsOpen, setOverrideIsOpen] = useState(true);
  const [overrideMaxPatients, setOverrideMaxPatients] = useState(2);
  const [overrideStartTime, setOverrideStartTime] = useState('09:00');
  const [overrideEndTime, setOverrideEndTime] = useState('14:00');
  const [overrideNote, setOverrideNote] = useState('Praktik Terbatas');

  // Form state for Holidays
  const [newHoliday, setNewHoliday] = useState('2026-10-28');

  useEffect(() => {
    saveScheduleSettings(settings);
  }, [settings]);

  const handleSetDayStatus = (dayIndex: number, isOpen: boolean) => {
    setSettings(prev => ({
      ...prev,
      weeklyDays: prev.weeklyDays.map(d =>
        d.dayIndex === dayIndex ? { ...d, isOpen } : d
      )
    }));
  };

  const handleDayChange = (dayIndex: number, field: keyof DayScheduleConfig, value: any) => {
    setSettings(prev => ({
      ...prev,
      weeklyDays: prev.weeklyDays.map(d =>
        d.dayIndex === dayIndex ? { ...d, [field]: value } : d
      )
    }));
  };

  // Add or Update Custom Date Override
  const handleAddOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideDate) return;

    const newOverride: CustomDateOverride = {
      date: overrideDate,
      isOpen: overrideIsOpen,
      maxPatients: overrideIsOpen ? Number(overrideMaxPatients) : 0,
      startTime: overrideStartTime,
      endTime: overrideEndTime,
      note: overrideNote
    };

    setSettings(prev => ({
      ...prev,
      customDateOverrides: [
        ...(prev.customDateOverrides || []).filter(o => o.date !== overrideDate),
        newOverride
      ].sort((a, b) => a.date.localeCompare(b.date))
    }));

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleRemoveOverride = (date: string) => {
    setSettings(prev => ({
      ...prev,
      customDateOverrides: (prev.customDateOverrides || []).filter(o => o.date !== date)
    }));
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday || settings.holidays.includes(newHoliday)) return;
    setSettings(prev => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday].sort()
    }));
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleRemoveHoliday = (date: string) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter(h => h !== date)
    }));
  };

  const handleSaveAll = () => {
    saveScheduleSettings(settings);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header Ringkas & Modern */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Pengaturan Hari Praktik & Kuota Pasien
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Atur hari buka/libur mingguan dan kuota spesifik tanggal tertentu. Sistem booking otomatis menyelaraskan slot pasien.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Simpan Jadwal Praktik</span>
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Jadwal dan kuota berhasil disimpan dan otomatis disinkronkan ke sistem booking pasien!</span>
        </div>
      )}

      {/* 2. TABEL JADWAL MINGGUAN RUTIN: Padat, Rapi, Tanpa Kolom Skema Waktu */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="py-2.5 px-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Jadwal Rutin Mingguan (Senin – Minggu)
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">
            Pilih Buka / Libur untuk mengubah status operasional
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-28">Hari</th>
                <th className="py-2.5 px-4 w-44">Status Praktik</th>
                <th className="py-2.5 px-4">Jam Operasional</th>
                <th className="py-2.5 px-4 w-44">Maksimal Pasien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settings.weeklyDays.map(day => (
                <tr
                  key={day.dayIndex}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    !day.isOpen ? 'bg-slate-50/40' : ''
                  }`}
                >
                  {/* Nama Hari */}
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className="text-xs font-black text-slate-900 block">{day.dayName}</span>
                  </td>

                  {/* UI Status Praktik: Hanya yang ON yang ada warnanya */}
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleSetDayStatus(day.dayIndex, true)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          day.isOpen
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-slate-700 bg-transparent'
                        }`}
                      >
                        {day.isOpen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        <span>Buka</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetDayStatus(day.dayIndex, false)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          !day.isOpen
                            ? 'bg-rose-600 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-slate-700 bg-transparent'
                        }`}
                      >
                        {!day.isOpen && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        <span>Libur</span>
                      </button>
                    </div>
                  </td>

                  {/* Jam Operasional */}
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 max-w-xs">
                      <input
                        type="time"
                        disabled={!day.isOpen}
                        value={day.startTime}
                        onChange={e => handleDayChange(day.dayIndex, 'startTime', e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <span className="font-bold text-slate-400 text-xs">s/d</span>
                      <input
                        type="time"
                        disabled={!day.isOpen}
                        value={day.endTime}
                        onChange={e => handleDayChange(day.dayIndex, 'endTime', e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>
                  </td>

                  {/* Maksimal Pasien */}
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={15}
                        disabled={!day.isOpen}
                        value={day.maxPatients}
                        onChange={e => handleDayChange(day.dayIndex, 'maxPatients', Number(e.target.value))}
                        className="w-14 px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 text-center disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <span className="text-[11px] font-medium text-slate-500">orang / hari</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. DUA KOLOM BAWAH TERSTRUKTUR: KUOTA TANGGAL KHUSUS & CUTI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* KOLOM KIRI: PENYESUAIAN KUOTA TANGGAL KHUSUS */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
              <CalendarDays className="w-3.5 h-3.5 text-sky-700" />
              <span>Penyesuaian Kuota & Praktik Tanggal Tertentu</span>
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 text-[10px] font-bold border border-sky-100">
              Khusus
            </span>
          </div>

          {/* Form Tambah Kuota Khusus */}
          <form onSubmit={handleAddOverride} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Pilih Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={overrideDate}
                  onChange={e => setOverrideDate(e.target.value)}
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Status Praktik:
                </label>
                <div className="inline-flex items-center p-0.5 bg-slate-200/70 rounded-lg border border-slate-200 w-full">
                  <button
                    type="button"
                    onClick={() => setOverrideIsOpen(true)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      overrideIsOpen ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Buka Khusus
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideIsOpen(false)}
                    className={`flex-1 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      !overrideIsOpen ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Libur Khusus
                  </button>
                </div>
              </div>
            </div>

            {overrideIsOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Maks. Pasien:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={overrideMaxPatients}
                    onChange={e => setOverrideMaxPatients(Number(e.target.value))}
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Jam Mulai:
                  </label>
                  <input
                    type="time"
                    value={overrideStartTime}
                    onChange={e => setOverrideStartTime(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                    Jam Selesai:
                  </label>
                  <input
                    type="time"
                    value={overrideEndTime}
                    onChange={e => setOverrideEndTime(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Keterangan (cth: Hanya 2 pasien siang)"
                value={overrideNote}
                onChange={e => setOverrideNote(e.target.value)}
                className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
              />

              <button
                type="submit"
                className="px-3.5 py-1 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Terapkan</span>
              </button>
            </div>
          </form>

          {/* List Overrides */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {(!settings.customDateOverrides || settings.customDateOverrides.length === 0) ? (
              <p className="text-[11px] text-slate-400 italic p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-center">
                Belum ada penyesuaian kuota khusus untuk tanggal tertentu.
              </p>
            ) : (
              settings.customDateOverrides.map(item => (
                <div
                  key={item.date}
                  className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{item.date}</strong>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.isOpen
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.isOpen ? `Maks. ${item.maxPatients} Pasien` : 'Libur Khusus'}
                    </span>
                    {item.note && (
                      <span className="text-slate-500 text-[11px] truncate max-w-[140px]">({item.note})</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveOverride(item.date)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KOLOM KANAN: HARI LIBUR / CUTI KHUSUS */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
          <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
              <CalendarOff className="w-3.5 h-3.5 text-rose-600" />
              <span>Hari Libur Tambahan / Cuti</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              {settings.holidays.length} Tanggal
            </span>
          </div>

          <form onSubmit={handleAddHoliday} className="flex gap-2">
            <input
              type="date"
              required
              value={newHoliday}
              onChange={e => setNewHoliday(e.target.value)}
              className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {settings.holidays.map(holiday => (
              <span
                key={holiday}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-bold"
              >
                <span>{holiday}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHoliday(holiday)}
                  className="text-rose-400 hover:text-rose-700 cursor-pointer ml-0.5"
                  title="Hapus"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
