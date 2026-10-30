import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContextCore';
import {
  HeartHandshake,
  User as UserIcon,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  LogOut,
  Sparkles
} from 'lucide-react';

export const PatientProfileCompletionPage: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    showToast,
    logout,
    selectedBookingPackageId,
    setActivePatientTab,
    server
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
    gender: 'Perempuan' as 'Laki-laki' | 'Perempuan',
    city: '',
    occupation: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name && currentUser.name !== currentUser.email?.split('@')[0] ? currentUser.name : '',
        phone: currentUser.phone || '',
        birthDate: currentUser.birthDate || '',
        gender: currentUser.gender || 'Perempuan',
        city: currentUser.city || '',
        occupation: currentUser.occupation || '',
        emergencyContactName: currentUser.emergencyContact ? currentUser.emergencyContact.split(' (')[0] : '',
        emergencyContactPhone: currentUser.emergencyContact && currentUser.emergencyContact.includes('(') ? currentUser.emergencyContact.replace(/.*\((.*)\).*/, '$1') : ''
      }));
    }
  }, [JSON.stringify(currentUser)]);

  const handleFillDemo = () => {
    setFormData({
      name: 'Rian Pratama, S.Kom.',
      phone: '0812-8877-6655',
      birthDate: '1998-07-14',
      gender: 'Laki-laki',
      city: 'Jakarta Selatan',
      occupation: 'Software Engineer',
      emergencyContactName: 'Ibu Ratna (Ibu Kandung)',
      emergencyContactPhone: '0812-3344-5566'
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi
    if (!formData.name.trim()) {
      setErrorMessage('Nama lengkap pasien wajib diisi.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      setErrorMessage('Nomor WhatsApp/HP aktif wajib diisi (minimal 9 digit).');
      return;
    }
    if (!formData.birthDate) {
      setErrorMessage('Tanggal lahir wajib diisi.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMessage('Kota domisili saat ini wajib diisi.');
      return;
    }
    if (!formData.occupation.trim()) {
      setErrorMessage('Pekerjaan / profesi saat ini wajib diisi.');
      return;
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      setErrorMessage('Nama dan nomor kontak darurat wajib diisi demi keselamatan klinis Anda.');
      return;
    }

    if (!currentUser) return;

    setIsSubmitting(true);

    const emergencyFull = `${formData.emergencyContactName.trim()} (${formData.emergencyContactPhone.trim()})`;

    const values = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      city: formData.city.trim(),
      occupation: formData.occupation.trim(),
      emergencyContact: emergencyFull,
      isProfileComplete: true
    };
    if(server){try{const saved=await server.saveProfile(currentUser.id,values);if(!saved){setErrorMessage('Data belum tersimpan. Periksa pesan kesalahan.');return;}if(selectedBookingPackageId)setActivePatientTab('booking');}finally{setIsSubmitting(false);}return;}
    updateUserProfile(currentUser.id, values);

    setIsSubmitting(false);
    showToast(
      'Data Diri Berhasil Disimpan!',
      'Profil pasien Anda telah lengkap. Anda kini dapat memilih paket konsultasi dan reservasi jadwal.',
      'success'
    );

    if (selectedBookingPackageId) {
      setActivePatientTab('booking');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-teal-50/20 to-slate-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-teal-700 via-teal-600 to-slate-800 text-white relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-inner">
                  <HeartHandshake className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider mb-1">
                    <Lock className="w-3 h-3 text-slate-900" />
                    Langkah Awal Pasien Baru
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Lengkapi Data Diri Pasien
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
                title="Keluar akun dan kembali ke halaman utama"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ganti Email</span>
              </button>
            </div>

            <p className="text-xs text-teal-50 mt-3 leading-relaxed">
              Halo! Sesuai standar operasional rekam medis klinis dan Kode Etik Psikologi Indonesia, data identitas Anda wajib dilengkapi sebelum dapat memilih paket konsultasi, menjadwalkan sesi dengan psikolog, atau mengisi asesmen mandiri.
            </p>

            {/* Quick Demo Fill Helper */}
            {!server&&<div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-teal-100 font-medium">Pengujian Demo:</span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2.5 py-1 rounded-lg bg-teal-800/80 hover:bg-teal-900 text-teal-100 text-[11px] font-bold transition-all border border-teal-500/40 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Isi Otomatis Data Sampel</span>
              </button>
            </div>}
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Lengkap Pasien (Sesuai KTP) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Email Read-only */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Alamat Email Terverifikasi
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser?.email || ''}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-xs font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Nomor WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Contoh: 081234567890"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tanggal Lahir <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={formData.birthDate}
                      onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jenis Kelamin <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as 'Laki-laki' | 'Perempuan' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                  >
                    <option value="Perempuan">Perempuan</option>
                    <option value="Laki-laki">Laki-laki</option>
                  </select>
                </div>

                {/* Kota Domisili */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kota Domisili Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Contoh: Jakarta Selatan"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Pekerjaan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pekerjaan / Aktivitas <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={formData.occupation}
                      onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="Contoh: Karyawan Swasta / Mahasiswa"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                    />
                  </div>
                </div>

                {/* Kontak Darurat */}
                <div className="sm:col-span-2 p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5 mt-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Kontak Darurat (Keluarga / Kerabat Terdekat) <span className="text-rose-500">*</span></span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-snug">
                    Informasi ini hanya dihubungi apabila terjadi kondisi krisis medis mendesak atau konfirmasi penting terkait sesi Anda.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <input
                      type="text"
                      required
                      value={formData.emergencyContactName}
                      onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      placeholder="Nama Kerabat (cth: Ibu Rahmawati)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContactPhone}
                      onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      placeholder="No. HP Kerabat (cth: 0812-9988-7766)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan Data...' : 'Simpan Data Diri & Mulai Konsultasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
