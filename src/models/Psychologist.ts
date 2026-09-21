import { User } from './User';
import {
  User as UserEntity,
  PsychologistProfile,
  ScheduleSlot,
  Appointment
} from '../types';

/**
 * Psychologist Model (OOP)
 * Inherits from User, encapsulating professional credentials, clinical profiles,
 * practice schedules, and patient consultation metrics.
 */
export class Psychologist extends User {
  private _profile: PsychologistProfile;

  constructor(user: UserEntity, profile: PsychologistProfile) {
    super(user);
    this._profile = profile;
  }

  // Encapsulated profile accessors
  public get profile(): PsychologistProfile {
    return this._profile;
  }

  public get title(): string {
    return this._profile.title;
  }

  public get fullTitle(): string {
    return `${this._name}, ${this._profile.title}`;
  }

  public get strNumber(): string {
    return this._profile.strNumber;
  }

  public get sipNumber(): string {
    return this._profile.sipNumber;
  }

  public get experienceYears(): number {
    return this._profile.experienceYears;
  }

  public get bio(): string {
    return this._profile.bio;
  }

  public get specialties(): string[] {
    return this._profile.specialties;
  }

  public get therapyApproaches(): string[] {
    return this._profile.therapyApproaches;
  }

  public get rating(): number {
    return this._profile.rating;
  }

  public get reviewCount(): number {
    return this._profile.reviewCount;
  }

  public get consultationFeeOnline(): number {
    return this._profile.consultationFeeOnline;
  }

  public get consultationFeeOffline(): number {
    return this._profile.consultationFeeOffline;
  }

  public get languages(): string[] {
    return this._profile.languages;
  }

  public get clinicAddress(): string {
    return this._profile.clinicAddress;
  }

  public get isAvailableToday(): boolean {
    return this._profile.isAvailableToday;
  }

  // Formatting helpers
  public getFormattedOnlineFee(): string {
    return `Rp ${this._profile.consultationFeeOnline.toLocaleString('id-ID')}`;
  }

  public getFormattedOfflineFee(): string {
    return `Rp ${this._profile.consultationFeeOffline.toLocaleString('id-ID')}`;
  }

  // Schedule filtering methods
  public getScheduleSlots(schedules: ScheduleSlot[]): ScheduleSlot[] {
    return schedules.filter(s => s.psychologistId === this._id);
  }

  public getAvailableSlots(schedules: ScheduleSlot[], date?: string): ScheduleSlot[] {
    return schedules.filter(
      s =>
        s.psychologistId === this._id &&
        s.isAvailable &&
        !s.isBooked &&
        (!date || s.date === date)
    );
  }

  // Appointment filtering methods
  public getAssignedAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(a => a.psychologistId === this._id);
  }

  public getActiveConsultations(appointments: Appointment[]): Appointment[] {
    return appointments.filter(
      a =>
        a.psychologistId === this._id &&
        (a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
    );
  }

  public getUniquePatientCount(appointments: Appointment[]): number {
    const myApts = this.getAssignedAppointments(appointments);
    const patientSet = new Set(myApts.map(a => a.patientId));
    return patientSet.size;
  }

  public static override create(user: UserEntity, profile?: PsychologistProfile): Psychologist {
    const fallbackProfile: PsychologistProfile = profile || {
      userId: user.id,
      title: 'Psikolog Klinis',
      strNumber: 'STR-PSI-DEFAULT',
      sipNumber: 'SIP-DEFAULT',
      experienceYears: 1,
      bio: '',
      specialties: ['Konseling Umum'],
      therapyApproaches: ['CBT'],
      rating: 5.0,
      reviewCount: 0,
      consultationFeeOnline: 200000,
      consultationFeeOffline: 300000,
      languages: ['Bahasa Indonesia'],
      clinicAddress: 'JiwaSehat Clinic Center',
      isAvailableToday: true
    };
    return new Psychologist(user, fallbackProfile);
  }
}
