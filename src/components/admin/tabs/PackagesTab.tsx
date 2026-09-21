import React, { useState } from 'react';
import { ConsultationPackage } from '../../../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface PackagesTabProps {
  packages: ConsultationPackage[];
  savePackage: (pkg: Partial<ConsultationPackage>) => void;
  deletePackage: (id: string) => void;
}

export const PackagesTab: React.FC<PackagesTabProps> = ({
  packages,
  savePackage,
  deletePackage
}) => {
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<ConsultationPackage> | null>(null);

  const handleOpenNewPackage = () => {
    setEditingPackage({
      name: '',
      type: 'ONLINE_CHAT',
      durationMinutes: 60,
      price: 150000,
      description: '',
      benefits: ['Konseling 60 Menit', 'Rangkuman SOAP Medis', 'Privasi Terjamin'],
      badge: 'Populer',
      isActive: true
    });
    setIsPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: ConsultationPackage) => {
    setEditingPackage({ ...pkg });
    setIsPackageModalOpen(true);
  };

  const handleSavePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    savePackage(editingPackage);
    setIsPackageModalOpen(false);
    setEditingPackage(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Katalog Paket Layanan Konsultasi</h3>
            <p className="text-xs text-slate-500">Atur paket, harga sesi, durasi, dan fasilitas yang didapatkan pasien.</p>
          </div>
          <button
            onClick={handleOpenNewPackage}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Paket Baru
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between hover:bg-white transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-slate-400">{pkg.type}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{pkg.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{pkg.durationMinutes} Menit Sesi</p>
                <div className="text-lg font-extrabold text-purple-900 my-2">
                  Rp {pkg.price.toLocaleString('id-ID')}
                </div>
                <ul className="text-xs text-slate-600 space-y-1 my-3 pl-2">
                  {pkg.benefits.map((b, i) => (
                    <li key={i}>• {b}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEditPackage(pkg)}
                  className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
                  title="Edit paket"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePackage(pkg.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                  title="Hapus paket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Tambah / Edit Paket Konsultasi */}
      {isPackageModalOpen && editingPackage && (
        <div
          onClick={() => setIsPackageModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 cursor-pointer animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 cursor-default"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-slate-900">
                {editingPackage.id ? 'Edit Paket Konsultasi' : 'Tambah Paket Baru'}
              </h4>
              <button onClick={() => setIsPackageModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePackageSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={editingPackage.name}
                  onChange={e => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Paket</label>
                  <select
                    value={editingPackage.type}
                    onChange={e => setEditingPackage({ ...editingPackage, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="ONLINE_CHAT">ONLINE_CHAT</option>
                    <option value="OFFLINE_CLINIC">OFFLINE_CLINIC</option>
                    <option value="BUNDLING_ASSESSMENT">BUNDLING_ASSESSMENT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Durasi (Menit)</label>
                  <input
                    type="number"
                    required
                    value={editingPackage.durationMinutes}
                    onChange={e => setEditingPackage({ ...editingPackage, durationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={editingPackage.price}
                  onChange={e => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={editingPackage.description}
                  onChange={e => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

