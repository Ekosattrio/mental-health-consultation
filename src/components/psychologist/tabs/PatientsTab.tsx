import React, { useState, useMemo } from 'react';
import { User, Appointment, IntakeForm } from '../../../types';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { Tooltip } from '../../common/Tooltip';
import { PatientDetailModal } from '../../common/PatientDetailModal';

interface PatientsTabProps {
  users: User[];
  appointments: Appointment[];
  intakeForms: Record<string, IntakeForm>;
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
  selectedPatientId,
  setSelectedPatientId
}) => {
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
    setIsViewModalOpen(true);
  };

  const exportClinicalCsv = () => {
    const rows = filteredPatients.map(pat => {
      const intake = intakeForms[pat.id];
      const patientAppointments = appointments.filter(apt => apt.patientId === pat.id);
      return {
        nama: pat.name,
        email: pat.email,
        telepon: pat.phone || '',
        pekerjaan: intake?.occupation || '',
        keluhan: intake?.primaryConcerns?.join('; ') || '',
        tingkat_stres: intake?.currentStressLevel ?? '',
        kualitas_tidur: intake?.sleepQuality || '',
        kontak_darurat: intake?.emergencyContact
          ? `${intake.emergencyContact.name} (${intake.emergencyContact.relationship}) ${intake.emergencyContact.phone}`
          : '',
        total_sesi: patientAppointments.length,
        sesi_selesai: patientAppointments.filter(apt => apt.status === 'COMPLETED').length
      };
    });

    const headers = [
      'nama',
      'email',
      'telepon',
      'pekerjaan',
      'keluhan',
      'tingkat_stres',
      'kualitas_tidur',
      'kontak_darurat',
      'total_sesi',
      'sesi_selesai'
    ];
    const csv = [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(header => `"${String((row as Record<string, unknown>)[header] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `export-data-klinis-pasien-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

  const selectedPatient = users.find(u => u.id === selectedPatientId);
  const selectedIntake = intakeForms[selectedPatientId];
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-xl w-full">
          <div className="relative flex-1">
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
          <Tooltip content="Export data klinis pasien" position="bottom">
            <button
              type="button"
              onClick={exportClinicalCsv}
              className="h-9 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Klinis</span>
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase">
              <tr>
                <th className="py-3 px-4">Nama Pasien</th>
                <th className="py-3 px-4">No. HP / Email</th>
                <th className="py-3 px-4">Pekerjaan</th>
                <th className="py-3 px-4">Keluhan Pre-Test</th>
                <th className="py-3 px-4">Riwayat Sesi</th>
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
                  const patientAppointments = appointments.filter(apt => apt.patientId === pat.id);
                  const completedSessions = patientAppointments.filter(apt => apt.status === 'COMPLETED').length;

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

                      {/* Riwayat Sesi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800">
                          {completedSessions}/{patientAppointments.length} selesai
                        </span>
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

      {/* MODAL LIHAT DETAIL PASIEN (Modern, Berstandar Klinis, Reusable) */}
      <PatientDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        patient={selectedPatient}
        intakeForm={selectedIntake}
        appointments={selectedAppointments}
      />
    </div>
  );
};

