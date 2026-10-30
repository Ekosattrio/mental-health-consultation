import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useApp } from '../../../context/AppContextCore';
import { LandingPageCmsConfig } from '../../../types';

const fields: Array<{ key: keyof LandingPageCmsConfig; label: string; type?: string }> = [
  { key: 'clinicName', label: 'Nama Praktik' },
  { key: 'clinicAddress', label: 'Alamat' },
  { key: 'clinicHours', label: 'Informasi Jam Praktik' },
  { key: 'clinicPhone', label: 'Telepon', type: 'tel' },
  { key: 'clinicWhatsapp', label: 'WhatsApp', type: 'tel' },
  { key: 'clinicEmail', label: 'Email', type: 'email' },
  { key: 'instagramUrl', label: 'Instagram', type: 'url' },
  { key: 'logoUrl', label: 'URL Logo', type: 'url' },
  { key: 'heroTitle', label: 'Judul Beranda' },
  { key: 'heroSubtitle', label: 'Ringkasan Beranda' },
  { key: 'sliderTitle', label: 'Judul Layanan' },
  { key: 'sliderSubtitle', label: 'Ringkasan Layanan' }
];

export const AdministrativeCmsTab: React.FC = () => {
  const { landingCms, updateLandingCms } = useApp();
  const [draft, setDraft] = useState<Partial<LandingPageCmsConfig>>({});
  useEffect(() => setDraft(Object.fromEntries(fields.map(field => [field.key, landingCms[field.key]]))), [JSON.stringify(landingCms)]);
  return <form onSubmit={event => { event.preventDefault(); updateLandingCms(draft); }} className="space-y-5">
    <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Konten Publik</h2><button type="submit" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"><Save className="h-4 w-4" />Simpan</button></div>
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="min-w-0 text-xs font-semibold text-slate-600">{field.label}<input type={field.type || 'text'} value={String(draft[field.key] || '')} onChange={event => setDraft(current => ({ ...current, [field.key]: event.target.value }))} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /></label>)}</div>
  </form>;
};
