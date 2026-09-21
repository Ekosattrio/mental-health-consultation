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
  ChatMessage,
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
    id: 'user-psy-2',
    email: 'dr.adrian@jiwasehat.id',
    name: 'Dr. Adrian Pratama, M.Psi., Psikolog',
    role: 'PSYCHOLOGIST',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0811-6677-8899',
    isVerified: true,
    createdAt: '2026-02-01'
  },
  {
    id: 'user-psy-3',
    email: 'maya.wulandari@jiwasehat.id',
    name: 'Maya Wulandari, M.Psi., Psikolog',
    role: 'PSYCHOLOGIST',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    status: 'PENDING_VERIFICATION',
    phone: '0812-7788-9900',
    isVerified: false,
    createdAt: '2026-09-10'
  },
  {
    id: 'user-psy-4',
    email: 'dimas.raditya@jiwasehat.id',
    name: 'dr. Dimas Raditya, M.Psi., Psikolog',
    role: 'PSYCHOLOGIST',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0812-4455-6677',
    isVerified: true,
    createdAt: '2026-03-12'
  },
  {
    id: 'user-psy-5',
    email: 'nabila.putri@jiwasehat.id',
    name: 'Nabila Putri, M.Psi., Psikolog',
    role: 'PSYCHOLOGIST',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '0813-2211-4433',
    isVerified: true,
    createdAt: '2026-04-05'
  },
  {
    id: 'user-adm-1',
    email: 'admin@jiwasehat.id',
    name: 'Super Admin JiwaSehat',
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
    experienceYears: 8,
    bio: 'Berpengalaman lebih dari 8 tahun mendampingi pasien dengan gangguan kecemasan (anxiety), depresi ringan-sedang, trauma masa lalu, dan krisis karier. Menggunakan pendekatan Cognitive Behavioral Therapy (CBT) dan Acceptance & Commitment Therapy (ACT) yang hangat, solutif, dan berbasis bukti klinis.',
    specialties: ['Anxiety & Panic Attack', 'Depresi & Burnout', 'Relationship & Family', 'Self-Esteem'],
    therapyApproaches: ['Cognitive Behavioral Therapy (CBT)', 'Acceptance & Commitment (ACT)', 'Mindfulness-Based Stress Reduction'],
    rating: 4.9,
    reviewCount: 168,
    consultationFeeOnline: 250000,
    consultationFeeOffline: 350000,
    languages: ['Bahasa Indonesia', 'English'],
    clinicAddress: 'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    isAvailableToday: true,
    education: ['S1 Fakultas Psikologi Universitas Indonesia (Cum Laude)', 'S2 Magister Psikologi Profesi Klinis Dewasa UI'],
    strExpiry: '2028-12-31',
    sipExpiry: '2027-06-30',
    clinicalHours: 2450,
    practicePolicy: 'Menjunjung tinggi standar etika kerahasiaan Kode Etik Psikologi Indonesia (HIMPSI). Seluruh informasi sesi dilindungi kerahasiaan medis, non-judgmental, dan berbasis informed consent.'
  },
  {
    userId: 'user-psy-2',
    title: 'Psikolog Klinis & Spesialis Stres Kerja / Karier',
    strNumber: 'STR-PSI-2019-11409',
    sipNumber: 'SIP.503/077-DPMPTSP/2020',
    experienceYears: 11,
    bio: 'Fokus pada manajemen stres profesional, krisis eksistensial, quarter-life crisis, trauma masa kecil, serta gangguan tidur/insomnia. Berkomitmen menciptakan ruang aman yang bebas dari penghakiman (judgement-free zone).',
    specialties: ['Workplace Burnout & Stress', 'Krisis Eksistensial', 'Trauma & Grief', 'Gangguan Tidur & Psikosomatis'],
    therapyApproaches: ['Humanistic Psychotherapy', 'Solution-Focused Brief Therapy (SFBT)', 'Compassion-Focused Therapy'],
    rating: 4.8,
    reviewCount: 112,
    consultationFeeOnline: 275000,
    consultationFeeOffline: 375000,
    languages: ['Bahasa Indonesia', 'English', 'Jawa'],
    clinicAddress: 'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    isAvailableToday: true,
    education: ['S1 Psikologi Universitas Gadjah Mada (UGM)', 'S2 Magister Psikologi Profesi Klinis UGM'],
    strExpiry: '2029-05-15',
    sipExpiry: '2028-02-28',
    clinicalHours: 3800,
    practicePolicy: 'Menyediakan ruang konseling privat yang aman, terstandarisasi etis, dengan pendekatan berbasis bukti ilmiah dan pemberdayaan individu.'
  },
  {
    userId: 'user-psy-3',
    title: 'Psikolog Remaja, Tumbuh Kembang & Emosi',
    strNumber: 'STR-PSI-2023-45120',
    sipNumber: 'SIP.503/118-DPMPTSP/2024',
    experienceYears: 4,
    bio: 'Menangani permasalahan emosi remaja, regulasi diri, motivasi belajar, tantrum, serta komunikasi orang tua dan anak. Menekankan terapi bermain terstruktur dan psikoedukasi keluarga.',
    specialties: ['Parenting & Pola Asuh', 'Kecemasan Remaja', 'Regulasi Emosi', 'Dukungan Perkembangan'],
    therapyApproaches: ['Play Therapy', 'CBT Remaja', 'Family Systems Therapy'],
    rating: 4.1,
    reviewCount: 32,
    consultationFeeOnline: 225000,
    consultationFeeOffline: 320000,
    languages: ['Bahasa Indonesia'],
    clinicAddress: 'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    isAvailableToday: false
  },
  {
    userId: 'user-psy-4',
    title: 'Psikolog Klinis Dewasa & Trauma Recovery',
    strNumber: 'STR-PSI-2020-33291',
    sipNumber: 'SIP.503/209-DPMPTSP/2021',
    experienceYears: 7,
    bio: 'Berpengalaman menangani trauma masa kecil, PTSD, kecemasan sosial, dan masalah kepercayaan diri. Menerapkan pendekatan EMDR dan Somatic Experiencing yang holistik dan menenangkan.',
    specialties: ['Trauma & PTSD', 'Kecemasan Sosial', 'Panic Attack', 'Self-Esteem'],
    therapyApproaches: ['Eye Movement Desensitization (EMDR)', 'Somatic Experiencing', 'CBT'],
    rating: 4.9,
    reviewCount: 94,
    consultationFeeOnline: 260000,
    consultationFeeOffline: 360000,
    languages: ['Bahasa Indonesia', 'English'],
    clinicAddress: 'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    isAvailableToday: true
  },
  {
    userId: 'user-psy-5',
    title: 'Psikolog Klinis Hubungan & Krisis Emosional',
    strNumber: 'STR-PSI-2022-77104',
    sipNumber: 'SIP.503/301-DPMPTSP/2023',
    experienceYears: 5,
    bio: 'Membantu klien menghadapi konflik relasi, perceraian, quarter-life crisis, dan overthinking kronis. Mengedepankan ruang bicara yang suportif, validatif, dan terarah menuju solusi.',
    specialties: ['Relationship & Family', 'Overthinking & Stres', 'Quarter-Life Crisis', 'Regulasi Emosi'],
    therapyApproaches: ['Emotion-Focused Therapy (EFT)', 'Mindfulness-Based CBT', 'SFBT'],
    rating: 4.8,
    reviewCount: 76,
    consultationFeeOnline: 240000,
    consultationFeeOffline: 340000,
    languages: ['Bahasa Indonesia'],
    clinicAddress: 'JiwaSehat Clinic Center, Lt. 3, Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
    isAvailableToday: true
  }
];

