import React, { useState, useMemo } from 'react';
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
  ChevronRight
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
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{pendingCount} Menunggu</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{approvedCount} Disetujui</span>
            </span>
          </div>
        </div>

        {/* 2. Rating Rata-Rata & Star Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Average Rating Score Card */}
          <div className="lg:col-span-3 flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              ★
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Rating Rata-rata</div>
              <div className="text-2xl font-black text-amber-950 leading-none mt-0.5">
                {avgRating} <span className="text-xs font-normal text-amber-800">/ 5.0</span>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold">{reviews.length} total ulasan</span>
            </div>
          </div>

          {/* Star Filter Pills */}
          <div className="lg:col-span-9 flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setSelectedRatingFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRatingFilter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Rating ({reviews.length})
            </button>

            {[5, 4, 3, 2, 1].map(stars => (
              <button
                key={stars}
                type="button"
                onClick={() => {
                  setSelectedRatingFilter(String(stars));
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedRatingFilter === String(stars)
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{stars}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-[10px] opacity-80">({countByRating[stars as keyof typeof countByRating]})</span>
              </button>
            ))}
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
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 text-xs cursor-pointer focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
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
        <div className="overflow-x-auto">
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

                      {/* Komentar */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{rev.comment}"
                        </p>
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
    </div>
  );
};
