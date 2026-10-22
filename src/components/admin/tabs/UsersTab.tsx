import React, { useState, useMemo, useEffect } from 'react';
import { User, PsychologistProfile } from '../../../types';
import { Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface UsersTabProps {
  users: User[];
  psychologists: PsychologistProfile[];
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  psychologists
}) => {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [userSearchQuery, userRoleFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = userSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, startIndex, itemsPerPage]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monitoring Pengguna</h3>
            <p className="text-xs text-slate-500">
              Pantau data akun pasien, psikolog, dan admin secara read-only.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              Total {filteredUsers.length} Pengguna
            </span>
          </div>
        </div>

        {/* Filter & Search Bar - Search di Kiri, Filter di Kanan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              placeholder="Cari nama pasien, psikolog, atau email..."
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0">
            {(['ALL', 'PATIENT', 'PSYCHOLOGIST', 'ADMIN'] as const).map(role => {
              const count = role === 'ALL' ? users.length : users.filter(u => u.role === role).length;
              const label =
                role === 'ALL'
                  ? 'Semua'
                  : role === 'PATIENT'
                  ? 'Pasien'
                  : role === 'PSYCHOLOGIST'
                  ? 'Psikolog'
                  : 'Admin';
              return (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    userRoleFilter === role
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border border-transparent'
                  }`}
                >
                  {label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:hidden divide-y divide-slate-100 border-y border-slate-100">
          {paginatedUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">Tidak ditemukan pengguna yang cocok dengan kriteria pencarian.</div>
          ) : paginatedUsers.map(u => {
            const psyProfile = psychologists.find(p => p.userId === u.id);
            return (
              <article key={u.id} className="py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-slate-900 break-words">{u.name}</h4>
                    <p className="text-[11px] text-slate-500 break-all">{u.email}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : u.role === 'PSYCHOLOGIST' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'}`}>{u.role}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="block font-black uppercase text-slate-400">Status</span>
                    <span className="font-bold text-slate-700 break-words">{u.status}</span>
                  </div>
                  <div>
                    <span className="block font-black uppercase text-slate-400">Kredensial</span>
                    <span className="font-semibold text-slate-700">{psyProfile ? `SIP ${psyProfile.sipNumber} / STR ${psyProfile.strNumber}` : '-'}</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Terdata Sistem
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto w-full max-w-full custom-scrollbar">
          <table className="w-full min-w-[700px] text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4">Kredensial STR / SIP</th>
                <th className="py-3 px-4 text-right">Status Monitoring</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ditemukan pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(u => {
                  const psyProfile = psychologists.find(p => p.userId === u.id);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'PSYCHOLOGIST'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {psyProfile ? (
                          <div className="text-[11px] font-semibold text-slate-600">
                            <div>SIP: {psyProfile.sipNumber}</div>
                            <div>STR: {psyProfile.strNumber}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terdata Sistem
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-4 text-xs">
            <span className="text-slate-500 font-medium">
              Menampilkan <strong className="text-slate-800">{startIndex + 1}</strong> -{' '}
              <strong className="text-slate-800">{Math.min(startIndex + itemsPerPage, filteredUsers.length)}</strong> dari{' '}
              <strong className="text-slate-800">{filteredUsers.length}</strong> pengguna
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
