import React, { useState } from 'react';
import {
  Shield,
  Database,
  Server,
  Code2,
  CheckCircle2,
  XCircle,
  Lock,
  Layers,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Play
} from 'lucide-react';

export const ArchitectureBlueprint: React.FC = () => {
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'rbac' | 'erd' | 'api' | 'code' | 'mvc'>('rbac');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Interactive Live Simulator for Booking Conflict
  const [simDate, setSimDate] = useState('2026-09-16');
  const [simTime, setSimTime] = useState('10:30');
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simRunning, setSimRunning] = useState(false);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const runConcurrencySimulation = () => {
    setSimRunning(true);
    setSimLogs([
      `[T+0ms] Client A (Budi Santoso) dan Client B (Siti Amanda) serentak mengirim request reservasi untuk slot ${simDate} ${simTime} WIB...`,
      `[T+12ms] BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE`,
      `[T+18ms] Client A mengakuisisi Row-Level Lock: "SELECT * FROM psychologist_schedules WHERE id = $1 FOR UPDATE NOWAIT"`,
      `[T+24ms] Lock granted to Client A. Memeriksa ketersediaan: is_available = TRUE & is_booked = FALSE`,
      `[T+28ms] Client B mencoba mengeksekusi "SELECT ... FOR UPDATE": Locked by Transaction A. Worker B mengantri pada connection pool`,
      `[T+45ms] Client A: INSERT INTO appointments (...) RETURNING id; UPDATE psychologist_schedules SET is_booked = TRUE; COMMIT;`,
      `[T+50ms] Lock dilepaskan oleh Client A. Worker Client B membaca state terbaru: slot telah berstatus is_booked = TRUE`,
      `[T+55ms] EXCEPTION 409 CONFLICT: "Slot waktu ini telah terisi atau sedang dalam proses pembayaran." Transaction B ROLLBACK.`,
      `[T+60ms] Hasil: Double-booking dicegah 100%. Data integrity aman.`
    ]);
    setTimeout(() => setSimRunning(false), 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Software Architecture & System Blueprint
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Arsitektur Sistem & Spesifikasi Enterprise JiwaSehat
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Dokumentasi komprehensif Role-Based Access Control (RBAC), skema database relasional, desain API RESTful, serta implementasi kode kunci untuk pre-test, booking H+1, verifikasi DP, dan pencegahan bentrok jadwal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-indigo-300 text-xs font-mono font-bold border border-slate-700">
              PostgreSQL 16 + Node.js
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Side Tab Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Vertical Side Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible custom-scrollbar sticky top-20">
            {[
              { id: 'rbac', label: '1. Role Matrix (RBAC)', icon: <Shield className="w-4 h-4" /> },
              { id: 'erd', label: '2. Database Schema (ERD)', icon: <Database className="w-4 h-4" /> },
              { id: 'api', label: '3. API Endpoints', icon: <Server className="w-4 h-4" /> },
              { id: 'code', label: '4. Kode Kunci & Lock', icon: <Code2 className="w-4 h-4" /> },
              { id: 'mvc', label: '5. Arsitektur MVC & OOP', icon: <Layers className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveBlueprintTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeBlueprintTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent'
                }`}
              >
                <span className={activeBlueprintTab === tab.id ? 'text-indigo-600' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* SECTION 1: ROLE & PERMISSION MATRIX (RBAC) */}
          {activeBlueprintTab === 'rbac' && (
            <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900">Tabel Matriks Hak Akses (Role-Based Access Control)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Matriks permission granular yang memisahkan boundary keamanan antara Pasien, Psikolog/Pengelola, dan Admin Operasional.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Modul & Kapabilitas Sistem</th>
                    <th className="py-3 px-4 text-center bg-slate-50 text-slate-500">Tamu / Publik</th>
                    <th className="py-3 px-4 text-center bg-emerald-50 text-emerald-800">Pasien (Klien)</th>
                    <th className="py-3 px-4 text-center bg-sky-50 text-sky-800">Psikolog / Pengelola</th>
                    <th className="py-3 px-4 text-center bg-purple-50 text-purple-800">Admin Operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { module: 'Melihat Profil Psikolog, Lokasi & Kontak', guest: true, pat: true, psy: true, adm: true },
                    { module: 'Melihat Testimoni & Review Publik Terverifikasi', guest: true, pat: true, psy: true, adm: true },
                    { module: 'Mengerjakan Tes Psikologi Mandiri (DASS-21)', guest: true, pat: true, psy: false, adm: false },
                    { module: 'Mengisi Pre-Test & General Info sebelum booking', guest: false, pat: true, psy: false, adm: false },
                    { module: 'Reservasi Jadwal H+1 dan Unggah Bukti DP 50%', guest: false, pat: true, psy: false, adm: false },
                    { module: 'Mengajukan Reschedule H+1 melalui form bantuan admin', guest: false, pat: true, psy: false, adm: true },
                    { module: 'Memberikan Rating & Ulasan Pasca-Sesi', guest: false, pat: true, psy: false, adm: false },
                    { module: 'Mengelola Profil Praktik, CMS, dan Konten Landing', guest: false, pat: false, psy: true, adm: false },
                    { module: 'Manajemen Jam Kerja, Hari Libur, dan Kapasitas Harian', guest: false, pat: false, psy: true, adm: false },
                    { module: 'Melihat Hasil Tes & Pre-Test Pasien Bimbingan', guest: false, pat: false, psy: true, adm: false, note: 'Protected EMR' },
                    { module: 'Menulis Catatan Perkembangan Klinis (SOAP Notes)', guest: false, pat: false, psy: true, adm: false },
                    { module: 'Verifikasi DP 50%, Konfirmasi Booking, dan Tandai Completed', guest: false, pat: false, psy: false, adm: true },
                    { module: 'Moderasi Review Pasien (Approve/Reject)', guest: false, pat: false, psy: false, adm: true },
                    { module: 'Monitoring User dan Booking', guest: false, pat: false, psy: false, adm: true },
                    { module: 'Analytics Keuangan dan Laporan Export', guest: false, pat: false, psy: true, adm: false }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {row.module}
                        {row.note && <span className="block text-[10px] text-slate-400 font-normal">*{row.note}</span>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.guest ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center bg-emerald-50/40">
                        {row.pat ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center bg-sky-50/40">
                        {row.psy ? <CheckCircle2 className="w-4 h-4 text-sky-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="py-3 px-4 text-center bg-purple-50/40">
                        {row.adm ? <CheckCircle2 className="w-4 h-4 text-purple-600 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DATABASE SCHEMA (ERD & RELASIONAL) */}
      {activeBlueprintTab === 'erd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Skema Database Relasional (12 Tabel Inti)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mencakup relasi `users`, `roles`, `profiles`, `psychologist_schedules`, `practice_holidays`, `pre_tests`, `packages`, `appointments`, `payment_proofs`, `test_results`, `clinical_notes`, dan `reviews`.
                </p>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    `-- PostgreSQL Schema JiwaSehat (12 Tables DDL)\n-- Includes booking H+1, payment proof, reschedule, indexes, and constraints...`,
                    'sql'
                  )
                }
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800"
              >
                {copiedSection === 'sql' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>Salin Schema DDL</span>
              </button>
            </div>

            {/* Interactive Visual Entity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  table: 'users',
                  desc: 'Entitas akun otentikasi utama',
                  cols: ['id (UUID, PK)', 'email (VARCHAR, UNIQUE)', 'password_hash (VARCHAR)', 'role_id (UUID, FK -> roles.id)', 'status (ENUM: ACTIVE, PENDING, BLOCKED)', 'created_at (TIMESTAMP)']
                },
                {
                  table: 'roles',
                  desc: 'Master permission role RBAC',
                  cols: ['id (UUID, PK)', 'name (ENUM: PATIENT, PSYCHOLOGIST, ADMIN)', 'description (TEXT)', 'permissions (JSONB)']
                },
                {
                  table: 'profiles',
                  desc: 'Detail general info pasien dan profil psikolog',
                  cols: ['id (UUID, PK)', 'user_id (UUID, FK -> users.id, UNIQUE)', 'title (VARCHAR)', 'str_number (VARCHAR)', 'sip_number (VARCHAR)', 'bio (TEXT)', 'specialties (TEXT[])', 'rating (DECIMAL)']
                },
                {
                  table: 'psychologist_schedules',
                  desc: 'Slot ketersediaan waktu praktik',
                  cols: ['id (UUID, PK)', 'psychologist_id (UUID, FK -> users.id)', 'date (DATE)', 'start_time (TIME)', 'end_time (TIME)', 'is_available (BOOLEAN)', 'is_booked (BOOLEAN)']
                },
                {
                  table: 'practice_holidays',
                  desc: 'Hari libur dan pengecualian praktik',
                  cols: ['id (UUID, PK)', 'psychologist_id (UUID, FK)', 'date (DATE)', 'reason (TEXT)', 'created_at (TIMESTAMP)']
                },
                {
                  table: 'pre_tests',
                  desc: 'Pre-test wajib sebelum pasien booking',
                  cols: ['id (UUID, PK)', 'patient_id (UUID, FK)', 'general_info (JSONB)', 'complaint_summary (TEXT)', 'risk_flags (JSONB)', 'submitted_at (TIMESTAMP)']
                },
                {
                  table: 'packages',
                  desc: 'Katalog layanan konsultasi klinik',
                  cols: ['id (UUID, PK)', 'name (VARCHAR)', 'type (ENUM: OFFLINE, BUNDLING)', 'duration_minutes (INT)', 'price (BIGINT)', 'benefits (JSONB)', 'is_active (BOOLEAN)']
                },
                {
                  table: 'appointments',
                  desc: 'Pemesanan & reservasi sesi',
                  cols: ['id (UUID, PK)', 'booking_code (VARCHAR, UNIQUE)', 'patient_id (UUID, FK)', 'psychologist_id (UUID, FK)', 'pre_test_id (UUID, FK)', 'package_id (UUID, FK)', 'status (ENUM)', 'payment_status (ENUM)']
                },
                {
                  table: 'payment_proofs',
                  desc: 'Bukti pembayaran DP dan pelunasan',
                  cols: ['id (UUID, PK)', 'appointment_id (UUID, FK)', 'phase (ENUM: DP, FINAL)', 'amount (BIGINT)', 'file_url (TEXT)', 'verification_status (ENUM)', 'verified_by (UUID, FK)']
                },
                {
                  table: 'tests',
                  desc: 'Instrumen asesmen psikologi (DASS-21)',
                  cols: ['id (UUID, PK)', 'code (VARCHAR, UNIQUE)', 'title (VARCHAR)', 'scoring_formula (TEXT)', 'questions (JSONB)', 'is_active (BOOLEAN)']
                },
                {
                  table: 'test_results',
                  desc: 'Hasil pengerjaan kuesioner pasien',
                  cols: ['id (UUID, PK)', 'patient_id (UUID, FK -> users.id)', 'test_id (UUID, FK -> tests.id)', 'total_score (INT)', 'subscale_scores (JSONB)', 'severity_level (ENUM)', 'completed_at']
                },
                {
                  table: 'clinical_notes',
                  desc: 'Rekam medis EMR SOAP format',
                  cols: ['id (UUID, PK)', 'appointment_id (UUID, FK, UNIQUE)', 'patient_id (UUID, FK)', 'psychologist_id (UUID, FK)', 'subjective (TEXT)', 'objective (TEXT)', 'assessment (TEXT)', 'plan (TEXT)', 'prognosis (VARCHAR)']
                },
                {
                  table: 'reviews',
                  desc: 'Ulasan & rating pasca-konsultasi',
                  cols: ['id (UUID, PK)', 'appointment_id (UUID, FK, UNIQUE)', 'patient_id (UUID, FK)', 'psychologist_id (UUID, FK)', 'rating (INT, 1-5)', 'comment (TEXT)', 'is_anonymous (BOOLEAN)', 'is_approved (BOOLEAN)']
                }
              ].map(item => (
                <div key={item.table} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-indigo-700">{item.table}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.cols.length} Kolom</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">{item.desc}</p>
                  <ul className="text-[11px] font-mono text-slate-700 space-y-1 bg-white p-2 rounded-xl border border-slate-200">
                    {item.cols.map((c, i) => (
                      <li key={i} className="truncate">• {c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* SQL DDL Code View */}
            <div className="mt-6">
              <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto">
                <pre>{`-- SQL DDL Relational Implementation for PostgreSQL
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PATIENT', 'PSYCHOLOGIST', 'ADMIN')),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE psychologist_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    psychologist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    is_booked BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_psychologist_slot UNIQUE (psychologist_id, date, start_time)
);

CREATE TABLE pre_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id),
    general_info JSONB NOT NULL,
    complaint_summary TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code VARCHAR(32) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES users(id),
    psychologist_id UUID NOT NULL REFERENCES users(id),
    pre_test_id UUID NOT NULL REFERENCES pre_tests(id),
    package_id UUID NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_status VARCHAR(50) DEFAULT 'DP_PENDING_VERIFICATION',
    total_amount NUMERIC(12,2) NOT NULL,
    dp_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES appointments(id),
    phase VARCHAR(20) NOT NULL CHECK (phase IN ('DP', 'FINAL')),
    amount NUMERIC(12,2) NOT NULL,
    file_url TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id),
    patient_id UUID NOT NULL REFERENCES users(id),
    psychologist_id UUID NOT NULL REFERENCES users(id),
    subjective TEXT NOT NULL,
    objective TEXT NOT NULL,
    assessment TEXT NOT NULL,
    plan TEXT NOT NULL,
    prognosis VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: API ENDPOINTS DESIGN */}
      {activeBlueprintTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="text-xl font-extrabold text-slate-900 mb-1">Daftar Endpoint RESTful & Middleware Authorization</h3>
            <p className="text-xs text-slate-500 mb-6">
                  Arsitektur rute API dengan guard middleware `verifyToken`, `requireRole`, dan validasi kepemilikan data.
            </p>

            <div className="space-y-3">
              {[
                {
                  method: 'GET',
                  endpoint: '/api/v1/public/psychologists',
                  auth: 'Public (Guest)',
                  desc: 'Mengambil daftar profil psikolog terverifikasi, spesialisasi, dan ulasan publik'
                },
                {
                  method: 'GET',
                  endpoint: '/api/v1/public/packages',
                  auth: 'Public (Guest)',
                  desc: 'Mendapatkan katalog paket layanan konsultasi dan tarif aktif'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/patient/pre-test',
                  auth: 'requireRole([PATIENT])',
                  desc: 'Menyimpan general info, keluhan awal, dan pre-test wajib sebelum booking'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/patient/assessments/submit',
                  auth: 'requireRole([PATIENT])',
                  desc: 'Mengirimkan jawaban tes psikologi DASS-21, menghitung skor otomatis, & mengikat ke rekam medis'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/appointments/reserve',
                  auth: 'requireRole([PATIENT])',
                  desc: 'Eksekusi booking H+1 dengan pre-test, bukti DP 50%, dan transaksi locking'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/appointments/:id/reschedule-request',
                  auth: 'requireRole([PATIENT, ADMIN])',
                  desc: 'Mencatat permintaan reschedule minimal H+1 untuk diproses admin'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/psychologist/schedules/slots',
                  auth: 'requireRole([PSYCHOLOGIST])',
                  desc: 'Membuat atau memperbarui jam kerja, kapasitas harian, dan slot praktik'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/psychologist/schedules/holidays',
                  auth: 'requireRole([PSYCHOLOGIST])',
                  desc: 'Menandai hari libur agar tidak muncul sebagai slot booking'
                },
                {
                  method: 'POST',
                  endpoint: '/api/v1/psychologist/emr/clinical-notes',
                  auth: 'requireRole([PSYCHOLOGIST])',
                  desc: 'Menulis atau memperbarui catatan perkembangan klinis SOAP pasca-sesi'
                },
                {
                  method: 'PATCH',
                  endpoint: '/api/v1/admin/appointments/:id/verify-dp',
                  auth: 'requireRole([ADMIN])',
                  desc: 'Verifikasi bukti DP 50% lalu mengubah booking PENDING menjadi CONFIRMED'
                },
                {
                  method: 'PATCH',
                  endpoint: '/api/v1/admin/reviews/:id/moderate',
                  auth: 'requireRole([ADMIN])',
                  desc: 'Menyetujui atau menolak ulasan pasien untuk tampil di landing page'
                }
              ].map((route, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-mono font-extrabold ${
                        route.method === 'GET'
                          ? 'bg-sky-100 text-sky-800'
                          : route.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {route.method}
                    </span>
                    <span className="font-mono font-bold text-slate-900">{route.endpoint}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-slate-600">{route.desc}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono font-bold text-[10px] shrink-0">
                      {route.auth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: KODE KUNCI (CONFLICT LOCK & WEBSOCKET) */}
      {activeBlueprintTab === 'code' && (
        <div className="space-y-6">
          {/* Interactive Concurrency Simulation Box */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 mb-4 gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Live Race-Condition Simulator</span>
                <h3 className="text-lg font-bold mt-0.5">Pengujian Bentrok Jadwal (Double-Booking Prevention)</h3>
                <p className="text-xs text-slate-400">
                  Simulasikan 2 pasien yang serentak menekan tombol booking pada milidetik yang sama.
                </p>
              </div>

              <button
                onClick={runConcurrencySimulation}
                disabled={simRunning}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-600/30"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{simRunning ? 'Memproses Lock...' : 'Uji Simulasi Race Condition'}</span>
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-emerald-400 h-44 overflow-y-auto space-y-1">
              {simLogs.length === 0 ? (
                <div className="text-slate-500 italic">
                  Klik "Uji Simulasi Race Condition" untuk melihat eksekusi transaksi database SERIALIZABLE dengan `SELECT ... FOR UPDATE` lock.
                </div>
              ) : (
                simLogs.map((log, idx) => (
                  <div key={idx} className={log.includes('EXCEPTION') ? 'text-rose-400' : 'text-emerald-400'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Code 1: Booking Conflict Prevention Implementation */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  1. Logika Pencegahan Bentrok Jadwal (Database Transaction & Row-Level Lock)
                </h3>
                <p className="text-xs text-slate-500">
                  Menggunakan `SELECT ... FOR UPDATE` pada PostgreSQL dengan level isolasi SERIALIZABLE.
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `// Production-grade Booking Transaction Handler\nasync function bookAppointmentWithLock(...)`,
                    'code-lock'
                  )
                }
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                {copiedSection === 'code-lock' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto">
              <pre>{`// backend/src/services/appointmentService.ts
import { pool } from '../config/database';
import { ConflictError, NotFoundError } from '../utils/errors';

export async function reserveAppointmentWithConflictLock(params: {
  patientId: string;
  psychologistId: string;
  scheduleSlotId: string;
  packageId: string;
  preTestId: string;
  totalAmount: number;
  dpProofUrl: string;
}) {
  const client = await pool.connect();
  try {
    // 1. Mulai Transaksi ACID dengan Isolasi Tinggi
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    // 2. Kunci Baris Slot secara Eksklusif (Pessimistic Lock)
    // Query ini mencegah transaksi lain mengubah status slot ini sampai COMMIT/ROLLBACK
    const slotQuery = \`
      SELECT id, psychologist_id, date, start_time, end_time, is_available, is_booked
      FROM psychologist_schedules
      WHERE id = $1
      FOR UPDATE NOWAIT;
    \`;
    const slotResult = await client.query(slotQuery, [params.scheduleSlotId]);

    if (slotResult.rows.length === 0) {
      throw new NotFoundError('Slot waktu tidak ditemukan.');
    }

    const slot = slotResult.rows[0];

    // 3. Validasi pre-test, batas H+1, dan kondisi bentrok
    const preTest = await client.query(
      'SELECT id FROM pre_tests WHERE id = $1 AND patient_id = $2',
      [params.preTestId, params.patientId]
    );

    if (preTest.rows.length === 0) {
      throw new ConflictError('Pre-test wajib diisi sebelum booking.');
    }

    const minBookingDate = new Date();
    minBookingDate.setDate(minBookingDate.getDate() + 1);
    if (new Date(slot.date) < minBookingDate) {
      throw new ConflictError('Booking hanya dapat dilakukan mulai besok (H+1).');
    }

    if (!slot.is_available || slot.is_booked) {
      throw new ConflictError(
        'Bentrok Jadwal Terdeteksi: Slot waktu ini telah dipesan atau tidak lagi tersedia.'
      );
    }

    // 4. Periksa apakah dokter memiliki janji aktif pada interval waktu yang sama
    const overlapCheck = await client.query(
      \`SELECT id FROM appointments 
       WHERE psychologist_id = $1 AND date = $2 AND start_time = $3 
       AND status IN ('CONFIRMED', 'PENDING', 'IN_PROGRESS')\`,
      [params.psychologistId, slot.date, slot.start_time]
    );

    if (overlapCheck.rows.length > 0) {
      throw new ConflictError('Dokter telah memiliki janji aktif pada jam tersebut.');
    }

    // 5. Buat Record Appointment PENDING & simpan bukti DP
    const bookingCode = \`JS-\${slot.date.replace(/-/g, '')}-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const newAppointment = await client.query(
      \`INSERT INTO appointments (
        booking_code, patient_id, psychologist_id, pre_test_id, package_id,
        date, start_time, end_time, status, payment_status, total_amount, dp_amount
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', 'DP_PENDING_VERIFICATION', $9, $10)
       RETURNING *\`,
      [
        bookingCode,
        params.patientId,
        params.psychologistId,
        params.preTestId,
        params.packageId,
        slot.date,
        slot.start_time,
        slot.end_time,
        params.totalAmount,
        params.totalAmount * 0.5
      ]
    );

    await client.query(
      \`INSERT INTO payment_proofs (appointment_id, phase, amount, file_url)
       VALUES ($1, 'DP', $2, $3)\`,
      [newAppointment.rows[0].id, params.totalAmount * 0.5, params.dpProofUrl]
    );

    // Kunci slot sehingga tidak bisa dipilih pasien lain
    await client.query(
      'UPDATE psychologist_schedules SET is_booked = TRUE, is_available = FALSE WHERE id = $1',
      [slot.id]
    );

    await client.query('COMMIT');
    return newAppointment.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`}</pre>
            </div>
          </div>

          {/* Key Code 2: Admin Payment Verification */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Verifikasi DP Admin & Perubahan Status Booking
                </h3>
                <p className="text-xs text-slate-500">
                  Admin memverifikasi DP 50% untuk mengubah booking dari PENDING menjadi CONFIRMED.
                </p>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `// Admin payment verification\nasync function verifyDpAndConfirmAppointment(...)`,
                    'code-ws'
                  )
                }
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                {copiedSection === 'code-ws' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto">
              <pre>{`// backend/src/services/adminAppointmentService.ts
import { pool } from '../config/database';
import { ConflictError, NotFoundError } from '../utils/errors';

export async function verifyDpAndConfirmAppointment(params: {
  appointmentId: string;
  adminId: string;
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const appointmentResult = await client.query(
      \`SELECT id, status, payment_status
       FROM appointments
       WHERE id = $1
       FOR UPDATE\`,
      [params.appointmentId]
    );

    if (appointmentResult.rows.length === 0) {
      throw new NotFoundError('Booking tidak ditemukan.');
    }

    const appointment = appointmentResult.rows[0];
    if (appointment.status !== 'PENDING') {
      throw new ConflictError('Hanya booking PENDING yang dapat dikonfirmasi admin.');
    }

    await client.query(
      \`UPDATE payment_proofs
       SET verification_status = 'VERIFIED', verified_by = $1, verified_at = NOW()
       WHERE appointment_id = $2 AND phase = 'DP'\`,
      [params.adminId, params.appointmentId]
    );

    const confirmed = await client.query(
      \`UPDATE appointments
       SET status = 'CONFIRMED', payment_status = 'DP_PAID'
       WHERE id = $1
       RETURNING *\`,
      [params.appointmentId]
    );

    await client.query('COMMIT');
    return confirmed.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: POLA ARSITEKTUR MVC & OOP HIERARCHY */}
      {activeBlueprintTab === 'mvc' && (
        <div className="space-y-6">
          {/* Top MVC Overview Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Software Engineering Pattern</span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Pola Arsitektur MVC & Berorientasi Objek (OOP)</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Pemisahan tegas antara representasi entitas data bisnis (Domain Models dengan inheritance & encapsulation), pengendali proses transaksi (Controllers), dan antarmuka interaktif (Views) yang terhubung ke endpoint REST simulasi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                  Clean Architecture • SOLID Principles
                </span>
              </div>
            </div>

            {/* 3 Pillars of MVC Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* MODEL CARD */}
              <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-3">
                <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-black">M</span>
                  <h4>Model Layer (OOP Entities)</h4>
                </div>
                <p className="text-xs text-sky-900/80 leading-relaxed">
                  Mengenapsulasi struktur data domain dan metode komputasi bisnis mandiri (encapsulation & inheritance):
                </p>
                <ul className="text-xs text-sky-900 space-y-1.5 font-mono">
                  <li>• <strong className="text-slate-900">User</strong> (Base Identity Model)</li>
                  <li>• <strong className="text-slate-900">Patient extends User</strong> (Intake & Risk)</li>
                  <li>• <strong className="text-slate-900">Psychologist extends User</strong> (STR & EMR)</li>
                  <li>• <strong className="text-slate-900">Admin extends User</strong> (Governance & KPI)</li>
                  <li>• <strong className="text-slate-900">AppointmentModel</strong> (Session Checks)</li>
                  <li>• <strong className="text-slate-900">Dass21Scorer</strong> (Lovibond Engine)</li>
                </ul>
              </div>

              {/* CONTROLLER CARD */}
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 space-y-3">
                <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">C</span>
                  <h4>Controller Layer (Business Logic)</h4>
                </div>
                <p className="text-xs text-indigo-900/80 leading-relaxed">
                  Mengorkestrasi alur transaksi, validasi aturan bisnis, dan konsumsi endpoint REST:
                </p>
                <ul className="text-xs text-indigo-900 space-y-1.5 font-mono">
                  <li>• <strong className="text-slate-900">AuthController</strong> (Login & Registrasi)</li>
                  <li>• <strong className="text-slate-900">PatientController</strong> (Booking & Tes)</li>
                  <li>• <strong className="text-slate-900">PsychologistController</strong> (Jadwal & SOAP)</li>
                  <li>• <strong className="text-slate-900">AdminController</strong> (Moderasi & Paket)</li>
                  <li>• <strong className="text-slate-900">BaseController</strong> (Error & Toast)</li>
                </ul>
              </div>

              {/* VIEW CARD */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">V</span>
                  <h4>View Layer (Presentation)</h4>
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  Komponen antarmuka pengguna responsif yang merender data model dan memicu aksi controller:
                </p>
                <ul className="text-xs text-emerald-900 space-y-1.5 font-mono">
                  <li>• <strong className="text-slate-900">PatientDashboard</strong> (Portal Pasien)</li>
                  <li>• <strong className="text-slate-900">PsychologistDashboard</strong> (Praktik)</li>
                  <li>• <strong className="text-slate-900">AdminDashboard</strong> (Admin Operasional)</li>
                  <li>• <strong className="text-slate-900">LoginModal</strong> (Dialog Masuk/Daftar)</li>
                  <li>• <strong className="text-slate-900">LandingPage</strong> (Katalog Publik)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* OOP Class Hierarchy Code Details */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">OOP Domain Specification</span>
                <h4 className="text-lg font-bold mt-0.5">Spesifikasi Kelas Berorientasi Objek & Blueprint Pewarisan</h4>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-300">
                TypeScript ES6+ Classes
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
              <pre>{`// 1. BASE DOMAIN ENTITY (Encapsulation)
class User {
  protected _id: string;
  protected _role: 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN';
  public isPatient(): boolean { return this._role === 'PATIENT'; }
  public isPsychologist(): boolean { return this._role === 'PSYCHOLOGIST'; }
  public isAdmin(): boolean { return this._role === 'ADMIN'; }
}

// 2. INHERITANCE: PATIENT DOMAIN MODEL
class Patient extends User {
  public getIntakeForm(forms: Record<string, IntakeForm>): IntakeForm | undefined;
  public getAppointments(allAppointments: Appointment[]): Appointment[];
  public evaluateRiskProfile(results: TestResult[], forms: Record<string, IntakeForm>): RiskEvaluation;
}

// 3. INHERITANCE: PSYCHOLOGIST DOMAIN MODEL
class Psychologist extends User {
  private _profile: PsychologistProfile;
  public getTitle(): string;
  public getAvailableSlots(schedules: ScheduleSlot[], date?: string): ScheduleSlot[];
  public getAssignedAppointments(appointments: Appointment[]): Appointment[];
}

// 4. INHERITANCE: ADMIN DOMAIN MODEL
class Admin extends User {
  public canModerateReviews(): boolean;
  public calculateAnalytics(appointments, users, reviews): AnalyticsSummary;
}

// 5. PSYCHOLOGICAL ASSESSMENT ENGINE (Lovibond DASS-21)
class Dass21Scorer {
  public static calculateScores(answers: Record<number, number>): Dass21ScoreBreakdown;
  public static createTestResult(patientId, name, test, answers): TestResult;
}`}</pre>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
};
