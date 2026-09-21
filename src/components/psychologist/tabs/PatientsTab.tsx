import React, { useState, useEffect, useMemo } from 'react';
import { User, Appointment, IntakeForm, ClinicalNote, TestResult } from '../../../types';
import { Search, AlertCircle, CheckCircle2, Save } from 'lucide-react';

interface PatientsTabProps {
  users: User[];
  appointments: Appointment[];
  intakeForms: Record<string, IntakeForm>;
  clinicalNotes: Record<string, ClinicalNote>;
  testResults: TestResult[];
  psychologistId: string;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  saveClinicalNotes: (appointmentId: string, notes: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  users,
  appointments,
  intakeForms,
  clinicalNotes,
  testResults,
  psychologistId,
  selectedPatientId,
  setSelectedPatientId,
  saveClinicalNotes
}) => {
  // Search & Triage Filter State
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientTriageFilter, setPatientTriageFilter] = useState<'ALL' | 'NEED_SOAP' | 'HIGH_RISK' | 'HAS_INTAKE' | 'HAS_TEST'>('ALL');

  const allPatientUsers = useMemo(() => {
    return users.filter(u => u.role === 'PATIENT');
  }, [users]);

  const filteredPatients = useMemo(() => {
    return allPatientUsers.filter(pat => {
      const q = patientSearchQuery.toLowerCase().trim();
      const intake = intakeForms[pat.id];
      const matchesQuery =
        !q ||
        pat.name.toLowerCase().includes(q) ||
        (pat.phone && pat.phone.toLowerCase().includes(q)) ||
        (pat.email && pat.email.toLowerCase().includes(q)) ||
        (intake && intake.occupation && intake.occupation.toLowerCase().includes(q)) ||
        (intake && intake.primaryConcerns && intake.primaryConcerns.some(c => c.toLowerCase().includes(q))) ||
        (intake && intake.concernDescription && intake.concernDescription.toLowerCase().includes(q));

      if (!matchesQuery) return false;

      if (patientTriageFilter === 'NEED_SOAP') {
        const patApt = appointments.find(a => a.patientId === pat.id);
        return patApt && !clinicalNotes[patApt.id];
      }
      if (patientTriageFilter === 'HIGH_RISK') {
        const hasFlag = intake?.suicideRiskFlag;
        const tests = testResults.filter(t => t.patientId === pat.id);
        const isSevere = tests.some(t => t.severityLevel === 'BERAT' || t.severityLevel === 'SANGAT_BERAT');
        return Boolean(hasFlag || isSevere);
      }
      if (patientTriageFilter === 'HAS_INTAKE') {
        return Boolean(intakeForms[pat.id]);
      }
      if (patientTriageFilter === 'HAS_TEST') {
        return testResults.some(t => t.patientId === pat.id);
      }
      return true;
    });
  }, [allPatientUsers, patientSearchQuery, patientTriageFilter, intakeForms, appointments, clinicalNotes, testResults]);

  // SOAP State
  const [soapAptId, setSoapAptId] = useState<string>('');
  const [soapSubjective, setSoapSubjective] = useState('');
  const [soapObjective, setSoapObjective] = useState('');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');
  const [soapPrognosis, setSoapPrognosis] = useState<'Baik' | 'Perlu Pemantauan' | 'Butuh Rujukan Psikiater'>('Baik');
  const [soapSuccessMsg, setSoapSuccessMsg] = useState(false);

  // Sync SOAP notes whenever selected patient changes
  useEffect(() => {
    const patientApt = appointments.find(a => a.patientId === selectedPatientId && a.psychologistId === psychologistId) ||
      appointments.find(a => a.patientId === selectedPatientId);
    
    const targetAptId = patientApt ? patientApt.id : `apt-${selectedPatientId}-current`;
    setSoapAptId(targetAptId);

    const note = clinicalNotes[targetAptId] || (Object.values(clinicalNotes) as ClinicalNote[]).find(n => n.patientId === selectedPatientId);
    if (note) {
      setSoapSubjective(note.subjective);
      setSoapObjective(note.objective);
      setSoapAssessment(note.assessment);
      setSoapPlan(note.plan);
      setSoapPrognosis(note.prognosis || 'Baik');
    } else {
      if (selectedPatientId === 'user-pat-2') {
        setSoapSubjective('Pasien mengeluhkan kesulitan memulai tidur (sleep-onset latency > 90 menit) dan pikiran terus berputar (racing thoughts).');
        setSoapObjective('Ekspresi lelah, respon verbal koheren namun lambat. Skor kecemasan subskala DASS-21 berada di tingkat sedang.');
        setSoapAssessment('F51.0 Insomnia Non-organik dengan kecemasan antisipatoris terkait performa kerja.');
        setSoapPlan('Psikoedukasi Sleep Hygiene terstruktur, pembatasan screen-time 1 jam sebelum tidur, teknik progressive muscle relaxation.');
        setSoapPrognosis('Baik');
      } else if (selectedPatientId === 'user-pat-3') {
        setSoapSubjective('Pasien melaporkan anhedonia ringan, penurunan energi dalam 2 pekan terakhir setelah kegagalan proyek studi.');
        setSoapObjective('Kontak mata intermiten, afek datar, tidak ada tanda-tanda ide bunuh diri atau agitasi.');
        setSoapAssessment('F32.0 Episode Depresif Ringan berkaitan dengan stresor akademik/pekerjaan.');
        setSoapPlan('Behavioral Activation: jadwal aktivitas menyenangkan harian bertahap, restrukturisasi kognitif pikiran over-generalisasi.');
        setSoapPrognosis('Baik');
      } else {
        setSoapSubjective('');
        setSoapObjective('');
        setSoapAssessment('');
        setSoapPlan('');
        setSoapPrognosis('Baik');
      }
    }
  }, [selectedPatientId, psychologistId, appointments, clinicalNotes]);

  const handleSaveSoap = (e: React.FormEvent) => {
    e.preventDefault();
    saveClinicalNotes(soapAptId, {
      appointmentId: soapAptId,
      patientId: selectedPatientId,
      psychologistId,
      sessionDate: '2026-09-16',
      subjective: soapSubjective,
      objective: soapObjective,
      assessment: soapAssessment,
      plan: soapPlan,
      prognosis: soapPrognosis,
      requiresPsychiatristReferral: false
    });
    setSoapSuccessMsg(true);
    setTimeout(() => setSoapSuccessMsg(false), 2500);
  };

  const selectedPatientIntake = intakeForms[selectedPatientId];
  const selectedPatientTests = testResults.filter(t => t.patientId === selectedPatientId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Patient Selector & Intake/Test details */}
        <div className="lg:col-span-5 space-y-6">
          {/* Patient List with Scalability Search & Triage Filters */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daftar Pasien Bimbingan</h3>
                <p className="text-[11px] text-slate-500">
                  Menampilkan {filteredPatients.length} dari {allPatientUsers.length} pasien
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold">
                {allPatientUsers.length} Terdaftar
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={patientSearchQuery}
                onChange={e => setPatientSearchQuery(e.target.value)}
                placeholder="Cari nama, keluhan, profesi, atau HP..."
                className="w-full pl-8.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-hidden transition-all"
              />
              {patientSearchQuery && (
                <button
                  type="button"
                  onClick={() => setPatientSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Triage Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-medium custom-scrollbar">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'NEED_SOAP', label: 'Perlu SOAP' },
                { id: 'HIGH_RISK', label: 'Risiko / Berat' },
                { id: 'HAS_INTAKE', label: 'Ada Intake' },
                { id: 'HAS_TEST', label: 'Tes DASS-21' }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPatientTriageFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                    patientTriageFilter === f.id
                      ? 'bg-sky-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Scrollable Patient Items */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Tidak ada pasien yang cocok dengan kata kunci pencarian atau filter yang dipilih.
                </div>
              ) : (
                filteredPatients.map(pat => {
                  const intake = intakeForms[pat.id];
                  const tests = testResults.filter(t => t.patientId === pat.id);
                  const latestTest = tests[0];
                  const patApt = appointments.find(a => a.patientId === pat.id);
                  const hasSoap = patApt && clinicalNotes[patApt.id];
                  const isSelected = selectedPatientId === pat.id;

                  return (
                    <div
                      key={pat.id}
                      onClick={() => setSelectedPatientId(pat.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-50 border-sky-600 ring-1 ring-sky-600 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={pat.avatar}
                          alt={pat.name}
                          className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="text-xs font-bold text-slate-900 truncate">{pat.name}</div>
                            {intake?.suicideRiskFlag && (
                              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9px] font-extrabold flex items-center gap-0.5 shrink-0">
                                <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                                Flag Perhatian
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {intake?.occupation || pat.phone}
                          </div>

                          {/* Clinical Status Badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {latestTest && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  latestTest.severityLevel === 'BERAT' || latestTest.severityLevel === 'SANGAT_BERAT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : latestTest.severityLevel === 'SEDANG'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {latestTest.testCode}: {latestTest.severityLevel}
                              </span>
                            )}
                            {intake && (
                              <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                                Intake Selesai
                              </span>
                            )}
                            {hasSoap ? (
                              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-md">
                                SOAP ✓
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-100 text-slate-500 font-normal px-2 py-0.5 rounded-md">
                                SOAP Belum
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Patient Intake Form Viewer */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-900">Formulir Intake Pasien</h4>
              <span className="text-[11px] text-slate-400">ID: {selectedPatientId}</span>
            </div>

            {selectedPatientIntake ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-700 block">Keluhan Utama:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPatientIntake.primaryConcerns.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block">Deskripsi Keluhan:</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic leading-relaxed mt-1">
                    "{selectedPatientIntake.concernDescription}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Skala Stres</span>
                    <span className="text-sm font-bold text-rose-600">
                      {selectedPatientIntake.currentStressLevel} / 10
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Kualitas Tidur</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {selectedPatientIntake.sleepQuality}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block">Tujuan Konsultasi:</span>
                  <p className="text-slate-600 mt-0.5">{selectedPatientIntake.goals}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Pasien belum mengisi formulir intake klinis.</p>
            )}
          </div>

          {/* Psychological Test Results Viewer */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Hasil Tes Psikologi (DASS-21)</h4>
            {selectedPatientTests.length > 0 ? (
              <div className="space-y-3">
                {selectedPatientTests.map(res => (
                  <div key={res.id} className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 text-xs">
                    <div className="flex justify-between font-bold text-teal-900 mb-1">
                      <span>{res.testTitle}</span>
                      <span className="px-2 py-0.5 bg-teal-200 rounded text-[10px]">
                        {res.severityLevel}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center my-2 text-[11px]">
                      <div className="p-1 bg-white rounded">Depresi: {res.subscaleScores.depression || 0}</div>
                      <div className="p-1 bg-white rounded">Kecemasan: {res.subscaleScores.anxiety || 0}</div>
                      <div className="p-1 bg-white rounded">Stres: {res.subscaleScores.stress || 0}</div>
                    </div>
                    <p className="text-[11px] text-teal-800 leading-relaxed">{res.interpretation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada catatan tes psikologi untuk pasien ini.</p>
            )}
          </div>
        </div>

        {/* Right: Clinical Progress Notes (SOAP Format) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Rekam Medis Elektronik</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Catatan Klinis Perkembangan (SOAP)</h3>
              <p className="text-xs text-slate-500">
                Format baku medis: Subjective, Objective, Assessment, Plan.
              </p>
            </div>
          </div>

          {soapSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold mb-6 border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Catatan perkembangan klinis SOAP berhasil disimpan ke rekam medis pasien!
            </div>
          )}

          <form onSubmit={handleSaveSoap} className="space-y-5">
            {/* S - Subjective */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                S - Subjective (Keluhan Subyektif & Ungkapan Pasien)
              </label>
              <textarea
                rows={3}
                required
                value={soapSubjective}
                onChange={e => setSoapSubjective(e.target.value)}
                placeholder="Contoh: Klien menyatakan dada terasa terhimpit saat rapat mingguan dan khawatir dievaluasi negatif oleh rekan..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* O - Objective */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                O - Objective (Observasi Afek, Perilaku Klinis & Skor Tes)
              </label>
              <textarea
                rows={3}
                required
                value={soapObjective}
                onChange={e => setSoapObjective(e.target.value)}
                placeholder="Contoh: Respons chat terstruktur, afek cemas, skor DASS-21 kecemasan skala sedang (skor 5). Tidak ada tanda agitasi psikomotor..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* A - Assessment */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                A - Assessment (Diagnosis Kerja & Dinamika Psikologis)
              </label>
              <textarea
                rows={3}
                required
                value={soapAssessment}
                onChange={e => setSoapAssessment(e.target.value)}
                placeholder="Contoh: F41.1 Gangguan Kecemasan Tergeneralisasi (GAD ringan-sedang) dipicu beban kerja berlebih (burnout)..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* P - Plan */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                P - Plan (Rencana Intervensi, PR Klien & Jadwal Lanjutan)
              </label>
              <textarea
                rows={3}
                required
                value={soapPlan}
                onChange={e => setSoapPlan(e.target.value)}
                placeholder="Contoh: 1. Restrukturisasi kognitif (CBT). 2. PR latihan relaksasi diafragma sebelum tidur. 3. Sesi lanjutan 1 minggu mendatang..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Prognosis Klinis</label>
                <select
                  value={soapPrognosis}
                  onChange={e => setSoapPrognosis(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Baik">Baik (Dapat pulih dengan sesi reguler)</option>
                  <option value="Perlu Pemantauan">Perlu Pemantauan Intensif</option>
                  <option value="Butuh Rujukan Psikiater">Butuh Rujukan Medis Psikiater (Farmakoterapi)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan Catatan Medis SOAP
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

