import type React from 'react';
import { BaseController, ToastCallback } from './BaseController';
import { AuthEndpoints, LoginRequest, RegisterRequest } from '../api/authEndpoints';
import { User as UserEntity, UserRole, PsychologistProfile } from '../types';
import { User } from '../models/User';

export interface AuthStateCallbacks {
  setCurrentRole: (role: UserRole) => void;
  setCurrentUserId: (id: string) => void;
  setUsers: React.Dispatch<React.SetStateAction<UserEntity[]>>;
  setPsychologists: React.Dispatch<React.SetStateAction<PsychologistProfile[]>>;
  setIsLoginModalOpen: (open: boolean) => void;
  setViewMode: (mode: 'PLATFORM' | 'BLUEPRINT') => void;
}

/**
 * AuthController (OOP Controller)
 * Orchestrates authentication lifecycles, role switches, registration, and logout flows.
 */
export class AuthController extends BaseController {
  private callbacks: AuthStateCallbacks;

  constructor(notify: ToastCallback, callbacks: AuthStateCallbacks) {
    super(notify);
    this.callbacks = callbacks;
  }

  /**
   * Handle user login / switch persona
   */
  public async loginAs(
    role: UserRole,
    specificUserId: string | undefined,
    allUsers: UserEntity[]
  ): Promise<boolean> {
    if (role === 'GUEST') {
      this.callbacks.setCurrentRole('GUEST');
      this.callbacks.setCurrentUserId('user-pat-1');
      this.callbacks.setViewMode('PLATFORM');
      this.callbacks.setIsLoginModalOpen(false);
      this.notify('Mode Tamu', 'Kembali ke halaman publik.');
      return true;
    }

    try {
      const targetId =
        specificUserId ||
        (role === 'PATIENT'
          ? 'user-pat-1'
          : role === 'PSYCHOLOGIST'
          ? 'user-psy-1'
          : 'user-adm-1');

      const response = await AuthEndpoints.login(
        { role, userId: targetId },
        allUsers
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const loggedUser = new User(response.data.user);
      this.callbacks.setCurrentRole(role);
      this.callbacks.setCurrentUserId(loggedUser.id);
      this.callbacks.setViewMode('PLATFORM');
      this.callbacks.setIsLoginModalOpen(false);

      this.notify(
        'Login Berhasil',
        `Selamat datang, ${loggedUser.name}! Siap untuk sesi konsultasi.`,
        'success'
      );
      return true;
    } catch (err: any) {
      this.handleError(err, 'Login Gagal');
      return false;
    }
  }

  /**
   * Handle registration
   */
  public async register(
    data: RegisterRequest,
    existingUsers: UserEntity[]
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await AuthEndpoints.register(data, existingUsers);

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const { user: newUser, profile: newProfile } = response.data;

      // Update state
      this.callbacks.setUsers(prev => [newUser, ...prev]);
      if (newProfile) {
        this.callbacks.setPsychologists(prev => [newProfile, ...prev]);
      }

      // Auto login
      this.callbacks.setCurrentRole(newUser.role);
      this.callbacks.setCurrentUserId(newUser.id);
      this.callbacks.setViewMode('PLATFORM');
      this.callbacks.setIsLoginModalOpen(false);

      this.notify(
        'Registrasi Berhasil',
        `Selamat datang, ${newUser.name}! Akun Anda berhasil terdaftar sebagai ${
          newUser.role === 'PATIENT' ? 'Pasien' : 'Psikolog'
        }.`,
        'success'
      );

      return { success: true, message: 'Pendaftaran berhasil' };
    } catch (err: any) {
      this.handleError(err, 'Registrasi Gagal');
      return { success: false, message: err?.message || 'Registrasi gagal' };
    }
  }

  /**
   * Handle user logout
   */
  public logout(): void {
    this.callbacks.setCurrentRole('GUEST');
    this.callbacks.setViewMode('PLATFORM');
    this.notify('Berhasil Keluar', 'Anda telah keluar dari akun dan kembali ke halaman utama.', 'info');
  }
}
