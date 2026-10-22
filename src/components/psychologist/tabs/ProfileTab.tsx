import React, { useState, useEffect, useRef } from 'react';
import { PsychologistProfile, User } from '../../../types';
import {
  Stethoscope,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  MapPin,
  Save,
  Sparkles,
  CheckCircle2,
  Camera,
  Upload,
  Trash2,
  User as UserIcon
} from 'lucide-react';
import { ImageWithFallback } from '../../common/ImageWithFallback';

interface ProfileTabProps {
  profile: PsychologistProfile | undefined;
  currentUser: User | null;
  psychologistId: string;
  updatePsychologistProfile: (profile: Partial<PsychologistProfile>, id?: string) => Promise<boolean>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  currentUser,
  psychologistId,
  updatePsychologistProfile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatarUrl || currentUser?.avatar || '');
  const [profileTitle, setProfileTitle] = useState(profile?.title || 'Psikolog Klinis Dewasa & Hubungan Interpersonal');
  const [profileSipNumber, setProfileSipNumber] = useState(profile?.sipNumber || 'SIP.503/042-DPMPTSP/2022');
  const [profileStrNumber, setProfileStrNumber] = useState(profile?.strNumber || 'STR-PSI-2021-09842');
  const [profileSipExpiry, setProfileSipExpiry] = useState(profile?.sipExpiry || '2027-06-30');
  const [profileStrExpiry, setProfileStrExpiry] = useState(profile?.strExpiry || '2028-12-31');
  const [profileExperienceYears, setProfileExperienceYears] = useState(profile?.experienceYears || 8);
  const [profileClinicalHours, setProfileClinicalHours] = useState(profile?.clinicalHours || 2450);
  const [profileEducation, setProfileEducation] = useState(
    profile?.education?.join('\n') ||
    'S1 Fakultas Psikologi Universitas Indonesia (Cum Laude)\nS2 Magister Psikologi Profesi Klinis Dewasa UI'
  );
  const [profileBio, setProfileBio] = useState(profile?.bio || '');
  const [profileSpecialties, setProfileSpecialties] = useState(profile?.specialties?.join(', ') || '');
  const [profileTherapyApproaches, setProfileTherapyApproaches] = useState(
    profile?.therapyApproaches?.join(', ') ||
    'Cognitive Behavioral Therapy (CBT), Acceptance & Commitment (ACT), Mindfulness-Based Stress Reduction'
  );
  const [profileLanguages, setProfileLanguages] = useState(profile?.languages?.join(', ') || 'Bahasa Indonesia, English');
  const [profileClinicAddress, setProfileClinicAddress] = useState(
    profile?.clinicAddress ||
    'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan'
  );
  const [profilePracticePolicy, setProfilePracticePolicy] = useState(
    profile?.practicePolicy ||
    'Menjunjung tinggi standar etika kerahasiaan profesi psikologi klinis. Seluruh informasi sesi dilindungi kerahasiaan medis, non-judgmental, dan berbasis informed consent.'
  );
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.avatarUrl) {
        setAvatarUrl(profile.avatarUrl);
      } else if (currentUser?.avatar) {
        setAvatarUrl(currentUser.avatar);
      }
      setProfileTitle(profile.title);
      setProfileSipNumber(profile.sipNumber);
      setProfileStrNumber(profile.strNumber);
      setProfileSipExpiry(profile.sipExpiry || '2027-06-30');
      setProfileStrExpiry(profile.strExpiry || '2028-12-31');
      setProfileExperienceYears(profile.experienceYears);
      setProfileClinicalHours(profile.clinicalHours || 2450);
      setProfileEducation(profile.education?.join('\n') || 'S1 Fakultas Psikologi Universitas Indonesia\nS2 Magister Psikologi Profesi Klinis Dewasa UI');
      setProfileBio(profile.bio);
      setProfileSpecialties(profile.specialties.join(', '));
      setProfileTherapyApproaches(profile.therapyApproaches.join(', '));
      setProfileLanguages(profile.languages.join(', '));
      setProfileClinicAddress(profile.clinicAddress);
      setProfilePracticePolicy(profile.practicePolicy || '');
    }
  }, [profile, currentUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar yang valid (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file foto maksimal adalah 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setProfileSavedMsg(false);
    try {
    const success = await updatePsychologistProfile({
      avatarUrl: avatarUrl.trim(),
      title: profileTitle,
      sipNumber: profileSipNumber,
      strNumber: profileStrNumber,
      sipExpiry: profileSipExpiry,
      strExpiry: profileStrExpiry,
      experienceYears: Number(profileExperienceYears),
      clinicalHours: Number(profileClinicalHours),
      education: profileEducation.split('\n').map(s => s.trim()).filter(Boolean),
      bio: profileBio,
      specialties: profileSpecialties.split(',').map(s => s.trim()).filter(Boolean),
      therapyApproaches: profileTherapyApproaches.split(',').map(s => s.trim()).filter(Boolean),
      languages: profileLanguages.split(',').map(s => s.trim()).filter(Boolean),
      clinicAddress: profileClinicAddress,
      practicePolicy: profilePracticePolicy
    }, psychologistId);
    setProfileSavedMsg(success);
    setTimeout(() => setProfileSavedMsg(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
              <Stethoscope className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">Kelola Profil & Kredensial Praktik Klinis</h3>
          </div>
          <p className="text-xs text-slate-500">
            Kelola legalitas STR/SIPP, almamater pendidikan, modalitas terapi, dan informasi praktik yang tampil di landing page publik.
          </p>
        </div>
        {profileSavedMsg && (
          <div className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2 shrink-0 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Profil & kredensial berhasil disimpan!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Comprehensive Form (7 cols) */}
        <form onSubmit={handleSaveProfile} className="xl:col-span-7 space-y-6">
          {/* Section 0: Foto Wajah & Identitas Visual Profil */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Camera className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">Foto Profil Wajah Psikolog</h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-teal-50 border-2 border-teal-200/80 text-teal-700 flex items-center justify-center overflow-hidden shadow-sm">
                  {avatarUrl ? (
                    <ImageWithFallback
                      src={avatarUrl}
                      alt="Foto Wajah Psikolog"
                      className="w-full h-full object-cover"
                      fallback={<UserIcon className="w-10 h-10 text-teal-600/70" />}
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-teal-600/70" />
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                <p className="text-slate-600 leading-relaxed">
                  Unggah foto wajah profesional berlatar rapi. Foto ini akan tampil di kartu profil publik, overview jadwal konsultasi, serta navigasi dashboard pasien.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="psychologist-photo-upload"
                  />
                  <label
                    htmlFor="psychologist-photo-upload"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{avatarUrl ? 'Ganti Foto Profil' : 'Unggah Foto Wajah'}</span>
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus Foto</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Data Praktik & Kredensial */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">1. Data Praktik & Kredensial</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gelar & Spesialisasi</label>
                <input
                  type="text"
                  required
                  value={profileTitle}
                  onChange={e => setProfileTitle(e.target.value)}
                  placeholder="Contoh: Psikolog Klinis Dewasa & Hubungan Interpersonal"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor SIPP (Surat Izin Praktik)</label>
                  <input
                    type="text"
                    required
                    value={profileSipNumber}
                    onChange={e => setProfileSipNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Masa Berlaku SIPP</label>
                  <input
                    type="date"
                    value={profileSipExpiry}
                    onChange={e => setProfileSipExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor STR Tenaga Kesehatan</label>
                  <input
                    type="text"
                    required
                    value={profileStrNumber}
                    onChange={e => setProfileStrNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Masa Berlaku STR</label>
                  <input
                    type="date"
                    value={profileStrExpiry}
                    onChange={e => setProfileStrExpiry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Riwayat Pendidikan & Jam Terbang */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">2. Pendidikan & Akumulasi Pengalaman</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Riwayat Almamater & Pendidikan (Satu baris per gelar)
                </label>
                <textarea
                  rows={3}
                  value={profileEducation}
                  onChange={e => setProfileEducation(e.target.value)}
                  placeholder="S1 Fakultas Psikologi UI&#10;S2 Magister Psikologi Profesi Klinis UI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengalaman Praktik (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={profileExperienceYears}
                    onChange={e => setProfileExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Jam Praktik Klinis</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={profileClinicalHours}
                    onChange={e => setProfileClinicalHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Pendekatan Terapi & Bahasa */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">3. Pendekatan Terapi & Spesialisasi Kasus</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pendekatan Klinis / Modalities (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  required
                  value={profileTherapyApproaches}
                  onChange={e => setProfileTherapyApproaches(e.target.value)}
                  placeholder="CBT, ACT, Mindfulness-Based, SFBT"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Topik Fokus Masalah / Spesialisasi (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  required
                  value={profileSpecialties}
                  onChange={e => setProfileSpecialties(e.target.value)}
                  placeholder="Kecemasan, Depresi, Burnout, Relasi Keluarga"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bahasa Sesi Konsultasi (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  required
                  value={profileLanguages}
                  onChange={e => setProfileLanguages(e.target.value)}
                  placeholder="Bahasa Indonesia, English, Jawa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Biografi & Info Klinik Offline */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">4. Pengantar Biografi & Lokasi Praktik Offline</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Biografi Ringkas & Sambutan Pasien</label>
                <textarea
                  rows={4}
                  required
                  value={profileBio}
                  onChange={e => setProfileBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alamat Klinik Praktik Offline (Tatap Muka)</label>
                <textarea
                  rows={2}
                  required
                  value={profileClinicAddress}
                  onChange={e => setProfileClinicAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Kebijakan & Kode Etik Praktik */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-bold text-slate-900">5. Kebijakan Informed Consent & Kode Etik</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kebijakan Kerahasiaan Medis & Standar Sesi
                </label>
                <textarea
                  rows={3}
                  value={profilePracticePolicy}
                  onChange={e => setProfilePracticePolicy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Seluruh Perubahan Kredensial'}
            </button>
          </div>
        </form>

        {/* Right: Live Public Preview Card (5 cols) */}
        <div className="xl:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Pratinjau Kartu Profil Publik
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Live Preview
            </span>
          </div>

          {/* Public Psychologist Card Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border-2 border-teal-300 text-teal-700 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <ImageWithFallback
                    src={avatarUrl}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                    fallback={<Stethoscope className="w-8 h-8 text-teal-600" />}
                  />
                ) : (
                  <Stethoscope className="w-8 h-8 text-teal-600" />
                )}
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold mb-1">
                  <ShieldCheck className="w-3 h-3 text-sky-600" />
                  Identitas Praktik Terverifikasi Internal
                </div>
                <h4 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                  {currentUser?.name}
                </h4>
                <p className="text-xs text-sky-700 font-semibold mt-0.5">{profileTitle}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                  <span className="font-bold text-amber-500 flex items-center gap-0.5">
                    ★ {profile?.rating || 4.9}
                  </span>
                  <span>•</span>
                  <span>{profileExperienceYears} Thn Pengalaman</span>
                  <span>•</span>
                  <span>{profileClinicalHours}+ Jam Klinis</span>
                </div>
              </div>
            </div>

            {/* Legal Badge Strip */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">No. SIPP:</span>
                <span className="text-slate-800 font-bold">{profileSipNumber}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">No. STR:</span>
                <span className="text-slate-800 font-bold">{profileStrNumber}</span>
              </div>
            </div>

            {/* Almamater */}
            {profileEducation && (
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Almamater</span>
                <ul className="text-xs text-slate-700 space-y-1">
                  {profileEducation.split('\n').filter(Boolean).map((edu, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>{edu}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Therapy Approaches Badges */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">Pendekatan Terapi</span>
              <div className="flex flex-wrap gap-1.5">
                {profileTherapyApproaches.split(',').map((app, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-[11px] font-semibold border border-sky-100"
                  >
                    {app.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tentang Psikolog</span>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {profileBio}
              </p>
            </div>

            {/* Status Layanan Praktik Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-bold">Menerima Pasien Baru</span>
              </div>
              <div className="px-3 py-1.5 bg-sky-50 text-sky-800 rounded-xl text-xs font-bold border border-sky-100">
                Paket Konsultasi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

