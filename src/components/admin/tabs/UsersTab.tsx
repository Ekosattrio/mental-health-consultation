import React, { useState, useMemo } from 'react';
import { User, PsychologistProfile, UserStatus } from '../../../types';
import { Search, CheckCircle2, Lock, Unlock } from 'lucide-react';

interface UsersTabProps {
  users: User[];
  psychologists: PsychologistProfile[];
  toggleUserStatus: (userId: string, status: UserStatus) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  psychologists,
  toggleUserStatus
}) => {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'PATIENT' | 'PSYCHOLOGIST' | 'ADMIN'>('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = userSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Manajemen Pengguna & Verifikasi Kredensial</h3>
            <p className="text-xs text-slate-500">
              Pantau basis pasien berskala besar dan verifikasi STR/SIP psikolog sebelum berpraktik.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600">
              Menampilkan {filteredUsers.length} dari {users.length} Total Pengguna
            </span>
          </div>
        </div>

        {/* Filter & Search Bar for Scalability */}
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

          <div className="inline-flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shrink-0">
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

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama & Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4">Kredensial STR / SIP</th>
                <th className="py-3 px-4 text-right">Aksi Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Tidak ditemukan pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
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
                        <div className="flex items-center justify-end gap-2">
                          {u.status === 'PENDING_VERIFICATION' && (
                            <button
                              onClick={() => toggleUserStatus(u.id, 'ACTIVE')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verifikasi & Aktifkan
                            </button>
                          )}
                          {u.status === 'ACTIVE' && u.role !== 'ADMIN' && (
                            <button
                              onClick={() => toggleUserStatus(u.id, 'BLOCKED')}
                              className="px-2.5 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              title="Blokir akses pengguna"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {u.status === 'BLOCKED' && (
                            <button
                              onClick={() => toggleUserStatus(u.id, 'ACTIVE')}
                              className="px-2.5 py-1 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                              title="Buka blokir akses"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

