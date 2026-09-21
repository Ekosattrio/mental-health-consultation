import React, { useState } from 'react';
import { Appointment, Review } from '../../../types';
import { Star, MessageSquare, CheckCircle2, ThumbsUp, ShieldCheck, Sparkles } from 'lucide-react';

interface HistoryTabProps {
  patientAppointments: Appointment[];
  appointments: Appointment[];
  reviews: Review[];
  submitReview: (review: {
    appointmentId: string;
    psychologistId: string;
    rating: number;
    comment: string;
    isAnonymous: boolean;
  }) => void;
  onNavigateTab: (tabId: 'chat') => void;
}

const FEEDBACK_TAGS = [
  'Empatis & Hangat',
  'Pendengar yang Baik',
  'Solusi Sangat Praktis',
  'Tepat Waktu',
  'Ruang Aman Bebas Judgement',
  'Wawasan Klinis Mendalam',
  'Membantu Atasi Cemas',
  'Perlu Penjelasan Lebih Rinci'
];

const RATING_DESCRIPTIONS: Record<number, { label: string; mood: string; color: string }> = {
  1: { label: 'Sangat Kurang Memuaskan', mood: '😞', color: 'text-rose-600' },
  2: { label: 'Kurang Memuaskan', mood: '🙁', color: 'text-amber-600' },
  3: { label: 'Cukup / Standar', mood: '😐', color: 'text-yellow-600' },
  4: { label: 'Sangat Baik & Solutif', mood: '😊', color: 'text-teal-600' },
  5: { label: 'Luar Biasa & Sangat Membantu', mood: '🤩', color: 'text-emerald-600' }
};

