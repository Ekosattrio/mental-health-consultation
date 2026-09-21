import React, { useState, useMemo } from 'react';
import { PsychologicalTest, Question } from '../../../types';
import { INITIAL_TESTS } from '../../../data/mockData';
import { RotateCcw, Plus, Sparkles, Search, Edit2, Trash2, Save } from 'lucide-react';

interface TestsTabProps {
  tests: PsychologicalTest[];
  saveTest: (test: PsychologicalTest) => void;
}

export const TestsTab: React.FC<TestsTabProps> = ({ tests, saveTest }) => {
  const activeTest = tests[0];

  const [questionSearchQuery, setQuestionSearchQuery] = useState('');
  const [questionSubscaleFilter, setQuestionSubscaleFilter] = useState<'ALL' | 'Depresi' | 'Kecemasan' | 'Stres'>('ALL');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);

  const filteredQuestions = useMemo(() => {
    if (!activeTest?.questions) return [];
    return activeTest.questions.filter(q => {
      const qText = questionSearchQuery.toLowerCase().trim();
      const matchesSearch = !qText || q.text.toLowerCase().includes(qText) || (q.subscale && q.subscale.toLowerCase().includes(qText));
      const matchesSubscale = questionSubscaleFilter === 'ALL' || q.subscale === questionSubscaleFilter;
      return matchesSearch && matchesSubscale;
    });
  }, [activeTest?.questions, questionSearchQuery, questionSubscaleFilter]);

  const handleOpenAddQuestion = () => {
    const nextId = (activeTest?.questions.length || 0) + 1;
    setEditingQuestion({
      id: nextId,
      text: '',
      subscale: 'Depresi',
      options: [
        { label: 'Tidak pernah dialami sama sekali', score: 0 },
        { label: 'Kadang-kadang dialami / beberapa kali', score: 1 },
        { label: 'Sering dialami / cukup sering', score: 2 },
        { label: 'Hampir selalu atau sangat sering dialami', score: 3 }
      ]
    });
    setIsNewQuestion(true);
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: Question) => {
    setEditingQuestion({ ...q });
    setIsNewQuestion(false);
    setIsQuestionModalOpen(true);
  };

  const handleDeleteQuestion = (questionId: number) => {
    if (!activeTest) return;
    if (confirm(`Yakin ingin menghapus butir pertanyaan #${questionId}?`)) {
      const updatedQuestions = activeTest.questions.filter(q => q.id !== questionId);
      saveTest({
        ...activeTest,
        questions: updatedQuestions
      });
    }
  };

  const handleSaveQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTest || !editingQuestion) return;

    let updatedQuestions: Question[];
    if (isNewQuestion) {
      updatedQuestions = [...activeTest.questions, editingQuestion];
    } else {
      updatedQuestions = activeTest.questions.map(q => (q.id === editingQuestion.id ? editingQuestion : q));
    }

    saveTest({
      ...activeTest,
      questions: updatedQuestions
    });

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleResetQuestionsToDefault = () => {
    if (confirm('Kembalikan butir pertanyaan ke 21 instrumen baku DASS-21 HIMPSI?')) {
      saveTest({
        ...activeTest,
        questions: INITIAL_TESTS[0].questions
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-700 uppercase bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {activeTest?.code || 'DASS-21'}
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Asesmen Mandiri Terstandar</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">{activeTest?.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{activeTest?.shortDescription}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetQuestionsToDefault}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Kembalikan butir pertanyaan ke 21 item standar DASS-21"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset Butir Baku
            </button>
            <button
              onClick={handleOpenAddQuestion}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Pertanyaan
            </button>
          </div>
        </div>

        {/* Formula & Scoring Guidance Box */}
        <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 text-xs text-slate-700 mb-6 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-purple-950 block mb-0.5">Formula & Pedoman Penilaian Baku:</span>
            <p className="text-slate-600 leading-relaxed">{activeTest?.scoringFormula}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-purple-100/80 text-[11px] font-semibold text-slate-600">
              <span className="text-purple-900">Skala Respon (0-3):</span>
              <span className="px-2 py-0.5 bg-white rounded border border-purple-200">0 = Tidak pernah</span>
              <span className="px-2 py-0.5 bg-white rounded border border-purple-200">1 = Terkadang</span>
              <span className="px-2 py-0.5 bg-white rounded border border-purple-200">2 = Sering</span>
              <span className="px-2 py-0.5 bg-white rounded border border-purple-200">3 = Sangat sering</span>
            </div>
          </div>
        </div>

        {/* Subscale Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={questionSearchQuery}
              onChange={e => setQuestionSearchQuery(e.target.value)}
              placeholder="Cari butir pertanyaan atau subskala..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          {/* Subscale filter pills */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0">
            {(['ALL', 'Depresi', 'Kecemasan', 'Stres'] as const).map(sub => {
              const count =
                sub === 'ALL'
                  ? (activeTest?.questions || []).length
                  : (activeTest?.questions || []).filter(q => q.subscale === sub).length;
              return (
                <button
                  key={sub}
                  onClick={() => setQuestionSubscaleFilter(sub)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    questionSubscaleFilter === sub
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'
                  }`}
                >
                  {sub === 'ALL' ? 'Semua Subskala' : sub} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              Tidak ada butir pertanyaan yang sesuai dengan kriteria filter atau pencarian.
            </div>
          ) : (
            filteredQuestions.map(q => {
              const subscaleColor =
                q.subscale === 'Depresi'
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : q.subscale === 'Kecemasan'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                      #{q.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {q.subscale && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${subscaleColor}`}>
                            Subskala {q.subscale}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono">ID: {q.id}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Hapus butir pertanyaan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal CRUD Butir Pertanyaan Tes Asesmen */}
      {isQuestionModalOpen && editingQuestion && (
        <div
          onClick={() => setIsQuestionModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 cursor-pointer animate-in fade-in duration-150 backdrop-blur-xs"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 cursor-default animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 font-black text-xs flex items-center justify-center border border-purple-200">
                  #{editingQuestion.id}
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {isNewQuestion ? 'Tambah Butir Pertanyaan Baru' : 'Edit Butir Pertanyaan Asesmen'}
                </h4>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subskala Gejala</label>
                <select
                  value={editingQuestion.subscale || 'Depresi'}
                  onChange={e => setEditingQuestion({ ...editingQuestion, subscale: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                >
                  <option value="Depresi">Subskala Depresi (D - Dysphoria / Anhedonia)</option>
                  <option value="Kecemasan">Subskala Kecemasan (A - Autonomic Arousal / Situational)</option>
                  <option value="Stres">Subskala Stres (S - Chronic Non-specific Arousal / Tension)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pilihlah domain klinis yang diukur oleh butir kuesioner ini.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teks Pernyataan / Pertanyaan</label>
                <textarea
                  rows={3}
                  required
                  value={editingQuestion.text}
                  onChange={e => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  placeholder="Contoh: Saya merasa sulit untuk beristirahat atau menenangkan diri..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs leading-relaxed"
                />
              </div>

              {/* Likert Scale Info Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block text-[11px]">
                  Pilihan Respon Pasien Baku (Skala 0 - 3 Likert):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-purple-700">0:</strong> Tidak pernah (0%)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-purple-700">1:</strong> Terkadang (Jarang)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-purple-700">2:</strong> Sering (Cukup sering)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <strong className="text-purple-700">3:</strong> Sangat sering (Hampir selalu)
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Butir Pertanyaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

