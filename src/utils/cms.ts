import { LandingPageCmsConfig, PatientPageCmsConfig } from '../types';

const legacyAnnouncement = 'Pemberitahuan: Seluruh data sesi konsultasi klinis privat terlindungi enkripsi end-to-end. Rekam medis Anda hanya dapat diakses secara rahasia oleh dr. Sarah Jenkins.';

export const mergePatientCms = (defaults: PatientPageCmsConfig, saved: Partial<PatientPageCmsConfig>): PatientPageCmsConfig => {
  const merged = { ...defaults, ...saved };
  if (merged.announcementText === legacyAnnouncement) merged.announcementText = defaults.announcementText;
  return merged;
};

export const persistBrowserValue = <T>(key: string, value: T): T => {
  localStorage.setItem(`jiwasehat_v3_${key}`, JSON.stringify(value));
  return value;
};

export const validateLandingCms = (config: LandingPageCmsConfig): LandingPageCmsConfig => {
  if (!config.clinicName.trim() || !config.clinicAddress.trim() || !config.clinicHours.trim()) {
    throw new Error('Nama, alamat, dan jam informasi praktik wajib diisi.');
  }
  if (!Number.isFinite(config.sliderIntervalSeconds) || config.sliderIntervalSeconds < 2 || config.sliderIntervalSeconds > 60) {
    throw new Error('Interval carousel harus 2-60 detik.');
  }
  for (const value of [config.logoUrl, config.heroImageUrl, config.aboutImageUrl, config.qrisImageUrl, config.clinicKopLogoUrl]) {
    if (value?.trim() && !/^https?:\/\//i.test(value.trim())) throw new Error('URL gambar harus menggunakan http atau https.');
  }
  if (config.instagramUrl?.trim()) {
    const url = new URL(config.instagramUrl.trim());
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(url.hostname)) {
      throw new Error('Tautan Instagram harus berupa URL https://www.instagram.com/...');
    }
  }
  const bank = [config.bankName?.trim(), config.bankAccountNumber?.trim(), config.bankAccountHolder?.trim()];
  if (!bank.every(Boolean)) throw new Error('Lengkapi nama bank, nomor rekening, dan pemilik rekening.');
  return config;
};
