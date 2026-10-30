import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Lock
} from 'lucide-react';

export const PatientMandatoryProfileModal: React.FC = () => {
  const { currentUser, currentRole, updateUserProfile, showToast, selectedBookingPackageId, setActivePatientTab } = useApp();

  // Hanya muncul jika role PATIENT dan isProfileComplete !== true
  const isNeeded = currentRole === 'PATIENT' && currentUser && !currentUser.isProfileComplete;

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
  }, [currentUser]);

  if (!isNeeded) return null;

  const handleSubmit = (e: React.FormEvent) => {
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
      setErrorMessage('Pekerjaan / aktivitas saat ini wajib diisi.');
      return;
    }
    if (!formData.emergencyContactName.trim() || !formData.emergencyContactPhone.trim()) {
      setErrorMessage('Nama dan nomor kontak darurat wajib diisi untuk keselamatan medis.');
      return;
    }

    setIsSubmitting(true);

    const emergencyFull = `${formData.emergencyContactName.trim()} (${formData.emergencyContactPhone.trim()})`;

    updateUserProfile(currentUser.id, {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      birthDate: formData.birthDate,
      gender: formData.gender,
      city: formData.city.trim(),
      occupation: formData.occupation.trim(),
      emergencyContact: emergencyFull,
      isProfileComplete: true
    });

    setIsSubmitting(false);
    showToast(
      'Data Diri Lengkap!',
      'Terima kasih telah melengkapi data diri. Anda kini dapat memilih paket layanan dan jadwal konsultasi.',
      'success'
    );

    // Jika sebelumnya sudah klik paket tertentu di landing page, arahkan langsung ke booking
    if (selectedBookingPackageId) {
      setActivePatientTab('booking');
    }
  };

  return typeof document !== 'undefined' && createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="viewport-dialog bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-200 my-auto relative">
        {/* Header Modal */}
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/30 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wide mb-1">
              <Lock className="w-3 h-3 text-amber-700" />
              Langkah Wajib Sebelum Memilih Paket
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              Lengkapi Data Diri Pasien
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Halo! Sesuai standar operasional rekam medis dan kode etik psikologi klinis resmi, Anda wajib mengisi data diri lengkap terlebih dahulu sebelum dapat memilih paket, memesan jadwal, atau mengikuti tes asesmen.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-semibold">{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap (Sesuai KTP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Email (Readonly info) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Contoh: 081234567890"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Lahir <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kota Domisili Saat Ini <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Pekerjaan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pekerjaan / Aktivitas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.occupation}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                  placeholder="Contoh: Karyawan Swasta / Mahasiswa"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all bg-white"
                />
              </div>
            </div>

            {/* Kontak Darurat */}
            <div className="sm:col-span-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Kontak Darurat (Keluarga / Kerabat) <span className="text-rose-500">*</span></span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Dihubungi hanya pada kondisi krisis mental darurat atau pembatalan mendesak.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={formData.emergencyContactName}
                  onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="Nama Kerabat (cth: Ibu Rahmawati)"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
                <input
                  type="tel"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="No. HP Kerabat (cth: 0812-9988-7766)"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan Data...' : 'Simpan Data Diri & Mulai Layanan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
