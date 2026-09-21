import { Review as ReviewEntity } from '../types';

/**
 * ReviewModel (OOP)
 * Encapsulates client review ratings, anonymization logic, and admin moderation state.
 */
export class ReviewModel {
  private _data: ReviewEntity;

  constructor(data: ReviewEntity) {
    this._data = data;
  }

  public get id(): string {
    return this._data.id;
  }
  public get appointmentId(): string {
    return this._data.appointmentId;
  }
  public get patientId(): string {
    return this._data.patientId;
  }
  public get patientName(): string {
    return this._data.patientName;
  }
  public get isAnonymous(): boolean {
    return this._data.isAnonymous;
  }
  public get psychologistId(): string {
    return this._data.psychologistId;
  }
  public get psychologistName(): string {
    return this._data.psychologistName;
  }
  public get rating(): number {
    return this._data.rating;
  }
  public get comment(): string {
    return this._data.comment;
  }
  public get isApproved(): boolean {
    return this._data.isApproved;
  }
  public get createdAt(): string {
    return this._data.createdAt;
  }
  public get raw(): ReviewEntity {
    return this._data;
  }

  public getDisplayName(): string {
    if (this._data.isAnonymous) {
      return this._data.anonymousAlias || `Pasien ${this._data.patientName.charAt(0)}***`;
    }
    return this._data.patientName;
  }

  public getStarsArray(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < this._data.rating);
  }

  public static create(data: ReviewEntity): ReviewModel {
    return new ReviewModel(data);
  }
}

