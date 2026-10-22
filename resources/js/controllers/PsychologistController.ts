import type React from 'react';
import { BaseController, ToastCallback } from './BaseController';
import { PsychologistEndpoints } from '../api/psychologistEndpoints';
import {
  ConsultationPackage,
  ScheduleSlot,
  PsychologistProfile
} from '../types';

export interface PsychologistStateCallbacks {
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setPsychologists: React.Dispatch<React.SetStateAction<PsychologistProfile[]>>;
  setPackages: React.Dispatch<React.SetStateAction<ConsultationPackage[]>>;
}

/**
 * PsychologistController (OOP Controller)
 * Orchestrates psychologist operations for schedule, package, and professional profile management.
 */
export class PsychologistController extends BaseController {
  private callbacks: PsychologistStateCallbacks;

  constructor(notify: ToastCallback, callbacks: PsychologistStateCallbacks) {
    super(notify);
    this.callbacks = callbacks;
  }

  /**
   * Add a new consultation schedule slot
   */
  public async addScheduleSlot(
    psychologistId: string,
    date: string,
    startTime: string,
    endTime: string,
    existingSchedules: ScheduleSlot[]
  ): Promise<boolean> {
    try {
      const response = await PsychologistEndpoints.addScheduleSlot(
        psychologistId,
        date,
        startTime,
        endTime,
        existingSchedules
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const newSlot = response.data;
      this.callbacks.setSchedules(prev => [...prev, newSlot]);

      this.notify(
        'Slot Ditambahkan',
        `Slot jadwal ${newSlot.date} pukul ${newSlot.startTime}-${newSlot.endTime} WIB berhasil dibuka.`,
        'success'
      );
      return true;
    } catch (err: any) {
      this.handleError(err, 'Gagal Menambah Slot');
      return false;
    }
  }

  /**
   * Toggle slot availability
   */
  public async toggleSlotAvailability(
    slotId: string,
    allSchedules: ScheduleSlot[]
  ): Promise<void> {
    try {
      const response = await PsychologistEndpoints.toggleSlotAvailability(
        slotId,
        allSchedules
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setSchedules(response.data);
      this.notify('Status Slot Diubah', 'Ketersediaan slot berhasil diperbarui.', 'info');
    } catch (err: any) {
      this.handleError(err, 'Gagal Mengubah Slot');
    }
  }

  /**
   * Delete unbooked schedule slot
   */
  public async deleteScheduleSlot(
    slotId: string,
    allSchedules: ScheduleSlot[]
  ): Promise<void> {
    try {
      const response = await PsychologistEndpoints.deleteScheduleSlot(
        slotId,
        allSchedules
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setSchedules(response.data);
      this.notify('Slot Dihapus', 'Slot jadwal telah dihapus dari kalender praktik.', 'info');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menghapus Slot');
    }
  }

  /**
   * Update psychologist profile
   */
  public async updateProfile(
    psychologistId: string,
    profileData: Partial<PsychologistProfile>,
    allProfiles: PsychologistProfile[]
  ): Promise<boolean> {
    try {
      const response = await PsychologistEndpoints.updateProfile(
        psychologistId,
        profileData,
        allProfiles
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setPsychologists(response.data);
      this.notify(
        'Profil Diperbarui',
        'Data profesional dan profil praktik Anda berhasil diperbarui.',
        'success'
      );
      return true;
    } catch (err: any) {
      this.handleError(err, 'Gagal Memperbarui Profil');
      return false;
    }
  }

  public async savePackage(
    pkg: ConsultationPackage,
    allPackages: ConsultationPackage[]
  ): Promise<void> {
    try {
      const response = await PsychologistEndpoints.savePackage(pkg, allPackages);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setPackages(response.data);
      this.notify('Paket Konsultasi Disimpan', `Paket "${pkg.name}" berhasil diperbarui.`, 'success');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyimpan Paket');
    }
  }

  public async deletePackage(
    packageId: string,
    allPackages: ConsultationPackage[]
  ): Promise<void> {
    try {
      const response = await PsychologistEndpoints.deletePackage(packageId, allPackages);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      this.callbacks.setPackages(response.data);
      this.notify('Paket Dihapus', 'Paket layanan telah dihapus dari katalog.', 'info');
    } catch (err: any) {
      this.handleError(err, 'Gagal Menghapus Paket');
    }
  }
}
