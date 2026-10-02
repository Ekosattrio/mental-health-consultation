import { PsychologicalTest, TestResult } from '../types';

export interface Dass21ScoreBreakdown {
  depressionRaw: number;
  depressionScaled: number;
  anxietyRaw: number;
  anxietyScaled: number;
  stressRaw: number;
  stressScaled: number;
  totalScore: number;
  severityLevel: 'NORMAL' | 'RINGAN' | 'SEDANG' | 'BERAT' | 'SANGAT_BERAT';
  interpretation: string;
  recommendation: string;
}

/**
 * Dass21Scorer (OOP Domain Model)
 * Implements Lovibond & Lovibond (1995) standard scoring formula and diagnostic thresholds for DASS-21.
 */
export class Dass21Scorer {
  // Question ID subscales for DASS-21
  public static readonly DEPRESSION_ITEMS = [3, 5, 10, 13, 16, 17, 21];
  public static readonly ANXIETY_ITEMS = [2, 4, 7, 9, 15, 19, 20];
  public static readonly STRESS_ITEMS = [1, 6, 8, 11, 12, 14, 18];

  /**
   * Calculate subscale scores and clinical evaluation
   */
  public static calculateScores(answers: Record<number, number>): Dass21ScoreBreakdown {
    let depressionRaw = 0;
    let anxietyRaw = 0;
    let stressRaw = 0;

    this.DEPRESSION_ITEMS.forEach(id => {
      depressionRaw += answers[id] || 0;
    });

    this.ANXIETY_ITEMS.forEach(id => {
      anxietyRaw += answers[id] || 0;
    });

    this.STRESS_ITEMS.forEach(id => {
      stressRaw += answers[id] || 0;
    });

    // In DASS-21, raw score is multiplied by 2 to compare with standard DASS-42 normative tables
    const depressionScaled = depressionRaw * 2;
    const anxietyScaled = anxietyRaw * 2;
    const stressScaled = stressRaw * 2;
    const totalScore = depressionScaled + anxietyScaled + stressScaled;

    const severityLevel = this.determineOverallSeverity(
      depressionScaled,
      anxietyScaled,
      stressScaled
    );

    const interpretation = this.generateInterpretation(
      depressionScaled,
      anxietyScaled,
      stressScaled,
      severityLevel
    );

    const recommendation = this.generateRecommendation(severityLevel);

    return {
      depressionRaw,
      depressionScaled,
      anxietyRaw,
      anxietyScaled,
      stressRaw,
      stressScaled,
      totalScore,
      severityLevel,
      interpretation,
      recommendation
    };
  }

  private static determineOverallSeverity(
    dep: number,
    anx: number,
    str: number
  ): 'NORMAL' | 'RINGAN' | 'SEDANG' | 'BERAT' | 'SANGAT_BERAT' {
    if (dep >= 28 || anx >= 20 || str >= 34) return 'SANGAT_BERAT';
    if (dep >= 21 || anx >= 15 || str >= 26) return 'BERAT';
    if (dep >= 14 || anx >= 10 || str >= 19) return 'SEDANG';
    if (dep >= 10 || anx >= 8 || str >= 15) return 'RINGAN';
    return 'NORMAL';
  }

  private static generateInterpretation(
    dep: number,
    anx: number,
    str: number,
    severity: string
  ): string {
    return (
      `Skor DASS-21 menunjukkan indikasi ${severity.replace('_', ' ')}. ` +
      `Subskala: Depresi (${dep}), Kecemasan (${anx}), dan Stres (${str}). ` +
      (severity === 'NORMAL'
        ? 'Tingkat afek dan keseimbangan emosional Anda berada dalam rentang populasi umum yang sehat.'
        : 'Terdapat indikasi ketegangan emosional atau kecemasan yang berpotensi mempengaruhi produktivitas harian.')
    );
  }

  private static generateRecommendation(severity: string): string {
    switch (severity) {
      case 'SANGAT_BERAT':
        return 'Sangat disarankan segera berkonsultasi dengan Psikolog Klinis atau Psikiater untuk intervensi profesional.';
      case 'BERAT':
        return 'Disarankan mengambil sesi konseling tatap muka atau video call untuk menyusun strategi coping terstruktur.';
      case 'SEDANG':
        return 'Konsultasi terjadwal dengan psikolog direkomendasikan bersama latihan regulasi emosi mandiri.';
      case 'RINGAN':
        return 'Praktikkan teknik grounding, relaksasi pernapasan, serta manajemen waktu untuk mencegah eskalasi stres.';
      default:
        return 'Pertahankan gaya hidup sehat, pola tidur teratur, dan luangkan waktu untuk relaksasi aktif.';
    }
  }

  /**
   * Helper to format a TestResult object
   */
  public static createTestResult(
    patientId: string,
    patientName: string,
    test: PsychologicalTest,
    answers: Record<number, number>
  ): Omit<TestResult, 'id' | 'completedAt'> {
    const scores = this.calculateScores(answers);
    return {
      patientId,
      patientName,
      testId: test.id,
      testCode: test.code,
      testTitle: test.title,
      totalScore: scores.totalScore,
      subscaleScores: {
        depression: scores.depressionScaled,
        anxiety: scores.anxietyScaled,
        stress: scores.stressScaled
      },
      severityLevel: scores.severityLevel,
      interpretation: scores.interpretation,
      clinicalRecommendation: scores.recommendation
    };
  }
}

