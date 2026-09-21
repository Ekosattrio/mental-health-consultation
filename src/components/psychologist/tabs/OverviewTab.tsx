import React from 'react';
import { Appointment, ScheduleSlot, PsychologistProfile, PsychologistPageCmsConfig } from '../../../types';
import { MessageSquare, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

interface OverviewTabProps {
  myAppointments: Appointment[];
  mySchedules: ScheduleSlot[];
  profile: PsychologistProfile | undefined;
  activeChatApt: Appointment | undefined;
  psychologistCms: PsychologistPageCmsConfig;
  onOpenEmr: (patientId: string, aptId: string) => void;
  onOpenChat: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  myAppointments,
  mySchedules,
  profile,
  activeChatApt,
  psychologistCms,
  onOpenEmr,
  onOpenChat
}) => {
  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sesi Ditangani</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{myAppointments.length} Sesi</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Online & Tatap Muka</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Slot Waktu Aktif</span>
          <div className="text-2xl font-extrabold text-sky-700 mt-1">
            {mySchedules.filter(s => s.isAvailable).length} Slot
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Tersedia untuk dibooking</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pasien Aktif</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {new Set(myAppointments.map(a => a.patientId)).size} Orang
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Memiliki riwayat terapi</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating Praktik</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{profile?.rating || 4.9} ★</div>
          <p className="text-[11px] text-slate-500 mt-0.5">{profile?.reviewCount || 140} ulasan pasien</p>
        </div>
      </div>

      {/* Active Consultation Banner */}
      {activeChatApt && (
        <div className="p-6 bg-gradient-to-r from-sky-900 to-slate-900 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              Sesi Konsultasi Terjadwal
            </span>
            <h3 className="text-xl font-bold mt-2">
              Pasien: {activeChatApt.patientName} ({activeChatApt.packageName})
            </h3>
            <p className="text-xs text-sky-200 mt-1">
              Jadwal: {activeChatApt.date} • {activeChatApt.startTime} - {activeChatApt.endTime} WIB • Lokasi: {activeChatApt.meetingLocation}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onOpenEmr(activeChatApt.patientId, activeChatApt.id)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
            >
              Buka Rekam Medis EMR
            </button>
            <button
              onClick={onOpenChat}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              Buka Live Chat
            </button>
          </div>
        </div>
      )}

      {/* Clinical Guidelines & SOP Notice from CMS - Fixed Clean Grid Layout */}
      <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/40 border border-amber-200/90 rounded-3xl p-6 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Guidelines & HIMPSI Code of Ethics */}
          <div className="xl:col-span-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 bg-amber-200/90 text-amber-900 rounded-2xl shrink-0 shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {psychologistCms.guidelinesTitle}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300">
                      Kode Etik HIMPSI
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 font-medium mt-0.5">
                    Pedoman Kepatuhan Etika Profesi & Layanan Konseling Klinis
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-amber-200/70 shadow-2xs">
                {psychologistCms.guidelinesContent}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-amber-950 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-200 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                Input Rekam Medis SOAP Maks. 24 Jam
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-100/90 px-3 py-1.5 rounded-xl border border-amber-200 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                Kontak Supervisor: {psychologistCms.clinicalSupervisorContact}
              </span>
            </div>
          </div>

          {/* Right Column: Clinical Board Announcement & Remuneration */}
          <div className="xl:col-span-5 bg-white/95 rounded-2xl border border-amber-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 border-b border-amber-100/80 pb-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  {psychologistCms.announcementTitle}
                </div>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {psychologistCms.announcementContent}
              </p>
            </div>

            <div className="pt-2.5 border-t border-amber-100 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-500 font-medium">Kebijakan Remunerasi:</span>
              <span className="font-bold text-slate-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/70 text-right">
                {psychologistCms.remunerationPolicy}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

