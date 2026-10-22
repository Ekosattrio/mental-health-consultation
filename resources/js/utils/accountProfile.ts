import { User } from '../types';

export type AccountProfileInput = Pick<User, 'name' | 'phone' | 'emergencyContact'>;

export const updateOwnAccountProfile = (user: User, actor: Pick<User, 'id' | 'role'>, input: AccountProfileInput): User => {
  if (actor.id !== user.id || actor.role !== user.role || actor.role === 'GUEST') {
    throw new Error('Anda hanya dapat mengubah profil akun sendiri.');
  }
  const name = input.name.trim();
  const phone = input.phone?.trim() || '';
  if (!name || name.length > 120) throw new Error('Nama wajib diisi, maksimal 120 karakter.');
  if (!/^[+\d\s().-]{7,25}$/.test(phone) || phone.replace(/\D/g, '').length < 7) {
    throw new Error('Isi nomor telepon yang valid.');
  }
  const emergencyContact = input.emergencyContact?.trim() || '';
  if (user.role === 'PATIENT' && user.isProfileComplete && !emergencyContact) {
    throw new Error('Kontak darurat pasien wajib tetap terisi.');
  }
  return { ...user, name, phone, ...(user.role === 'PATIENT' ? { emergencyContact } : {}) };
};
