import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Review, PsychologistProfile, User } from '../../../types';
import {
  Star,
  CheckCircle2,
  Clock,
  Check,
  Trash2,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MessageSquare
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface ReviewsTabProps {
  reviews: Review[];
  psychologists: PsychologistProfile[];
  users: User[];
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  approveReview,
  rejectReview
}) => {
  // Modal state untuk membaca ulasan lengkap
  const [selectedReviewForModal, setSelectedReviewForModal] = useState<Review | null>(null);

  // Filters state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Standardized Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 4.8;
  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;

  const countByRating = useMemo(() => {
    return {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };
  }, [reviews]);

  // Filter calculation
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Filter by rating
      if (selectedRatingFilter !== 'ALL') {
        const targetRating = Number(selectedRatingFilter);
        if (rev.rating !== targetRating) return false;
      }

      // Filter by status
      if (selectedStatusFilter === 'APPROVED' && !rev.isApproved) return false;
      if (selectedStatusFilter === 'PENDING' && rev.isApproved) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const clientName = (rev.isAnonymous ? rev.anonymousAlias || 'Anonim' : rev.patientName).toLowerCase();
        const comment = (rev.comment || '').toLowerCase();
        if (!clientName.includes(query) && !comment.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [reviews, selectedRatingFilter, selectedStatusFilter, searchQuery]);

  const resetFilters = () => {
    setSelectedRatingFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Standardized Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredReviews.length);
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  return (
    <div className="space-y-5">
      {/* 1. Header & Stats Summary Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Moderasi Ulasan & Feedback Pasien
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola dan verifikasi ulasan pasien sebelum ditampilkan ke publik.
            </p>
          </div>

          {/* Key Metric Highlights */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingCount} Menunggu</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{approvedCount} Disetujui</span>
            </span>
          </div>
        </div>

        {/* 2. Rating Breakdown & Metric Grid Modern Simple Light */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Kolom 1: Skor Rata-rata & Bintang (4 cols) */}
          <div className="md:col-span-4 p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col justify-center items-center text-center">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">
              Rating Rata-rata Pasien
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">
              {avgRating} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(avgRating)
                      ? 'fill-amber-400 text-amber-400 drop-shadow-2xs'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Berdasarkan <strong>{reviews.length} total ulasan</strong> terverifikasi
            </span>
          </div>

          {/* Kolom 2: Visual Distribution Bar (5 - 1 Star) (5 cols) */}
          <div className="md:col-span-5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex flex-col justify-center space-y-1.5 text-xs">
            {[5, 4, 3, 2, 1].map(stars => {
              const count = countByRating[stars as keyof typeof countByRating];
              const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              const isSelected = selectedRatingFilter === String(stars);

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => {
                    setSelectedRatingFilter(isSelected ? 'ALL' : String(stars));
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded-lg transition-colors cursor-pointer group text-left ${
                    isSelected ? 'bg-amber-100/80 font-bold' : 'hover:bg-white'
                  }`}
                  title={`Klik untuk memfilter ulasan ${stars} bintang`}
                >
                  <span className="w-10 text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>

                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stars >= 4 ? 'bg-amber-400' : stars === 3 ? 'bg-amber-300' : 'bg-rose-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-12 text-right text-[11px] text-slate-500 font-semibold shrink-0">
                    {count} ({pct}%)
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kolom 3: Status Moderasi Pills & Filter Cepat (3 cols) */}
          <div className="md:col-span-3 p-3.5 rounded-2xl bg-white border border-slate-200/80 flex flex-col justify-center space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Filter Cepat Status
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Semua Ulasan</span>
              <span className="text-[11px] font-bold opacity-80">{reviews.length}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatusFilter('PENDING');
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                selectedStatusFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Menunggu</span>
              </span>
              <span className="text-[11px] font-bold">{pendingCount}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatusFilter('APPROVED');
                setCurrentPage(1);
              }}
              className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                selectedStatusFilter === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Disetujui</span>
              </span>
              <span className="text-[11px] font-bold">{approvedCount}</span>
            </button>
          </div>
        </div>

        {/* 3. Search & Status Filter Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama pasien atau kutipan komentar ulasan..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatusFilter}
              onChange={e => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="min-w-0 flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-xs cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
            >
              <option value="ALL">Semua Status Publikasi</option>
              <option value="PENDING">Menunggu Persetujuan ({pendingCount})</option>
              <option value="APPROVED">Sudah Disetujui ({approvedCount})</option>
            </select>

            {(selectedRatingFilter !== 'ALL' || selectedStatusFilter !== 'ALL' || searchQuery.trim()) && (
              <Tooltip content="Reset Filter & Pencarian" position="bottom">
                <button
                  type="button"
                  onClick={resetFilters}
                  aria-label="Reset Filter & Pencarian"
                  className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* 4. DATA TABEL ULASAN (Sesuai Permintaan: Review Dijadikan Tabel Bersih) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedReviews.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-400 text-xs italic">Tidak ada ulasan yang cocok dengan kriteria filter saat ini.</div>
          ) : paginatedReviews.map(rev => {
            const reviewerName = rev.isAnonymous ? rev.anonymousAlias || 'Klien Anonim' : rev.patientName;
            return (
              <article key={rev.id} className={`p-4 space-y-3 ${!rev.isApproved ? 'bg-amber-50/30' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 break-words">{reviewerName}</h4>
                    <p className="text-[10px] text-slate-400">{rev.createdAt} - #{rev.appointmentId}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{rev.isApproved ? 'Disetujui' : 'Pending'}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Rating ${rev.rating} dari 5`}>
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                  <strong className="text-xs text-slate-800 ml-1">{rev.rating}.0</strong>
                </div>
                <p className="text-xs italic text-slate-700 line-clamp-3 break-words">"{rev.comment}"</p>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setSelectedReviewForModal(rev)} className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-purple-700 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Baca</button>
                  <div className="flex items-center gap-1.5">
                    {!rev.isApproved && <button type="button" onClick={() => approveReview(rev.id)} aria-label="Setujui Ulasan" className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center"><Check className="w-4 h-4" /></button>}
                    <button type="button" onClick={() => rejectReview(rev.id)} aria-label={rev.isApproved ? 'Hapus Ulasan' : 'Tolak Ulasan'} className="w-9 h-9 bg-white text-rose-600 border border-rose-200 rounded-xl flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tanggal & ID</th>
                <th className="py-3.5 px-4">Pasien</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4 min-w-[280px]">Ulasan Pasien</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi Moderasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs italic">
                    Tidak ada ulasan yang cocok dengan kriteria filter saat ini.
                  </td>
                </tr>
              ) : (
                paginatedReviews.map(rev => {
                  const reviewerName = rev.isAnonymous
                    ? rev.anonymousAlias || 'Klien Anonim'
                    : rev.patientName;

                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        !rev.isApproved ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Tanggal & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 block">{rev.createdAt}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">#{rev.appointmentId}</span>
                      </td>

                      {/* Pasien */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{reviewerName}</span>
                          {rev.isAnonymous && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-bold">
                              Anonim
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-black text-slate-800 ml-1">{rev.rating}.0</span>
                        </div>
                      </td>

                      {/* Komentar (Diringkas agar tabel rapi, klik untuk melihat modal utuh) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                          <p className="text-slate-700 truncate text-xs italic">
                            "{rev.comment}"
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedReviewForModal(rev)}
                            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 hover:underline shrink-0 cursor-pointer flex items-center gap-1 ml-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Baca</span>
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {rev.isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Aksi (Icon + Tooltip) */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {!rev.isApproved && (
                            <Tooltip content="Setujui & Publikasikan Ulasan" position="left">
                              <button
                                type="button"
                                onClick={() => approveReview(rev.id)}
                                aria-label="Setujui Ulasan"
                                className="w-8 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip content={rev.isApproved ? 'Hapus Ulasan dari Publik' : 'Tolak & Hapus Ulasan'} position="left">
                            <button
                              type="button"
                              onClick={() => rejectReview(rev.id)}
                              aria-label={rev.isApproved ? 'Hapus Ulasan' : 'Tolak Ulasan'}
                              className="w-8 h-8 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Standardized Pagination Controller */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Menampilkan <strong className="text-slate-800">{filteredReviews.length > 0 ? startIndex + 1 : 0}</strong> -{' '}
              <strong className="text-slate-800">{endIndex}</strong> dari{' '}
              <strong className="text-slate-800">{filteredReviews.length}</strong> ulasan
            </span>

            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Baris per halaman:</span>
              <select
                value={itemsPerPage}
                onChange={e => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 font-bold text-slate-800 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="px-2 font-bold text-slate-700">
              Halaman {validCurrentPage} dari {totalPages}
            </span>
            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL BACA ULASAN LENGKAP & MODERASI CEPAT */}
      {selectedReviewForModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="viewport-dialog bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp my-auto">
            {/* Header Modal Modern Simple Light */}
            <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Detail Ulasan Pasien</h3>
                  <p className="text-xs text-slate-500">
                    ID Reservasi: #{selectedReviewForModal.appointmentId} • {selectedReviewForModal.createdAt}
                  </p>
                </div>
              </div>

              <Tooltip content="Tutup Jendela" position="bottom">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForModal(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pengulas</span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedReviewForModal.isAnonymous
                      ? selectedReviewForModal.anonymousAlias || 'Klien Anonim'
                      : selectedReviewForModal.patientName}
                  </span>
                  {selectedReviewForModal.isAnonymous && (
                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold mt-0.5">
                      Identitas Terlindungi (Anonim)
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rating Diberikan</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < selectedReviewForModal.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="font-black text-slate-900 text-sm ml-1">
                      {selectedReviewForModal.rating}.0
                    </span>
                  </div>
                </div>
              </div>

              {/* Teks Ulasan Lengkap */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pesan & Testimoni Pasien:
                </span>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium italic">
                  "{selectedReviewForModal.comment}"
                </p>
              </div>

              {/* Status Publikasi */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-purple-950 font-bold">Status Saat Ini:</span>
                {selectedReviewForModal.isApproved ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sudah Dipublikasikan
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    Menunggu Persetujuan
                  </span>
                )}
              </div>
            </div>

            {/* Footer Modal Aksi Moderasi */}
            <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  rejectReview(selectedReviewForModal.id);
                  setSelectedReviewForModal(null);
                }}
                className="px-3.5 py-2 rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{selectedReviewForModal.isApproved ? 'Hapus Ulasan' : 'Tolak & Hapus'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReviewForModal(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  Tutup
                </button>

                {!selectedReviewForModal.isApproved && (
                  <button
                    type="button"
                    onClick={() => {
                      approveReview(selectedReviewForModal.id);
                      setSelectedReviewForModal(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Setujui & Publikasikan</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
