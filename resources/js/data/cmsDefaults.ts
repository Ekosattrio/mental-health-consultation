import type {LandingPageCmsConfig,PatientPageCmsConfig,PsychologistPageCmsConfig} from '../types';

export const INITIAL_LANDING_CMS: LandingPageCmsConfig = {
  heroBadge: 'Booking Konsultasi Psikologi Terjadwal',
  heroTitle: 'Ruang Aman untuk Mendengar, Menyembuhkan, dan Bertumbuh.',
  heroSubtitle: 'Konsultasikan keresahan batin, stres kerja, dan kecemasan Anda secara privat bersama dr. Sarah Jenkins, M.Psi., Psikolog Klinis. Booking dilakukan minimal H+1 dengan pre-test singkat sebelum jadwal dikirim.',
  sliderTitle: 'Pengalaman Konseling Bersama Psikolog',
  sliderSubtitle: 'Cerita dan pengalaman pasien setelah menjalani sesi konsultasi.',
  sliderIntervalSeconds: 4,
  sliderAutoPlay: true,
  clinicName: 'Praktik Mandiri dr. Sarah Jenkins, M.Psi.',
  clinicAddress: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190',
  clinicHours: 'Senin - Sabtu: 08:00 - 21:00 WIB • Minggu: Libur Praktik',
  clinicPhone: '+62 21 5790 1234',
  clinicWhatsapp: '+62 811-2233-4455',
  clinicEmail: 'halo@jiwasehat.id',
  logoUrl: '',
  heroImageUrl: '',
  aboutImageUrl: '',
  qrisImageUrl: '',
  clinicKopLogoUrl: '',
  instagramUrl: 'https://www.instagram.com/jiwasehat.id/',
  bankName: 'BCA',
  bankAccountNumber: '8830-1122-3344',
  bankAccountHolder: 'PT JiwaSehat Konseling Mandiri'
};

export const INITIAL_PATIENT_CMS: PatientPageCmsConfig = {
  welcomeBannerTitle: 'Selamat Datang di Ruang Pulih JiwaSehat',
  welcomeBannerSubtitle: 'Langkah pertama mencari bantuan adalah bukti keberanian diri. dr. Sarah Jenkins, M.Psi., Psikolog Klinis siap mendampingi perjalanan pemulihan emosional Anda.',
  dailyMentalHealthTip: 'Saat pikiran cemas mulai berkejaran (racing thoughts), letakkan kedua telapak kaki di lantai dan bernapaslah dengan teknik 4-7-8 (tarik 4 detik, tahan 7 detik, hembuskan 8 detik).',
  crisisHotlineTitle: 'Layanan Bantuan Krisis & Siaga 24 Jam',
  crisisHotlineNumber: '119 ext 8 (Sejiwa Kemenkes RI)',
  crisisWhatsapp: '+62 811-1929-555',
  crisisNotice: 'Jika Anda atau kerabat sedang mengalami krisis emosional mendalam, serangan panik berat, atau dorongan menyakiti diri, mohon segera hubungi hotline darurat di atas. Layanan ini bebas pulsa 24 jam.',
  announcementText: 'Informasi layanan dan jadwal dapat berubah. Hubungi admin jika membutuhkan bantuan.'
};

export const INITIAL_PSYCHOLOGIST_CMS: PsychologistPageCmsConfig = {
  guidelinesTitle: 'Standar Prosedur Operasional (SOP) & Etika Klinis',
  guidelinesContent: 'Sesuai Standar Kode Etik Profesi Psikologi & Regulasi Tenaga Kesehatan RI, psikolog diwajibkan menyelesaikan input Rekam Medis Pasien paling lambat 24 jam setelah sesi konsultasi berakhir. Jaga objektivitas diagnosis, informed consent, dan kerahasiaan penuh rekam medis pasien.',
  announcementTitle: 'Maklumat Praktik Mandiri',
  announcementContent: 'Jadwal konsultasi tatap muka dan rekapitulasi data rekam medis pasien terintegrasi secara aman.',
  remunerationPolicy: 'Alokasi honorarium sesi konsultasi ditransfer setiap tanggal 25 setiap bulannya ke rekening terdaftar dokter.',
  clinicalSupervisorContact: 'Kontak Darurat Praktik: dr. Sarah Jenkins (WA: +62 811-2233-4455)',

  // Kop Surat Resmi Laporan Keuangan & Dokumen Dinas
  letterheadClinicName: 'Praktik Mandiri Psikolog Klinis JiwaSehat',
  letterheadDoctorName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
  letterheadSipNumber: 'SIP.503/042-DPMPTSP/2022',
  letterheadStrNumber: 'STR-PSI-2021-09842',
  letterheadAddress: 'Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190',
  letterheadPhone: '(021) 7890-1234',
  letterheadEmail: 'klinik@jiwasehat.id',
  letterheadWebsite: 'www.jiwasehat.id',
  letterheadCity: 'Jakarta',
  letterheadSignerRole: 'Psikolog Penanggung Jawab Praktik'
};
