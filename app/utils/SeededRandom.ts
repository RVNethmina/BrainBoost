// app/utils/SeededRandom.ts

/**
 * Generate a deterministic seed from user ID and current date
 * This ensures users get different game patterns each day, but the same patterns on the same day
 * @param userId - The user's unique identifier
 * @returns A numeric seed for the random generator
 */
export const generateDailySeed = (userId: string = 'guest'): number => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const seedString = `${userId}-${today}`;
  
  // Create hash from string
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    const char = seedString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Seeded pseudo-random number generator
 * Uses Linear Congruential Generator (LCG) algorithm
 * This ensures reproducible "random" sequences based on the seed
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate random integer between 0 and max (exclusive)
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm with seeded randomness
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(array.length)];
  }

  /**
   * Pick n random elements from array without replacement
   */
  pickN<T>(array: T[], n: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(n, array.length));
  }
}