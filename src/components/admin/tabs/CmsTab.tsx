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
  Globe,
  HeartHandshake,
  Stethoscope,
  LayoutTemplate,
  RotateCcw,
  Save,
  Sparkles,
  Users,
  PhoneCall,
  Shield,
  FileText
} from 'lucide-react';

interface CmsTabProps {
  cmsConfig: LandingPageCmsConfig;
  patientCms: PatientPageCmsConfig;
  psychologistCms: PsychologistPageCmsConfig;
  psychologists: PsychologistProfile[];
  users: User[];
  updateLandingCms: (config: LandingPageCmsConfig) => void;
  updatePatientCms: (config: PatientPageCmsConfig) => void;
  updatePsychologistCms: (config: PsychologistPageCmsConfig) => void;
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, id?: string) => void;
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
    <div className="space-y-6">
      {/* 3-Subtab Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-purple-900 shadow-xs border border-purple-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: CMS LANDING PAGE */}
      {adminCmsSubTab === 'LANDING' && (
        <form onSubmit={handleSaveCms} className="space-y-6">
          {/* Header action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-purple-600" />
                Content Management System (CMS) Landing Page
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ubah konten teks Hero Banner, konfigurasi auto-slider psikolog, dan informasi kontak klinik secara real-time.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetCms}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Default
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan CMS Landing
              </button>
            </div>
          </div>

          {/* Section 1: Hero Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                1. Hero Jumbotron & Kalimat Utama
              </h4>
              <p className="text-xs text-slate-500">Teks utama yang pertama kali dilihat calon pasien saat berkunjung.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Badge Teks Kecil (Atas Judul)</label>
                <input
                  type="text"
                  required
                  value={cmsForm.heroBadge}
                  onChange={e => setCmsForm({ ...cmsForm, heroBadge: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Utama Hero (Heading 1)</label>
                <input
                  type="text"
                  required
                  value={cmsForm.heroTitle}
                  onChange={e => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjudul / Deskripsi Pendukung</label>
                <textarea
                  rows={3}
                  required
                  value={cmsForm.heroSubtitle}
                  onChange={e => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Carousel Slider Psikolog */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                2. Konfigurasi Carousel Psikolog (Siap Sedia Hari Ini)
              </h4>
              <p className="text-xs text-slate-500">
                Atur kecepatan pergantian otomatis dan judul bagian card profil psikolog di samping jumbotron.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Bagian Slider</label>
                <input
                  type="text"
                  required
                  value={cmsForm.sliderTitle}
                  onChange={e => setCmsForm({ ...cmsForm, sliderTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sub-label / Keterangan Status</label>
                <input
                  type="text"
                  required
                  value={cmsForm.sliderSubtitle}
                  onChange={e => setCmsForm({ ...cmsForm, sliderSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Durasi Interval Otomatis (Detik)</label>
                <input
                  type="number"
                  min={2}
                  max={30}
                  required
                  value={cmsForm.sliderIntervalSeconds}
                  onChange={e => setCmsForm({ ...cmsForm, sliderIntervalSeconds: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
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
            </div>

            {/* Manage Active Psychologist in Slider */}
            <div className="pt-4 border-t border-slate-100">
              <span className="font-bold text-slate-800 block mb-2 text-xs">
                Daftar Psikolog & Status Siap Sedia di Carousel:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {psychologists.map(psy => {
                  const userObj = users.find(u => u.id === psy.userId);
                  const name = userObj?.name || psy.userId;
                  const isAvailable = psy.isAvailableToday !== false;

                  return (
                    <div
                      key={psy.userId}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        isAvailable ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={userObj?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                          alt={name}
                          className="w-8 h-8 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h6 className="text-xs font-bold text-slate-900 truncate">{name}</h6>
                          <p className="text-[11px] text-purple-700 font-semibold truncate">{psy.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{psy.sipNumber}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => updatePsychologistProfile({ ...psy, isAvailableToday: !isAvailable }, psy.userId)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                          isAvailable
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                        }`}
                      >
                        {isAvailable ? '✓ Siap Sedia' : '✕ Tidak Aktif'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Informasi Kontak & Alamat Klinik */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-purple-600" />
                3. Informasi Kontak Resmi & Alamat Klinik
              </h4>
              <p className="text-xs text-slate-500">Tampil pada footer dan informasi reservasi offline pasien.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Alamat Klinik Tatap Muka</label>
                <textarea
                  rows={2}
                  required
                  value={cmsForm.clinicAddress}
                  onChange={e => setCmsForm({ ...cmsForm, clinicAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">No. Telepon / Hotline</label>
                <input
                  type="text"
                  required
                  value={cmsForm.clinicPhone}
                  onChange={e => setCmsForm({ ...cmsForm, clinicPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Siaga (Booking Cepat)</label>
                <input
                  type="text"
                  required
                  value={cmsForm.clinicWhatsapp}
                  onChange={e => setCmsForm({ ...cmsForm, clinicWhatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Email Resmi Layanan</label>
                <input
                  type="email"
                  required
                  value={cmsForm.clinicEmail}
                  onChange={e => setCmsForm({ ...cmsForm, clinicEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Save button bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetCms}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Semua Perubahan CMS Landing
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 2: CMS HALAMAN PASIEN */}
      {adminCmsSubTab === 'PATIENT' && (
        <form onSubmit={handleSavePatientCms} className="space-y-6">
          {/* Header action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-purple-600" />
                Content Management System (CMS) Halaman Pasien
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola pesan sambutan, tips kesehatan mental harian, kontak darurat krisis (hotline), dan pengumuman untuk pasien.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetPatientCms}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Default
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan CMS Pasien
              </button>
            </div>
          </div>

          {/* Section 1: Welcome Banner & Daily Tip */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                1. Banner Sambutan & Tips Psikoedukasi Harian
              </h4>
              <p className="text-xs text-slate-500">
                Konten motivasi dan afirmasi positif yang ditampilkan di bagian atas dashboard pasien.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Banner Sambutan</label>
                <input
                  type="text"
                  required
                  value={patientCmsForm.welcomeBannerTitle}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, welcomeBannerTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subjudul / Pesan Empati</label>
                <textarea
                  rows={2}
                  required
                  value={patientCmsForm.welcomeBannerSubtitle}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, welcomeBannerSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tips Kesehatan Mental Hari Ini</label>
                <textarea
                  rows={3}
                  required
                  value={patientCmsForm.dailyMentalHealthTip}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, dailyMentalHealthTip: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Crisis Hotline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                2. Kontak Siaga Krisis & Pencegahan Bunuh Diri (24 Jam)
              </h4>
              <p className="text-xs text-slate-500">
                Pusat bantuan darurat resmi yang langsung dapat dihubungi pasien saat berada dalam situasi bahaya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Box Krisis</label>
                <input
                  type="text"
                  required
                  value={patientCmsForm.crisisHotlineTitle}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisHotlineTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Telepon Hotline Krisis</label>
                <input
                  type="text"
                  required
                  value={patientCmsForm.crisisHotlineNumber}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisHotlineNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">WhatsApp Siaga Darurat</label>
                <input
                  type="text"
                  required
                  value={patientCmsForm.crisisWhatsapp}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisWhatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pemberitahuan Medis / Disclaimer Darurat</label>
                <input
                  type="text"
                  required
                  value={patientCmsForm.crisisNotice}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, crisisNotice: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Teks Pengumuman Pasien (Opsional)</label>
                <textarea
                  rows={2}
                  value={patientCmsForm.announcementText}
                  onChange={e => setPatientCmsForm({ ...patientCmsForm, announcementText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-950 block">{patientCmsForm.crisisHotlineTitle}</span>
                  <span className="text-[11px] text-rose-700">
                    Hotline: {patientCmsForm.crisisHotlineNumber} • WA: {patientCmsForm.crisisWhatsapp}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">
                Siaga 24 Jam
              </span>
            </div>
          </div>

          {/* Save button bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetPatientCms}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Halaman Pasien
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 3: CMS HALAMAN DOKTER / PSIKOLOG */}
      {adminCmsSubTab === 'PSYCHOLOGIST' && (
        <form onSubmit={handleSavePsychologistCms} className="space-y-6">
          {/* Header action bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-600" />
                Content Management System (CMS) Halaman Dokter / Psikolog
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atur panduan klinis HIMPSI, standar SOP rekam medis, ketentuan remunerasi, dan kontak supervisor on-duty.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetPsychologistCms}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Default
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Simpan CMS Dokter
              </button>
            </div>
          </div>

          {/* Section 1: Clinical Guidelines */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                1. Panduan Klinis & Protokol Pelayanan HIMPSI
              </h4>
              <p className="text-xs text-slate-500">
                Instruksi kepatuhan etika telekonseling, kerahasiaan data pasien, dan standar pengisian SOAP.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Panduan Klinis</label>
                <input
                  type="text"
                  required
                  value={psychologistCmsForm.guidelinesTitle}
                  onChange={e =>
                    setPsychologistCmsForm({ ...psychologistCmsForm, guidelinesTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Isi Panduan Klinis (Ditampilkan di Dashboard Dokter)
                </label>
                <textarea
                  rows={3}
                  required
                  value={psychologistCmsForm.guidelinesContent}
                  onChange={e =>
                    setPsychologistCmsForm({ ...psychologistCmsForm, guidelinesContent: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Announcement & Policy */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                2. Pengumuman Internal & Kebijakan Remunerasi
              </h4>
              <p className="text-xs text-slate-500">
                Informasi administrasi klinis, skema bagi hasil sesi, dan kontak supervisor klinis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Judul Pengumuman Internal</label>
                <input
                  type="text"
                  required
                  value={psychologistCmsForm.announcementTitle}
                  onChange={e =>
                    setPsychologistCmsForm({ ...psychologistCmsForm, announcementTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Isi Pengumuman Internal Dokter</label>
                <textarea
                  rows={3}
                  required
                  value={psychologistCmsForm.announcementContent}
                  onChange={e =>
                    setPsychologistCmsForm({ ...psychologistCmsForm, announcementContent: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ketentuan Pembayaran & Remunerasi</label>
                <textarea
                  rows={2}
                  required
                  value={psychologistCmsForm.remunerationPolicy}
                  onChange={e =>
                    setPsychologistCmsForm({ ...psychologistCmsForm, remunerationPolicy: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kontak Supervisor Klinis On-Duty</label>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Save button bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetPsychologistCms}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Halaman Dokter
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

