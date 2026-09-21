import { User } from './User';
import { User as UserEntity, IntakeForm, Appointment, TestResult } from '../types';

export interface RiskEvaluation {
  level: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'KRITIS';
  score: number;
  label: string;
  color: string;
  hasSuicideRisk: boolean;
  recommendation: string;
}

/**
 * Patient Model (OOP)
 * Inherits from User and encapsulates clinical records, intake status, and psychological test evaluations.
 */
export class Patient extends User {
  constructor(data: UserEntity) {
    super(data);
  }

  /**
   * Check if patient has completed the clinical intake form
   */
  public hasCompletedIntake(forms: Record<string, IntakeForm>): boolean {
    return !!forms[this._id];
  }

  /**
   * Retrieve patient's intake form
   */
  public getIntakeForm(forms: Record<string, IntakeForm>): IntakeForm | undefined {
    return forms[this._id];
  }

  /**
   * Get all appointments associated with this patient
   */
  public getAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(a => a.patientId === this._id);
  }

  /**
   * Get active consultation session (either CONFIRMED or IN_PROGRESS)
   */
  public getActiveAppointment(appointments: Appointment[]): Appointment | undefined {
    return appointments.find(
      a =>
        a.patientId === this._id &&
        (a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
    );
  }

  /**
   * Get past completed appointments
   */
  public getPastAppointments(appointments: Appointment[]): Appointment[] {
    return appointments.filter(
      a => a.patientId === this._id && a.status === 'COMPLETED'
    );
  }

  /**
   * Get all test results taken by this patient
   */
  public getTestResults(results: TestResult[]): TestResult[] {
    return results.filter(r => r.patientId === this._id);
  }

  /**
   * Get the most recent psychological assessment result
   */
  public getLatestTestResult(results: TestResult[]): TestResult | undefined {
    const userResults = this.getTestResults(results);
    if (userResults.length === 0) return undefined;
    return [...userResults].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];
  }

  /**
   * OOP Evaluator: Compute patient overall risk level based on Intake and DASS-21 score
   */
  public evaluateRiskProfile(
    results: TestResult[],
    forms: Record<string, IntakeForm>
  ): RiskEvaluation {
    const intake = this.getIntakeForm(forms);
    const latestTest = this.getLatestTestResult(results);

    const hasSuicideFlag = !!intake?.suicideRiskFlag;
    const stressScore = intake?.currentStressLevel || 5;
    const dassSeverity = latestTest?.severityLevel || 'NORMAL';

    if (hasSuicideFlag || dassSeverity === 'SANGAT_BERAT') {
      return {
        level: 'KRITIS',
        score: 95,
        label: 'Tingkat Risiko Kritis - Perlu Intervensi Segera',
        color: 'rose',
        hasSuicideRisk: true,
        recommendation: 'Prioritaskan rujukan darurat, dampingi sesi konsultasi intensif bersama psikiater.'
      };
    }

    if (dassSeverity === 'BERAT' || stressScore >= 8) {
      return {
        level: 'TINGGI',
        score: 75,
        label: 'Tingkat Risiko Tinggi',
        color: 'amber',
        hasSuicideRisk: false,
        recommendation: 'Jadwalkan konseling rutin mingguan dan pemantauan dinamika afek.'
      };
    }

    if (dassSeverity === 'SEDANG' || stressScore >= 6) {
      return {
        level: 'SEDANG',
        score: 50,
        label: 'Tingkat Risiko Sedang',
        color: 'sky',
        hasSuicideRisk: false,
        recommendation: 'Terapkan teknik relaksasi mandiri (CBT / Mindful Breathing) dan evaluasi 2 minggu ke depan.'
      };
    }

    return {
      level: 'RENDAH',
      score: 20,
      label: 'Tingkat Risiko Rendah / Stabil',
      color: 'emerald',
      hasSuicideRisk: false,
      recommendation: 'Kondisi psikologis stabil. Konseling suportif atau asesmen preventif berkala direkomendasikan.'
    };
  }

  public static create(data: UserEntity): Patient {
    return new Patient(data);
  }
}

