import React, { useState } from 'react';
import { PsychologicalTest, User, TestResult } from '../../../types';
import { Sparkles, CheckCircle2, Activity, Award } from 'lucide-react';

interface TestsTabProps {
  tests: PsychologicalTest[];
  patientId: string;
  currentUser: User | null;
  submitTestResult: (result: Omit<TestResult, 'id' | 'completedAt'>) => Promise<TestResult> | TestResult;
  onNavigateTab: (tabId: 'booking') => void;
}

export const TestsTab: React.FC<TestsTabProps> = ({
  tests,
  patientId,
  currentUser,
  submitTestResult,
  onNavigateTab
}) => {
  const activeTest = tests[0];
  const [testViewMode, setTestViewMode] = useState<'ALL_LIST' | 'STEPPER'>('ALL_LIST');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testCompletedResult, setTestCompletedResult] = useState<TestResult | null>(null);

  const handleAutoFillDASS21 = () => {
    const dummyAnswers: Record<number, number> = {};
    activeTest.questions.forEach((q, idx) => {
      if (q.subscale === 'Kecemasan') {
        dummyAnswers[idx] = [1, 2, 2, 3][idx % 4];
      } else if (q.subscale === 'Stres') {
        dummyAnswers[idx] = [1, 2, 1, 2][idx % 4];
      } else {
        dummyAnswers[idx] = [0, 1, 1, 2][idx % 4];
      }
    });
    setTestAnswers(dummyAnswers);
  };

  const handleAnswerQuestion = (idx: number, score: number) => {
    setTestAnswers(prev => ({ ...prev, [idx]: score }));
  };

  const calculateDASS21Score = async () => {
    let total = 0;
    let dep = 0;
    let anx = 0;
    let str = 0;

    activeTest.questions.forEach((q, idx) => {
      const val = testAnswers[idx] ?? 0;
      total += val;
      if (q.subscale === 'Depresi') dep += val;
      if (q.subscale === 'Kecemasan') anx += val;
      if (q.subscale === 'Stres') str += val;
    });

    let severity: 'NORMAL' | 'RINGAN' | 'SEDANG' | 'BERAT' | 'SANGAT_BERAT' = 'NORMAL';
    let interpretation = 'Tingkat stres dan kecemasan Anda berada dalam batas normal dan adaptif.';
    let rec = 'Tetap jaga keseimbangan ritme istirahat dan luangkan waktu untuk kegiatan rekreatif mandiri.';

    if (total >= 28) {
      severity = 'BERAT';
      interpretation = 'Skor total menunjukkan indikasi distres psikologis berat dengan intensitas kecemasan dan stres yang sangat mengganggu fungsi harian.';
      rec = 'Sangat dianjurkan berkonsultasi mendalam dengan psikolog klinis untuk terapi terstruktur (CBT) dan psikoedukasi regulasi sistem saraf.';
    } else if (total >= 18) {
      severity = 'SEDANG';
      interpretation = 'Indikasi tingkat kecemasan dan beban stres berada pada derajat Sedang. Terdapat keluhan psikosomatis atau ketegangan pikiran berlebih.';
      rec = 'Disarankan mengikuti sesi konseling 1-on-1 untuk melatih teknik pernapasan diafragma 4-7-8 dan restrukturisasi pikiran cemas.';
    } else if (total >= 10) {
      severity = 'RINGAN';
      interpretation = 'Indikasi gejala kecemasan atau stres ringan yang muncul sesekali pada situasi pemicu tertentu.';
      rec = 'Dapat dibantu dengan latihan mindfulness teratur, perbaikan sleep hygiene, dan manajemen beban kerja harian.';
    }

    const saved = await submitTestResult({
      patientId,
      patientName: currentUser?.name || 'Pasien',
      testId: activeTest.id,
      testCode: activeTest.code,
      testTitle: activeTest.title,
      totalScore: total,
      subscaleScores: {
        depression: dep,
        anxiety: anx,
        stress: str
      },
      severityLevel: severity,
      interpretation,
      clinicalRecommendation: rec
    });

    setTestCompletedResult(saved);
  };

  const answeredCount = Object.keys(testAnswers).length;
  const isAllAnswered = answeredCount === activeTest.questions.length;

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6">
      {/* Top Test Banner with Auto-fill Demo */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-mono">
                {activeTest.code}
              </span>
              <span className="text-xs text-slate-400 font-bold">{activeTest.questions.length} Butir Pertanyaan Klinis</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeTest.title}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {activeTest.shortDescription} Pilihlah salah satu opsi (0 sampai 3) yang paling menggambarkan kondisi Anda selama 1 pekan terakhir.
            </p>
          </div>

          {/* DEMO AUTO-FILL BUTTON */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={handleAutoFillDASS21}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              title="Klik untuk mengisi otomatis seluruh pertanyaan dengan data realistis untuk pengujian cepat"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Isi Otomatis (Auto-fill Demo)</span>
            </button>

            <button
              type="button"
              onClick={() => setTestViewMode(testViewMode === 'ALL_LIST' ? 'STEPPER' : 'ALL_LIST')}
              className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
            >
              {testViewMode === 'ALL_LIST' ? 'Mode Stepper' : 'Mode Semua Soal'}
            </button>
          </div>
        </div>

        {/* Progress Bar & Answer Status */}
        <div className="py-4 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">
            Status Pengisian: <strong className="text-teal-700">{answeredCount} / {activeTest.questions.length} Terjawab</strong>
          </span>
          <span className="text-slate-400">
            Skala Nilai: 0 (Tidak Pernah) s/d 3 (Hampir Selalu)
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-4">
          <div
            className="bg-teal-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(answeredCount / activeTest.questions.length) * 100}%` }}
          />
        </div>

        {/* Questions Rendering (ALL LIST MODE) */}
        {testViewMode === 'ALL_LIST' ? (
          <div className="space-y-4 my-6">
            {activeTest.questions.map((q, qIndex) => {
              const currentSelected = testAnswers[qIndex];
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    currentSelected !== undefined
                      ? 'border-teal-200 bg-teal-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      {qIndex + 1}. {q.text}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.subscale === 'Depresi'
                          ? 'bg-rose-50 text-rose-700'
                          : q.subscale === 'Kecemasan'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-teal-50 text-teal-700'
                      }`}
                    >
                      {q.subscale}
                    </span>
                  </div>

                  {/* 4 Radio Option Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {q.options.map(opt => {
                      const isPicked = currentSelected === opt.score;
                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleAnswerQuestion(qIndex, opt.score)}
                          className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isPicked
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isPicked ? 'bg-white text-teal-800' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {opt.score}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* STEPPER MODE */
          <div className="my-6 space-y-6">
            <div className="p-6 bg-teal-50/60 rounded-2xl border border-teal-100">
              <span className="inline-block px-2 py-0.5 rounded bg-teal-100 text-teal-800 text-[10px] font-bold uppercase mb-2">
                Kategori: {activeTest.questions[currentQuestionIndex].subscale}
              </span>
              <p className="text-lg font-bold text-slate-900 leading-relaxed">
                "{activeTest.questions[currentQuestionIndex].text}"
              </p>
            </div>

            <div className="space-y-2.5">
              {activeTest.questions[currentQuestionIndex].options.map(opt => (
                <button
                  key={opt.score}
                  onClick={() => {
                    handleAnswerQuestion(currentQuestionIndex, opt.score);
                    if (currentQuestionIndex < activeTest.questions.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    }
                  }}
                  className="w-full p-4 text-left rounded-2xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-xs sm:text-sm font-semibold text-slate-800 transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>{opt.label}</span>
                  <span className="w-6 h-6 rounded-full border border-slate-300 flex items-center justify-center text-xs font-bold">
                    {opt.score}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                className="px-4 py-2 border rounded-xl text-xs font-semibold disabled:opacity-30 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                disabled={currentQuestionIndex === activeTest.questions.length - 1}
                onClick={() => setCurrentQuestionIndex(prev => Math.min(activeTest.questions.length - 1, prev + 1))}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold disabled:opacity-30 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}

        {/* Bottom Calculate Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            {isAllAnswered ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Seluruh {activeTest.questions.length} pertanyaan sudah lengkap terisi!
              </span>
            ) : (
              <span>Lengkapi atau klik <strong>"Isi Otomatis"</strong> untuk langsung menghitung.</span>
            )}
          </div>

          <button
            type="button"
            onClick={calculateDASS21Score}
            className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4" />
            Hitung Skor & Simpan Hasil Evaluasi (DASS-21)
          </button>
        </div>
      </div>

      {/* EVALUATION RESULT MODAL */}
      {testCompletedResult && (
        <div
          onClick={() => setTestCompletedResult(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden cursor-default"
          >
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                Hasil Asesmen DASS-21 Tersimpan
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Psikogram Klinis Mandiri</h3>
              <p className="text-xs text-slate-500 mt-1">
                Evaluasi terikat ke akun <strong>{testCompletedResult.patientName}</strong> dan otomatis terlihat oleh psikolog saat sesi konsultasi.
              </p>
            </div>

            <div className="py-4 space-y-4 text-xs">
              {/* Total score & severity */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tingkat Derajat Keparahan</span>
                  <div className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                      testCompletedResult.severityLevel === 'BERAT' || testCompletedResult.severityLevel === 'SANGAT_BERAT'
                        ? 'bg-rose-100 text-rose-800'
                        : testCompletedResult.severityLevel === 'SEDANG'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      KATEGORI {testCompletedResult.severityLevel}
                    </span>
                  </div>
                </div>
                <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Skor</span>
                  <div className="text-2xl font-black text-teal-700">{testCompletedResult.totalScore}</div>
                </div>
              </div>

              {/* Subscales Breakdown */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Subskala Depresi</span>
                  <div className="text-lg font-black text-rose-900 mt-0.5">
                    {testCompletedResult.subscaleScores?.depression ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Subskala Kecemasan</span>
                  <div className="text-lg font-black text-amber-900 mt-0.5">
                    {testCompletedResult.subscaleScores?.anxiety ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                  <span className="text-[10px] font-bold text-teal-700 uppercase">Subskala Stres</span>
                  <div className="text-lg font-black text-teal-900 mt-0.5">
                    {testCompletedResult.subscaleScores?.stress ?? 0}
                  </div>
                </div>
              </div>

              {/* Clinical Interpretations */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
                <div className="font-bold text-teal-950">Interpretasi Klinis:</div>
                <p className="text-teal-900 leading-relaxed">{testCompletedResult.interpretation}</p>
                <div className="font-bold text-teal-950 pt-1">Rekomendasi Psikolog:</div>
                <p className="text-teal-900 leading-relaxed">{testCompletedResult.clinicalRecommendation}</p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => {
                  setTestCompletedResult(null);
                  onNavigateTab('booking');
                }}
                className="w-full sm:flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Konsultasikan Hasil Ini dengan Psikolog
              </button>
              <button
                onClick={() => setTestCompletedResult(null)}
                className="w-full sm:w-auto px-5 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
