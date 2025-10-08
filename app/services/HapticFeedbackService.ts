import { Vibration, Platform } from 'react-native';

/**
 * Advanced Haptic Feedback Service
 * Provides contextual vibration patterns for elderly cognitive assessment
 * Novel Feature: Pattern-based tactile feedback for accessibility
 */
export class HapticFeedbackService {
  // Different patterns for different actions
  private static readonly PATTERNS = {
    // Success patterns
    CORRECT_ANSWER: [0, 100, 50, 100], // Double tap
    PERFECT_ROUND: [0, 50, 30, 50, 30, 50], // Triple tap
    ACHIEVEMENT: [0, 200, 100, 200], // Strong celebration
    
    // Feedback patterns
    WRONG_ANSWER: [0, 500], // Long buzz
    WARNING: [0, 100, 100, 100], // Alert pattern
    TIME_WARNING: [0, 50, 50, 50, 50, 50], // Urgent pattern
    
    // Interaction patterns
    BUTTON_PRESS: [0, 50], // Light tap
    CARD_FLIP: [0, 30], // Very light tap
    SELECTION: [0, 40], // Gentle feedback
    
    // Progress patterns
    LEVEL_UP: [0, 100, 50, 100, 50, 200], // Ascending pattern
    GAME_START: [0, 150], // Strong start
    GAME_END: [0, 300], // Strong end
  };

  /**
   * Vibrate with a specific pattern
   */
  private static vibrate(pattern: number[]) {
    if (Platform.OS === 'android') {
      Vibration.vibrate(pattern);
    } else {
      // iOS doesn't support patterns, use simple vibration
      Vibration.vibrate();
    }
  }

  // Success feedback
  static correctAnswer() {
    this.vibrate(this.PATTERNS.CORRECT_ANSWER);
  }

  static perfectRound() {
    this.vibrate(this.PATTERNS.PERFECT_ROUND);
  }

  static achievement() {
    this.vibrate(this.PATTERNS.ACHIEVEMENT);
  }

  // Error feedback
  static wrongAnswer() {
    this.vibrate(this.PATTERNS.WRONG_ANSWER);
  }

  static warning() {
    this.vibrate(this.PATTERNS.WARNING);
  }

  static timeWarning() {
    this.vibrate(this.PATTERNS.TIME_WARNING);
  }

  // Interaction feedback
  static buttonPress() {
    this.vibrate(this.PATTERNS.BUTTON_PRESS);
  }

  static cardFlip() {
    this.vibrate(this.PATTERNS.CARD_FLIP);
  }

  static selection() {
    this.vibrate(this.PATTERNS.SELECTION);
  }

  // Progress feedback
  static levelUp() {
    this.vibrate(this.PATTERNS.LEVEL_UP);
  }

  static gameStart() {
    this.vibrate(this.PATTERNS.GAME_START);
  }

  static gameEnd() {
    this.vibrate(this.PATTERNS.GAME_END);
  }

  /**
   * Provide haptic feedback based on score percentage
   * Novel Feature: Performance-based vibration intensity
   */
  static scoreBasedFeedback(scorePercentage: number) {
    if (scorePercentage >= 90) {
      this.perfectRound();
    } else if (scorePercentage >= 70) {
      this.correctAnswer();
    } else if (scorePercentage >= 50) {
      this.selection();
    } else {
      this.warning();
    }
  }

  /**
   * Time-based warning haptic (for elderly users)
   * Provides gentle reminders as time runs low
   */
  static timeBasedWarning(secondsLeft: number, totalSeconds: number) {
    const percentageLeft = (secondsLeft / totalSeconds) * 100;
    
    if (percentageLeft <= 10 && secondsLeft % 5 === 0) {
      // Urgent warning every 5 seconds in last 10%
      this.timeWarning();
    } else if (percentageLeft <= 25 && secondsLeft % 10 === 0) {
      // Gentle warning every 10 seconds in last 25%
      this.warning();
    }
  }

  /**
   * Cancel all vibrations
   */
  static cancel() {
    Vibration.cancel();
  }
}