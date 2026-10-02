import React, { useState, useEffect } from 'react';
import {
  LandingPageCmsConfig,
  PatientPageCmsConfig,
  PsychologistPageCmsConfig,
  PsychologistProfile,
  User
} from '../../../types';
import {
  INITIAL_LANDING_CMS,
  INITIAL_PATIENT_CMS,
  INITIAL_PSYCHOLOGIST_CMS
} from '../../../data/mockData';
import {
  Save,
  RotateCcw,
  Sparkles,
  Users,
  PhoneCall,
  Globe,
  HeartHandshake,
  Stethoscope,
  Shield,
  FileText,
  LayoutTemplate,
  ChevronDown,
  ChevronUp,
  Building2
} from 'lucide-react';

interface CmsTabProps {
  cmsConfig: LandingPageCmsConfig;
  patientCms: PatientPageCmsConfig;
  psychologistCms: PsychologistPageCmsConfig;
  psychologists: PsychologistProfile[];
  users: User[];
  updateLandingCms: (config: Partial<LandingPageCmsConfig>) => void;
  updatePatientCms: (config: Partial<PatientPageCmsConfig>) => void;
  updatePsychologistCms: (config: Partial<PsychologistPageCmsConfig>) => void;
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, userId?: string) => void;
}

export const CmsTab: React.FC<CmsTabProps> = ({
  cmsConfig,
  patientCms,
  psychologistCms,
  psychologists,
  users,
  updateLandingCms,
  updatePatientCms,
  updatePsychologistCms,
  updatePsychologistProfile
}) => {
  const [adminCmsSubTab, setAdminCmsSubTab] = useState<'LANDING' | 'PATIENT' | 'PSYCHOLOGIST'>('LANDING');

  // Single-open exclusive accordion states (Hanya 1 yang bisa terbuka di setiap tab)
  const [openLandingSection, setOpenLandingSection] = useState<string | null>('hero');
  const [openPatientSection, setOpenPatientSection] = useState<string | null>('welcome');
  const [openPsychologistSection, setOpenPsychologistSection] = useState<string | null>('guidelines');

  // Landing Page CMS form state
  const [cmsForm, setCmsForm] = useState<LandingPageCmsConfig>(cmsConfig);
  useEffect(() => {
    setCmsForm(cmsConfig);
  }, [cmsConfig]);

  const handleSaveCms = (e: React.FormEvent) => {
    e.preventDefault();
    updateLandingCms(cmsForm);
  };

  const handleResetCms = () => {
    setCmsForm(INITIAL_LANDING_CMS);
    updateLandingCms(INITIAL_LANDING_CMS);
  };

  // Patient Page CMS state
  const [patientCmsForm, setPatientCmsForm] = useState<PatientPageCmsConfig>(patientCms);
  useEffect(() => {
    setPatientCmsForm(patientCms);
  }, [patientCms]);

  const handleSavePatientCms = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientCms(patientCmsForm);
  };

  const handleResetPatientCms = () => {
    setPatientCmsForm(INITIAL_PATIENT_CMS);
    updatePatientCms(INITIAL_PATIENT_CMS);
  };

  // Psychologist Page CMS state
  const [psychologistCmsForm, setPsychologistCmsForm] = useState<PsychologistPageCmsConfig>(psychologistCms);
  useEffect(() => {
    setPsychologistCmsForm(psychologistCms);
  }, [psychologistCms]);

  const handleSavePsychologistCms = (e: React.FormEvent) => {
    e.preventDefault();
    updatePsychologistCms(psychologistCmsForm);
  };

  const handleResetPsychologistCms = () => {
    setPsychologistCmsForm(INITIAL_PSYCHOLOGIST_CMS);
    updatePsychologistCms(INITIAL_PSYCHOLOGIST_CMS);
  };

  return (
    <div className="space-y-4">
      {/* 3-Subtab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
        {[
          { id: 'LANDING', label: '1. Landing Page (Beranda)', icon: Globe },
          { id: 'PATIENT', label: '2. Halaman Pasien', icon: HeartHandshake },
          { id: 'PSYCHOLOGIST', label: '3. Halaman Dokter / Psikolog', icon: Stethoscope }
        ].map(sub => {
          const Icon = sub.icon;
          const isActive = adminCmsSubTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setAdminCmsSubTab(sub.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-purple-900 shadow-2xs border border-purple-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: CMS LANDING PAGE (ACCORDION EKSKLUSIF) */}
      {adminCmsSubTab === 'LANDING' && (
        <form onSubmit={handleSaveCms} className="space-y-3">
          {/* Action Bar Ringkas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-purple-600" />
                CMS Landing Page (Pengaturan Beranda)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih salah satu bagian di bawah untuk mengubah konten beranda secara terfokus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetCms}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Landing
              </button>
            </div>
          </div>

          {/* ACCORDION 1: HERO JUMBOTRON */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenLandingSection(prev => prev === 'hero' ? null : 'hero')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    1. Hero Jumbotron & Kalimat Utama
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Badge, judul utama, dan kalimat sambutan pertama calon pasien.
                  </p>
                </div>
              </div>
              {openLandingSection === 'hero' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openLandingSection === 'hero' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Teks Kecil (Atas Judul)</label>
                  <input
                    type="text"
                    required
                    value={cmsForm.heroBadge}
                    onChange={e => setCmsForm({ ...cmsForm, heroBadge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Utama Hero (Heading 1)</label>
                  <input
                    type="text"
                    required
                    value={cmsForm.heroTitle}
                    onChange={e => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subjudul / Deskripsi Pendukung</label>
                  <textarea
                    rows={2}
                    required
                    value={cmsForm.heroSubtitle}
                    onChange={e => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: CAROUSEL PSIKOLOG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenLandingSection(prev => prev === 'carousel' ? null : 'carousel')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    2. Konfigurasi Carousel Psikolog
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Kecepatan rotasi otomatis dan status kesiapan dokter hari ini.
                  </p>
                </div>
              </div>
              {openLandingSection === 'carousel' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openLandingSection === 'carousel' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5 text-xs bg-slate-50/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Bagian Slider</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.sliderTitle}
                      onChange={e => setCmsForm({ ...cmsForm, sliderTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sub-label / Keterangan Status</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.sliderSubtitle}
                      onChange={e => setCmsForm({ ...cmsForm, sliderSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoPlayCheck"
                      checked={cmsForm.sliderAutoPlay}
                      onChange={e => setCmsForm({ ...cmsForm, sliderAutoPlay: e.target.checked })}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <label htmlFor="autoPlayCheck" className="font-bold text-slate-700 cursor-pointer">
                      Aktifkan Auto-Play Pergantian Kartu Otomatis
                    </label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Interval:</span>
                    <input
                      type="number"
                      min={2}
                      max={30}
                      value={cmsForm.sliderIntervalSeconds}
                      onChange={e => setCmsForm({ ...cmsForm, sliderIntervalSeconds: Number(e.target.value) })}
                      className="w-14 px-2 py-1 rounded-lg border border-slate-200 text-center font-bold text-slate-900"
                    />
                    <span className="text-slate-500">detik</span>
                  </div>
                </div>

                {/* Status Psikolog */}
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">
                    Status Kehadiran Praktik di Beranda:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {psychologists.map(psy => {
                      const userObj = users.find(u => u.id === psy.userId);
                      const name = userObj?.name || psy.userId;
                      const isAvailable = psy.isAvailableToday !== false;

                      return (
                        <div
                          key={psy.userId}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 bg-white ${
                            isAvailable ? 'border-emerald-200' : 'border-slate-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                              <Stethoscope className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <h6 className="text-xs font-bold text-slate-900 truncate">{name}</h6>
                              <p className="text-[10px] text-slate-400 font-semibold truncate">{psy.sipNumber}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => updatePsychologistProfile({ ...psy, isAvailableToday: !isAvailable }, psy.userId)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isAvailable ? '✓ Aktif' : 'Libur'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: KONTAK RESMI & ALAMAT KLINIK */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenLandingSection(prev => prev === 'contact' ? null : 'contact')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    3. Informasi Kontak Resmi & Alamat Klinik
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Alamat klinik tatap muka, nomor telepon, WhatsApp, dan email resmi.
                  </p>
                </div>
              </div>
              {openLandingSection === 'contact' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openLandingSection === 'contact' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Klinik Tatap Muka</label>
                  <textarea
                    rows={2}
                    required
                    value={cmsForm.clinicAddress}
                    onChange={e => setCmsForm({ ...cmsForm, clinicAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">No. Telepon / Hotline</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.clinicPhone}
                      onChange={e => setCmsForm({ ...cmsForm, clinicPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Siaga</label>
                    <input
                      type="text"
                      required
                      value={cmsForm.clinicWhatsapp}
                      onChange={e => setCmsForm({ ...cmsForm, clinicWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
                    <input
                      type="email"
                      required
                      value={cmsForm.clinicEmail}
                      onChange={e => setCmsForm({ ...cmsForm, clinicEmail: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* SUBTAB 2: CMS HALAMAN PASIEN (ACCORDION EKSKLUSIF) */}
      {adminCmsSubTab === 'PATIENT' && (
        <form onSubmit={handleSavePatientCms} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                CMS Halaman Pasien
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola pesan sambutan, tips harian, dan kontak darurat pasien.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPatientCms}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Pasien
              </button>
            </div>
          </div>

          {/* ACCORDION 1: BANNER SAMBUTAN & TIPS HARIAN */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenPatientSection(prev => prev === 'welcome' ? null : 'welcome')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    1. Banner Sambutan & Tips Psikoedukasi Harian
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pesan motivasi dan tips kesehatan mental di beranda pasien.
                  </p>
                </div>
              </div>
              {openPatientSection === 'welcome' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openPatientSection === 'welcome' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Banner Sambutan</label>
                  <input
                    type="text"
                    required
                    value={patientCmsForm.welcomeBannerTitle}
                    onChange={e => setPatientCmsForm({ ...patientCmsForm, welcomeBannerTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subjudul / Pesan Empati</label>
                  <textarea
                    rows={2}
                    required
                    value={patientCmsForm.welcomeBannerSubtitle}
                    onChange={e => setPatientCmsForm({ ...patientCmsForm, welcomeBannerSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tips Kesehatan Mental Hari Ini</label>
                  <textarea
                    rows={2}
                    required
                    value={patientCmsForm.dailyMentalHealthTip}
                    onChange={e => setPatientCmsForm({ ...patientCmsForm, dailyMentalHealthTip: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: KONTAK SIAGA KRISIS 24 JAM */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenPatientSection(prev => prev === 'hotline' ? null : 'hotline')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    2. Kontak Siaga Krisis & Pencegahan Bunuh Diri (24 Jam)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Nomor telepon darurat resmi dan WhatsApp siaga pasien krisis.
                  </p>
                </div>
              </div>
              {openPatientSection === 'hotline' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openPatientSection === 'hotline' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Judul Box Krisis</label>
                    <input
                      type="text"
                      required
                      value={patientCmsForm.crisisHotlineTitle}
                      onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisHotlineTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Disclaimer / Ketentuan Darurat</label>
                    <input
                      type="text"
                      required
                      value={patientCmsForm.crisisNotice}
                      onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisNotice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Telepon Hotline Krisis</label>
                    <input
                      type="text"
                      required
                      value={patientCmsForm.crisisHotlineNumber}
                      onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisHotlineNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">WhatsApp Siaga Darurat</label>
                    <input
                      type="text"
                      required
                      value={patientCmsForm.crisisWhatsapp}
                      onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisWhatsapp: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      )}

      {/* SUBTAB 3: CMS HALAMAN DOKTER / PSIKOLOG (ACCORDION EKSKLUSIF) */}
      {adminCmsSubTab === 'PSYCHOLOGIST' && (
        <form onSubmit={handleSavePsychologistCms} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-purple-600" />
                CMS Halaman Dokter / Psikolog
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur panduan klinis dan pengumuman internal praktik.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetPsychologistCms}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Dokter
              </button>
            </div>
          </div>

          {/* ACCORDION 1: PANDUAN KLINIS */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenPsychologistSection(prev => prev === 'guidelines' ? null : 'guidelines')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    1. Panduan Klinis & Protokol Pelayanan Profesi
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Etika pelayanan, kerahasiaan informed consent, dan SOP praktik.
                  </p>
                </div>
              </div>
              {openPsychologistSection === 'guidelines' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openPsychologistSection === 'guidelines' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Panduan Klinis</label>
                  <input
                    type="text"
                    required
                    value={psychologistCmsForm.guidelinesTitle}
                    onChange={e =>
                      setPsychologistCmsForm({ ...psychologistCmsForm, guidelinesTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Isi Panduan Klinis</label>
                  <textarea
                    rows={3}
                    required
                    value={psychologistCmsForm.guidelinesContent}
                    onChange={e =>
                      setPsychologistCmsForm({ ...psychologistCmsForm, guidelinesContent: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 2: PENGUMUMAN INTERNAL */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenPsychologistSection(prev => prev === 'internal' ? null : 'internal')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    2. Pengumuman Internal & Kebijakan Praktik
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Pemberitahuan operasional internal dan kontak darurat supervisor.
                  </p>
                </div>
              </div>
              {openPsychologistSection === 'internal' ? (
                <ChevronUp className="w-4 h-4 text-purple-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openPsychologistSection === 'internal' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3 text-xs bg-slate-50/40">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman</label>
                  <input
                    type="text"
                    required
                    value={psychologistCmsForm.announcementTitle}
                    onChange={e =>
                      setPsychologistCmsForm({ ...psychologistCmsForm, announcementTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Isi Pengumuman</label>
                  <textarea
                    rows={2}
                    required
                    value={psychologistCmsForm.announcementContent}
                    onChange={e =>
                      setPsychologistCmsForm({ ...psychologistCmsForm, announcementContent: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kebijakan Operasional Praktik</label>
                    <textarea
                      rows={2}
                      required
                      value={psychologistCmsForm.remunerationPolicy}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, remunerationPolicy: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kontak Supervisor On-Duty</label>
                    <textarea
                      rows={2}
                      required
                      value={psychologistCmsForm.clinicalSupervisorContact}
                      onChange={e =>
                        setPsychologistCmsForm({
                          ...psychologistCmsForm,
                          clinicalSupervisorContact: e.target.value
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION 3: KOP SURAT RESMI LAPORAN KEUANGAN & DOKUMEN CETAK */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all">
            <button
              type="button"
              onClick={() => setOpenPsychologistSection(prev => prev === 'letterhead' ? null : 'letterhead')}
              className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    3. Pengaturan Kop Surat Resmi Laporan & Dokumen Cetak (PDF / Excel)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Atur nama klinik, psikolog, nomor SIP/STR, alamat, kontak, dan penanggung jawab pada cetak PDF & ekspor.
                  </p>
                </div>
              </div>
              {openPsychologistSection === 'letterhead' ? (
                <ChevronUp className="w-4 h-4 text-teal-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {openPsychologistSection === 'letterhead' && (
              <div className="p-4 pt-1 border-t border-slate-100 space-y-3.5 text-xs bg-slate-50/40">
                <div className="p-3 bg-teal-50 border border-teal-200/80 rounded-xl text-[11px] text-teal-900 leading-relaxed font-medium">
                  Informasi di bawah ini otomatis tampil sebagai <strong>Kop Surat Dinas Resmi</strong> pada pratinjau PDF cetak A4 dan bagian header lembar kerja Excel laporan arus kas.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Instansi / Praktik Mandiri</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadClinicName || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadClinicName: e.target.value })
                      }
                      placeholder="Contoh: Praktik Mandiri Psikolog Klinis JiwaSehat"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Psikolog & Gelar Profesi</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadDoctorName || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadDoctorName: e.target.value })
                      }
                      placeholder="Contoh: dr. Sarah Jenkins, M.Psi., Psikolog"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Surat Izin Praktik (SIP)</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadSipNumber || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadSipNumber: e.target.value })
                      }
                      placeholder="Contoh: SIP.503/042-DPMPTSP/2022"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Registrasi Tenaga Kesehatan (STR)</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadStrNumber || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadStrNumber: e.target.value })
                      }
                      placeholder="Contoh: STR-PSI-2021-09842"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Lengkap Lokasi Praktik Mandiri</label>
                  <input
                    type="text"
                    required
                    value={psychologistCmsForm.letterheadAddress || ''}
                    onChange={e =>
                      setPsychologistCmsForm({ ...psychologistCmsForm, letterheadAddress: e.target.value })
                    }
                    placeholder="Contoh: Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / Kontak</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadPhone || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadPhone: e.target.value })
                      }
                      placeholder="Contoh: (021) 7890-1234"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Resmi Praktik</label>
                    <input
                      type="email"
                      required
                      value={psychologistCmsForm.letterheadEmail || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadEmail: e.target.value })
                      }
                      placeholder="Contoh: klinik@jiwasehat.id"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Website Resmi</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadWebsite || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadWebsite: e.target.value })
                      }
                      placeholder="Contoh: www.jiwasehat.id"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-200/80">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kota Penerbitan Laporan</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadCity || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadCity: e.target.value })
                      }
                      placeholder="Contoh: Jakarta"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Jabatan Penandatangan Dokumen</label>
                    <input
                      type="text"
                      required
                      value={psychologistCmsForm.letterheadSignerRole || ''}
                      onChange={e =>
                        setPsychologistCmsForm({ ...psychologistCmsForm, letterheadSignerRole: e.target.value })
                      }
                      placeholder="Contoh: Psikolog Penanggung Jawab Praktik"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
