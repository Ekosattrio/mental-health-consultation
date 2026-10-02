import React, { useState, useMemo } from 'react';
import { User, Appointment, IntakeForm, TestResult } from '../../../types';
import {
  Search,
  Eye,
  X,
  UserCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  User as UserIcon
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';

interface PatientsTabProps {
  users: User[];
  appointments: Appointment[];
  intakeForms: Record<string, IntakeForm>;
  testResults: TestResult[];
  psychologistId: string;
  selectedPatientId: string;
  setSelectedPatientId: (id: string) => void;
  // Backward compatibility prop if passed, but SOAP is removed
  clinicalNotes?: any;
  saveClinicalNotes?: any;
}

export const PatientsTab: React.FC<PatientsTabProps> = ({
  users,
  appointments,
  intakeForms,
  testResults,
  selectedPatientId,
  setSelectedPatientId
}) => {
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'PRETEST' | 'TESTS' | 'APPOINTMENTS'>('PRETEST');

  // Pagination for Patient Table
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(7);

  const allPatientUsers = useMemo(() => {
    return users.filter(u => u.role === 'PATIENT');
  }, [users]);

  const filteredPatients = useMemo(() => {
    return allPatientUsers.filter(pat => {
      const q = patientSearchQuery.toLowerCase().trim();
      const intake = intakeForms[pat.id];
      if (!q) return true;

      return (
        pat.name.toLowerCase().includes(q) ||
        (pat.phone && pat.phone.toLowerCase().includes(q)) ||
        (pat.email && pat.email.toLowerCase().includes(q)) ||
        (intake && intake.occupation && intake.occupation.toLowerCase().includes(q)) ||
        (intake && intake.primaryConcerns && intake.primaryConcerns.some(c => c.toLowerCase().includes(q)))
      );
    });
  }, [allPatientUsers, patientSearchQuery, intakeForms]);

  const openPatientModal = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveModalTab('PRETEST');
    setIsViewModalOpen(true);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const selectedPatient = users.find(u => u.id === selectedPatientId);
  const selectedIntake = intakeForms[selectedPatientId];
  const selectedTests = testResults.filter(t => t.patientId === selectedPatientId);
  const selectedAppointments = appointments.filter(a => a.patientId === selectedPatientId);

  return (
    <div className="space-y-5">
      {/* Header & Search Bar Padat */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Data Pasien Konsultasi ({allPatientUsers.length})
          </h2>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            Daftar lengkap pasien bimbingan beserta riwayat pre-test, kontak darurat, dan jadwal konsultasi.
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={patientSearchQuery}
            onChange={e => {
              setPatientSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, keluhan, profesi, no. HP..."
            className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
          />
          {patientSearchQuery && (
            <button
              type="button"
              onClick={() => setPatientSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs cursor-pointer font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Tabel Data Pasien: Padat, Modern, Jelas Terbaca untuk Orang Tua */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-4">Nama Pasien</th>
                <th className="py-3 px-4">No. HP / Email</th>
                <th className="py-3 px-4">Pekerjaan</th>
                <th className="py-3 px-4">Keluhan Pre-Test</th>
                <th className="py-3 px-4">Skrining DASS-21</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold italic">
                    Tidak ada pasien yang sesuai dengan kata kunci pencarian.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map(pat => {
                  const intake = intakeForms[pat.id];
                  const tests = testResults.filter(t => t.patientId === pat.id);
                  const latestTest = tests[0];

                  return (
                    <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                      {/* Nama Pasien */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                            {pat.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">ID: #{pat.id}</span>
                        </div>
                      </td>

                      {/* Kontak */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-800 font-medium">
                        <div>{pat.phone || '0812-xxxx-xxxx'}</div>
                        <span className="text-[11px] text-slate-500">{pat.email}</span>
                      </td>

                      {/* Pekerjaan */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-800 font-medium">
                        {intake?.occupation || '-'}
                      </td>

                      {/* Keluhan Pre-Test */}
                      <td className="py-3 px-4">
                        {intake ? (
                          <div className="max-w-[220px]">
                            <span className="font-bold text-slate-900 block truncate">
                              {intake.primaryConcerns?.[0] || 'Tercatat'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Stres: {intake.currentStressLevel}/10 • Tidur: {intake.sleepQuality}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belum mengisi</span>
                        )}
                      </td>

                      {/* DASS-21 */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {latestTest ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              latestTest.severityLevel === 'BERAT' || latestTest.severityLevel === 'SANGAT_BERAT'
                                ? 'bg-rose-100 text-rose-900'
                                : latestTest.severityLevel === 'SEDANG'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            <span>{latestTest.severityLevel}</span>
                            <span className="font-bold">({latestTest.totalScore})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum tes</span>
                        )}
                      </td>

                      {/* Tombol Lihat Detail Pasien (Icon + Tooltip) */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <Tooltip content="Lihat Detail Pasien (Pre-Test & Riwayat)" position="left">
                          <button
                            type="button"
                            onClick={() => openPatientModal(pat.id)}
                            aria-label={`Lihat Detail Pasien ${pat.name}`}
                            className="w-8.5 h-8.5 rounded-xl bg-sky-50 hover:bg-sky-600 text-sky-700 hover:text-white border border-sky-200/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-2xs mx-auto"
                          >
                            <Eye className="w-4 h-4" />
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

        {/* Pagination Bar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium">
            Menampilkan <strong>{filteredPatients.length > 0 ? startIndex + 1 : 0}</strong> -{' '}
            <strong>{Math.min(startIndex + itemsPerPage, filteredPatients.length)}</strong> dari{' '}
            <strong>{filteredPatients.length}</strong> pasien
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="px-2 font-bold text-slate-800">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL LIHAT DETAIL PASIEN (Murni Pre-Test, Identitas, Asesmen & Riwayat - TANPA SOAP) */}
      {isViewModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400 text-sky-300 flex items-center justify-center font-bold shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-300">
                    {selectedPatient.email} • {selectedPatient.phone || '0812-xxxx-xxxx'}
                  </p>
                </div>
              </div>

              <Tooltip content="Tutup Jendela (Esc)" position="bottom">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  aria-label="Tutup"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            {/* Modal Tabs */}
            <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveModalTab('PRETEST')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'PRETEST'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Pre-Test & Keluhan Awal
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('TESTS')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'TESTS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Asesmen DASS-21 ({selectedTests.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveModalTab('APPOINTMENTS')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeModalTab === 'APPOINTMENTS'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Riwayat Konsultasi ({selectedAppointments.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* TAB 1: PRE-TEST & IDENTITAS */}
              {activeModalTab === 'PRETEST' && (
                <div className="space-y-4">
                  {selectedIntake ? (
                    <div className="space-y-4">
                      {/* Info Kontak & Darurat */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Pekerjaan</span>
                          <span className="font-bold text-slate-900 text-sm">{selectedIntake.occupation}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Kontak Darurat Keluarga</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {selectedIntake.emergencyContact.name} ({selectedIntake.emergencyContact.relationship}) - {selectedIntake.emergencyContact.phone}
                          </span>
                        </div>
                      </div>

                      {/* Keluhan Utama */}
                      <div className="space-y-2">
                        <span className="font-bold text-slate-900 block">Keluhan yang Dipilih Pasien:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedIntake.primaryConcerns.map((c, i) => (
                            <span key={i} className="px-3 py-1 bg-sky-50 text-sky-900 border border-sky-200 rounded-xl font-bold">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Deskripsi */}
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Deskripsi Kondisi Pasien:</span>
                        <p className="text-slate-700 leading-relaxed italic">
                          "{selectedIntake.concernDescription || 'Tidak ada catatan tambahan.'}"
                        </p>
                      </div>

                      {/* Tingkat Stres & Tidur */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Tingkat Stres Saat Ini</span>
                          <span className="text-sm font-black text-slate-900">{selectedIntake.currentStressLevel} / 10</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Kualitas Tidur</span>
                          <span className="text-sm font-black text-slate-900">{selectedIntake.sleepQuality}</span>
                        </div>
                      </div>

                      {/* Tujuan Sesi */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-900 block">Ekspektasi / Tujuan Konsultasi:</span>
                        <p className="text-slate-800 font-medium">"{selectedIntake.goals}"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Pasien belum mengisi formulir pre-test.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ASESMEN DASS-21 */}
              {activeModalTab === 'TESTS' && (
                <div className="space-y-4">
                  {selectedTests.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Pasien belum mengerjakan tes asesmen psikologi DASS-21.
                    </div>
                  ) : (
                    selectedTests.map(test => (
                      <div key={test.id} className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900">{test.testTitle}</h4>
                          <span
                            className={`px-3 py-1 rounded-xl font-bold ${
                              test.severityLevel === 'BERAT' || test.severityLevel === 'SANGAT_BERAT'
                                ? 'bg-rose-100 text-rose-900'
                                : test.severityLevel === 'SEDANG'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {test.severityLevel} (Skor {test.totalScore})
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Depresi</span>
                            <span className="text-sm font-black text-slate-900">{test.subscaleScores.depression ?? '-'}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Kecemasan</span>
                            <span className="text-sm font-black text-slate-900">{test.subscaleScores.anxiety ?? '-'}</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Stres</span>
                            <span className="text-sm font-black text-slate-900">{test.subscaleScores.stress ?? '-'}</span>
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed font-medium">{test.interpretation}</p>
                        <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-950 font-medium">
                          <strong>Saran Klinis:</strong> {test.clinicalRecommendation}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: RIWAYAT KONSULTASI */}
              {activeModalTab === 'APPOINTMENTS' && (
                <div className="space-y-3">
                  {selectedAppointments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Belum ada jadwal konsultasi tercatat untuk pasien ini.
                    </div>
                  ) : (
                    selectedAppointments.map(apt => (
                      <div key={apt.id} className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{apt.packageName}</div>
                          <span className="text-slate-600 block mt-0.5">
                            {apt.date} • {apt.startTime} - {apt.endTime} WIB
                          </span>
                          <span className="text-[11px] text-slate-500 font-semibold">Kode: #{apt.bookingCode}</span>
                        </div>

                        <div className="text-right">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                            {apt.status}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-semibold mt-1">
                            {apt.paymentStatus === 'PAID' ? 'Lunas' : apt.paymentStatus === 'DP_PAID' ? 'DP Terbayar' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

