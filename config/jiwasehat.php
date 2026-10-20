<?php

return [
    'legacy_preview_enabled' => (bool) env('ENABLE_LEGACY_PREVIEW', false),
    // Fallback publik sampai CMS/katalog database diimplementasikan. Tidak ada harga/data pasien.
    'public_practice' => [
        'name' => '[NAMA_PRAKTISI]',
        'title' => 'Psikolog',
        'bio' => 'Profil praktisi akan dilengkapi oleh penanggung jawab praktik.',
        'str_number' => '[NOMOR_STR]',
        'sip_number' => '[NOMOR_SIP]',
        'clinic_name' => 'JiwaSehat',
        'clinic_address' => '[ALAMAT_PRAKTIK]',
        'clinic_hours' => '[JAM_OPERASIONAL]',
        'clinic_phone' => '[TELEPON_PRAKTIK]',
        'clinic_whatsapp' => '[WHATSAPP_PRAKTIK]',
        'clinic_email' => '[EMAIL_PRAKTIK]',
    ],
    'public_packages' => [
        ['COUNSELING_OFFLINE', 'Konsultasi Offline', 'COUNSELING', 60],
        ['COUNSELING_TELE_SERVICE', 'Konsultasi Telelayanan', 'COUNSELING', 60],
        ['COUNSELING_CHILD_ADOLESCENT', 'Konsultasi Anak/Remaja', 'COUNSELING', 60],
        ['COUNSELING_ADULT', 'Konsultasi Dewasa', 'COUNSELING', 60],
        ['COUNSELING_COUPLE_FAMILY', 'Konsultasi Pasangan/Keluarga', 'COUNSELING', 60],
        ['ASSESSMENT_BASIC', 'Asesmen Psikologis Dasar', 'ASSESSMENT', null],
        ['ASSESSMENT_FULL', 'Asesmen Psikologis Lengkap', 'ASSESSMENT', 240],
        ['ASSESSMENT_INTELLIGENCE', 'Tes Inteligensi/IQ', 'ASSESSMENT', null],
        ['ASSESSMENT_PERSONALITY_STANDARD', 'Tes Kepribadian Standar', 'ASSESSMENT', null],
        ['ASSESSMENT_PERSONALITY_FULL', 'Tes Kepribadian Lengkap', 'ASSESSMENT', null],
        ['ASSESSMENT_CHILD_ADOLESCENT_STANDARD', 'Asesmen Anak/Remaja Standar', 'ASSESSMENT', null],
        ['ASSESSMENT_CHILD_ADOLESCENT_FULL', 'Asesmen Anak/Remaja Lengkap', 'ASSESSMENT', null],
        ['ASSESSMENT_ADULT_STANDARD', 'Asesmen Dewasa Standar', 'ASSESSMENT', null],
        ['ASSESSMENT_ADULT_FULL', 'Asesmen Dewasa Lengkap', 'ASSESSMENT', null],
        ['PSYCHOTHERAPY_SESSION', 'Psikoterapi per sesi', 'PSYCHOTHERAPY', null],
    ],
];
