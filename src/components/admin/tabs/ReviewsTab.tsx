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
  Sparkles,
  AlertTriangle,
  ChevronDown,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface ReviewsTabProps {
  reviews: Review[];
  psychologists: PsychologistProfile[];
  users: User[];
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  reviews,
  psychologists,
  users,
  approveReview,
  rejectReview
}) => {
  // Filters state
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);

  const primaryDoc = psychologists[0];
  const primaryDocUser = users.find(u => u.id === primaryDoc?.userId);
  const avgRating =
    reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : primaryDoc?.rating || 4.9;
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length;
  const fourStarReviews = reviews.filter(r => r.rating === 4).length;
  const lowStarReviews = reviews.filter(r => r.rating <= 3).length;

  // Filtered reviews calculation
  const filteredReviews = useMemo(() => {
    return reviews.filter(rev => {
      // Filter by rating
      if (selectedRatingFilter === '5' && rev.rating !== 5) return false;
      if (selectedRatingFilter === '4' && rev.rating !== 4) return false;
      if (selectedRatingFilter === 'LOW' && rev.rating > 3) return false;

      // Filter by approval status
      if (selectedStatusFilter === 'APPROVED' && !rev.isApproved) return false;
      if (selectedStatusFilter === 'PENDING' && rev.isApproved) return false;

      // Filter by search query (client name or comment)
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

  const handleFilterRating = (rating: string) => {
    setSelectedRatingFilter(rating);
    setCurrentPage(1);
  };

  const handleFilterStatus = (status: string) => {
    setSelectedStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSelectedRatingFilter('ALL');
    setSelectedStatusFilter('ALL');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredReviews.length);
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;

  const isFiltered =
    selectedRatingFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL' ||
    searchQuery.trim() !== '';

  return (
    <div className="space-y-5">
      {/* 1. HEADER & GLOBAL SUMMARY */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold mb-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Moderasi & Evaluasi Ulasan Pasien</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Daftar Ulasan & Kepuasan Klien
            </h3>
            <p className="text-xs text-slate-500">
              Filter ulasan berdasarkan dokter tujuan, verifikasi kelayakan publikasi, dan kelola feedback secara efisien.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{pendingCount} Pending</span>
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{approvedCount} Disetujui</span>
            </span>
          </div>
        </div>

        {/* 2. DEDICATED SOLO DOCTOR SUMMARY CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-50/70 via-slate-50 to-white border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <img
              src={primaryDocUser?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160'}
              alt={primaryDocUser?.name || 'dr. Sarah Jenkins, M.Psi.'}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-purple-400 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-slate-900 leading-tight">
                  {primaryDocUser?.name || 'dr. Sarah Jenkins, M.Psi., Psikolog'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 shrink-0">
                  Praktisi Tunggal
                </span>
              </div>
              <p className="text-[11px] text-purple-800 font-medium mt-0.5">
                {primaryDoc?.title || 'Psikolog Klinis Dewasa & Hubungan Interpersonal'} • SIP: {primaryDoc?.sipNumber || 'SIP.503/042-DPMPTSP/2022'}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                <span className="font-bold text-slate-800">{reviews.length} Total Ulasan Pasien</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">{approvedCount} Terbit</span>
                <span>•</span>
                <span className="text-amber-700 font-semibold">{pendingCount} Menunggu</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-purple-100 pt-2.5 sm:pt-0 sm:pl-4 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Rating Rata-rata</span>
              <div className="text-lg font-black text-slate-900 flex items-center justify-center gap-1 font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{avgRating}</span>
              </div>
            </div>
            <div className="h-8 w-px bg-purple-100" />
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Bintang 5</span>
              <span className="text-sm font-black text-emerald-700">{fiveStarReviews}</span>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Bintang 4</span>
              <span className="text-sm font-black text-teal-700">{fourStarReviews}</span>
            </div>
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">≤ 3 Bintang</span>
              <span className={`text-sm font-black ${lowStarReviews > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{lowStarReviews}</span>
            </div>
          </div>
        </div>

        {/* 3. MULTI-LEVEL FILTER & SEARCH TOOLBAR */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 text-xs">
          {/* Search Bar */}
          <div className="lg:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Cari nama pasien atau isi komentar ulasan..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white shadow-2xs text-xs"
            />
          </div>

          {/* Rating Dropdown */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedRatingFilter}
              onChange={e => handleFilterRating(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer shadow-2xs text-xs"
            >
              <option value="ALL">Semua Rating ({reviews.length})</option>
              <option value="5">Bintang 5 ({fiveStarReviews})</option>
              <option value="4">Bintang 4 ({fourStarReviews})</option>
              <option value="LOW">Bintang ≤ 3 ({lowStarReviews})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-3 relative">
            <select
              value={selectedStatusFilter}
              onChange={e => handleFilterStatus(e.target.value)}
              className="w-full appearance-none pl-3 pr-7 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 focus:outline-hidden cursor-pointer shadow-2xs text-xs"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Persetujuan ({pendingCount})</option>
              <option value="APPROVED">Sudah Disetujui ({approvedCount})</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Active Filter Confirmation Badge Bar */}
        {isFiltered && (
          <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-purple-900 font-medium">
              <span className="font-bold">Filter Aktif:</span>
              {selectedRatingFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-bold text-[11px]">
                  Rating: {selectedRatingFilter === 'LOW' ? '≤ 3 ★' : `${selectedRatingFilter} ★`}
                </span>
              )}
              {selectedStatusFilter !== 'ALL' && (
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-900 font-bold text-[11px]">
                  Status: {selectedStatusFilter}
                </span>
              )}
              {searchQuery.trim() && (
                <span className="px-2 py-0.5 rounded-md bg-white border border-purple-300 text-purple-900 text-[11px]">
                  "{searchQuery}"
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="px-2.5 py-0.5 rounded-lg bg-white border border-purple-200 hover:bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* 4. DAFTAR ULASAN PASIEN - LAYOUT PADAT, SLIM & EFISIEN */}
      <div className="space-y-3">
        {/* Subheader & Page Size Selector */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900">
              Daftar Ulasan Pasien
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
              {filteredReviews.length} Ditemukan
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Tampilkan per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold cursor-pointer"
            >
              <option value={5}>5 Ulasan</option>
              <option value={8}>8 Ulasan</option>
              <option value={10}>10 Ulasan</option>
              <option value={20}>20 Ulasan</option>
            </select>
          </div>
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
            <p className="font-bold text-slate-600">Tidak ada ulasan yang cocok dengan filter saat ini.</p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          /* Sleek, Dense Review Cards */
          paginatedReviews.map(rev => {
            const isLowRating = rev.rating <= 3;
            const reviewerDisplayName = rev.isAnonymous
              ? (rev.anonymousAlias || 'Klien Anonim')
              : rev.patientName;
            const initialLetter = reviewerDisplayName.charAt(0).toUpperCase();

            return (
              <div
                key={rev.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2.5 shadow-2xs ${
                  rev.isApproved
                    ? isLowRating
                      ? 'bg-rose-50/40 border-rose-200/90'
                      : 'bg-white hover:bg-slate-50/60 border-slate-200/90'
                    : 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300/30'
                }`}
              >
                {/* Header Row: Pasien + Target Dokter + Rating + Status Moderasi */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Left: Reviewer & Target Doctor Chip */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Reviewer Initial Avatar */}
                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {initialLetter}
                    </div>

                    {/* Reviewer Name & Anon Tag */}
                    <span className="font-bold text-slate-900">
                      {reviewerDisplayName}
                    </span>

                    {rev.isAnonymous && (
                      <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-semibold text-[10px]">
                        Anonim
                      </span>
                    )}

                    <span className="text-slate-400 text-[11px]">• {rev.createdAt}</span>

                    {/* SOLO DOCTOR BADGE */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-emerald-900">
                        dr. Sarah Jenkins, M.Psi.
                      </span>
                    </div>
                  </div>

                  {/* Right: Stars & Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-black text-slate-800 ml-1 font-mono">
                        {rev.rating}.0
                      </span>
                    </div>

                    {/* Status Pill */}
                    {rev.isApproved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Disetujui</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950 flex items-center gap-1 border border-amber-300">
                        <Clock className="w-3 h-3 text-amber-800" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Body - Sleek & Readable */}
                <div className="pl-3 border-l-2 border-purple-300 py-0.5">
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Footer Row: Metadata, Warning (if <= 3) & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100/80 text-xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span>ID: #{rev.id.replace('rev-', '')} • Booking: #{rev.appointmentId}</span>
                    {isLowRating && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Perlu Tindak Lanjut Layanan
                      </span>
                    )}
                  </div>

                  {/* Compact Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {!rev.isApproved && (
                      <button
                        type="button"
                        onClick={() => approveReview(rev.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        <span>Setujui</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => rejectReview(rev.id)}
                      className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Tolak atau hapus ulasan ini"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{rev.isApproved ? 'Hapus' : 'Tolak'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* 5. PAGINATION BAR CONTROLLER */}
        {filteredReviews.length > 0 && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            {/* Info Range */}
            <span className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-900">{startIndex + 1}</strong> –{' '}
              <strong className="text-slate-900">{endIndex}</strong> dari{' '}
              <strong className="text-slate-900">{filteredReviews.length}</strong> ulasan
            </span>

            {/* Stepper Buttons & Page Numbers */}
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                type="button"
                disabled={validCurrentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Number buttons */}
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === validCurrentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={validCurrentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
