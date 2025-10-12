// app/src/services/fatigueDetectionService.ts

export type FatigueLevel = 'none' | 'early' | 'moderate' | 'high';

export type PerformanceMetrics = {
  roundNumber: number;
  accuracy: number;
  reactionTime: number;
  timestamp: number;
};

export type FatigueDetectionResult = {
  fatigueLevel: FatigueLevel;
  rtDegradation: number; // percentage increase in RT
  accuracyDrop: number; // percentage drop in accuracy
  consistency: number; // 0-100, lower = more erratic
  shouldRecommendBreak: boolean;
  recommendation: string;
  sessionDurationMinutes: number;
};

export class FatigueDetectionService {
  private performanceHistory: PerformanceMetrics[] = [];
  private sessionStartTime: number = 0;
  private maxSessionDuration = 900000; // 15 minutes in milliseconds
  private rtThreshold = 1.2; // 20% increase
  private accuracyThreshold = 0.15; // 15% drop

  constructor() {
    this.sessionStartTime = Date.now();
  }

  /**
   * Add a round's performance data
   */
  addPerformanceData(roundNumber: number, accuracy: number, reactionTime: number) {
    this.performanceHistory.push({
      roundNumber,
      accuracy,
      reactionTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Analyze fatigue based on performance trends
   */
  analyzeFatigue(): FatigueDetectionResult {
    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 60000);

    if (this.performanceHistory.length < 3) {
      return {
        fatigueLevel: 'none',
        rtDegradation: 0,
        accuracyDrop: 0,
        consistency: 100,
        shouldRecommendBreak: false,
        recommendation: 'Keep up the good work!',
        sessionDurationMinutes: sessionDuration,
      };
    }

    // Get baseline (first 2 rounds) and recent performance (last 3 rounds)
    const baseline = this.performanceHistory.slice(0, Math.min(2, this.performanceHistory.length));
    const recent = this.performanceHistory.slice(-3);

    const baselineAvgRT = this._average(baseline.map(p => p.reactionTime));
    const baselineAvgAccuracy = this._average(baseline.map(p => p.accuracy));

    const recentAvgRT = this._average(recent.map(p => p.reactionTime));
    const recentAvgAccuracy = this._average(recent.map(p => p.accuracy));

    // Calculate degradation metrics
    const rtDegradation = (recentAvgRT - baselineAvgRT) / baselineAvgRT;
    const accuracyDrop = (baselineAvgAccuracy - recentAvgAccuracy) / baselineAvgAccuracy;

    // Calculate consistency (standard deviation of recent accuracy)
    const recentAccuracies = recent.map(p => p.accuracy);
    const consistency = 100 - Math.min(100, this._standardDeviation(recentAccuracies) * 100);

    // Determine fatigue level
    let fatigueLevel: FatigueLevel = 'none';
    let shouldRecommendBreak = false;

    // Check multiple fatigue indicators
    const rtIndicatesEarlyFatigue = rtDegradation > 0.1; // 10% increase
    const rtIndicatesFatigue = rtDegradation > this.rtThreshold;
    const accuracyIndicatesEarlyFatigue = accuracyDrop > 0.08; // 8% drop
    const accuracyIndicatesFatigue = accuracyDrop > this.accuracyThreshold;
    const consistencyPoor = consistency < 60;
    const sessionTooLong = sessionDuration > 15;

    // Fatigue level determination
    if (
      (rtIndicatesFatigue || accuracyIndicatesFatigue || consistencyPoor) &&
      sessionTooLong
    ) {
      fatigueLevel = 'high';
      shouldRecommendBreak = true;
    } else if (
      rtIndicatesFatigue ||
      accuracyIndicatesFatigue ||
      (consistencyPoor && sessionDuration > 10)
    ) {
      fatigueLevel = 'moderate';
      shouldRecommendBreak = true;
    } else if (
      rtIndicatesEarlyFatigue ||
      accuracyIndicatesEarlyFatigue ||
      consistencyPoor
    ) {
      fatigueLevel = 'early';
    }

    // Generate recommendation
    const recommendation = this._getRecommendation(
      fatigueLevel,
      sessionDuration,
      rtDegradation,
      accuracyDrop
    );

    return {
      fatigueLevel,
      rtDegradation: Math.round(rtDegradation * 100),
      accuracyDrop: Math.round(accuracyDrop * 100),
      consistency: Math.round(consistency),
      shouldRecommendBreak,
      recommendation,
      sessionDurationMinutes: sessionDuration,
    };
  }

  /**
   * Get difficulty adjustment factor (0.5 = half difficulty, 1 = normal, 1.5 = harder)
   */
  getDifficultyAdjustment(fatigueLevel: FatigueLevel): number {
    switch (fatigueLevel) {
      case 'high':
        return 0.4; // Significantly easier
      case 'moderate':
        return 0.6; // Easier
      case 'early':
        return 0.85; // Slightly easier
      case 'none':
      default:
        return 1.0; // Normal difficulty
    }
  }

  /**
   * Get time extension for responses (in milliseconds)
   * Elderly users need more time when fatigued
   */
  getResponseTimeExtension(fatigueLevel: FatigueLevel): number {
    switch (fatigueLevel) {
      case 'high':
        return 5000; // +5 seconds
      case 'moderate':
        return 3000; // +3 seconds
      case 'early':
        return 1000; // +1 second
      case 'none':
      default:
        return 0;
    }
  }

  /**
   * Check if session should be ended for safety
   */
  shouldEndSession(): boolean {
    const sessionDuration = Date.now() - this.sessionStartTime;
    return sessionDuration > this.maxSessionDuration;
  }

  /**
   * Reset for new session
   */
  reset() {
    this.performanceHistory = [];
    this.sessionStartTime = Date.now();
  }

  // Private helper methods
  private _average(values: number[]): number {
    return values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
  }

  private _standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = this._average(values);
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = this._average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
  }

  private _getRecommendation(
    fatigueLevel: FatigueLevel,
    sessionDuration: number,
    rtDegradation: number,
    accuracyDrop: number
  ): string {
    switch (fatigueLevel) {
      case 'high':
        return `You've been training for ${sessionDuration} minutes. Time for a rest! Your brain needs a break. 💙`;
      case 'moderate':
        return `You're doing well, but we notice you might be getting tired. Consider taking a short break soon. ☕`;
      case 'early':
        return `Great focus so far! We're adjusting difficulty to keep it comfortable. 😊`;
      case 'none':
      default:
        return `Excellent performance! Keep it up! 🌟`;
    }
  }
}

/**
 * Utility function to adjust game parameters based on fatigue
 */
export function adjustGameParameters(
  fatigueLevel: FatigueLevel,
  originalParams: {
    gridSize: number;
    targetCount: number;
    timeLimit: number;
    roundTime?: number;
  }
): typeof originalParams {
  const difficultyFactor = new FatigueDetectionService().getDifficultyAdjustment(
    fatigueLevel
  );

  return {
    gridSize: Math.max(6, Math.round(originalParams.gridSize * difficultyFactor)),
    targetCount: Math.max(1, Math.round(originalParams.targetCount * difficultyFactor)),
    timeLimit: Math.round(originalParams.timeLimit / difficultyFactor), // More time when fatigued
    roundTime: originalParams.roundTime
      ? Math.round(originalParams.roundTime / difficultyFactor)
      : undefined,
  };
}