export const HistoryTab: React.FC<HistoryTabProps> = ({
  patientAppointments,
  appointments,
  reviews,
  submitReview,
  onNavigateTab
}) => {
  const [reviewModalAptId, setReviewModalAptId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewAnonymous, setReviewAnonymous] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const activeModalApt = appointments.find(a => a.id === reviewModalAptId);

  const handleOpenReviewModal = (apt: Appointment) => {
    setReviewModalAptId(apt.id);
    const existing = reviews.find(r => r.appointmentId === apt.id);
    if (existing) {
      setReviewRating(existing.rating);
      setReviewComment(existing.comment);
      setReviewAnonymous(existing.isAnonymous);
    } else {
      setReviewRating(5);
      setReviewComment('');
      setReviewAnonymous(true);
      setSelectedTags([]);
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
      // Auto append to comment if not already included
      if (!reviewComment.includes(tag)) {
        setReviewComment(prev => (prev ? `${prev}. ${tag}` : tag));
      }
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalAptId || !activeModalApt) return;

    submitReview({
      appointmentId: reviewModalAptId,
      psychologistId: activeModalApt.psychologistId,
      rating: reviewRating,
      comment: reviewComment,
      isAnonymous: reviewAnonymous
    });

    setReviewModalAptId(null);
    setReviewComment('');
    setSelectedTags([]);
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : reviewRating;

  return (
    <div className="py-6 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rekam Sesi & Ulasan Kepuasan</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Riwayat Janji Temu & Penilaian Sesi</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh sesi konsultasi Anda. Berikan rating dan ulasan objektif untuk membantu evaluasi mutu klinis psikolog.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {patientAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada riwayat janji temu konsultasi.
            </div>
          ) : (
            patientAppointments.map(apt => {
              const userReview = reviews.find(r => r.appointmentId === apt.id);
              const isReviewed = !!userReview;

              return (
                <div
                  key={apt.id}
                  className="p-5 rounded-3xl border border-slate-200/80 bg-slate-50/50 hover:bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {apt.bookingCode}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : apt.status === 'COMPLETED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status === 'CONFIRMED' ? 'Jadwal Terkonfirmasi' : apt.status === 'COMPLETED' ? 'Selesai' : apt.status}
                      </span>

                      {isReviewed && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Rating {userReview.rating}/5 Diberikan</span>
                        </span>
                      )}
                    </div>

                    <div className="text-base font-black text-slate-900">{apt.packageName}</div>
                    <div className="text-xs text-slate-600">
                      Psikolog: <strong className="text-slate-900">{apt.psychologistName}</strong> • {apt.date} ({apt.startTime} - {apt.endTime} WIB)
                    </div>
                    <div className="text-[11px] text-teal-700 font-medium">
                      Lokasi: {apt.meetingLocation} • Total Biaya: Rp {apt.totalAmount.toLocaleString('id-ID')} ({apt.paymentStatus})
                    </div>

                    {/* Show preview of client review if submitted */}
                    {isReviewed && (
                      <div className="mt-2 p-3 bg-white rounded-2xl border border-amber-200/80 text-xs text-slate-700 space-y-1 max-w-xl">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-amber-500" />
                            Ulasan Anda {userReview.isAnonymous && <span className="text-slate-400 font-normal">(Anonim)</span>}:
                          </span>
                          <div className="flex text-amber-400">
                            {[...Array(userReview.rating)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="italic text-slate-600 leading-relaxed">"{userReview.comment}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {/* Review button available if session completed OR confirmed */}
                    <button
                      type="button"
                      onClick={() => handleOpenReviewModal(apt)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                        isReviewed
                          ? 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-50'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isReviewed ? 'fill-amber-500 text-amber-500' : 'fill-white'}`} />
                      <span>{isReviewed ? 'Edit Ulasan Saya' : 'Beri Rating & Ulasan'}</span>
                    </button>

                    {apt.status === 'CONFIRMED' && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('chat')}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Ruang Chat
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL REVIEW POST-SESSION                                                 */}
      {/* ========================================================================= */}
      {reviewModalAptId && activeModalApt && (
        <div
          onClick={() => setReviewModalAptId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 cursor-default relative overflow-hidden"
          >
            <div className="flex justify-between items-start pb-3.5 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Evaluasi Kualitas Konseling
                </span>
                <h4 className="text-lg font-black text-slate-900 mt-1">Beri Penilaian & Ulasan Praktik</h4>
                <p className="text-xs text-slate-500">
                  Konsultasi bersama <strong>{activeModalApt.psychologistName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalAptId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Rating Section */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Berapa bintang untuk sesi konsultasi Anda?
                </label>

                <div className="flex items-center justify-center gap-2 py-1">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = star <= currentDisplayRating;
                    return (
                      <button
                        type="button"
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setReviewRating(star)}
                        className="p-1 rounded-xl hover:scale-115 transition-transform cursor-pointer"
                        title={`${star} Bintang`}
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="text-xs font-extrabold flex items-center justify-center gap-1.5">
                  <span className="text-base">{RATING_DESCRIPTIONS[currentDisplayRating]?.mood}</span>
                  <span className={RATING_DESCRIPTIONS[currentDisplayRating]?.color}>
                    {RATING_DESCRIPTIONS[currentDisplayRating]?.label} ({currentDisplayRating} dari 5 Bintang)
                  </span>
                </div>
              </div>

              {/* Quick Feedback Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Aspek Pelayanan (Pilih yang sesuai):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Review Text Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ceritakan Pengalaman Konsultasi Anda
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Bagaimana pendekatan psikolog dalam mendengarkan keluhan Anda? Apakah solusi yang diberikan membantu menenangkan batin?"
                  className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              {/* Anonymous Checkbox */}
              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="anonCheckbox"
                  checked={reviewAnonymous}
                  onChange={e => setReviewAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer mt-0.5"
                />
                <label htmlFor="anonCheckbox" className="text-xs text-slate-700 cursor-pointer leading-relaxed">
                  <strong>Tampilkan sebagai Klien Anonim</strong> demi melindungi privasi Anda pada ulasan publik. Nama asli Anda hanya terlihat oleh sistem moderasi klinik.
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalAptId(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Kirim Ulasan & Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
