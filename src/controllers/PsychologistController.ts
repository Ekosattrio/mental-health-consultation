import type React from 'react';
import { BaseController, ToastCallback } from './BaseController';
import { PsychologistEndpoints } from '../api/psychologistEndpoints';
import {
  ScheduleSlot,
  ClinicalNote,
  PsychologistProfile,
  Appointment
} from '../types';

export interface PsychologistStateCallbacks {
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  setClinicalNotes: React.Dispatch<React.SetStateAction<Record<string, ClinicalNote>>>;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setPsychologists: React.Dispatch<React.SetStateAction<PsychologistProfile[]>>;
}

/**
 * PsychologistController (OOP Controller)
 * Orchestrates psychologist operations: schedule management, SOAP clinical notes documentation,
 * and professional practice profile updates.
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
   * Save SOAP clinical notes for a patient session
   */
  public async saveClinicalNotes(
    appointmentId: string,
    notes: Omit<ClinicalNote, 'id' | 'createdAt' | 'updatedAt'>,
    existingNotes: Record<string, ClinicalNote>
  ): Promise<ClinicalNote | null> {
    try {
      const response = await PsychologistEndpoints.saveClinicalNotes(
        appointmentId,
        notes,
        existingNotes
      );

      if (!response.success || !response.data) {
        throw new Error(response.message);
      }

      const savedNote = response.data;
      this.callbacks.setClinicalNotes(prev => ({
        ...prev,
        [appointmentId]: savedNote
      }));

      // Link note to appointment and mark complete
      this.callbacks.setAppointments(prev =>
        prev.map(a =>
          a.id === appointmentId
            ? { ...a, status: 'COMPLETED', clinicalNotesId: savedNote.id }
            : a
        )
      );

      this.notify(
        'Catatan Klinis (SOAP) Tersimpan',
        `Catatan sesi rekam medis telah tersimpan permanen.${
          savedNote.requiresPsychiatristReferral
            ? ' Ditandai untuk rujukan psikiater!'
            : ''
        }`,
        'success'
      );

      return savedNote;
    } catch (err: any) {
      this.handleError(err, 'Gagal Menyimpan Catatan Klinis');
      return null;
    }
  }

  /**
   * Update psychologist profile
   */
  public async updateProfile(
    psychologistId: string,
    profileData: Partial<PsychologistProfile>,
    allProfiles: PsychologistProfile[]
  ): Promise<void> {
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
        'Data STR, bio, dan tarif konsultasi praktik Anda berhasil diperbarui.',
        'success'
      );
    } catch (err: any) {
      this.handleError(err, 'Gagal Memperbarui Profil');
    }
  }
}
