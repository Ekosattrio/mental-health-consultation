import {
  User,
  PsychologistProfile,
  ConsultationPackage,
  PsychologicalTest,
  ScheduleSlot,
  Appointment,
  TestResult,
  IntakeForm,
  ClinicalNote,
  Review,
  LandingPageCmsConfig,
  PatientPageCmsConfig,
  PsychologistPageCmsConfig
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-pat-1',
    email: 'budi.santoso@gmail.com',
    name: 'Budi Santoso',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0812-3456-7890',
    isVerified: true,
    createdAt: '2026-08-10'
  },
  {
    id: 'user-pat-2',
    email: 'siti.amanda@outlook.com',
    name: 'Siti Amanda',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0813-9876-5432',
    isVerified: true,
    createdAt: '2026-08-25'
  },
  {
    id: 'user-pat-3',
    email: 'dimas.pratama@kampus.ac.id',
    name: 'Dimas Pratama',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0815-4433-2211',
    isVerified: true,
    createdAt: '2026-09-01'
  },
  {
    id: 'user-pat-4',
    email: 'rina.kartika@perusahaan.co.id',
    name: 'Rina Kartika',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0812-7722-1100',
    isVerified: true,
    createdAt: '2026-08-14'
  },
  {
    id: 'user-pat-5',
    email: 'taufik.hidayat@creative.net',
    name: 'Taufik Hidayat',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0813-8899-0011',
    isVerified: true,
    createdAt: '2026-08-20'
  },
  {
    id: 'user-pat-6',
    email: 'anindya.putri@holding.com',
    name: 'Anindya Putri',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0812-3344-5566',
    isVerified: true,
    createdAt: '2026-08-28'
  },
  {
    id: 'user-pat-7',
    email: 'bagas.wicaksono@startup.id',
    name: 'Bagas Wicaksono',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0811-9988-2233',
    isVerified: true,
    createdAt: '2026-09-05'
  },
  {
    id: 'user-pat-8',
    email: 'clara.natasha@creator.id',
    name: 'Clara Natasha',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0819-0123-4567',
    isVerified: true,
    createdAt: '2026-09-12'
  },
  {
    id: 'user-pat-9',
    email: 'hendra.gunawan@studio.com',
    name: 'Hendra Gunawan',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0812-5566-7788',
    isVerified: true,
    createdAt: '2026-06-01'
  },
  {
    id: 'user-pat-10',
    email: 'maya.kartini@univ.ac.id',
    name: 'Maya Kartini',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0813-1122-3344',
    isVerified: true,
    createdAt: '2026-06-15'
  },
  {
    id: 'user-pat-11',
    email: 'reza.fahrezi@fintech.co.id',
    name: 'Reza Fahrezi',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0817-2233-4455',
    isVerified: true,
    createdAt: '2026-07-02'
  },
  {
    id: 'user-pat-12',
    email: 'nadya.dental@clinic.id',
    name: 'Nadya Stephanie',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0818-3344-5566',
    isVerified: true,
    createdAt: '2026-07-18'
  },
  {
    id: 'user-pat-13',
    email: 'farhan.pratama@mail.com',
    name: 'Farhan Pratama',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0819-4455-6677',
    isVerified: true,
    createdAt: '2026-07-29'
  },
  {
    id: 'user-pat-14',
    email: 'dewi.lestari@advisory.id',
    name: 'Dewi Lestari',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0811-5566-7788',
    isVerified: true,
    createdAt: '2026-08-05'
  },
  {
    id: 'user-pat-15',
    email: 'aditya.nugroho@retail.com',
    name: 'Aditya Nugroho',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0812-6677-8899',
    isVerified: true,
    createdAt: '2026-08-18'
  },
  {
    id: 'user-pat-16',
    email: 'tiara.maharani@corporate.id',
    name: 'Tiara Maharani',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0813-7788-9900',
    isVerified: true,
    createdAt: '2026-08-25'
  },
  {
    id: 'user-pat-17',
    email: 'yoga.prasetyo@analytics.net',
    name: 'Yoga Prasetyo',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0815-8899-0011',
    isVerified: true,
    createdAt: '2026-09-02'
  },
  {
    id: 'user-pat-18',
    email: 'melati.kusuma@pasca.ac.id',
    name: 'Melati Kusuma',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0816-9900-1122',
    isVerified: true,
    createdAt: '2026-09-10'
  },
  {
    id: 'user-pat-19',
    email: 'fajar.ramadhan@people.id',
    name: 'Fajar Ramadhan',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0817-0011-2233',
    isVerified: true,
    createdAt: '2026-09-18'
  },
  {
    id: 'user-pat-20',
    email: 'gita.savitri@agency.id',
    name: 'Gita Savitri',
    role: 'PATIENT',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0818-1122-3344',
    isVerified: true,
    createdAt: '2026-09-24'
  },
  {
    id: 'user-psy-1',
    email: 'sarah.jenkins@jiwasehat.id',
    name: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    role: 'PSYCHOLOGIST',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0811-2233-4455',
    isVerified: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'user-adm-1',
    email: 'admin@jiwasehat.id',
    name: 'Admin Operasional JiwaSehat',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0811-0000-1122',
    isVerified: true,
    createdAt: '2026-01-01'
  }
];

export const INITIAL_PSYCHOLOGISTS: PsychologistProfile[] = [
  {
    userId: 'user-psy-1',
    title: 'Psikolog Klinis Dewasa & Hubungan Interpersonal',
    strNumber: 'STR-PSI-2021-09842',
    sipNumber: 'SIP.503/042-DPMPTSP/2022',
    experienceYears: 10,
    bio: 'Berpengalaman lebih dari 10 tahun mendampingi pasien dengan gangguan kecemasan (anxiety), depresi ringan-sedang, trauma masa lalu, burnout karier, dan dinamika hubungan interpersonal. Menggunakan pendekatan Cognitive Behavioral Therapy (CBT), Acceptance & Commitment Therapy (ACT), dan Mindfulness-Based Stress Reduction yang hangat, solutif, empatis, dan berbasis bukti klinis ilmiah.',
    specialties: ['Anxiety & Panic Attack', 'Depresi & Burnout', 'Relationship & Family', 'Self-Esteem & Trauma'],
    therapyApproaches: ['Cognitive Behavioral Therapy (CBT)', 'Acceptance & Commitment (ACT)', 'Mindfulness-Based Stress Reduction', 'Solution-Focused Brief Therapy (SFBT)'],
    rating: 4.9,
    reviewCount: 168,
    consultationFeeOnline: 250000,
    consultationFeeOffline: 375000,
    languages: ['Bahasa Indonesia', 'English'],
    clinicAddress: 'Praktik Mandiri JiwaSehat, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    isAvailableToday: true,
    education: ['S1 Fakultas Psikologi Universitas Indonesia (Cum Laude)', 'S2 Magister Psikologi Profesi Klinis Dewasa UI'],
    strExpiry: '2028-12-31',
    sipExpiry: '2027-06-30',
    clinicalHours: 3200,
    practicePolicy: 'Menjunjung tinggi standar etika kerahasiaan profesi psikologi klinis. Seluruh informasi sesi dilindungi kerahasiaan medis, non-judgmental, dan berbasis informed consent.'
  }
];

export const INITIAL_PACKAGES: ConsultationPackage[] = [
  {
    id: 'pkg-regular-1',
    name: 'Sesi Konsultasi Reguler',
    type: 'OFFLINE_CLINIC',
    durationMinutes: 60,
    price: 250000,
    badge: 'Paling Populer',
    description: 'Konsultasi terjadwal bersama psikolog di ruang praktik. Pasien wajib mengisi pre-test dan membayar DP sebelum jadwal dikonfirmasi admin.',
    benefits: [
      'Durasi konsultasi 60 menit',
      'Pre-test singkat sebelum booking',
      'DP 50% untuk mengunci pengajuan jadwal',
      'Konfirmasi admin setelah bukti pembayaran diverifikasi'
    ],
    isActive: true,
    iconName: 'Calendar'
  },
  {
    id: 'pkg-offline-1',
    name: 'Sesi Tatap Muka (Offline di Klinik)',
    type: 'OFFLINE_CLINIC',
    durationMinutes: 75,
    price: 375000,
    badge: 'Rekomendasi Klinis',
    description: 'Pertemuan langsung di ruang konseling privat yang tenang, aman, dan kedap suara di klinik JiwaSehat Senopati Jakarta Selatan.',
    benefits: [
      'Durasi tatap muka 75 menit ruang privat kedap suara',
      'Observasi afek dan bahasa tubuh klinis mendalam',
      'Free welcome tea & relaxing aromatherapy room',
      'Surat keterangan psikologis / rujukan jika diperlukan'
    ],
    isActive: true,
    iconName: 'Users'
  },
  {
    id: 'pkg-bundling-1',
    name: 'Paket Bundling: Konsultasi + Tes Asesmen',
    type: 'BUNDLING_ASSESSMENT',
    durationMinutes: 90,
    price: 490000,
    badge: 'Paling Lengkap',
    description: 'Kombinasi lengkap instrumen tes psikologi terstandar (DASS-21 / PHQ-9) disertai sesi pembahasan hasil secara komprehensif.',
    benefits: [
      'Akses asesmen tes psikometri lengkap online',
      'Interpretasi psikogram & kalkulasi skor keparahan otomatis',
      'Sesi konsultasi 90 menit untuk membahas hasil',
      'Laporan evaluasi klinis resmi bertanda tangan SIP'
    ],
    isActive: true,
    iconName: 'FileCheck'
  }
];

