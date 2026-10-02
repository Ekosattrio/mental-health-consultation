import React, { useState } from 'react';
import { PsychologicalTest, User, TestResult } from '../../../types';
import {
  Sparkles,
  CheckCircle2,
  Activity,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

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

  const handleSelectOption = (score: number) => {
    setTestAnswers(prev => ({ ...prev, [currentQuestionIndex]: score }));
    // Auto advance to next question if not at the last question
    if (currentQuestionIndex < activeTest.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 200);
    }
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
    let rec = 'Tetap jaga ritme istirahat teratur dan luangkan waktu untuk relaksasi mandiri.';

    if (total >= 28) {
      severity = 'BERAT';
      interpretation = 'Skor total menunjukkan indikasi distres psikologis berat dengan intensitas kecemasan dan stres tinggi.';
      rec = 'Sangat dianjurkan berkonsultasi mendalam dengan psikolog klinis untuk terapi terstruktur (CBT).';
    } else if (total >= 18) {
      severity = 'SEDANG';
      interpretation = 'Indikasi tingkat kecemasan dan stres berada pada derajat Sedang. Terdapat ketegangan pikiran berlebih.';
      rec = 'Disarankan mengikuti sesi konseling 1-on-1 untuk melatih teknik pernapasan dan restrukturisasi pikiran cemas.';
    } else if (total >= 10) {
      severity = 'RINGAN';
      interpretation = 'Indikasi gejala kecemasan atau stres ringan yang muncul sesekali pada situasi pemicu tertentu.';
      rec = 'Dapat dibantu dengan mindfulness teratur, sleep hygiene, dan manajemen beban kerja harian.';
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
  const currentQ = activeTest.questions[currentQuestionIndex];
  const currentAnswer = testAnswers[currentQuestionIndex];

  return (
    <div className="space-y-4">
      {/* RESULT MODAL / CARD IF COMPLETED */}
      {testCompletedResult ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-700 mx-auto flex items-center justify-center shadow-xs">
              <Award className="w-8 h-8" />
            </div>
            <span className="text-xs font-bold text-teal-700 tracking-wider uppercase">
              Asesmen Berhasil Diselesaikan
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Hasil Skrining Psikologi Mandiri ({testCompletedResult.testCode})
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">
              Skrining ini memberikan gambaran awal respon emosional Anda selama 1 pekan terakhir untuk membantu psikolog saat sesi konsultasi.
            </p>
          </div>

          {/* Severity Score Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold text-teal-800 uppercase">Tingkat Derajat Keparahan</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                Kategori: <span className="text-teal-700">{testCompletedResult.severityLevel}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Total Akumulasi Skor: <strong>{testCompletedResult.totalScore}</strong> poin
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl border border-teal-100 text-center min-w-[70px]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Depresi</span>
                <span className="text-lg font-black text-slate-800">{testCompletedResult.subscaleScores.depression ?? 0}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-teal-100 text-center min-w-[70px]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Cemas</span>
                <span className="text-lg font-black text-slate-800">{testCompletedResult.subscaleScores.anxiety ?? 0}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-teal-100 text-center min-w-[70px]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Stres</span>
                <span className="text-lg font-black text-slate-800">{testCompletedResult.subscaleScores.stress ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interpretasi Klinis</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {testCompletedResult.interpretation}
            </p>
            <div className="pt-2 text-xs text-teal-900 bg-teal-50 p-3.5 rounded-xl border border-teal-100">
              <strong>Rekomendasi Praktisi:</strong> {testCompletedResult.clinicalRecommendation}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setTestCompletedResult(null);
                setTestAnswers({});
                setCurrentQuestionIndex(0);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Asesmen</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('booking')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Booking Konsultasi dengan Hasil Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* STEPPER QUESTION CARD - NO ENDLESS VERTICAL SCROLLING */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header & Demo Autofill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  {activeTest.code}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  Asesmen {activeTest.questions.length} Butir
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">{activeTest.title}</h3>
            </div>

            <button
              type="button"
              onClick={handleAutoFillDASS21}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
              title="Isi jawaban secara cepat untuk pengujian"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Isi Otomatis (Demo)</span>
            </button>
          </div>

          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                Soal <strong className="text-teal-700 text-sm font-black">{currentQuestionIndex + 1}</strong> dari {activeTest.questions.length}
              </span>
              <span className="text-slate-500 font-semibold">
                Terjawab: <strong className="text-teal-700">{answeredCount}</strong> / {activeTest.questions.length}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(answeredCount / activeTest.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Quick Jump Question Number Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {activeTest.questions.map((_, idx) => {
              const isAnswered = testAnswers[idx] !== undefined;
              const isCurrent = currentQuestionIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1'
                      : isAnswered
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Main Question Box */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wider">
                Dimensi: {currentQ.subscale || 'Umum'}
              </span>
              <span className="text-[11px] text-slate-400">Pilih 1 jawaban</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed min-h-[50px]">
              "{currentQ.text}"
            </h4>

            {/* 4 Touch-Friendly Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                { score: 0, label: 'Tidak Pernah', desc: 'Sama sekali tidak berlaku pada saya' },
                { score: 1, label: 'Kadang-kadang', desc: 'Berlaku sampai batas tertentu' },
                { score: 2, label: 'Cukup Sering', desc: 'Berlaku pada tingkat yang cukup sering' },
                { score: 3, label: 'Hampir Selalu', desc: 'Sangat sering berlaku pada saya' }
              ].map(opt => {
                const isSelected = currentAnswer === opt.score;
                return (
                  <button
                    key={opt.score}
                    type="button"
                    onClick={() => handleSelectOption(opt.score)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 ring-2 ring-teal-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black ${
                        isSelected
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      {opt.score}
                    </div>
                    <div>
                      <span className={`text-xs font-black block ${isSelected ? 'text-teal-950' : 'text-slate-900'}`}>
                        {opt.label}
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        {opt.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            {currentQuestionIndex < activeTest.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isAllAnswered}
                onClick={calculateDASS21Score}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-black flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan & Lihat Hasil</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
