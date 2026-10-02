import React, { useState } from 'react';
import { IntakeForm, User } from '../../../types';
import { CheckCircle2 } from 'lucide-react';

interface IntakeTabProps {
  patientId: string;
  currentUser: User | null;
  existingIntake: IntakeForm | undefined;
  submitIntakeForm: (form: Omit<IntakeForm, 'id' | 'completedAt'>) => void;
}

export const IntakeTab: React.FC<IntakeTabProps> = ({
  patientId,
  currentUser,
  existingIntake,
  submitIntakeForm
}) => {
  const [intakeData, setIntakeData] = useState<Partial<IntakeForm>>({
    gender: 'Laki-laki',
    occupation: existingIntake?.occupation || '',
    emergencyContact: existingIntake?.emergencyContact || { name: '', relationship: '', phone: '' },
    primaryConcerns: existingIntake?.primaryConcerns || ['Kecemasan Berlebih (Anxiety)'],
    concernDescription: existingIntake?.concernDescription || '',
    previousTherapy: existingIntake?.previousTherapy ?? false,
    currentMedications: existingIntake?.currentMedications || 'Tidak ada',
    currentStressLevel: existingIntake?.currentStressLevel || 6,
    sleepQuality: existingIntake?.sleepQuality || 'Buruk',
    suicideRiskFlag: existingIntake?.suicideRiskFlag ?? false,
    goals: existingIntake?.goals || ''
  });
  const [intakeSuccess, setIntakeSuccess] = useState(false);

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitIntakeForm({
      patientId,
      birthDate: '1995-05-14',
      gender: intakeData.gender as any,
      occupation: intakeData.occupation || 'Profesional / Mahasiswa',
      emergencyContact: intakeData.emergencyContact || { name: 'Kerabat Pasien', relationship: 'Keluarga', phone: '0812-9988-7766' },
      primaryConcerns: intakeData.primaryConcerns || ['Kecemasan Berlebih (Anxiety)'],
      concernDescription: intakeData.concernDescription || '',
      previousTherapy: !!intakeData.previousTherapy,
      currentMedications: intakeData.currentMedications || 'Tidak ada',
      currentStressLevel: intakeData.currentStressLevel || 5,
      sleepQuality: intakeData.sleepQuality as any,
      suicideRiskFlag: !!intakeData.suicideRiskFlag,
      goals: intakeData.goals || ''
    });
    setIntakeSuccess(true);
    setTimeout(() => setIntakeSuccess(false), 3000);
  };

  return (
    <div className="py-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Syarat Sebelum Booking</div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Pre-Test & General Info Pasien</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Informasi ini wajib diisi sebelum booking agar psikolog dan admin memahami kebutuhan awal pasien.
          </p>
        </div>

        {intakeSuccess && (
          <div className="p-4 rounded-2xl mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Pre-test berhasil diperbarui. Anda sudah bisa mengirim booking konsultasi.
          </div>
        )}

        <form onSubmit={handleIntakeSubmit} className="space-y-6">
          {/* Identitas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pasien</label>
              <input
                type="text"
                disabled
                value={currentUser?.name || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan / Profesi</label>
              <input
                type="text"
                required
                value={intakeData.occupation}
                onChange={e => setIntakeData({ ...intakeData, occupation: e.target.value })}
                placeholder="Contoh: Software Engineer / Desainer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Kontak Darurat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kontak Darurat (Keluarga / Kerabat Terdekat)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nama Kerabat"
                value={intakeData.emergencyContact?.name}
                onChange={e =>
                  setIntakeData({
                    ...intakeData,
                    emergencyContact: { ...intakeData.emergencyContact!, name: e.target.value }
                  })
                }
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
              <input
                type="text"
                placeholder="Hubungan (Misal: Pasangan/Ibu)"
                value={intakeData.emergencyContact?.relationship}
                onChange={e =>
                  setIntakeData({
                    ...intakeData,
                    emergencyContact: { ...intakeData.emergencyContact!, relationship: e.target.value }
                  })
                }
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
              <input
                type="text"
                placeholder="No. Telepon"
                value={intakeData.emergencyContact?.phone}
                onChange={e =>
                  setIntakeData({
                    ...intakeData,
                    emergencyContact: { ...intakeData.emergencyContact!, phone: e.target.value }
                  })
                }
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Keluhan Utama */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Keluhan Utama yang Dirasakan</label>
            <div className="flex flex-wrap gap-2">
              {[
                'Kecemasan Berlebih (Anxiety)',
                'Burnout Pekerjaan',
                'Sulit Tidur / Insomnia',
                'Depresi & Rasa Hampa',
                'Serangan Panik Pagi Hari',
                'Masalah Hubungan Asmara / Keluarga',
                'Krisis Percaya Diri (Self-Esteem)',
                'Trauma Masa Lalu'
              ].map(concern => {
                const isSelected = intakeData.primaryConcerns?.includes(concern);
                return (
                  <button
                    type="button"
                    key={concern}
                    onClick={() => {
                      const list = intakeData.primaryConcerns || [];
                      if (isSelected) {
                        setIntakeData({ ...intakeData, primaryConcerns: list.filter(c => c !== concern) });
                      } else {
                        setIntakeData({ ...intakeData, primaryConcerns: [...list, concern] });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {concern}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deskripsi Keluhan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Deskripsikan Apa yang Sedang Dialami (Bebas)
            </label>
            <textarea
              rows={4}
              value={intakeData.concernDescription}
              onChange={e => setIntakeData({ ...intakeData, concernDescription: e.target.value })}
              placeholder="Sejak kapan keluhan ini mengganggu Anda? Apa pemicu utama yang Anda rasakan? Apa respons fisik tubuh Anda?"
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Skala Stres & Kualitas Tidur */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Skala Stres Saat Ini</span>
                <span className="text-emerald-700 font-extrabold">{intakeData.currentStressLevel} / 10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={intakeData.currentStressLevel}
                onChange={e => setIntakeData({ ...intakeData, currentStressLevel: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 (Sangat Tenang)</span>
                <span>10 (Kewalahan Hebat)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kualitas Tidur 1 Minggu Terakhir</label>
              <select
                value={intakeData.sleepQuality}
                onChange={e => setIntakeData({ ...intakeData, sleepQuality: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="Baik">Baik (Nyenyak 7-8 jam)</option>
                <option value="Cukup">Cukup (Kadang terbangun)</option>
                <option value="Buruk">Buruk (Sulit tidur / sering terbangun)</option>
                <option value="Insomnia Akut">Insomnia Akut (Hanya tidur 2-3 jam)</option>
              </select>
            </div>
          </div>

          {/* Riwayat Terapi & Obat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pernah Konseling Sebelumnya?</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={intakeData.previousTherapy === true}
                    onChange={() => setIntakeData({ ...intakeData, previousTherapy: true })}
                    className="accent-emerald-600"
                  />
                  Pernah
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    checked={intakeData.previousTherapy === false}
                    onChange={() => setIntakeData({ ...intakeData, previousTherapy: false })}
                    className="accent-emerald-600"
                  />
                  Ini Pengalaman Pertama
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Obat yang Sedang Dikonsumsi</label>
              <input
                type="text"
                value={intakeData.currentMedications}
                onChange={e => setIntakeData({ ...intakeData, currentMedications: e.target.value })}
                placeholder="Contoh: Tidak ada / Vitamin B kompleks"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Harapan Terapi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Harapan & Tujuan dari Sesi Ini</label>
            <input
              type="text"
              value={intakeData.goals}
              onChange={e => setIntakeData({ ...intakeData, goals: e.target.value })}
              placeholder="Misal: Ingin menemukan strategi mengendalikan panik saat presentasi kerja..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Pre-Test Pasien
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

