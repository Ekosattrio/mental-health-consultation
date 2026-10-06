import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Appointment, Review } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { RescheduleModal } from '../RescheduleModal';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  ShieldCheck,
  Sparkles,
  CalendarClock,
  Eye,
  Search,
  Calendar,
  Clock,
  Building2,
  X,
  CreditCard,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Printer
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

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
  onNavigateTab: (tabId: 'booking') => void;
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
  const { rescheduleAppointment } = useApp();
  const [rescheduleModalApt, setRescheduleModalApt] = useState<Appointment | null>(null);
  const [selectedDetailApt, setSelectedDetailApt] = useState<Appointment | null>(null);
  const [receiptApt, setReceiptApt] = useState<Appointment | null>(null);
  const [reviewModalAptId, setReviewModalAptId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewAnonymous, setReviewAnonymous] = useState<boolean>(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Search & Filter & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredAppointments = useMemo(() => {
    return patientAppointments.filter(apt => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        apt.bookingCode.toLowerCase().includes(q) ||
        apt.packageName.toLowerCase().includes(q) ||
        apt.psychologistName.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [patientAppointments, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAppointments = useMemo(() => {
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, startIndex, itemsPerPage]);

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
    <div className="space-y-5">
      {/* HEADER & FILTER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Jadwal Konsultasi & Rekam Janji Temu</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Tabel Jadwal & Riwayat Janji Temu
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar seluruh sesi konsultasi Anda. Klik baris atau tombol detail untuk melihat rincian sesi, evaluasi mutu klinis, atau ajukan reschedule.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-slate-600">
              Total: <strong>{filteredAppointments.length}</strong> sesi
            </span>
          </div>
        </div>

        {/* SEARCH & STATUS FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari kode booking, nama paket, atau psikolog..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
            {[
              { id: 'ALL', label: 'Semua Sesi' },
              { id: 'CONFIRMED', label: 'Terkonfirmasi' },
              { id: 'PENDING', label: 'Menunggu' },
              { id: 'COMPLETED', label: 'Selesai' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === f.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABEL JADWAL & RIWAYAT */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap w-12 text-center">No</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Kode Booking</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Paket Layanan</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Psikolog</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Jadwal Sesi</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Status Sesi</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Pembayaran</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs italic">
                    Belum ada data janji temu konsultasi yang cocok dengan pencarian / filter.
                  </td>
                </tr>
              ) : (
                paginatedAppointments.map((apt, index) => {
                  const userReview = reviews.find(r => r.appointmentId === apt.id);
                  const isReviewed = !!userReview;

                  return (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedDetailApt(apt)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {startIndex + index + 1}
                      </td>

                      {/* Kode Booking */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                          {apt.bookingCode}
                        </span>
                      </td>

                      {/* Paket Layanan */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{apt.packageName}</div>
                        {apt.continuousSessionTotal && apt.continuousSessionTotal > 1 && (
                          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black">
                            Sesi {apt.continuousSessionNumber || 1} dari {apt.continuousSessionTotal}
                          </span>
                        )}
                        <span className="text-[10px] text-teal-800 font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-teal-600" />
                          <span>Tatap Muka di Klinik</span>
                        </span>
                      </td>

                      {/* Psikolog */}
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-800">
                        {apt.psychologistName}
                      </td>

                      {/* Jadwal Sesi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{apt.date}</div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {apt.startTime} - {apt.endTime} WIB
                        </div>
                      </td>

                      {/* Status Sesi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : apt.status === 'COMPLETED'
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : apt.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : apt.status === 'NO_SHOW'
                              ? 'bg-orange-100 text-orange-900 border border-orange-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {apt.status === 'CONFIRMED'
                            ? 'Terkonfirmasi'
                            : apt.status === 'COMPLETED'
                            ? 'Selesai'
                            : apt.status === 'CANCELLED'
                            ? 'Dibatalkan'
                            : apt.status === 'NO_SHOW'
                            ? 'Tidak Hadir'
                            : 'Menunggu'}
                        </span>
                      </td>

                      {/* Pembayaran */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : apt.paymentStatus === 'DP_PAID' || apt.paymentStatus === 'DP_PENDING_VERIFICATION'
                              ? 'bg-teal-100 text-teal-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {apt.paymentStatus === 'PAID'
                            ? 'Lunas'
                            : apt.paymentStatus === 'DP_PAID'
                            ? 'DP Terverifikasi'
                            : apt.paymentStatus === 'DP_PENDING_VERIFICATION'
                            ? 'DP Dicek Admin'
                            : 'Pending'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Tooltip content="Lihat Detail Janji Temu" position="left">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedDetailApt(apt);
                            }}
                            className="w-8 h-8 rounded-xl bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredAppointments.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs bg-slate-50/50">
            <span className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> -{' '}
              <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, filteredAppointments.length)}</strong> dari{' '}
              <strong className="text-slate-800">{filteredAppointments.length}</strong> sesi
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600 bg-white"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-white bg-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600 bg-white"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DETAIL JANJI TEMU PASIEN                                            */}
      {/* ========================================================================= */}
      {selectedDetailApt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto my-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">Detail Janji Temu</h3>
                    <span className="font-bold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {selectedDetailApt.bookingCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Dibuat pada: {selectedDetailApt.createdAt}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailApt(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* INFO UTAMA BOX */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Paket Layanan</span>
                <strong className="text-slate-900">{selectedDetailApt.packageName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Psikolog</span>
                <strong className="text-slate-900">{selectedDetailApt.psychologistName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Jadwal Sesi</span>
                <strong className="text-slate-900">
                  {selectedDetailApt.date} ({selectedDetailApt.startTime} - {selectedDetailApt.endTime} WIB)
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Lokasi Praktik</span>
                <span className="font-semibold text-slate-800 text-right">
                  {selectedDetailApt.meetingLocation || 'Ruang Praktik JiwaSehat Senopati Lt. 3 (Tatap Muka)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Status Janji Temu</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedDetailApt.status === 'CONFIRMED'
                      ? 'bg-emerald-100 text-emerald-900'
                      : selectedDetailApt.status === 'COMPLETED'
                      ? 'bg-purple-100 text-purple-900'
                      : selectedDetailApt.status === 'CANCELLED'
                      ? 'bg-rose-100 text-rose-900'
                      : selectedDetailApt.status === 'NO_SHOW'
                      ? 'bg-orange-100 text-orange-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {selectedDetailApt.status === 'CONFIRMED'
                    ? 'Jadwal Terkonfirmasi'
                    : selectedDetailApt.status === 'COMPLETED'
                    ? 'Selesai'
                    : selectedDetailApt.status === 'CANCELLED'
                    ? 'Dibatalkan oleh Psikolog'
                    : selectedDetailApt.status === 'NO_SHOW'
                    ? 'Pasien Tidak Hadir'
                    : 'Menunggu Verifikasi'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Total Biaya Paket</span>
                <strong className="text-slate-900">
                  Rp {selectedDetailApt.totalAmount.toLocaleString('id-ID')}
                </strong>
              </div>
              <div className="flex justify-between py-1 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-emerald-900">
                <span className="font-bold">DP Biaya Administrasi:</span>
                <strong className="font-black">
                  Rp {(selectedDetailApt.dpAmount ?? 100000).toLocaleString('id-ID')} (Terbayar)
                </strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setReceiptApt(selectedDetailApt);
                  setSelectedDetailApt(null);
                }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>Lihat Invoice / Kwitansi Pembayaran</span>
              </button>
            </div>

            {/* ULASAN JIKA SUDAH SELESAI */}
            {selectedDetailApt.status === 'COMPLETED' && (
              <div className="pt-2 border-t border-slate-100">
                {(() => {
                  const existingReview = reviews.find(r => r.appointmentId === selectedDetailApt.id);
                  return existingReview ? (
                    <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
                          Ulasan Anda {existingReview.isAnonymous && <span className="font-normal text-amber-700">(Anonim)</span>}:
                        </span>
                        <div className="flex text-amber-400">
                          {[...Array(existingReview.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="italic text-slate-700 leading-relaxed">
                        "{existingReview.comment}"
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDetailApt(null);
                          handleOpenReviewModal(selectedDetailApt);
                        }}
                        className="text-[11px] font-bold text-amber-800 hover:underline pt-1 block cursor-pointer"
                      >
                        Edit Ulasan Saya
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDetailApt(null);
                        handleOpenReviewModal(selectedDetailApt);
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Beri Rating & Ulasan Kepuasan</span>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* RESCHEDULE BUTTON JIKA BELUM SELESAI */}
            {(selectedDetailApt.status === 'CONFIRMED' || selectedDetailApt.status === 'PENDING') && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setRescheduleModalApt(selectedDetailApt);
                    setSelectedDetailApt(null);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CalendarClock className="w-4 h-4" />
                  <span>Ajukan Reschedule Jadwal</span>
                </button>
              </div>
            )}

            {/* FOOTER */}
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailApt(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL REVIEW POST-SESSION                                                 */}
      {/* ========================================================================= */}
      {reviewModalAptId && activeModalApt && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setReviewModalAptId(null)}
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 cursor-pointer animate-in fade-in duration-150 overflow-y-auto"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 cursor-default relative overflow-hidden my-auto"
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star Rating Selector */}
              <div className="text-center py-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-600 block mb-1">
                  Pilih Nilai Kepuasan Anda (1 - 5 Bintang)
                </span>
                <div className="flex justify-center items-center gap-2 my-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 transition-transform hover:scale-125 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= currentDisplayRating
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className={`text-xs font-bold ${RATING_DESCRIPTIONS[currentDisplayRating].color}`}>
                  {RATING_DESCRIPTIONS[currentDisplayRating].mood} {RATING_DESCRIPTIONS[currentDisplayRating].label}
                </div>
              </div>

              {/* Tag Rekomendasi Cepat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Aspek yang Paling Berkesan (Opsional):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                        }`}
                      >
                        {tag} {isSelected && '✓'}
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
        </div>,
        document.body
      )}

      {receiptApt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full my-auto overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between print:hidden">
              <div>
                <h3 className="text-base font-black text-slate-900">Invoice / Kwitansi Pembayaran</h3>
                <p className="text-xs text-slate-500">Nomor referensi: INV-{receiptApt.bookingCode}</p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptApt(null)}
                className="w-9 h-9 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                aria-label="Tutup invoice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h4 className="text-lg font-black text-slate-900">JiwaSehat</h4>
                  <p className="text-slate-500">Kwitansi pembayaran reservasi konsultasi psikologi.</p>
                </div>
                <div className="text-right">
                  <span className="block font-black text-slate-900">INV-{receiptApt.bookingCode}</span>
                  <span className="text-slate-500">{receiptApt.createdAt}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Pasien</span>
                  <p className="font-bold text-slate-900">{receiptApt.patientName}</p>
                  <p className="text-slate-500">{receiptApt.patientEmail}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-black uppercase">Metode</span>
                  <p className="font-bold text-slate-900">{receiptApt.paymentMethod || 'BANK_TRANSFER'}</p>
                  <p className="text-slate-500">{receiptApt.paymentChannelDetail || 'Transfer Bank'}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="grid grid-cols-3 bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                  <div className="p-3 col-span-2">Rincian</div>
                  <div className="p-3 text-right">Nominal</div>
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100">
                  <div className="p-3 col-span-2 font-bold text-slate-800">{receiptApt.packageName}</div>
                  <div className="p-3 text-right font-bold">Rp {receiptApt.totalAmount.toLocaleString('id-ID')}</div>
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100 bg-emerald-50/70">
                  <div className="p-3 col-span-2 font-bold text-emerald-900">DP Administrasi Terbayar</div>
                  <div className="p-3 text-right font-black text-emerald-900">Rp {(receiptApt.dpAmount ?? 100000).toLocaleString('id-ID')}</div>
                </div>
                <div className="grid grid-cols-3 border-t border-slate-100">
                  <div className="p-3 col-span-2 font-bold text-slate-800">Sisa Pelunasan</div>
                  <div className="p-3 text-right font-bold">Rp {(receiptApt.remainingAmount ?? Math.max(receiptApt.totalAmount - (receiptApt.dpAmount ?? 100000), 0)).toLocaleString('id-ID')}</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">Nama Pengirim</span>
                    <p className="font-bold text-slate-900">{receiptApt.transferSenderName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">Status Pembayaran</span>
                    <p className="font-bold text-slate-900">{receiptApt.paymentStatus}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">Nomor Referensi</span>
                    <p className="font-bold text-slate-900">{receiptApt.paymentReference || '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-black uppercase">Bukti Pembayaran</span>
                    <p className="font-bold text-slate-900">{receiptApt.paymentProofUrl || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => setReceiptApt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* MODAL RESCHEDULE JADWAL KONSULTASI                                        */}
      {/* ========================================================================= */}
      <RescheduleModal
        isOpen={!!rescheduleModalApt}
        onClose={() => setRescheduleModalApt(null)}
        appointment={rescheduleModalApt}
        onConfirmReschedule={rescheduleAppointment}
      />
    </div>
  );
};
