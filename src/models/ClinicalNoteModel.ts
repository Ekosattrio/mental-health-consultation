import { ClinicalNote as ClinicalNoteEntity } from '../types';

/**
 * ClinicalNoteModel (OOP)
 * Encapsulates SOAP (Subjective, Objective, Assessment, Plan) progress notes and psychiatrist referral flags.
 */
export class ClinicalNoteModel {
  private _data: ClinicalNoteEntity;

  constructor(data: ClinicalNoteEntity) {
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
  public get psychologistId(): string {
    return this._data.psychologistId;
  }
  public get sessionDate(): string {
    return this._data.sessionDate;
  }
  public get subjective(): string {
    return this._data.subjective;
  }
  public get objective(): string {
    return this._data.objective;
  }
  public get assessment(): string {
    return this._data.assessment;
  }
  public get plan(): string {
    return this._data.plan;
  }
  public get prognosis(): string {
    return this._data.prognosis;
  }
  public get requiresPsychiatristReferral(): boolean {
    return this._data.requiresPsychiatristReferral;
  }
  public get createdAt(): string {
    return this._data.createdAt;
  }
  public get updatedAt(): string {
    return this._data.updatedAt;
  }
  public get raw(): ClinicalNoteEntity {
    return this._data;
  }

  public isCritical(): boolean {
    return this._data.requiresPsychiatristReferral || this._data.prognosis === 'Butuh Rujukan Psikiater';
  }

  public static create(data: ClinicalNoteEntity): ClinicalNoteModel {
    return new ClinicalNoteModel(data);
  }
}