// FULL 21-ITEM DASS-21 INSTRUMENT
export const INITIAL_TESTS: PsychologicalTest[] = [
  {
    id: 'test-dass21',
    code: 'DASS-21',
    title: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    shortDescription: 'Asesmen klinis baku 21 butir untuk mengukur intensitas gejala depresi, kecemasan, dan tingkat stres yang dirasakan selama 1 pekan terakhir.',
    instruction: 'Pilihlah salah satu opsi respon (0 sampai 3) yang paling menggambarkan kondisi yang Anda rasakan selama satu pekan terakhir. Jawaban Anda bersifat rahasia dan membantu diagnosis klinis.',
    estimatedMinutes: 5,
    questionCount: 21,
    subscales: ['Depresi', 'Kecemasan', 'Stres'],
    scoringFormula: 'Total Skor = Jumlah bobot respons (0=Tidak Pernah, 1=Kadang-kadang, 2=Cukup Sering, 3=Hampir Selalu). Nilai dikelompokkan ke kategori Normal, Ringan, Sedang, Berat, Sangat Berat.',
    questions: [
      // 1. Stress
      {
        id: 1,
        text: 'Saya merasa sulit untuk menenangkan diri dan merasa sangat tegang.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 2. Anxiety
      {
        id: 2,
        text: 'Saya menyadari mulut saya terasa kering tanpa ada alasan fisik atau dehidrasi.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 3. Depression
      {
        id: 3,
        text: 'Saya tidak dapat merasakan perasaan positif atau antusiasme sama sekali.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 4. Anxiety
      {
        id: 4,
        text: 'Saya mengalami kesulitan bernapas (napas cepat atau sesak) saat tidak sedang beraktivitas fisik berat.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 5. Depression
      {
        id: 5,
        text: 'Saya merasa sulit berinisiatif untuk melakukan aktivitas harian dan merasa kehilangan daya penggerak.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 6. Stress
      {
        id: 6,
        text: 'Saya cenderung bereaksi berlebihan terhadap situasi atau gangguan-gangguan kecil.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 7. Anxiety
      {
        id: 7,
        text: 'Saya mengalami gemetar pada tangan atau bagian tubuh lainnya.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 8. Stress
      {
        id: 8,
        text: 'Saya merasa menggunakan banyak energi mental dan merasa sangat gelisah.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 9. Anxiety
      {
        id: 9,
        text: 'Saya merasa cemas tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 10. Depression
      {
        id: 10,
        text: 'Saya merasa bahwa saya tidak memiliki masa depan yang cerah untuk dinantikan.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 11. Stress
      {
        id: 11,
        text: 'Saya merasa mudah tersinggung atau lekas marah oleh hal-hal sepele.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 12. Stress
      {
        id: 12,
        text: 'Saya merasa sulit untuk rileks atau bersantai bahkan di waktu senggang.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 13. Depression
      {
        id: 13,
        text: 'Saya merasa sedih, murung, dan kehilangan keceriaan.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 14. Stress
      {
        id: 14,
        text: 'Saya tidak toleran terhadap hal apa pun yang menghalangi atau memperlambat pekerjaan saya.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 15. Anxiety
      {
        id: 15,
        text: 'Saya merasa seolah-olah saya hampir panik tanpa ada pemicu bahaya nyata.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 16. Depression
      {
        id: 16,
        text: 'Saya tidak mampu merasakan antusiasme terhadap apa pun yang biasanya saya senangi.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 17. Depression
      {
        id: 17,
        text: 'Saya merasa bahwa saya tidak berharga atau tidak berguna sebagai seorang individu.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 18. Stress
      {
        id: 18,
        text: 'Saya merasa sangat peka dan mudah merasa tersentuh atau tersinggung emosi.',
        subscale: 'Stres',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 19. Anxiety
      {
        id: 19,
        text: 'Saya menyadari detak jantung saya berdetak kencang tanpa adanya aktivitas fisik.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 20. Anxiety
      {
        id: 20,
        text: 'Saya merasa takut tanpa alasan yang jelas atau merasa ada sesuatu yang buruk akan terjadi.',
        subscale: 'Kecemasan',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      },
      // 21. Depression
      {
        id: 21,
        text: 'Saya merasa bahwa hidup ini tidak berarti dan sia-sia.',
        subscale: 'Depresi',
        options: [
          { label: 'Tidak pernah (0)', score: 0 },
          { label: 'Kadang-kadang (1)', score: 1 },
          { label: 'Cukup sering (2)', score: 2 },
          { label: 'Hampir selalu (3)', score: 3 }
        ]
      }
    ]
  },
  {
    id: 'test-phq9',
    code: 'PHQ-9',
    title: 'Patient Health Questionnaire-9 (PHQ-9)',
    shortDescription: 'Instrumen baku skrining depresi klinis berdasarkan kriteria DSM-5 untuk mengevaluasi derajat mood depresif.',
    instruction: 'Selama 2 minggu terakhir, seberapa sering Anda terganggu oleh keluhan-keluhan berikut?',
    estimatedMinutes: 4,
    questionCount: 4,
    scoringFormula: 'Skor 0-4: Minimal, 5-9: Ringan, 10-14: Sedang, 15-19: Sedang-Berat, 20-27: Berat.',
    questions: [
      {
        id: 1,
        text: 'Kurang berminat atau bergairah dalam melakukan hal-hal yang biasanya Anda sukai.',
        options: [
          { label: 'Sama sekali tidak (0)', score: 0 },
          { label: 'Beberapa hari (1)', score: 1 },
          { label: 'Lebih dari separuh waktu (2)', score: 2 },
          { label: 'Hampir setiap hari (3)', score: 3 }
        ]
      },
      {
        id: 2,
        text: 'Merasa sedih, murung, tertekan, atau putus asa.',
        options: [
          { label: 'Sama sekali tidak (0)', score: 0 },
          { label: 'Beberapa hari (1)', score: 1 },
          { label: 'Lebih dari separuh waktu (2)', score: 2 },
          { label: 'Hampir setiap hari (3)', score: 3 }
        ]
      },
      {
        id: 3,
        text: 'Sulit tidur atau tidur terlalu lama, terbangun di tengah malam tanpa sebab jelas.',
        options: [
          { label: 'Sama sekali tidak (0)', score: 0 },
          { label: 'Beberapa hari (1)', score: 1 },
          { label: 'Lebih dari separuh waktu (2)', score: 2 },
          { label: 'Hampir setiap hari (3)', score: 3 }
        ]
      },
      {
        id: 4,
        text: 'Merasa lelah atau tidak bertenaga meskipun tidak bekerja berat.',
        options: [
          { label: 'Sama sekali tidak (0)', score: 0 },
          { label: 'Beberapa hari (1)', score: 1 },
          { label: 'Lebih dari separuh waktu (2)', score: 2 },
          { label: 'Hampir setiap hari (3)', score: 3 }
        ]
      }
    ]
  }
];

// PRE-POPULATED INTAKE FORMS FOR 3 PATIENTS
export const INITIAL_INTAKE_FORMS: Record<string, IntakeForm> = {
  // Patient 1: Budi Santoso (Anxiety & Burnout)
  'user-pat-1': {
    id: 'intake-pat-1',
    patientId: 'user-pat-1',
    completedAt: '2026-09-12 14:20',
    birthDate: '1995-05-14',
    gender: 'Laki-laki',
    occupation: 'Lead Software Engineer di Startup Fintech',
    emergencyContact: {
      name: 'Dewi Lestari (Istri)',
      relationship: 'Pasangan',
      phone: '0812-9988-7766'
    },
    primaryConcerns: ['Kecemasan Berlebih (Anxiety)', 'Burnout Pekerjaan', 'Serangan Panik Pagi Hari'],
    concernDescription: 'Sudah 3 bulan terakhir sering mengalami sesak mendadak dan dada berdebar kencang saat pagi hari sebelum jam kerja. Merasa cemas berlebihan akan evaluasi sprint dan performa tim.',
    previousTherapy: false,
    currentMedications: 'Tidak ada obat rutin',
    currentStressLevel: 8,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Ingin menemukan teknik mengelola stres kerja, mengatasi serangan panik sebelum rapat, dan memulihkan pola tidur yang sehat.'
  },
  // Patient 2: Siti Amanda (Insomnia & Overthinking)
  'user-pat-2': {
    id: 'intake-pat-2',
    patientId: 'user-pat-2',
    completedAt: '2026-09-02 09:30',
    birthDate: '2000-11-20',
    gender: 'Perempuan',
    occupation: 'Senior UI/UX Designer di E-commerce',
    emergencyContact: {
      name: 'Hendra Amanda (Kakak)',
      relationship: 'Keluarga',
      phone: '0813-2211-9988'
    },
    primaryConcerns: ['Insomnia Akut', 'Overthinking di Malam Hari', 'Kelelahan Kronis (Fatigue)'],
    concernDescription: 'Sangat sulit tidur sebelum jam 3 pagi karena pikiran terus berputar (racing thoughts) memikirkan hal-hal kecil di masa lalu atau cemas masa depan. Sering merasa pusing di siang hari.',
    previousTherapy: true,
    previousDiagnosis: 'Insomnia Non-organik & Gangguan Kecemasan Situasional',
    currentMedications: 'Suplemen Melatonin (tidak teratur)',
    currentStressLevel: 7,
    sleepQuality: 'Insomnia Akut',
    suicideRiskFlag: false,
    goals: 'Menghentikan kebiasaan overthinking sebelum tidur dan membangun rutinitas sleep hygiene yang konsisten.'
  },
  // Patient 3: Dimas Pratama (Depresi Ringan & Skripsi)
  'user-pat-3': {
    id: 'intake-pat-3',
    patientId: 'user-pat-3',
    completedAt: '2026-09-08 16:45',
    birthDate: '2003-03-18',
    gender: 'Laki-laki',
    occupation: 'Mahasiswa Tingkat Akhir (Teknik Informatika)',
    emergencyContact: {
      name: 'Rahmat Pratama (Ayah)',
      relationship: 'Orang Tua',
      phone: '0815-6677-8899'
    },
    primaryConcerns: ['Kehilangan Motivasi & Arah', 'Depresi Ringan', 'Prokrastinasi Skripsi'],
    concernDescription: 'Merasa hampa dan terisolasi dari teman sebaya. Skripsi terhenti selama 5 bulan karena setiap membuka laptop langsung merasa overwhelmed dan ingin melarikan diri ke game online.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 6,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Membangkitkan kembali gairah belajar, memecah tugas skripsi menjadi langkah realistis, dan mengatasi perasaan tidak berharga.'
  },
  // Patient 4: Rina Kartika (Trauma Masa Lalu & Rekan Kerja)
  'user-pat-4': {
    id: 'intake-pat-4',
    patientId: 'user-pat-4',
    completedAt: '2026-08-16 11:00',
    birthDate: '1997-05-14',
    gender: 'Perempuan',
    occupation: 'Financial Analyst di BUMN',
    emergencyContact: {
      name: 'Maya Kartika (Ibu)',
      relationship: 'Orang Tua',
      phone: '0812-3322-1144'
    },
    primaryConcerns: ['Trauma Hubungan Masa Lalu', 'Kecemasan Sosial', 'Rasa Tidak Aman (Insecurity)'],
    concernDescription: 'Sering mengalami kilas balik (flashback) dan kecemasan mendadak bila ada konflik dengan rekan kerja senior. Selalu merasa akan dikhianati atau disalahkan.',
    previousTherapy: true,
    previousDiagnosis: 'PTSD Ringan & Gangguan Penyesuaian',
    currentMedications: 'Tidak ada',
    currentStressLevel: 7,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Memproses luka emosional masa lalu, membangun batasan interpersonal yang sehat, dan meningkatkan self-compassion.'
  },
  // Patient 5: Taufik Hidayat (Social Anxiety & Panic)
  'user-pat-5': {
    id: 'intake-pat-5',
    patientId: 'user-pat-5',
    completedAt: '2026-08-22 14:10',
    birthDate: '2000-09-03',
    gender: 'Laki-laki',
    occupation: 'Freelance Graphic Designer',
    emergencyContact: {
      name: 'Bayu Hidayat (Adik)',
      relationship: 'Keluarga',
      phone: '0813-7766-5544'
    },
    primaryConcerns: ['Kecemasan Sosial Akut', 'Serangan Panik di Keramaian', 'Agoraphobia Ringan'],
    concernDescription: 'Merasa jantung berdegup kencang, pusing, dan mual saat harus presentasi ke klien atau berada di tempat umum yang padat. Menghindari kontak sosial selama 2 bulan.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 8,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Mampu berbicara di depan umum tanpa rasa panik dan mengurangi respons menghindar pada situasi sosial.'
  },
  // Patient 6: Anindya Putri (Postpartum & Stres Ganda)
  'user-pat-6': {
    id: 'intake-pat-6',
    patientId: 'user-pat-6',
    completedAt: '2026-08-30 10:20',
    birthDate: '1994-07-22',
    gender: 'Perempuan',
    occupation: 'HR Manager & Ibu Baru',
    emergencyContact: {
      name: 'Irwan Setiawan (Suami)',
      relationship: 'Pasangan',
      phone: '0811-4455-8899'
    },
    primaryConcerns: ['Baby Blues / Postpartum Stress', 'Kelelahan Mental Ekstrem', 'Konflik Peran'],
    concernDescription: 'Kewalahan membagi peran merawat bayi 6 bulan dan beban kerja manajerial. Sering menangis tiba-tiba tanpa alasan jelas dan merasa menjadi ibu yang gagal.',
    previousTherapy: false,
    currentMedications: 'Vitamin & Asupan Menyusui',
    currentStressLevel: 9,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Meredakan rasa bersalah berlebih (mom guilt), menstabilkan mood, dan menyepakati pembagian peran dengan pasangan.'
  },
  // Patient 7: Bagas Wicaksono (High Stress & Burnout - Flag Perhatian)
  'user-pat-7': {
    id: 'intake-pat-7',
    patientId: 'user-pat-7',
    completedAt: '2026-09-06 09:15',
    birthDate: '1992-02-10',
    gender: 'Laki-laki',
    occupation: 'Startup Founder & CEO',
    emergencyContact: {
      name: 'Nadia Wicaksono (Istri)',
      relationship: 'Pasangan',
      phone: '0812-6655-4433'
    },
    primaryConcerns: ['Burnout Ekstrem', 'Serangan Panik Berulang', 'Distres Fisik Psikosomatis'],
    concernDescription: 'Bekerja 16 jam sehari selama 1 tahun terakhir. Tekanan investor dan runway finansial perusahaan menyebabkan nyeri dada non-jantung berulang dan hilangnya harapan.',
    previousTherapy: true,
    previousDiagnosis: 'Major Depressive Episode & Panic Disorder',
    currentMedications: 'Sertraline 50mg (Resep Psikiater RS Mitra)',
    currentStressLevel: 9,
    sleepQuality: 'Insomnia Akut',
    suicideRiskFlag: true, // Emergency risk flag for clinical triage test!
    goals: 'Meredakan kepanikan akut harian, menata batas jam kerja, dan pendampingan suportif bersama psikiater.'
  },
  // Patient 9: Hendro Wijaya (Tech Lead Burnout)
  'user-pat-9': {
    id: 'intake-pat-9',
    patientId: 'user-pat-9',
    completedAt: '2026-06-03 10:30',
    birthDate: '1991-04-12',
    gender: 'Laki-laki',
    occupation: 'Principal Software Architect',
    emergencyContact: {
      name: 'Ratih Wijaya (Istri)',
      relationship: 'Pasangan',
      phone: '0812-3344-5566'
    },
    primaryConcerns: ['Burnout Kronis', 'Insomnia Akut', 'Kecemasan Kinerja Tim'],
    concernDescription: 'Beban memimpin arsitektur sistem berskala besar selama masa restrukturisasi membuat tidur tidak nyenyak dan sering terjaga pukul 03.00 pagi dengan palpitasi jantung.',
    previousTherapy: true,
    previousDiagnosis: 'Insomnia Terkait Stres Kerja',
    currentMedications: 'Suplemen Melatonin 3mg',
    currentStressLevel: 8,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Mengembalikan pola tidur alami dan menetapkan batas tegas antara pekerjaan dan istirahat pribadi.'
  },
  // Patient 10: Maya Kartini (Creative Director)
  'user-pat-10': {
    id: 'intake-pat-10',
    patientId: 'user-pat-10',
    completedAt: '2026-06-12 14:15',
    birthDate: '1998-08-25',
    gender: 'Perempuan',
    occupation: 'Creative Director',
    emergencyContact: {
      name: 'Bambang Kartini (Ayah)',
      relationship: 'Keluarga',
      phone: '0813-2233-4455'
    },
    primaryConcerns: ['Imposter Syndrome', 'Kelelahan Kreatif (Creative Block)', 'Kecemasan Sosial'],
    concernDescription: 'Merasa keberhasilan karir saat ini hanyalah kebetulan dan sewaktu-waktu ketidakmampuannya akan terungkap. Selalu cemas menjelang sesi pitch klien.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 7,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Membangun kepercayaan diri autentik dan mengatasi ketakutan berlebih terhadap kritik profesional.'
  },
  // Patient 11: Reza Fahrezi (Fintech Risk Manager)
  'user-pat-11': {
    id: 'intake-pat-11',
    patientId: 'user-pat-11',
    completedAt: '2026-06-28 09:00',
    birthDate: '1993-11-05',
    gender: 'Laki-laki',
    occupation: 'Senior Risk Manager Fintech',
    emergencyContact: {
      name: 'Sarah Fahrezi (Adik)',
      relationship: 'Keluarga',
      phone: '0817-9988-7766'
    },
    primaryConcerns: ['Kecemasan Finansial Perusahaan', 'Ketegangan Otot Psikosomatis', 'Serangan Cemas Singkat'],
    concernDescription: 'Bertanggung jawab atas audit mitigasi risiko miliaran rupiah. Merasa punggung dan pundak selalu tegang seperti memikul beban berat setiap hari kerja.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 8,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Belajar manajemen stres berbasis mindfulness dan meredakan ketegangan fisik psikosomatis.'
  },
  // Patient 12: Nadya Stephanie (Dokter Gigi)
  'user-pat-12': {
    id: 'intake-pat-12',
    patientId: 'user-pat-12',
    completedAt: '2026-07-15 16:20',
    birthDate: '1997-03-18',
    gender: 'Perempuan',
    occupation: 'Dokter Gigi Spesialis',
    emergencyContact: {
      name: 'drg. Hendra (Rekan Sejawat)',
      relationship: 'Kolega',
      phone: '0818-7766-5544'
    },
    primaryConcerns: ['Perfeksionisme Maladaptif', 'Kelelahan Pasien Klinis', 'Kecemasan Kesalahan Medis'],
    concernDescription: 'Sangat takut melakukan kesalahan sekecil apapun dalam tindakan klinis. Sering memikirkan ulang prosedur pasien bahkan saat sedang libur akhir pekan.',
    previousTherapy: true,
    previousDiagnosis: 'Anxiety NOS',
    currentMedications: 'Tidak ada',
    currentStressLevel: 7,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Menerima batasan kendali diri, meredakan perfeksionisme ekstrem, dan self-compassion klinis.'
  },
  // Patient 13: Farhan Pratama (Content Creator)
  'user-pat-13': {
    id: 'intake-pat-13',
    patientId: 'user-pat-13',
    completedAt: '2026-07-26 11:45',
    birthDate: '2002-05-14',
    gender: 'Laki-laki',
    occupation: 'Content Creator & Podcaster',
    emergencyContact: {
      name: 'Dian Pratama (Ibu)',
      relationship: 'Keluarga',
      phone: '0819-3322-1100'
    },
    primaryConcerns: ['Kecemasan Validasi Digital', 'Burnout Produksi Konten', 'Insomnia Ritme Sirkadian'],
    concernDescription: 'Algoritma platform dan komentar negatif netizen menyebabkan fluktuasi suasana hati yang drastis. Jam tidur terbalik dari pagi ke malam.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 8,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Detoks digital terencana, memperbaiki jam biologis tubuh, dan ketahanan mental menghadapi kritik publik.'
  },
  // Patient 14: Dewi Lestari (Strategic Advisor)
  'user-pat-14': {
    id: 'intake-pat-14',
    patientId: 'user-pat-14',
    completedAt: '2026-08-01 13:10',
    birthDate: '1988-12-09',
    gender: 'Perempuan',
    occupation: 'Strategic Business Advisor',
    emergencyContact: {
      name: 'Irwan Lestari (Suami)',
      relationship: 'Pasangan',
      phone: '0811-1234-5678'
    },
    primaryConcerns: ['Krisis Paruh Baya', 'Konflik Peran Keluarga-Karir', 'Stres Pengasuhan Remaja'],
    concernDescription: 'Anak sulung mulai beranjak dewasa dan mandiri sementara tuntutan advisory di kantor semakin tinggi. Merasa hampa dan kehilangan identitas diri di luar pekerjaan.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 6,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Menemukan kembali makna hidup (meaning-centered therapy) dan membangun kedekatan emosional dengan keluarga.'
  },
  // Patient 15: Aditya Nugroho (Retail Business Owner)
  'user-pat-15': {
    id: 'intake-pat-15',
    patientId: 'user-pat-15',
    completedAt: '2026-08-14 15:30',
    birthDate: '1994-09-20',
    gender: 'Laki-laki',
    occupation: 'Retail Business Owner',
    emergencyContact: {
      name: 'Rian Nugroho (Saudara Kandung)',
      relationship: 'Keluarga',
      phone: '0812-9900-1122'
    },
    primaryConcerns: ['Kecemasan Arus Kas Bisnis', 'Psikosomatis Asam Lambung (GERD)', 'Stres Persaingan Ritel'],
    concernDescription: 'Perubahan tren belanja pasca-pandemi menekan omset gerai ritel. Sering mengalami refluks asam lambung mendadak saat memeriksa laporan keuangan bulanan.',
    previousTherapy: false,
    currentMedications: 'Omeprazole 20mg (Resep Internis)',
    currentStressLevel: 8,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Meredakan keterkaitan cemas-lambung (gut-brain axis) dan mengasah ketahanan psikologis kewirausahaan.'
  },
  // Patient 16: Tiara Maharani (Legal Counsel)
  'user-pat-16': {
    id: 'intake-pat-16',
    patientId: 'user-pat-16',
    completedAt: '2026-08-20 18:00',
    birthDate: '1999-01-30',
    gender: 'Perempuan',
    occupation: 'Corporate Legal Counsel',
    emergencyContact: {
      name: 'Nur Maharani (Ibu)',
      relationship: 'Keluarga',
      phone: '0813-8877-6655'
    },
    primaryConcerns: ['Kelelahan Jam Kerja Ekstrem', 'Ketegangan Leher & Migrain', 'Kecemasan Tenggat Waktu'],
    concernDescription: 'Sering bekerja hingga larut malam menyusun kontrak korporat mendesak. Sering mengalami migrain tegang saat menghadapi negosiasi alot.',
    previousTherapy: false,
    currentMedications: 'Paracetamol sesuai kebutuhan',
    currentStressLevel: 7,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Teknik relaksasi otot progresif untuk migrain dan komunikasi asertif dalam pembagian beban kerja tim.'
  },
  // Patient 17: Yoga Prasetyo (Data Scientist)
  'user-pat-17': {
    id: 'intake-pat-17',
    patientId: 'user-pat-17',
    completedAt: '2026-08-28 10:15',
    birthDate: '1996-06-17',
    gender: 'Laki-laki',
    occupation: 'Data Scientist',
    emergencyContact: {
      name: 'Dedi Prasetyo (Paman)',
      relationship: 'Keluarga',
      phone: '0815-4433-2211'
    },
    primaryConcerns: ['Isolasi Sosial Remote Work', 'Kesepian Kronis', 'Kesulitan Membina Hubungan Romantis'],
    concernDescription: 'Bekerja penuh dari kamar kos selama 2 tahun terakhir tanpa interaksi tatap muka yang berarti. Merasa canggung dan gamang saat harus berkomunikasi kasual.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 7,
    sleepQuality: 'Cukup',
    suicideRiskFlag: false,
    goals: 'Meningkatkan keterampilan sosial praktis dan mengatasi penghindaran interaksi nyata.'
  },
  // Patient 18: Melati Kusuma (Mahasiswi Pascasarjana)
  'user-pat-18': {
    id: 'intake-pat-18',
    patientId: 'user-pat-18',
    completedAt: '2026-09-05 14:00',
    birthDate: '2001-02-14',
    gender: 'Perempuan',
    occupation: 'Mahasiswi Pascasarjana Bioteknologi',
    emergencyContact: {
      name: 'Prof. Sutrisno (Dosen Pembimbing Akademik)',
      relationship: 'Kolega',
      phone: '0816-5544-3322'
    },
    primaryConcerns: ['Academic Burnout Tesis', 'Prokrastinasi Kecemasan', 'Takut Kegagalan Laboratorium'],
    concernDescription: 'Hasil eksperimen penelitian tesis tidak sesuai hipotesis selama 3 bulan berturut-turut. Menghindari membuka laptop karena merasa tidak kompeten.',
    previousTherapy: true,
    previousDiagnosis: 'Episode Depresif Ringan',
    currentMedications: 'Tidak ada',
    currentStressLevel: 8,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Memecah hambatan penulisan tesis dengan micro-habits dan meredam ketakutan akan hasil eksperimen.'
  },
  // Patient 19: Fajar Ramadhan (Head of HR)
  'user-pat-19': {
    id: 'intake-pat-19',
    patientId: 'user-pat-19',
    completedAt: '2026-09-12 11:00',
    birthDate: '1990-10-28',
    gender: 'Laki-laki',
    occupation: 'Head of People & Culture',
    emergencyContact: {
      name: 'Anisa Ramadhan (Istri)',
      relationship: 'Pasangan',
      phone: '0817-6677-8899'
    },
    primaryConcerns: ['Compassion Fatigue (Kelelahan Empati)', 'Beban Emosional PHK Karyawan', 'Distres Moral'],
    concernDescription: 'Memimpin proses efisiensi dan perpisahan 50 karyawan kantor. Menyerap kesedihan dan kemarahan orang lain hingga merasa mati rasa secara emosional di rumah.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 9,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Memulihkan energi empati, melepaskan beban rasa bersalah institusional, dan pemulihan batas psikologis.'
  },
  // Patient 20: Gita Savitri (Campaign Specialist)
  'user-pat-20': {
    id: 'intake-pat-20',
    patientId: 'user-pat-20',
    completedAt: '2026-09-15 16:45',
    birthDate: '1995-07-08',
    gender: 'Perempuan',
    occupation: 'Marketing Campaign Specialist',
    emergencyContact: {
      name: 'Vina Savitri (Kakak Kandung)',
      relationship: 'Keluarga',
      phone: '0818-1100-2233'
    },
    primaryConcerns: ['Overthinking Masa Depan', 'Kecemasan Eksistensial', 'Insomnia Pemikiran Berulang'],
    concernDescription: 'Terus-menerus mempertanyakan tujuan hidup dan takut tertinggal oleh pencapaian rekan sebaya di media sosial (FOMO kronis). Sulit menenangkan pikiran malam hari.',
    previousTherapy: false,
    currentMedications: 'Tidak ada',
    currentStressLevel: 7,
    sleepQuality: 'Buruk',
    suicideRiskFlag: false,
    goals: 'Latihan mindfulness penerimaan diri, mengurangi paparan perbandingan sosial, dan regulasi emosi harian.'
  }
};

// PRE-POPULATED TEST RESULTS (DASS-21) FOR 3 PATIENTS
export const INITIAL_TEST_RESULTS: TestResult[] = [
  // Budi Santoso
  {
    id: 'res-1',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-12 14:40',
    totalScore: 28, // scale calibrated to 21 items
    subscaleScores: {
      depression: 7,
      anxiety: 11,
      stress: 10
    },
    severityLevel: 'SEDANG',
    interpretation: 'Tingkat kecemasan berada pada derajat Sedang-Tinggi (Skor 11) dan stres Sedang (Skor 10). Terdapat manifestasi psikosomatis seperti ketegangan otot dan sensasi dada terhimpit.',
    clinicalRecommendation: 'Disarankan konseling intensif Cognitive Behavioral Therapy (CBT) fokus restrukturisasi kognitif (thought records) dan teknik relaksasi diafragma pernapasan.'
  },
  // Siti Amanda
  {
    id: 'res-2',
    patientId: 'user-pat-2',
    patientName: 'Siti Amanda',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-02 10:00',
    totalScore: 19,
    subscaleScores: {
      depression: 4,
      anxiety: 8,
      stress: 7
    },
    severityLevel: 'RINGAN',
    interpretation: 'Indikasi kecemasan ringan dan stres ringan terkait sleep-onset anxiety (kecemasan akan ketidakmampuan untuk tertidur). Gejala depresi dalam batas normal.',
    clinicalRecommendation: 'Pendekatan CBT for Insomnia (CBT-I), stimulus control, dan pembatasan screen-time 1 jam sebelum jam tidur ideal.'
  },
  // Dimas Pratama
  {
    id: 'res-3',
    patientId: 'user-pat-3',
    patientName: 'Dimas Pratama',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-08 17:15',
    totalScore: 32,
    subscaleScores: {
      depression: 14,
      anxiety: 8,
      stress: 10
    },
    severityLevel: 'BERAT',
    interpretation: 'Subskala Depresi menunjukkan skor Sedang-Berat (14) dengan anhedonia, penurunan energi, dan perasaan putus asa terhadap penyelesaian studi.',
    clinicalRecommendation: 'Pendekatan Behavioral Activation (aktivasi perilaku bertahap), penetapan target mikro (micro-goals), dan dukungan keluarga suportif.'
  },
  // Rina Kartika
  {
    id: 'res-4',
    patientId: 'user-pat-4',
    patientName: 'Rina Kartika',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-16 11:30',
    totalScore: 24,
    subscaleScores: {
      depression: 6,
      anxiety: 10,
      stress: 8
    },
    severityLevel: 'SEDANG',
    interpretation: 'Kecemasan interpersonal derajat Sedang dengan respon kewaspadaan berlebih (hypervigilance) pada dinamika kantor.',
    clinicalRecommendation: 'EMDR / Trauma-informed CBT untuk desensitisasi respon cemas terhadap figur otoritas.'
  },
  // Taufik Hidayat
  {
    id: 'res-5',
    patientId: 'user-pat-5',
    patientName: 'Taufik Hidayat',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-22 14:45',
    totalScore: 34,
    subscaleScores: {
      depression: 9,
      anxiety: 15,
      stress: 10
    },
    severityLevel: 'BERAT',
    interpretation: 'Tingkat kecemasan Berat (Skor 15) dengan gejala psikosomatis tremor, takikardia, dan penghindaran sosial menyeluruh.',
    clinicalRecommendation: 'Graded Exposure Therapy (paparan sosial bertahap), latihan biofeedback pernapasan, dan restrukturisasi pikiran katastrofik.'
  },
  // Anindya Putri
  {
    id: 'res-6',
    patientId: 'user-pat-6',
    patientName: 'Anindya Putri',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-30 11:00',
    totalScore: 26,
    subscaleScores: {
      depression: 11,
      anxiety: 7,
      stress: 8
    },
    severityLevel: 'SEDANG',
    interpretation: 'Indikasi depresi postpartum derajat Sedang berkaitan dengan keletihan fisik kumulatif dan rasa bersalah.',
    clinicalRecommendation: 'Interpersonal Psychotherapy (IPT) fokus penyesuaian peran baru, aktivasi support network keluarga, dan jadwal istirahat terjaga.'
  },
  // Bagas Wicaksono
  {
    id: 'res-7',
    patientId: 'user-pat-7',
    patientName: 'Bagas Wicaksono',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-06 09:45',
    totalScore: 42,
    subscaleScores: {
      depression: 15,
      anxiety: 14,
      stress: 13
    },
    severityLevel: 'SANGAT_BERAT',
    interpretation: 'Distres psikologis Ekstrem / Sangat Berat pada ketiga dimensi (Depresi 15, Ansietas 14, Stres 13). Disertai tanda kelelahan fisik menyeluruh.',
    clinicalRecommendation: 'Kolaborasi intensif psikolog klinis & psikiater, krisis intervensi penstabilan stres, dan rehat kerja medis darurat.'
  },
  // Hendro Wijaya
  {
    id: 'res-9',
    patientId: 'user-pat-9',
    patientName: 'Hendro Wijaya',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-06-03 10:45',
    totalScore: 31,
    subscaleScores: {
      depression: 9,
      anxiety: 10,
      stress: 12
    },
    severityLevel: 'SEDANG',
    interpretation: 'Tingkat stres tinggi dengan kecemasan sedang akibat akumulasi beban kerja teknis berkepanjangan.',
    clinicalRecommendation: 'Pendekatan restrukturisasi kognitif beban kerja, sleep hygiene untuk insomnia, dan work-life boundaries.'
  },
  // Maya Kartini
  {
    id: 'res-10',
    patientId: 'user-pat-10',
    patientName: 'Maya Kartini',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-06-12 14:30',
    totalScore: 23,
    subscaleScores: {
      depression: 5,
      anxiety: 11,
      stress: 7
    },
    severityLevel: 'SEDANG',
    interpretation: 'Skor kecemasan menonjol (11, Sedang) dipicu oleh imposter syndrome dan takut evaluasi negatif.',
    clinicalRecommendation: 'CBT untuk core beliefs ketidakmampuan diri, afirmasi pencapaian, dan exposure therapy presentasi.'
  },
  // Reza Fahrezi
  {
    id: 'res-11',
    patientId: 'user-pat-11',
    patientName: 'Reza Fahrezi',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-06-28 09:15',
    totalScore: 27,
    subscaleScores: {
      depression: 6,
      anxiety: 10,
      stress: 11
    },
    severityLevel: 'SEDANG',
    interpretation: 'Stres sedang dan ansietas sedang dengan somatisasi ketegangan otot bahu dan leher.',
    clinicalRecommendation: 'Progressive Muscle Relaxation (PMR), somatic grounding, dan time boxing tugas audit berisiko tinggi.'
  },
  // Nadya Stephanie
  {
    id: 'res-12',
    patientId: 'user-pat-12',
    patientName: 'Nadya Stephanie',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-07-15 16:40',
    totalScore: 25,
    subscaleScores: {
      depression: 5,
      anxiety: 11,
      stress: 9
    },
    severityLevel: 'SEDANG',
    interpretation: 'Kecemasan perfeksionistik klinis dengan over-checking behavior dan ketakutan malapraktik.',
    clinicalRecommendation: 'Acceptance and Commitment Therapy (ACT) untuk toleransi ketidakpastian dan belas kasih diri medis.'
  },
  // Farhan Pratama
  {
    id: 'res-13',
    patientId: 'user-pat-13',
    patientName: 'Farhan Pratama',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-07-26 12:00',
    totalScore: 30,
    subscaleScores: {
      depression: 10,
      anxiety: 12,
      stress: 8
    },
    severityLevel: 'SEDANG',
    interpretation: 'Kombinasi depresi ringan-sedang dan ansietas sedang terkait paparan media sosial terus menerus.',
    clinicalRecommendation: 'Protokol pembatasan media sosial bertahap, restrukturisasi kognitif validasi diri internal.'
  },
  // Dewi Lestari
  {
    id: 'res-14',
    patientId: 'user-pat-14',
    patientName: 'Dewi Lestari',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-01 13:30',
    totalScore: 20,
    subscaleScores: {
      depression: 7,
      anxiety: 6,
      stress: 7
    },
    severityLevel: 'RINGAN',
    interpretation: 'Gejala distres ringan transisi kehidupan (krisis paruh baya & anak mandiri). Fungsi keseharian masih baik.',
    clinicalRecommendation: 'Eksplorasi nilai hidup bermakna (Logotherapy), penguatan komunikasi relasi suami-istri.'
  },
  // Aditya Nugroho
  {
    id: 'res-15',
    patientId: 'user-pat-15',
    patientName: 'Aditya Nugroho',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-14 15:50',
    totalScore: 29,
    subscaleScores: {
      depression: 7,
      anxiety: 12,
      stress: 10
    },
    severityLevel: 'SEDANG',
    interpretation: 'Kecemasan finansial memicu dispepsia/GERD fungsional psikogenik. Tingkat kecemasan pada skala sedang-tinggi.',
    clinicalRecommendation: 'Latihan pernapasan diafragma saat stres puncak, pemisahan waktu memikirkan solusi bisnis dari jam istirahat.'
  },
  // Tiara Maharani
  {
    id: 'res-16',
    patientId: 'user-pat-16',
    patientName: 'Tiara Maharani',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-20 18:20',
    totalScore: 26,
    subscaleScores: {
      depression: 6,
      anxiety: 9,
      stress: 11
    },
    severityLevel: 'SEDANG',
    interpretation: 'Stres tingkat sedang terkait beban jam kerja advokat. Disertai kelelahan fisik dan migrain periodik.',
    clinicalRecommendation: 'Latihan asertivitas batas jam kerja, relaksasi biofeedback sederhana, dan micro-breaks.'
  },
  // Yoga Prasetyo
  {
    id: 'res-17',
    patientId: 'user-pat-17',
    patientName: 'Yoga Prasetyo',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-08-28 10:35',
    totalScore: 28,
    subscaleScores: {
      depression: 11,
      anxiety: 9,
      stress: 8
    },
    severityLevel: 'SEDANG',
    interpretation: 'Indikasi depresi sedang akibat isolasi sosial kronis selama bekerja jarak jauh (remote work).',
    clinicalRecommendation: 'Behavioral activation dengan bergabung ke komunitas minat offline, pendampingan interaksi sosial bertahap.'
  },
  // Melati Kusuma
  {
    id: 'res-18',
    patientId: 'user-pat-18',
    patientName: 'Melati Kusuma',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-05 14:20',
    totalScore: 33,
    subscaleScores: {
      depression: 13,
      anxiety: 10,
      stress: 10
    },
    severityLevel: 'BERAT',
    interpretation: 'Skor depresi mendekati batas berat (13) terkait kebuntuan progres riset pascasarjana dan hilangnya self-efficacy.',
    clinicalRecommendation: 'Intervensi kognitif untuk mendobrak pola avoidance, penjadwalan bimbingan bertahap dengan dosen.'
  },
  // Fajar Ramadhan
  {
    id: 'res-19',
    patientId: 'user-pat-19',
    patientName: 'Fajar Ramadhan',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-12 11:20',
    totalScore: 35,
    subscaleScores: {
      depression: 11,
      anxiety: 11,
      stress: 13
    },
    severityLevel: 'BERAT',
    interpretation: 'Tingkat stres berat (13) dan kelelahan empati (compassion fatigue) tinggi pasca eksekusi restrukturisasi organisasi.',
    clinicalRecommendation: 'Debriefing psikologis profesional, melepaskan rasa tanggung jawab emosional yang berlebihan, cuti pemulihan.'
  },
  // Gita Savitri
  {
    id: 'res-20',
    patientId: 'user-pat-20',
    patientName: 'Gita Savitri',
    testId: 'test-dass21',
    testCode: 'DASS-21',
    testTitle: 'Skala Depresi, Kecemasan & Stres (DASS-21)',
    completedAt: '2026-09-15 17:05',
    totalScore: 24,
    subscaleScores: {
      depression: 6,
      anxiety: 10,
      stress: 8
    },
    severityLevel: 'SEDANG',
    interpretation: 'Kecemasan eksistensial dan overthinking berulang derajat sedang dengan kesulitan mempertahankan fokus kerja.',
    clinicalRecommendation: 'Mindfulness grounding 5-4-3-2-1, pembatasan konsumsi konten pembanding, dan reframing arah karir masa depan.'
  }
];

export const INITIAL_SCHEDULES: ScheduleSlot[] = [
  // dr. Sarah Jenkins (user-psy-1)
  { id: 'slot-1', psychologistId: 'user-psy-1', date: '2026-09-16', startTime: '09:00', endTime: '10:00', isAvailable: true, isBooked: false },
  { id: 'slot-2', psychologistId: 'user-psy-1', date: '2026-09-16', startTime: '10:30', endTime: '11:30', isAvailable: false, isBooked: true, appointmentId: 'apt-active-1' },
  { id: 'slot-3', psychologistId: 'user-psy-1', date: '2026-09-16', startTime: '13:30', endTime: '14:30', isAvailable: true, isBooked: false },
  { id: 'slot-4', psychologistId: 'user-psy-1', date: '2026-09-16', startTime: '15:00', endTime: '16:00', isAvailable: true, isBooked: false },
  { id: 'slot-5', psychologistId: 'user-psy-1', date: '2026-09-17', startTime: '10:00', endTime: '11:00', isAvailable: true, isBooked: false },
  { id: 'slot-6', psychologistId: 'user-psy-1', date: '2026-09-17', startTime: '14:00', endTime: '15:00', isAvailable: true, isBooked: false },
  { id: 'slot-7', psychologistId: 'user-psy-1', date: '2026-09-18', startTime: '11:00', endTime: '12:00', isAvailable: true, isBooked: false },
  { id: 'slot-8', psychologistId: 'user-psy-1', date: '2026-09-18', startTime: '15:30', endTime: '16:30', isAvailable: false, isBooked: false }, // Libur

  // Slot Tambahan Praktik dr. Sarah Jenkins (user-psy-1)
  { id: 'slot-9', psychologistId: 'user-psy-1', date: '2026-09-16', startTime: '11:00', endTime: '12:00', isAvailable: true, isBooked: false },
  { id: 'slot-10', psychologistId: 'user-psy-1', date: '2026-09-16', startTime: '14:00', endTime: '15:00', isAvailable: true, isBooked: false },
  { id: 'slot-11', psychologistId: 'user-psy-1', date: '2026-09-17', startTime: '09:00', endTime: '10:00', isAvailable: true, isBooked: false },
  { id: 'slot-12', psychologistId: 'user-psy-1', date: '2026-09-17', startTime: '13:00', endTime: '14:00', isAvailable: false, isBooked: true, appointmentId: 'apt-pending-1' }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  // 1. Active Confirmed Consultation (Budi Santoso & dr. Sarah Jenkins)
  {
    id: 'apt-active-1',
    bookingCode: 'JS-20260916-01',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    patientEmail: 'budi.santoso@gmail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-16',
    startTime: '10:30',
    endTime: '11:30',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-14 11:20',
    clinicalNotesId: 'note-1'
  },
  // 2. Completed Consultation in past (Siti Amanda & dr. Sarah Jenkins)
  {
    id: 'apt-past-1',
    bookingCode: 'JS-20260905-09',
    patientId: 'user-pat-2',
    patientName: 'Siti Amanda',
    patientEmail: 'siti.amanda@outlook.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-09-05',
    startTime: '14:00',
    endTime: '15:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-02 09:15',
    clinicalNotesId: 'note-past-1',
    reviewId: 'rev-1'
  },
  // 3. Pending Offline Appointment (Budi Santoso & dr. Sarah Jenkins)
  {
    id: 'apt-pending-1',
    bookingCode: 'JS-20260917-04',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    patientEmail: 'budi.santoso@gmail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-17',
    startTime: '13:00',
    endTime: '14:00',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-15 16:30'
  },
  // 4. Completed Consultation in past (Dimas Pratama & dr. Sarah Jenkins)
  {
    id: 'apt-past-2',
    bookingCode: 'JS-20260910-02',
    patientId: 'user-pat-3',
    patientName: 'Dimas Pratama',
    patientEmail: 'dimas.pratama@kampus.ac.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-10',
    startTime: '16:00',
    endTime: '17:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-08 18:00',
    clinicalNotesId: 'note-past-2'
  },
  // 5. Completed Offline Appointment (dr. Sarah Jenkins)
  {
    id: 'apt-past-3',
    bookingCode: 'JS-20260904-03',
    patientId: 'user-pat-4',
    patientName: 'Rina Kartika',
    patientEmail: 'rina.kartika@office.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-04',
    startTime: '10:00',
    endTime: '11:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-01 14:00',
    clinicalNotesId: 'note-past-3'
  },
  // 6. Completed Consultation (dr. Sarah Jenkins)
  {
    id: 'apt-past-4',
    bookingCode: 'JS-20260911-05',
    patientId: 'user-pat-5',
    patientName: 'Taufik Hidayat',
    patientEmail: 'taufik.hidayat@gmail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-11',
    startTime: '14:00',
    endTime: '15:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-09 11:30'
  },
  // 7. Completed Assessment Bundling (dr. Sarah Jenkins)
  {
    id: 'apt-past-5',
    bookingCode: 'JS-20260907-06',
    patientId: 'user-pat-2',
    patientName: 'Siti Amanda',
    patientEmail: 'siti.amanda@outlook.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-09-07',
    startTime: '13:00',
    endTime: '14:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-03 16:45',
    reviewId: 'rev-top-1'
  },
  // 8. Completed Regular Consultation (dr. Sarah Jenkins)
  {
    id: 'apt-past-6',
    bookingCode: 'JS-20260908-07',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    patientEmail: 'budi.santoso@gmail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-08',
    startTime: '15:30',
    endTime: '16:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Teratai Lt. 1',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-05 10:20',
    reviewId: 'rev-eval-1'
  },
  // 9. Completed Offline Consultation (dr. Sarah Jenkins)
  {
    id: 'apt-past-7',
    bookingCode: 'JS-20260913-08',
    patientId: 'user-pat-6',
    patientName: 'Anindya Putri',
    patientEmail: 'anindya.putri@gmail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-13',
    startTime: '11:00',
    endTime: '12:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Lily Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-10 09:10'
  },

  // ==========================================
  // HISTORICAL APPOINTMENTS - TAHUN 2025
  // ==========================================
  // November 2025
  {
    id: 'apt-2025-11-01',
    bookingCode: 'JS-20251110-01',
    patientId: 'user-pat-9',
    patientName: 'Hendro Wijaya',
    patientEmail: 'hendro.wijaya@tech.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2025-11-10',
    startTime: '10:00',
    endTime: '11:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2025-11-07 14:00'
  },
  {
    id: 'apt-2025-11-02',
    bookingCode: 'JS-20251118-02',
    patientId: 'user-pat-10',
    patientName: 'Maya Kartini',
    patientEmail: 'maya.kartini@agency.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2025-11-18',
    startTime: '13:30',
    endTime: '14:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2025-11-15 09:30'
  },
  {
    id: 'apt-2025-11-03',
    bookingCode: 'JS-20251125-03',
    patientId: 'user-pat-11',
    patientName: 'Reza Fahrezi',
    patientEmail: 'reza.fahrezi@fintech.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2025-11-25',
    startTime: '15:00',
    endTime: '16:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2025-11-22 16:15'
  },
  // Desember 2025
  {
    id: 'apt-2025-12-01',
    bookingCode: 'JS-20251208-01',
    patientId: 'user-pat-12',
    patientName: 'Nadya Stephanie',
    patientEmail: 'nadya.dental@clinic.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2025-12-08',
    startTime: '09:30',
    endTime: '10:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Teratai Lt. 1',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2025-12-05 11:20'
  },
  {
    id: 'apt-2025-12-02',
    bookingCode: 'JS-20251215-02',
    patientId: 'user-pat-13',
    patientName: 'Farhan Pratama',
    patientEmail: 'farhan.pratama@mail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2025-12-15',
    startTime: '14:00',
    endTime: '15:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2025-12-12 10:45'
  },
  {
    id: 'apt-2025-12-03',
    bookingCode: 'JS-20251222-03',
    patientId: 'user-pat-14',
    patientName: 'Dewi Lestari',
    patientEmail: 'dewi.lestari@advisory.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2025-12-22',
    startTime: '16:00',
    endTime: '17:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2025-12-19 13:00'
  },

  // ==========================================
  // APPOINTMENTS - TAHUN 2026
  // ==========================================
  // Juni 2026
  {
    id: 'apt-2026-06-01',
    bookingCode: 'JS-20260608-01',
    patientId: 'user-pat-15',
    patientName: 'Aditya Nugroho',
    patientEmail: 'aditya.nugroho@retail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-06-08',
    startTime: '10:00',
    endTime: '11:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-06-05 08:30'
  },
  {
    id: 'apt-2026-06-02',
    bookingCode: 'JS-20260615-02',
    patientId: 'user-pat-16',
    patientName: 'Tiara Maharani',
    patientEmail: 'tiara.maharani@corporate.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-06-15',
    startTime: '13:00',
    endTime: '14:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-06-12 11:20'
  },
  {
    id: 'apt-2026-06-03',
    bookingCode: 'JS-20260622-03',
    patientId: 'user-pat-17',
    patientName: 'Yoga Prasetyo',
    patientEmail: 'yoga.prasetyo@analytics.net',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-06-22',
    startTime: '15:00',
    endTime: '16:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-06-19 14:00'
  },
  {
    id: 'apt-2026-06-04',
    bookingCode: 'JS-20260627-04',
    patientId: 'user-pat-18',
    patientName: 'Melati Kusuma',
    patientEmail: 'melati.kusuma@pasca.ac.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-06-27',
    startTime: '11:00',
    endTime: '12:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lily Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-06-24 16:45'
  },

  // Juli 2026
  {
    id: 'apt-2026-07-01',
    bookingCode: 'JS-20260706-01',
    patientId: 'user-pat-19',
    patientName: 'Fajar Ramadhan',
    patientEmail: 'fajar.ramadhan@people.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-07-06',
    startTime: '09:00',
    endTime: '10:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-07-03 10:15'
  },
  {
    id: 'apt-2026-07-02',
    bookingCode: 'JS-20260713-02',
    patientId: 'user-pat-20',
    patientName: 'Gita Savitri',
    patientEmail: 'gita.savitri@agency.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-07-13',
    startTime: '14:00',
    endTime: '15:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-07-10 13:40'
  },
  {
    id: 'apt-2026-07-03',
    bookingCode: 'JS-20260720-03',
    patientId: 'user-pat-9',
    patientName: 'Hendro Wijaya',
    patientEmail: 'hendro.wijaya@tech.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-07-20',
    startTime: '11:00',
    endTime: '12:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Teratai Lt. 1',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-07-17 15:30'
  },
  {
    id: 'apt-2026-07-04',
    bookingCode: 'JS-20260724-04',
    patientId: 'user-pat-10',
    patientName: 'Maya Kartini',
    patientEmail: 'maya.kartini@agency.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-07-24',
    startTime: '15:30',
    endTime: '16:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-07-21 09:10'
  },

  // Agustus 2026
  {
    id: 'apt-2026-08-01',
    bookingCode: 'JS-20260804-01',
    patientId: 'user-pat-11',
    patientName: 'Reza Fahrezi',
    patientEmail: 'reza.fahrezi@fintech.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-08-04',
    startTime: '10:00',
    endTime: '11:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-08-01 11:00'
  },
  {
    id: 'apt-2026-08-02',
    bookingCode: 'JS-20260811-02',
    patientId: 'user-pat-12',
    patientName: 'Nadya Stephanie',
    patientEmail: 'nadya.dental@clinic.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-08-11',
    startTime: '13:00',
    endTime: '14:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-08-08 14:20'
  },
  {
    id: 'apt-2026-08-03',
    bookingCode: 'JS-20260818-03',
    patientId: 'user-pat-13',
    patientName: 'Farhan Pratama',
    patientEmail: 'farhan.pratama@mail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-08-18',
    startTime: '14:00',
    endTime: '15:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-08-15 16:30'
  },
  {
    id: 'apt-2026-08-04',
    bookingCode: 'JS-20260822-04',
    patientId: 'user-pat-14',
    patientName: 'Dewi Lestari',
    patientEmail: 'dewi.lestari@advisory.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-08-22',
    startTime: '16:00',
    endTime: '17:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lily Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-08-19 12:00'
  },
  {
    id: 'apt-2026-08-05',
    bookingCode: 'JS-20260828-05',
    patientId: 'user-pat-15',
    patientName: 'Aditya Nugroho',
    patientEmail: 'aditya.nugroho@retail.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-08-28',
    startTime: '10:00',
    endTime: '11:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-08-25 09:45'
  },

  // September 2026 (Variasi Status Pembayaran & Reservasi Tambahan)
  {
    id: 'apt-2026-09-10',
    bookingCode: 'JS-20260918-10',
    patientId: 'user-pat-16',
    patientName: 'Tiara Maharani',
    patientEmail: 'tiara.maharani@corporate.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-18',
    startTime: '11:00',
    endTime: '12:00',
    status: 'CONFIRMED',
    paymentStatus: 'DP_PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-15 10:00'
  },
  {
    id: 'apt-2026-09-11',
    bookingCode: 'JS-20260919-11',
    patientId: 'user-pat-17',
    patientName: 'Yoga Prasetyo',
    patientEmail: 'yoga.prasetyo@analytics.net',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-09-19',
    startTime: '14:00',
    endTime: '15:30',
    status: 'CONFIRMED',
    paymentStatus: 'DP_PAID',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-16 11:30'
  },
  {
    id: 'apt-2026-09-12',
    bookingCode: 'JS-20260920-12',
    patientId: 'user-pat-18',
    patientName: 'Melati Kusuma',
    patientEmail: 'melati.kusuma@pasca.ac.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-20',
    startTime: '15:00',
    endTime: '16:00',
    status: 'PENDING',
    paymentStatus: 'DP_PENDING_VERIFICATION',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-17 09:15'
  },
  {
    id: 'apt-2026-09-13',
    bookingCode: 'JS-20260922-13',
    patientId: 'user-pat-19',
    patientName: 'Fajar Ramadhan',
    patientEmail: 'fajar.ramadhan@people.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-09-22',
    startTime: '10:00',
    endTime: '11:00',
    status: 'CANCELLED',
    paymentStatus: 'REFUNDED',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Teratai Lt. 1',
    hasIntakeForm: true,
    hasTestResult: false,
    createdAt: '2026-09-15 14:00'
  },

  // Oktober 2026
  {
    id: 'apt-2026-10-01',
    bookingCode: 'JS-20261002-01',
    patientId: 'user-pat-20',
    patientName: 'Gita Savitri',
    patientEmail: 'gita.savitri@agency.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-10-02',
    startTime: '09:00',
    endTime: '10:00',
    status: 'CONFIRMED',
    paymentStatus: 'DP_PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lavender Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-29 10:20'
  },
  {
    id: 'apt-2026-10-02',
    bookingCode: 'JS-20261005-02',
    patientId: 'user-pat-9',
    patientName: 'Hendro Wijaya',
    patientEmail: 'hendro.wijaya@tech.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-offline-1',
    packageName: 'Sesi Tatap Muka (Offline di Klinik)',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-10-05',
    startTime: '13:00',
    endTime: '14:00',
    status: 'CONFIRMED',
    paymentStatus: 'DP_PAID',
    totalAmount: 375000,
    meetingLocation: 'Klinik Ruang Magnolia Lt. 3',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-30 14:15'
  },
  {
    id: 'apt-2026-10-03',
    bookingCode: 'JS-20261008-03',
    patientId: 'user-pat-10',
    patientName: 'Maya Kartini',
    patientEmail: 'maya.kartini@agency.com',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-bundling-1',
    packageName: 'Paket Bundling: Konsultasi + Tes Asesmen',
    packageType: 'BUNDLING_ASSESSMENT',
    date: '2026-10-08',
    startTime: '15:00',
    endTime: '16:30',
    status: 'PENDING',
    paymentStatus: 'PENDING',
    totalAmount: 490000,
    meetingLocation: 'Klinik Ruang Cempaka Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-10-01 09:30'
  },
  {
    id: 'apt-2026-10-04',
    bookingCode: 'JS-20261012-04',
    patientId: 'user-pat-11',
    patientName: 'Reza Fahrezi',
    patientEmail: 'reza.fahrezi@fintech.co.id',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    packageId: 'pkg-regular-1',
    packageName: 'Sesi Konsultasi Reguler',
    packageType: 'OFFLINE_CLINIC',
    date: '2026-10-12',
    startTime: '16:00',
    endTime: '17:00',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Klinik Ruang Lily Lt. 2',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-10-01 11:00'
  }
];

// CLINICAL NOTES (SOAP FORMAT) PRE-POPULATED
export const INITIAL_CLINICAL_NOTES: Record<string, ClinicalNote> = {
  'note-1': {
    id: 'note-1',
    appointmentId: 'apt-active-1',
    patientId: 'user-pat-1',
    psychologistId: 'user-psy-1',
    sessionDate: '2026-09-16',
    subjective: 'Klien (31 thn, Lead Software Engineer) mengeluhkan sensasi sesak dada dan ketegangan otot leher setiap pagi hari menjelang jam kerja. Merasa cemas berlebihan akan penilaian direksi dan performa sprint.',
    objective: 'Respons sesi kooperatif, artikulatif. Klien menyadari pola pikir catastrophizing (overthinking). Hasil tes DASS-21 kecemasan skala sedang (skor 11). Tidak ada riwayat penggunaan zat atau gejala psikotik.',
    assessment: 'Diagnosis kerja: F41.1 Generalized Anxiety Disorder (derajat sedang) yang dieksaserbasi oleh stres beban kerja berlebih (workplace burnout).',
    plan: '1. Psikoedukasi fisiologis respons cemas (fight-or-flight).\n2. Latihan teknik pernapasan diafragma 4-7-8 untuk grounding.\n3. Thought record journaling untuk menangkap pikiran otomatis negatif.\n4. Rencana sesi lanjutan 1 minggu ke depan.',
    prognosis: 'Baik',
    requiresPsychiatristReferral: false,
    createdAt: '2026-09-16 11:25',
    updatedAt: '2026-09-16 11:25'
  },
  'note-past-1': {
    id: 'note-past-1',
    appointmentId: 'apt-past-1',
    patientId: 'user-pat-2',
    psychologistId: 'user-psy-1',
    sessionDate: '2026-09-05',
    subjective: 'Klien (26 thn, UI/UX Designer) mengeluhkan kesulitan memulai tidur (sleep-onset insomnia) berdurasi >2 jam selama 2 bulan. Mengalami racing thoughts dan overthinking masa depan.',
    objective: 'Afek cemas ringan, kontak mata baik pada sesi tatap muka. Klien tampak lelah secara fisik. Skor DASS-21 kecemasan 8 (ringan).',
    assessment: 'G47.0 Insomnia Non-organik sekunder terhadap kebiasaan nocturnal overthinking dan higienitas tidur yang terganggu.',
    plan: '1. Intervensi Sleep Hygiene & Stimulus Control (kasur hanya untuk tidur).\n2. Pembatasan layar gadget (screen time) 60 menit sebelum waktu tidur.\n3. Teknik progressive muscle relaxation (PMR).',
    prognosis: 'Baik',
    requiresPsychiatristReferral: false,
    createdAt: '2026-09-05 15:35',
    updatedAt: '2026-09-05 15:35'
  },
  'note-past-2': {
    id: 'note-past-2',
    appointmentId: 'apt-past-2',
    patientId: 'user-pat-3',
    psychologistId: 'user-psy-1',
    sessionDate: '2026-09-10',
    subjective: 'Klien (23 thn, Mahasiswa Akhir) merasa kehilangan motivasi untuk menyelesaikan tugas akhir skripsi. Menghabiskan sebagian besar waktu mengurung diri di kamar kos.',
    objective: 'Afek datar, respons lambat namun kooperatif. Skor DASS-21 depresi 14 (sedang-berat).',
    assessment: 'F32.0 Episode Depresif Ringan-Sedang dipicu oleh kebuntuan akademis dan distres penundaan (prokrastinasi kronis).',
    plan: '1. Behavioral Activation: Jadwalkan aktivitas non-akademis yang menyenangkan 1 jam per hari.\n2. Pemecahan tugas skripsi menjadi unit mikro 15 menit.\n3. Evaluasi sesi 2 minggu lagi.',
    prognosis: 'Perlu Pemantauan',
    requiresPsychiatristReferral: false,
    createdAt: '2026-09-10 17:15',
    updatedAt: '2026-09-10 17:15'
  }
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    appointmentId: 'apt-past-1',
    patientId: 'user-pat-2',
    patientName: 'Siti Amanda',
    isAnonymous: true,
    anonymousAlias: 'Klien Desainer (Anonim)',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'dr. Sarah sangat hangat, sabar, dan tidak menghakimi sama sekali. Metode stimulus control yang diajarkan membuat saya bisa tidur jauh lebih tenang tanpa rasa cemas yang menghantui. Sangat direkomendasikan!',
    isApproved: true,
    createdAt: '2026-09-06'
  },
  {
    id: 'rev-2',
    appointmentId: 'apt-past-2',
    patientId: 'user-pat-3',
    patientName: 'Dimas Pratama',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Sangat membantu saya yang tadinya merasa buntu dan malu karena skripsi terbengkalai. Bu Sarah mendengarkan tanpa memojokkan dan membantu menyusun target harian yang realistis.',
    isApproved: true,
    createdAt: '2026-09-11'
  },
  {
    id: 'rev-3',
    appointmentId: 'apt-past-3',
    patientId: 'user-pat-4',
    patientName: 'Rina Kartika',
    isAnonymous: true,
    anonymousAlias: 'Klien Profesional (Anonim)',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Fasilitas klinik di Senopati sangat nyaman dan tenang. Privasi terjaga dengan baik. Penjelasan hasil tes asesmen juga sangat detail membuka mata saya tentang akar rasa cemas saya.',
    isApproved: true,
    createdAt: '2026-08-15'
  },
  // PENDING REVIEWS READY FOR ADMIN MODERATION
  {
    id: 'rev-pending-1',
    appointmentId: 'apt-past-4',
    patientId: 'user-pat-5',
    patientName: 'Taufik Hidayat',
    isAnonymous: true,
    anonymousAlias: 'Klien Anonim',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Sesi konsultasi sangat tepat waktu. Psikolog merespons dengan tenang dan memberi latihan pernapasan yang langsung meredakan panik saya saat itu juga.',
    isApproved: false, // Pending moderation
    createdAt: '2026-09-15'
  },
  {
    id: 'rev-pending-2',
    appointmentId: 'apt-past-5',
    patientId: 'user-pat-6',
    patientName: 'Anindya Putri',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 4,
    comment: 'Konseling tatap muka sangat berbobot, klinik sangat rapi. Akan menjadwalkan sesi tindak lanjut.',
    isApproved: false, // Pending moderation
    createdAt: '2026-09-15'
  },
  {
    id: 'rev-eval-1',
    appointmentId: 'apt-past-6',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 4,
    comment: 'Penjelasan teori dan latihan pernapasan cukup bagus. Sesi terasa hangat dan terarah menuju solusi.',
    isApproved: true,
    createdAt: '2026-09-08'
  },
  {
    id: 'rev-top-1',
    appointmentId: 'apt-past-7',
    patientId: 'user-pat-2',
    patientName: 'Siti Amanda',
    isAnonymous: true,
    anonymousAlias: 'Klien Anonim',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Luar biasa! Pendekatan CBT & mindfulness yang dilakukan dr. Sarah sangat membantu meredakan kecemasan dan insomnia saya. Sangat profesional dan menenangkan.',
    isApproved: true,
    createdAt: '2026-09-12'
  },
  {
    id: 'rev-extra-1',
    appointmentId: 'apt-past-3',
    patientId: 'user-pat-4',
    patientName: 'Rina Kartika',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Sangat terbantu dengan sesi tatap muka bersama dr. Sarah di Senopati. Beliau memberikan panduan restrukturisasi kognitif yang sangat aplikatif untuk kecemasan karier saya.',
    isApproved: true,
    createdAt: '2026-09-06'
  },
  {
    id: 'rev-extra-2',
    appointmentId: 'apt-past-7',
    patientId: 'user-pat-6',
    patientName: 'Anindya Putri',
    isAnonymous: true,
    anonymousAlias: 'Ibu Muda Bahagia',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Dokter Sarah sangat hangat dan penuh penerimaan. Pendampingan psikologi pasca-melahirkan yang beliau berikan sungguh menjadi penyelamat kesehatan mental saya.',
    isApproved: true,
    createdAt: '2026-09-14'
  },
  {
    id: 'rev-extra-3',
    appointmentId: 'apt-past-8',
    patientId: 'user-pat-7',
    patientName: 'Bagas Wicaksono',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 4,
    comment: 'Sesi mindfulness berjalan sangat kondusif. Teknik grounding 5-4-3-2-1 yang diajarkan dr. Sarah langsung saya pakai saat mulai overthinking.',
    isApproved: true,
    createdAt: '2026-09-15'
  },
  {
    id: 'rev-extra-4',
    appointmentId: 'apt-past-9',
    patientId: 'user-pat-3',
    patientName: 'Dimas Pratama',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Bu Sarah selalu menjadi tempat pulang yang menenangkan ketika pikiran sedang kusut. Sangat empatis dan solutif!',
    isApproved: true,
    createdAt: '2026-09-11'
  },
  {
    id: 'rev-extra-5',
    appointmentId: 'apt-past-10',
    patientId: 'user-pat-5',
    patientName: 'Taufik Hidayat',
    isAnonymous: true,
    anonymousAlias: 'Klien Anonim',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 4,
    comment: 'Meskipun awalnya agak canggung, sesi kedua berjalan jauh lebih baik. Bu Sarah memberikan framework pemecahan masalah yang jelas.',
    isApproved: false,
    createdAt: '2026-09-16'
  },
  {
    id: 'rev-extra-6',
    appointmentId: 'apt-past-11',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    isAnonymous: true,
    anonymousAlias: 'Software Engineer',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Pelayanan prima. Penjadwalan mudah dan sesi konseling privat sangat membuka perspektif baru dalam menghadapi burnout.',
    isApproved: true,
    createdAt: '2026-09-16'
  },
  {
    id: 'rev-extra-7',
    appointmentId: 'apt-2026-06-01',
    patientId: 'user-pat-15',
    patientName: 'Aditya Nugroho',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'dr. Sarah sangat cermat mengidentifikasi kaitan antara stres omset bisnis dan penyakit GERD saya. Latihan grounding diafragma sangat aplikatif.',
    isApproved: true,
    createdAt: '2026-06-10'
  },
  {
    id: 'rev-extra-8',
    appointmentId: 'apt-2026-06-02',
    patientId: 'user-pat-16',
    patientName: 'Tiara Maharani',
    isAnonymous: true,
    anonymousAlias: 'Legal Corporate (Anonim)',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 4,
    comment: 'Ruang konseling di Senopati sangat tenang dan private. Teknik relaksasi otot progresif membantu meredakan tegang leher dan migrain saya.',
    isApproved: true,
    createdAt: '2026-06-18'
  },
  {
    id: 'rev-extra-9',
    appointmentId: 'apt-2026-07-01',
    patientId: 'user-pat-19',
    patientName: 'Fajar Ramadhan',
    isAnonymous: true,
    anonymousAlias: 'HR Leader',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Sangat melegakan bisa mendiskusikan compassion fatigue secara aman tanpa dihakimi. Saya merasa kembali berdaya memimpin tim.',
    isApproved: true,
    createdAt: '2026-07-08'
  },
  {
    id: 'rev-extra-10',
    appointmentId: 'apt-2026-07-03',
    patientId: 'user-pat-9',
    patientName: 'Hendro Wijaya',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Pendekatan sleep hygiene dan boundary-setting dr. Sarah mengubah kualitas tidur saya yang tadinya berantakan akibat beban sistem IT.',
    isApproved: true,
    createdAt: '2026-07-22'
  },
  {
    id: 'rev-extra-11',
    appointmentId: 'apt-2026-08-01',
    patientId: 'user-pat-11',
    patientName: 'Reza Fahrezi',
    isAnonymous: true,
    anonymousAlias: 'Risk Specialist',
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 4,
    comment: 'Pemeriksaan asesmen DASS-21 sangat akurat menggambarkan kecemasan kerja saya. Sesi berlangsung tepat waktu dan solutif.',
    isApproved: false, // Pending moderation
    createdAt: '2026-08-06'
  },
  {
    id: 'rev-extra-12',
    appointmentId: 'apt-2026-08-02',
    patientId: 'user-pat-12',
    patientName: 'Nadya Stephanie',
    isAnonymous: false,
    psychologistId: 'user-psy-1',
    psychologistName: 'dr. Sarah Jenkins, M.Psi., Psikolog',
    rating: 5,
    comment: 'Sebagai tenaga medis, saya sering merasa harus selalu sempurna. Dokter Sarah mengajarkan self-compassion yang sangat menenteramkan.',
    isApproved: false, // Pending moderation
    createdAt: '2026-08-13'
  }
];

export const INITIAL_LANDING_CMS: LandingPageCmsConfig = {
  heroBadge: 'Booking Konsultasi Psikologi Terjadwal',
  heroTitle: 'Ruang Aman untuk Mendengar, Menyembuhkan, dan Bertumbuh.',
  heroSubtitle: 'Konsultasikan keresahan batin, stres kerja, dan kecemasan Anda secara privat bersama dr. Sarah Jenkins, M.Psi., Psikolog Klinis. Booking dilakukan minimal H+1 dengan pre-test singkat sebelum jadwal dikirim.',
  sliderTitle: 'Jadwal Praktik Terencana',
  sliderSubtitle: 'Pilih jadwal konsultasi mulai besok sesuai ketersediaan psikolog dan kapasitas harian praktik.',
  sliderIntervalSeconds: 4,
  sliderAutoPlay: true,
  clinicName: 'Praktik Mandiri dr. Sarah Jenkins, M.Psi.',
  clinicAddress: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190',
  clinicHours: 'Senin - Sabtu: 08:00 - 21:00 WIB • Minggu: Libur Praktik',
  clinicPhone: '+62 21 5790 1234',
  clinicWhatsapp: '+62 811-2233-4455',
  clinicEmail: 'halo@jiwasehat.id'
};

export const INITIAL_PATIENT_CMS: PatientPageCmsConfig = {
  welcomeBannerTitle: 'Selamat Datang di Ruang Pulih JiwaSehat',
  welcomeBannerSubtitle: 'Langkah pertama mencari bantuan adalah bukti keberanian diri. dr. Sarah Jenkins, M.Psi., Psikolog Klinis siap mendampingi perjalanan pemulihan emosional Anda.',
  dailyMentalHealthTip: 'Saat pikiran cemas mulai berkejaran (racing thoughts), letakkan kedua telapak kaki di lantai dan bernapaslah dengan teknik 4-7-8 (tarik 4 detik, tahan 7 detik, hembuskan 8 detik).',
  crisisHotlineTitle: 'Layanan Bantuan Krisis & Siaga 24 Jam',
  crisisHotlineNumber: '119 ext 8 (Sejiwa Kemenkes RI)',
  crisisWhatsapp: '+62 811-1929-555',
  crisisNotice: 'Jika Anda atau kerabat sedang mengalami krisis emosional mendalam, serangan panik berat, atau dorongan menyakiti diri, mohon segera hubungi hotline darurat di atas. Layanan ini bebas pulsa 24 jam.',
  announcementText: 'Pemberitahuan: Seluruh data sesi konsultasi klinis privat terlindungi enkripsi end-to-end. Rekam medis Anda hanya dapat diakses secara rahasia oleh dr. Sarah Jenkins.'
};

export const INITIAL_PSYCHOLOGIST_CMS: PsychologistPageCmsConfig = {
  guidelinesTitle: 'Standar Prosedur Operasional (SOP) & Etika Klinis',
  guidelinesContent: 'Sesuai Standar Kode Etik Profesi Psikologi & Regulasi Tenaga Kesehatan RI, psikolog diwajibkan menyelesaikan input Rekam Medis (Catatan SOAP) paling lambat 24 jam setelah sesi konsultasi berakhir. Jaga objektivitas diagnosis, informed consent, dan kerahasiaan penuh rekam medis pasien.',
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



