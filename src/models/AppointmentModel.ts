import { Appointment as AppointmentEntity, AppointmentStatus } from '../types';

/**
 * Appointment Domain Model (OOP)
 * Encapsulates status checks, date/time formatting, and booking eligibility.
 */
export class AppointmentModel {
  private _data: AppointmentEntity;

  constructor(data: AppointmentEntity) {
    this._data = data;
  }

  public get id(): string {
    return this._data.id;
  }
  public get bookingCode(): string {
    return this._data.bookingCode;
  }
  public get patientId(): string {
    return this._data.patientId;
  }
  public get patientName(): string {
    return this._data.patientName;
  }
  public get patientEmail(): string {
    return this._data.patientEmail;
  }
  public get psychologistId(): string {
    return this._data.psychologistId;
  }
  public get psychologistName(): string {
    return this._data.psychologistName;
  }
  public get packageId(): string {
    return this._data.packageId;
  }
  public get packageName(): string {
    return this._data.packageName;
  }
  public get packageType(): string {
    return this._data.packageType;
  }
  public get date(): string {
    return this._data.date;
  }
  public get startTime(): string {
    return this._data.startTime;
  }
  public get endTime(): string {
    return this._data.endTime;
  }
  public get status(): AppointmentStatus {
    return this._data.status;
  }
  public get paymentStatus(): string {
    return this._data.paymentStatus;
  }
  public get totalAmount(): number {
    return this._data.totalAmount;
  }
  public get meetingLocation(): string {
    return this._data.meetingLocation;
  }
  public get hasIntakeForm(): boolean {
    return this._data.hasIntakeForm;
  }
  public get hasTestResult(): boolean {
    return this._data.hasTestResult;
  }
  public get raw(): AppointmentEntity {
    return this._data;
  }

  // Domain behavioral methods
  public isOffline(): boolean {
    return this._data.packageType === 'OFFLINE_CLINIC';
  }

  public isConfirmed(): boolean {
    return this._data.status === 'CONFIRMED';
  }

  public isInProgress(): boolean {
    return this._data.status === 'IN_PROGRESS';
  }

  public isCompleted(): boolean {
    return this._data.status === 'COMPLETED';
  }

  public isCancelled(): boolean {
    return this._data.status === 'CANCELLED';
  }

  public canOpenSessionDetail(): boolean {
    return this.isConfirmed() || this.isInProgress();
  }

  public getFormattedPrice(): string {
    return `Rp ${this._data.totalAmount.toLocaleString('id-ID')}`;
  }

  public getFormattedSchedule(): string {
    return `${this._data.date} • ${this._data.startTime} - ${this._data.endTime} WIB`;
  }

  public static create(data: AppointmentEntity): AppointmentModel {
    return new AppointmentModel(data);
  }
}