export const INITIAL_PACKAGES: ConsultationPackage[] = [
  {
    id: 'pkg-chat-1',
    name: 'Sesi Konsultasi Online (Chat Privat)',
    type: 'ONLINE_CHAT',
    durationMinutes: 60,
    price: 250000,
    badge: 'Paling Populer',
    description: 'Konsultasi real-time melalui ruang chat terenkripsi end-to-end dengan psikolog berizin. Nyaman, fleksibel, dan terhubung langsung dari ponsel/laptop.',
    benefits: [
      'Durasi interaktif 60 menit dengan timer klinis',
      'Ruang privat 1-on-1 terenkripsi',
      'Ringkasan insight & saran pasca-sesi dari psikolog',
      'Fleksibel dari mana saja tanpa perlu keluar rumah'
    ],
    isActive: true,
    iconName: 'MessageSquare'
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
      'Sesi konsultasi 90 menit (Online/Offline) bedah hasil',
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

  // Dr. Adrian Pratama (user-psy-2)
  { id: 'slot-9', psychologistId: 'user-psy-2', date: '2026-09-16', startTime: '11:00', endTime: '12:00', isAvailable: true, isBooked: false },
  { id: 'slot-10', psychologistId: 'user-psy-2', date: '2026-09-16', startTime: '14:00', endTime: '15:00', isAvailable: true, isBooked: false },
  { id: 'slot-11', psychologistId: 'user-psy-2', date: '2026-09-17', startTime: '09:00', endTime: '10:00', isAvailable: true, isBooked: false },
  { id: 'slot-12', psychologistId: 'user-psy-2', date: '2026-09-17', startTime: '13:00', endTime: '14:00', isAvailable: false, isBooked: true, appointmentId: 'apt-pending-1' }
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
    packageId: 'pkg-chat-1',
    packageName: 'Sesi Konsultasi Online (Chat Privat)',
    packageType: 'ONLINE_CHAT',
    date: '2026-09-16',
    startTime: '10:30',
    endTime: '11:30',
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Room-Live-JS01',
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
  // 3. Pending Offline Appointment (Budi Santoso & Dr. Adrian)
  {
    id: 'apt-pending-1',
    bookingCode: 'JS-20260917-04',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    patientEmail: 'budi.santoso@gmail.com',
    psychologistId: 'user-psy-2',
    psychologistName: 'Dr. Adrian Pratama, M.Psi., Psikolog',
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
    packageId: 'pkg-chat-1',
    packageName: 'Sesi Konsultasi Online (Chat Privat)',
    packageType: 'ONLINE_CHAT',
    date: '2026-09-10',
    startTime: '16:00',
    endTime: '17:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Room-Live-JS02',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-08 18:00',
    clinicalNotesId: 'note-past-2'
  },
  // 5. Completed Offline Appointment (Dr. Adrian Pratama)
  {
    id: 'apt-past-3',
    bookingCode: 'JS-20260904-03',
    patientId: 'user-pat-4',
    patientName: 'Rina Kartika',
    patientEmail: 'rina.kartika@office.co.id',
    psychologistId: 'user-psy-2',
    psychologistName: 'Dr. Adrian Pratama, M.Psi., Psikolog',
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
  // 6. Completed Online Consultation (Dr. Adrian Pratama)
  {
    id: 'apt-past-4',
    bookingCode: 'JS-20260911-05',
    patientId: 'user-pat-5',
    patientName: 'Taufik Hidayat',
    patientEmail: 'taufik.hidayat@gmail.com',
    psychologistId: 'user-psy-2',
    psychologistName: 'Dr. Adrian Pratama, M.Psi., Psikolog',
    packageId: 'pkg-chat-1',
    packageName: 'Sesi Konsultasi Online (Chat Privat)',
    packageType: 'ONLINE_CHAT',
    date: '2026-09-11',
    startTime: '14:00',
    endTime: '15:00',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Room-Live-JS03',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-09 11:30'
  },
  // 7. Completed Assessment Bundling (dr. Nadira Utami)
  {
    id: 'apt-past-5',
    bookingCode: 'JS-20260907-06',
    patientId: 'user-pat-2',
    patientName: 'Siti Amanda',
    patientEmail: 'siti.amanda@outlook.com',
    psychologistId: 'user-psy-4',
    psychologistName: 'dr. Nadira Utami, M.Psi., Psikolog',
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
  // 8. Completed Online Chat (Farhan Wicaksono)
  {
    id: 'apt-past-6',
    bookingCode: 'JS-20260908-07',
    patientId: 'user-pat-1',
    patientName: 'Budi Santoso',
    patientEmail: 'budi.santoso@gmail.com',
    psychologistId: 'user-psy-3',
    psychologistName: 'Farhan Wicaksono, M.Psi., Psikolog',
    packageId: 'pkg-chat-1',
    packageName: 'Sesi Konsultasi Online (Chat Privat)',
    packageType: 'ONLINE_CHAT',
    date: '2026-09-08',
    startTime: '15:30',
    endTime: '16:30',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    totalAmount: 250000,
    meetingLocation: 'Room-Live-JS04',
    hasIntakeForm: true,
    hasTestResult: true,
    createdAt: '2026-09-05 10:20',
    reviewId: 'rev-eval-1'
  },
  // 9. Completed Offline Consultation (dr. Maya Anggraini)
  {
    id: 'apt-past-7',
    bookingCode: 'JS-20260913-08',
    patientId: 'user-pat-6',
    patientName: 'Anindya Putri',
    patientEmail: 'anindya.putri@gmail.com',
    psychologistId: 'user-psy-5',
    psychologistName: 'dr. Maya Anggraini, M.Psi., Psikolog',
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
  }
];

// REALTIME CHAT CONVERSATION HISTORY
export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'apt-active-1': [
    {
      id: 'msg-1',
      appointmentId: 'apt-active-1',
      senderId: 'system',
      senderRole: 'SYSTEM',
      senderName: 'Sistem JiwaSehat',
      text: 'Sesi konsultasi terenkripsi telah dimulai. Waktu sesi Anda adalah 60 menit. Seluruh percakapan dijamin kerahasiaannya di bawah Kode Etik HIMPSI.',
      timestamp: '10:30'
    },
    {
      id: 'msg-2',
      appointmentId: 'apt-active-1',
      senderId: 'user-psy-1',
      senderRole: 'PSYCHOLOGIST',
      senderName: 'dr. Sarah Jenkins, M.Psi.',
      text: 'Halo Mas Budi, selamat pagi. Saya dr. Sarah Jenkins yang mendampingi sesi Anda hari ini. Bagaimana kabar dan perasaan Anda pagi ini?',
      timestamp: '10:31'
    },
    {
      id: 'msg-3',
      appointmentId: 'apt-active-1',
      senderId: 'user-pat-1',
      senderRole: 'PATIENT',
      senderName: 'Budi Santoso',
      text: 'Pagi Bu Sarah. Sejujurnya agak tegang dan sedikit sesak sejak bangun tadi pagi, karena ada tekanan rilis produk di kantor yang menumpuk.',
      timestamp: '10:32'
    },
    {
      id: 'msg-4',
      appointmentId: 'apt-active-1',
      senderId: 'user-psy-1',
      senderRole: 'PSYCHOLOGIST',
      senderName: 'dr. Sarah Jenkins, M.Psi.',
      text: 'Terima kasih sudah mau berbagi dengan jujur, Mas Budi. Ketegangan itu sangat manusiawi saat beban kerja meningkat. Mari kita ambil napas perlahan bersama. Bisakah diceritakan apa yang paling Anda khawatirkan saat sensasi sesak itu muncul?',
      timestamp: '10:33'
    },
    {
      id: 'msg-5',
      appointmentId: 'apt-active-1',
      senderId: 'user-pat-1',
      senderRole: 'PATIENT',
      senderName: 'Budi Santoso',
      text: 'Saya takut tiba-tiba nge-blank saat presentasi di depan direksi besok lusa. Rasanya jantung berdegup kencang dan pikiran tidak bisa diajak fokus.',
      timestamp: '10:34'
    }
  ]
};

// CLINICAL NOTES (SOAP FORMAT) PRE-POPULATED
export const INITIAL_CLINICAL_NOTES: Record<string, ClinicalNote> = {
  'note-1': {
    id: 'note-1',
    appointmentId: 'apt-active-1',
    patientId: 'user-pat-1',
    psychologistId: 'user-psy-1',
    sessionDate: '2026-09-16',
    subjective: 'Klien (31 thn, Lead Software Engineer) mengeluhkan sensasi sesak dada dan ketegangan otot leher setiap pagi hari menjelang jam kerja. Merasa cemas berlebihan akan penilaian direksi dan performa sprint.',
    objective: 'Respons chat kooperatif, artikulatif. Klien menyadari pola pikir catastrophizing (overthinking). Hasil tes DASS-21 kecemasan skala sedang (skor 11). Tidak ada riwayat penggunaan zat atau gejala psikotik.',
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
    psychologistId: 'user-psy-2',
    psychologistName: 'Dr. Adrian Pratama, M.Psi., Psikolog',
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
    comment: 'Sesi online chat sangat tepat waktu. Psikolog merespons dengan cepat dan memberi latihan pernapasan yang langsung meredakan panik saya saat itu juga.',
    isApproved: false, // Pending moderation
    createdAt: '2026-09-15'
  },
  {
    id: 'rev-pending-2',
    appointmentId: 'apt-past-5',
    patientId: 'user-pat-6',
    patientName: 'Anindya Putri',
    isAnonymous: false,
    psychologistId: 'user-psy-2',
    psychologistName: 'Dr. Adrian Pratama, M.Psi., Psikolog',
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
    psychologistId: 'user-psy-3',
    psychologistName: 'Farhan Wicaksono, M.Psi., Psikolog',
    rating: 3,
    comment: 'Penjelasan teori cukup bagus, tapi sesi terasa agak terburu-buru dan psikolog beberapa kali memotong pembicaraan. Perlu lebih sabar mendengarkan keluhan klien.',
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
    psychologistId: 'user-psy-4',
    psychologistName: 'dr. Nadira Utami, M.Psi., Psikolog',
    rating: 5,
    comment: 'Luar biasa! Pendekatan EMDR yang dilakukan dr. Nadira sangat membantu meredakan trauma masa kecil saya yang sudah menahun. Sangat profesional dan menenangkan.',
    isApproved: true,
    createdAt: '2026-09-12'
  },
  {
    id: 'rev-extra-1',
    appointmentId: 'apt-past-3',
    patientId: 'user-pat-4',
    patientName: 'Rina Kartika',
    isAnonymous: false,
    psychologistId: 'user-psy-2',
    psychologistName: 'Dr. Adrian Pratama, M.Psi., Psikolog',
    rating: 5,
    comment: 'Sangat terbantu dengan sesi tatap muka bersama Dr. Adrian di Senopati. Beliau memberikan panduan restrukturisasi kognitif yang sangat aplikatif untuk kecemasan karier saya.',
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
    psychologistId: 'user-psy-5',
    psychologistName: 'dr. Maya Anggraini, M.Psi., Psikolog',
    rating: 5,
    comment: 'Dokter Maya sangat hangat dan penuh penerimaan. Pendampingan psikologi pasca-melahirkan yang beliau berikan sungguh menjadi penyelamat kesehatan mental saya.',
    isApproved: true,
    createdAt: '2026-09-14'
  },
  {
    id: 'rev-extra-3',
    appointmentId: 'apt-past-8',
    patientId: 'user-pat-7',
    patientName: 'Bagas Wicaksono',
    isAnonymous: false,
    psychologistId: 'user-psy-6',
    psychologistName: 'Reza Firmansyah, M.Psi., Psikolog',
    rating: 4,
    comment: 'Sesi mindfulness berjalan sangat kondusif. Teknik grounding 5-4-3-2-1 yang diajarkan Mas Reza langsung saya pakai saat mulai overthinking.',
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
    psychologistId: 'user-psy-3',
    psychologistName: 'Farhan Wicaksono, M.Psi., Psikolog',
    rating: 4,
    comment: 'Meskipun awalnya agak canggung, sesi kedua berjalan jauh lebih baik. Pak Farhan memberikan framework pemecahan masalah yang jelas.',
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
    psychologistId: 'user-psy-4',
    psychologistName: 'dr. Nadira Utami, M.Psi., Psikolog',
    rating: 5,
    comment: 'Pelayanan prima. Penjadwalan mudah dan sesi konseling sangat membuka perspektif baru dalam menghadapi burnout.',
    isApproved: true,
    createdAt: '2026-09-16'
  }
];

export const INITIAL_LANDING_CMS: LandingPageCmsConfig = {
  heroBadge: 'Layanan Psikologi Berizin Resmi HIMPSI & Kemenkes RI',
  heroTitle: 'Ruang Aman untuk Mendengar, Menyembuhkan, dan Bertumbuh.',
  heroSubtitle: 'Konsultasikan keresahan batin, stres kerja, dan kecemasan Anda dengan psikolog klinis berlisensi. Pilihan sesi fleksibel via Chat Online privat terenkripsi atau Tatap Muka di klinik Senopati.',
  sliderTitle: 'Psikolog Siap Sedia Hari Ini',
  sliderSubtitle: 'Tenaga psikolog klinis yang siap melayani sesi konsultasi online atau tatap muka hari ini tanpa perlu antre berhari-hari.',
  sliderIntervalSeconds: 4,
  sliderAutoPlay: true,
  clinicName: 'JiwaSehat Clinic Center Senopati',
  clinicAddress: 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190',
  clinicHours: 'Senin - Sabtu: 08:00 - 21:00 WIB • Minggu: 09:00 - 17:00 WIB',
  clinicPhone: '+62 21 5790 1234',
  clinicWhatsapp: '+62 812 3456 7890',
  clinicEmail: 'halo@jiwasehat.id'
};

export const INITIAL_PATIENT_CMS: PatientPageCmsConfig = {
  welcomeBannerTitle: 'Selamat Datang di Ruang Pulih JiwaSehat',
  welcomeBannerSubtitle: 'Langkah pertama mencari bantuan adalah bukti keberanian diri. Psikolog klinis berlisensi kami siap mendampingi perjalanan pemulihan emosional Anda.',
  dailyMentalHealthTip: 'Saat pikiran cemas mulai berkejaran (racing thoughts), letakkan kedua telapak kaki di lantai dan bernapaslah dengan teknik 4-7-8 (tarik 4 detik, tahan 7 detik, hembuskan 8 detik).',
  crisisHotlineTitle: 'Layanan Bantuan Krisis & Siaga 24 Jam',
  crisisHotlineNumber: '119 ext 8 (Sejiwa Kemenkes RI)',
  crisisWhatsapp: '+62 811-1929-555',
  crisisNotice: 'Jika Anda atau kerabat sedang mengalami krisis emosional mendalam, serangan panik berat, atau dorongan menyakiti diri, mohon segera hubungi hotline darurat di atas. Layanan ini bebas pulsa 24 jam.',
  announcementText: 'Pemberitahuan: Seluruh sesi telekonsultasi terlindungi enkripsi end-to-end. Rekam medis Anda hanya dapat diakses oleh psikolog penanggung jawab.'
};

export const INITIAL_PSYCHOLOGIST_CMS: PsychologistPageCmsConfig = {
  guidelinesTitle: 'Standar Prosedur Operasional (SOP) & Etika Klinis',
  guidelinesContent: 'Sesuai Kode Etik Psikologi Indonesia (HIMPSI), psikolog diwajibkan menyelesaikan input Rekam Medis (Catatan SOAP) paling lambat 24 jam setelah sesi konsultasi berakhir. Jaga objektivitas diagnosis dan lakukan eskalasi rujukan psikiater bila terindikasi risiko bahaya.',
  announcementTitle: 'Maklumat Dewan Etik & Supervisi Klinis',
  announcementContent: 'Sesi Peer Clinical Supervision bulanan akan diselenggarakan setiap hari Jumat pekan ketiga. Kehadiran dihitung sebagai bagian dari Continuing Professional Development (CPD).',
  remunerationPolicy: 'Bagi hasil honor sesi konsultasi (80% Psikolog : 20% Klinik) ditransfer setiap tanggal 25 setiap bulannya ke rekening terdaftar.',
  clinicalSupervisorContact: 'Kordinator Klinis: dr. Adrian Pratama, M.Psi. (WA: +62 811-6677-8899)'
};


