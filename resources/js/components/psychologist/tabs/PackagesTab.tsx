import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ConsultationPackage, PackageType } from '../../../types';
import { useApp } from '../../../context/AppContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Check,
  Building2,
  AlertCircle,
  Eye,
  X,
  TrendingUp,
  Tag,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';
import { calculatePackagePayableAmount } from '../../../utils/discounts';
import { FLAT_DP_AMOUNT } from '../../../utils/payments';

export interface PackagesTabProps {
  packages: ConsultationPackage[];
  savePackage: (pkg: ConsultationPackage) => void;
  deletePackage: (packageId: string) => void;
  togglePackageStatus: (packageId: string) => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  packages,
  savePackage,
  deletePackage,
  togglePackageStatus
}) => {
  const { showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SINGLE' | 'CONTINUOUS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, typeFilter]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [previewPackage, setPreviewPackage] = useState<ConsultationPackage | null>(null);
  const [editingPackage, setEditingPackage] = useState<ConsultationPackage | null>(null);
  const [deleteConfirmPkgId, setDeleteConfirmPkgId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'KONSELING' | 'ASESMEN' | 'PSIKOTERAPI'>('KONSELING');
  const [consultationMode, setConsultationMode] = useState<'OFFLINE_CLINIC' | 'ONLINE_TELE'>('OFFLINE_CLINIC');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(250000);
  const [discountType, setDiscountType] = useState<'NONE' | 'PERCENT' | 'FIXED'>('NONE');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountLabel, setDiscountLabel] = useState('');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [benefitsList, setBenefitsList] = useState<string[]>(['Konsultasi privat sesuai metode layanan yang dipilih.']);
  const [newBenefit, setNewBenefit] = useState('');
  const [notes, setNotes] = useState('');
  const [isContinuousCare, setIsContinuousCare] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  // Reset form helper
  const resetForm = () => {
    setName('');
    setCategory('KONSELING');
    setConsultationMode('OFFLINE_CLINIC');
    setDurationMinutes(60);
    setPrice(250000);
    setDiscountType('NONE');
    setDiscountValue(0);
    setDiscountLabel('');
    setBadge('');
    setDescription('');
    setBenefitsList(['Konsultasi privat sesuai metode layanan yang dipilih.']);
    setNewBenefit('');
    setNotes('');
    setIsContinuousCare(false);
    setSessionCount(1);
    setEditingPackage(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (pkg: ConsultationPackage) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setCategory(pkg.category || 'KONSELING');
    setConsultationMode(pkg.type === 'ONLINE_TELE' ? 'ONLINE_TELE' : 'OFFLINE_CLINIC');
    setDurationMinutes(pkg.durationMinutes);
    setPrice(pkg.price);
    setDiscountType(pkg.discountType || 'NONE');
    setDiscountValue(pkg.discountValue || 0);
    setDiscountLabel(pkg.discountLabel || '');
    setBadge(pkg.badge || '');
    setDescription(pkg.description);
    setBenefitsList(pkg.benefits && pkg.benefits.length > 0 ? pkg.benefits : ['Konsultasi privat sesuai metode layanan yang dipilih.']);
    setNewBenefit('');
    setNotes(pkg.notes || '');
    setIsContinuousCare(!!pkg.isContinuousCare);
    setSessionCount(pkg.sessionCount || 1);
    setIsFormModalOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Form Tidak Lengkap', 'Nama paket wajib diisi.', 'error');
      return;
    }

    const normalizedPrice = Number(price);
    const normalizedDuration = Number(durationMinutes);
    const normalizedSessionCount = Number(sessionCount);

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      showToast('Tarif Belum Valid', 'Tarif layanan tidak boleh negatif.', 'error');
      return;
    }

    if (!Number.isInteger(normalizedDuration) || normalizedDuration < 30 || normalizedDuration > 240) {
      showToast('Durasi Belum Valid', 'Durasi sesi harus berupa 30-240 menit.', 'error');
      return;
    }

    if (category !== 'PSIKOTERAPI' && isContinuousCare && (!Number.isInteger(normalizedSessionCount) || normalizedSessionCount < 2 || normalizedSessionCount > 50)) {
      showToast('Jumlah Sesi Belum Valid', 'Paket berkelanjutan harus memiliki 2-50 sesi.', 'error');
      return;
    }

    if (discountType !== 'NONE') {
      if (!Number.isFinite(discountValue) || discountValue <= 0) {
        showToast('Diskon Belum Valid', 'Nilai diskon harus lebih dari 0.', 'error');
        return;
      }

      if (discountType === 'PERCENT' && discountValue > 100) {
        showToast('Diskon Belum Valid', 'Persentase diskon maksimal 100%.', 'error');
        return;
      }

      if (discountType === 'FIXED' && discountValue > price) {
        showToast('Diskon Belum Valid', 'Nominal diskon tidak boleh melebihi tarif layanan.', 'error');
        return;
      }
    }

    const benefitsArray = benefitsList
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const packageType: PackageType = category === 'ASESMEN'
      ? 'BUNDLING_ASSESSMENT'
      : category === 'PSIKOTERAPI'
      ? 'PSYCHOTHERAPY'
      : consultationMode;

    const updatedPackage: ConsultationPackage = {
      id: editingPackage ? editingPackage.id : `pkg-${Date.now()}`,
      name: name.trim(),
      category,
      type: packageType,
      durationMinutes: normalizedDuration,
      price: normalizedPrice,
      discountType,
      discountValue: discountType === 'NONE' ? 0 : Number(discountValue),
      discountLabel: discountType === 'NONE' ? undefined : discountLabel.trim() || 'Potongan dari psikolog/pengelola',
      isContinuousCare: category === 'PSIKOTERAPI' || isContinuousCare,
      sessionCount: category === 'PSIKOTERAPI' ? 4 : isContinuousCare ? normalizedSessionCount : 1,
      badge: badge.trim() || undefined,
      description: description.trim(),
      benefits: benefitsArray.length > 0 ? benefitsArray : ['Konsultasi privat sesuai metode layanan yang dipilih.'],
      notes: notes.trim() || undefined,
      isActive: editingPackage ? editingPackage.isActive : true,
      iconName: packageType === 'ONLINE_TELE' ? 'Video' : 'Building2'
    };

    savePackage(updatedPackage);
    setIsFormModalOpen(false);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmPkgId) {
      deletePackage(deleteConfirmPkgId);
      setDeleteConfirmPkgId(null);
    }
  };

  const handleAddBenefit = () => {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;
    setBenefitsList(prev => [...prev, trimmed]);
    setNewBenefit('');
  };

  const handleUpdateBenefit = (index: number, value: string) => {
    setBenefitsList(prev => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefitsList(prev => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [''];
    });
  };

  const handleAddDiscount = () => {
    setDiscountType('PERCENT');
    setDiscountValue(10);
    setDiscountLabel('');
  };

  const handleRemoveDiscount = () => {
    setDiscountType('NONE');
    setDiscountValue(0);
    setDiscountLabel('');
  };

  // Filter packages
  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || pkg.name.toLowerCase().includes(q) || pkg.description.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'ALL' || pkg.category === categoryFilter;
      const matchesType =
        typeFilter === 'ALL' ||
        (typeFilter === 'CONTINUOUS' && pkg.isContinuousCare) ||
        (typeFilter === 'SINGLE' && !pkg.isContinuousCare);

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [packages, searchQuery, categoryFilter, typeFilter]);

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPackages = useMemo(() => {
    return filteredPackages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPackages, startIndex, itemsPerPage]);

  const hasDiscount = discountType !== 'NONE';
  const discountPreviewAmount = hasDiscount
    ? Math.min(
        discountType === 'PERCENT'
          ? Math.floor(Math.max(price, 0) * (Math.min(Math.max(discountValue, 0), 100) / 100))
          : Math.max(discountValue, 0),
        Math.max(price, 0)
      )
    : 0;
  const priceAfterDiscount = Math.max(price - discountPreviewAmount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Manajemen Paket Konsultasi ({packages.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Kelola paket tatap muka, telelayanan, rawat jalan berkelanjutan, durasi, dan ketentuan biaya DP administrasi.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* 2. Filter & Pencarian Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama paket konsultasi atau deskripsi..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Kategori */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="KONSELING">Konseling</option>
            <option value="ASESMEN">Asesmen</option>
            <option value="PSIKOTERAPI">Psikoterapi</option>
          </select>

          {/* Filter Jenis Sesi */}
          <div className="grid grid-cols-3 w-full sm:w-auto p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTypeFilter('ALL')}
              className={`min-w-0 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('SINGLE')}
              className={`min-w-0 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'SINGLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sesi Tunggal
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('CONTINUOUS')}
              className={`min-w-0 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer leading-tight ${
                typeFilter === 'CONTINUOUS'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Rawat Jalan / Berkelanjutan
            </button>
          </div>
        </div>
      </div>

      {/* 3. TABEL DATA PAKET KONSULTASI */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedPackages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              Tidak ditemukan paket konsultasi yang sesuai filter.
            </div>
          ) : paginatedPackages.map(pkg => {
            const pricing = calculatePackagePayableAmount(pkg);
            return (
              <article key={pkg.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-slate-900 break-words">{pkg.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black">
                        {pkg.category || 'KONSELING'}
                      </span>
                      {pkg.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                          {pkg.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePackageStatus(pkg.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border ${pkg.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                  >
                    {pkg.isActive !== false ? 'Aktif' : 'Nonaktif'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                  <div>
                    <span className="block text-slate-400 font-bold uppercase">Metode</span>
                    <strong className="text-slate-800">{pkg.type === 'ONLINE_TELE' ? 'Telelayanan' : 'Tatap Muka'}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase">Durasi</span>
                    <strong className="text-slate-800">{pkg.durationMinutes} menit</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase">Sesi</span>
                    <strong className="text-slate-800">{pkg.isContinuousCare ? `${pkg.sessionCount || 1} sesi` : 'Sesi tunggal'}</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold uppercase">DP</span>
                    <strong className="text-purple-700">Rp {FLAT_DP_AMOUNT.toLocaleString('id-ID')}</strong>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="min-w-0">
                    <span className="block text-[10px] text-slate-400 font-bold uppercase">{pkg.type === 'PSYCHOTHERAPY' ? 'Tarif per Sesi' : 'Tarif Paket'}</span>
                    <strong className="text-sm text-slate-900">Rp {(pkg.type === 'PSYCHOTHERAPY' ? pricing.unitPayableAmount : pricing.totalAmount).toLocaleString('id-ID')}{pkg.type === 'PSYCHOTHERAPY' ? ' / sesi' : ''}</strong>
                    {pricing.discount && (
                      <span className="block text-[10px] text-emerald-700 font-bold">Potongan Rp {pricing.discountAmount.toLocaleString('id-ID')}{pkg.type === 'PSYCHOTHERAPY' ? ' / sesi' : ''}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => setPreviewPackage(pkg)} aria-label={`Preview ${pkg.name}`} className="w-9 h-9 rounded-xl border border-slate-200 text-slate-700 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleOpenEditModal(pkg)} aria-label={`Edit ${pkg.name}`} className="w-9 h-9 rounded-xl border border-sky-200 bg-sky-50 text-sky-700 flex items-center justify-center">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setDeleteConfirmPkgId(pkg.id)} aria-label={`Hapus ${pkg.name}`} className="w-9 h-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No.</th>
                <th className="py-3.5 px-4 min-w-[220px]">Nama Paket & Label</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Tipe & Sesi</th>
                <th className="py-3.5 px-4">Durasi</th>
                <th className="py-3.5 px-4">Tarif Total</th>
                <th className="py-3.5 px-4">Potongan</th>
                <th className="py-3.5 px-4">DP Admin</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedPackages.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 italic">
                    Tidak ditemukan paket konsultasi yang sesuai filter.
                  </td>
                </tr>
              ) : (
                paginatedPackages.map((pkg, idx) => {
                  const pricing = calculatePackagePayableAmount(pkg);
                  return (
                  <tr key={pkg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                      {startIndex + idx + 1}
                    </td>

                    {/* Nama Paket & Badge */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 text-xs">{pkg.name}</span>
                        {pkg.badge && (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black w-max">
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        pkg.category === 'ASESMEN'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : pkg.category === 'PSIKOTERAPI'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}>
                        {pkg.category || 'KONSELING'}
                      </span>
                    </td>

                    {/* Tipe & Jumlah Sesi */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {pkg.isContinuousCare ? (
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Rawat Jalan ({pkg.sessionCount || 1} Sesi)</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs">Sesi Tunggal (1 Sesi)</span>
                      )}
                      <span className={`mt-1 flex items-center gap-1 text-[10px] font-bold ${pkg.type === 'ONLINE_TELE' ? 'text-sky-700' : 'text-slate-500'}`}>
                        {pkg.type === 'ONLINE_TELE' ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                        {pkg.type === 'ONLINE_TELE' ? 'Telelayanan' : 'Tatap Muka'}
                      </span>
                    </td>

                    {/* Durasi */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.durationMinutes} Menit
                      </span>
                    </td>

                    {/* Tarif */}
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900">
                      Rp {pkg.price.toLocaleString('id-ID')}{pkg.type === 'PSYCHOTHERAPY' ? ' / sesi' : ''}
                      {pricing.discount && (
                        <span className="block text-[10px] text-emerald-700 font-black">
                          Jadi Rp {(pkg.type === 'PSYCHOTHERAPY' ? pricing.unitPayableAmount : pricing.totalAmount).toLocaleString('id-ID')}{pkg.type === 'PSYCHOTHERAPY' ? ' / sesi' : ''}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-emerald-700 font-bold text-xs">
                      {pricing.discount ? (
                        <div>
                          <span className="block">- Rp {pricing.discountAmount.toLocaleString('id-ID')}{pkg.type === 'PSYCHOTHERAPY' ? ' / sesi' : ''}</span>
                          <span className="block text-[10px] text-slate-500 font-semibold">{pricing.discount.label}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Tidak ada</span>
                      )}
                    </td>

                    {/* DP Admin */}
                    <td className="py-3 px-4 whitespace-nowrap text-purple-700 font-bold text-xs">
                      Rp {FLAT_DP_AMOUNT.toLocaleString('id-ID')}
                    </td>

                    {/* Status Switch (Aktif/Nonaktif) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => togglePackageStatus(pkg.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          pkg.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            pkg.isActive !== false ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span>{pkg.isActive !== false ? 'Aktif' : 'Nonaktif'}</span>
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <Tooltip content="Preview Kartu Paket Pasien" position="left">
                          <button
                            type="button"
                            onClick={() => setPreviewPackage(pkg)}
                            aria-label="Preview Kartu Paket"
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Edit Rincian Paket" position="left">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(pkg)}
                            aria-label="Edit Paket"
                            className="p-1.5 rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Hapus Paket" position="left">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPkgId(pkg.id)}
                            aria-label="Hapus Paket"
                            className="p-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* PAGINATION FOOTER */}
        {filteredPackages.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100 text-xs bg-slate-50/50">
            <span className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> -{' '}
              <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, filteredPackages.length)}</strong> dari{' '}
              <strong className="text-slate-800">{filteredPackages.length}</strong> paket
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
                      ? 'bg-sky-600 text-white shadow-2xs'
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

      {/* 4. MODAL PREVIEW KARTU PAKET (PERSIS TAMPILAN PASIEN) */}
      {previewPackage && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp my-auto">
            <div className="p-5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100/60 text-teal-600 flex items-center justify-center font-bold shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Pratinjau Kartu Paket Pasien</h3>
                  <p className="text-[11px] text-slate-500">Tampilan katalog yang dilihat oleh calon pasien</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPackage(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Kartu Visual Paket */}
            <div className="p-6 space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-teal-500/40 shadow-xs space-y-4 relative">
                {previewPackage.badge && (
                  <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                    {previewPackage.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-base font-black text-slate-900">{previewPackage.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {previewPackage.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 text-slate-900 pt-2 border-t border-slate-100">
                  <span className="text-2xl font-black">
                    Rp {previewPackage.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-500">/ {previewPackage.type === 'PSYCHOTHERAPY' ? 'sesi' : 'paket'}</span>
                </div>

                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Durasi Konsultasi:</span>
                    <strong className="text-slate-900 font-bold">{previewPackage.durationMinutes} Menit</strong>
                  </div>
                  <div className="flex items-center justify-between text-teal-900">
                    <span>DP Penguncian Jadwal:</span>
                    <strong className="font-bold">Rp {FLAT_DP_AMOUNT.toLocaleString('id-ID')}</strong>
                  </div>
                  {previewPackage.isContinuousCare && (
                    <div className="flex items-center justify-between text-teal-950 pt-1 border-t border-teal-200/60 font-bold">
                      <span>Perawatan Berkelanjutan:</span>
                      <span>{previewPackage.sessionCount || 1} Sesi Terjadwal</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Fasilitas & Manfaat:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {previewPackage.benefits && previewPackage.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewPackage(null)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. MODAL FORM TAMBAH / EDIT PAKET */}
      {isFormModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp my-auto">
            {/* Modal Header Modern Simple Light */}
            <div className="p-5 sm:p-6 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    {editingPackage ? 'Edit Paket Konsultasi' : 'Tambah Paket Konsultasi Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Konfigurasikan judul, durasi, skema rawat jalan berkelanjutan, dan tarif.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePackage} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Paket Layanan *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Konseling Individu Dewasa"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Kategori Layanan</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="KONSELING">Konseling Psikologi</option>
                    <option value="ASESMEN">Asesmen & Tes Klinis</option>
                    <option value="PSIKOTERAPI">Psikoterapi Spesifik</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Label Promosi / Badge (Opsional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={e => setBadge(e.target.value)}
                    placeholder="Contoh: Terpopuler, Rekomendasi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {category === 'KONSELING' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Metode Konsultasi</label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setConsultationMode('OFFLINE_CLINIC')}
                      className={`min-h-10 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${consultationMode === 'OFFLINE_CLINIC' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Building2 className="w-4 h-4" />
                      Tatap Muka
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationMode('ONLINE_TELE')}
                      className={`min-h-10 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${consultationMode === 'ONLINE_TELE' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Video className="w-4 h-4" />
                      Telelayanan
                    </button>
                  </div>
                </div>
              )}

              {/* Pilihan Konsultasi Berkelanjutan (Rawat Jalan) */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-xs text-indigo-950 block">Konsultasi Berkelanjutan (Rawat Jalan)</strong>
                    <span className="text-[11px] text-indigo-700">
                      {category === 'PSIKOTERAPI' ? 'Rencana awal psikoterapi selalu empat sesi; kelanjutan dibuat lewat booking baru.' : 'Aktifkan jika paket mencakup beberapa rangkaian sesi terapi berkelanjutan.'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={category === 'PSIKOTERAPI' || isContinuousCare}
                      onChange={e => setIsContinuousCare(e.target.checked)}
                      disabled={category === 'PSIKOTERAPI'}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {category !== 'PSIKOTERAPI' && isContinuousCare && (
                  <div className="pt-3 border-t border-indigo-200/60 space-y-3 animate-fadeIn">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">Jumlah Rangkaian Sesi Terjadwal</span>
                      <span className="text-[11px] text-indigo-700">
                        Pilih jumlah sesi bawaan paket rawat jalan. Angka ini dipakai untuk menandai progres sesi pasien.
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[4, 5, 8, 10].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setSessionCount(cnt)}
                          className={`min-h-[62px] rounded-2xl border text-center transition-all cursor-pointer ${
                            sessionCount === cnt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-indigo-950 border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          <span className="text-lg font-black block">{cnt}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${sessionCount === cnt ? 'text-indigo-100' : 'text-indigo-500'}`}>
                            Sesi
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-900 shrink-0">Atau isi custom:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={sessionCount}
                        onChange={e => setSessionCount(Math.max(1, Number(e.target.value)))}
                        className="w-full sm:w-28 px-3 py-2 rounded-xl border border-indigo-300 bg-white text-xs text-center font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Durasi, Tarif, dan DP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Durasi per Sesi (Menit) *</label>
                  <input
                    type="number"
                    required
                    min="30"
                    step="15"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">{category === 'PSIKOTERAPI' ? 'Tarif per Sesi (Rp) *' : 'Total Biaya Paket (Rp) *'}</label>
                  <input
                    type="number"
                    required
                    min="50000"
                    step="25000"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">DP Penguncian Jadwal</label>
                  <div className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50 font-bold text-purple-700">
                    Rp {FLAT_DP_AMOUNT.toLocaleString('id-ID')} (tetap)
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-3 ${hasDiscount ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <Tag className={`w-4 h-4 shrink-0 mt-0.5 ${hasDiscount ? 'text-emerald-700' : 'text-slate-500'}`} />
                    <div>
                      <strong className={`text-xs block ${hasDiscount ? 'text-emerald-950' : 'text-slate-800'}`}>{category === 'PSIKOTERAPI' ? 'Diskon per Sesi' : 'Diskon Paket'}</strong>
                      <span className={`text-[11px] ${hasDiscount ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {hasDiscount
                          ? category === 'PSIKOTERAPI' ? 'Diskon diterapkan pada setiap sesi dalam rencana awal.' : 'Diskon ini otomatis diterapkan ke harga paket yang dilihat pasien.'
                          : 'Belum ada diskon aktif pada paket ini.'}
                      </span>
                    </div>
                  </div>

                  {hasDiscount ? (
                    <Tooltip content="Hapus diskon">
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="w-9 h-9 shrink-0 rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Hapus diskon paket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddDiscount}
                      className="shrink-0 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Tambah Diskon
                    </button>
                  )}
                </div>

                {hasDiscount && (
                  <div className="space-y-3 pt-3 border-t border-emerald-200 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Jenis Diskon</label>
                        <select
                          value={discountType}
                          onChange={e => {
                            const nextType = e.target.value as 'PERCENT' | 'FIXED';
                            setDiscountType(nextType);
                            setDiscountValue(nextType === 'PERCENT' ? 10 : 25000);
                          }}
                          className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        >
                          <option value="PERCENT">Persentase (%)</option>
                          <option value="FIXED">Nominal Rupiah</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nilai Diskon {discountType === 'PERCENT' ? '(%)' : '(Rp)'}
                        </label>
                        <input
                          type="number"
                          required
                          min={discountType === 'PERCENT' ? 1 : 1000}
                          max={discountType === 'PERCENT' ? 100 : Math.max(price, 0)}
                          step={discountType === 'PERCENT' ? 1 : 1000}
                          value={discountValue}
                          onChange={e => setDiscountValue(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Nama Diskon (Opsional)</label>
                      <input
                        type="text"
                        value={discountLabel}
                        onChange={e => setDiscountLabel(e.target.value)}
                        placeholder="Contoh: Diskon Oktober"
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-xl border border-emerald-200 bg-white p-3">
                      <div className="min-w-0">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">Harga Awal</span>
                        <strong className="block text-[11px] text-slate-800 truncate">Rp {Math.max(price, 0).toLocaleString('id-ID')}</strong>
                      </div>
                      <div className="min-w-0 text-center border-x border-slate-100 px-1">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">Diskon</span>
                        <strong className="block text-[11px] text-rose-600 truncate">- Rp {discountPreviewAmount.toLocaleString('id-ID')}</strong>
                      </div>
                      <div className="min-w-0 text-right">
                        <span className="block text-[9px] font-bold uppercase text-slate-500">Harga Akhir</span>
                        <strong className="block text-[11px] text-emerald-700 truncate">Rp {priceAfterDiscount.toLocaleString('id-ID')}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Ringkasan / Deskripsi Paket</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Deskripsi singkat target intervensi paket..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Fasilitas & Manfaat
                </label>
                <div className="space-y-2">
                  {benefitsList.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={e => handleUpdateBenefit(index, e.target.value)}
                        placeholder={`Fasilitas ${index + 1}`}
                        className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(index)}
                        className="w-9 h-9 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Hapus fasilitas"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={e => setNewBenefit(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBenefit();
                      }
                    }}
                    placeholder="Tulis fasilitas baru, lalu klik Tambah"
                    className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddBenefit}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Fasilitas
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Contoh: Termasuk biaya asesmen alat tes dan laporan psikogram tertulis"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingPackage ? 'Simpan Perubahan' : 'Buat Paket Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 6. MODAL KONFIRMASI HAPUS */}
      {deleteConfirmPkgId && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp my-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Hapus Paket Konsultasi?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paket ini tidak akan muncul lagi di katalog layanan pasien. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPkgId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
