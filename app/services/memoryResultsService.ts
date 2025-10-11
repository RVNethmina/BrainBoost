// services/memoryResultsService.ts (React Native Mobile)
import { NotificationService } from '@/config/NotificationService';
import { auth, firestore } from '@/config/firebaseConfig';
import { addDoc, collection, doc, serverTimestamp, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { Platform } from 'react-native';

type MemoryGameType = 'pattern' | 'cards' | 'numbers' | 'pictures';
type MemoryDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface MemoryResultInput {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  level: number;
  endedBy: string;
  gameType: MemoryGameType;
  difficulty: MemoryDifficulty;
}

interface MemoryResultData extends MemoryResultInput {
  percentageScore: number;
  userId: string | null;
  userEmail: string;
  platform: string;
  createdAt: any;
  timestamp: number;
}

/**
 * Calculate percentage score correctly based on game type
 * FIXED: Prevents percentages over 100%
 */
const calculatePercentageScore = (
  score: number,
  totalQuestions: number,
  gameType: MemoryGameType
): number => {
  if (totalQuestions <= 0) return 0;

  let percentage = 0;

  switch (gameType) {
    case 'pattern':
      // Pattern game: 1 point per correct pattern
      percentage = (score / totalQuestions) * 100;
      break;

    case 'cards':
      // Cards game: 2 points per pair, totalQuestions = max pairs possible
      // Score represents points earned (2 per match)
      const maxCardScore = totalQuestions * 2;
      percentage = (score / maxCardScore) * 100;
      break;

    case 'numbers':
      // Numbers game: Variable points per round (10-60 per round)
      // Max possible: 60 points per round
      const maxNumberScore = totalQuestions * 60;
      percentage = (score / maxNumberScore) * 100;
      break;

    case 'pictures':
      // Pictures game: Variable points based on accuracy
      // Max possible: ~100 points per round
      const maxPictureScore = totalQuestions * 100;
      percentage = (score / maxPictureScore) * 100;
      break;

    default:
      // Fallback: direct ratio
      percentage = (score / totalQuestions) * 100;
  }

  // CRITICAL: Always cap at 100%
  return Math.min(100, Math.round(percentage));
};

/**
 * Save memory game result to Firestore
 * Returns success status and document ID
 */
export const saveMemoryResult = async (
  result: MemoryResultInput
): Promise<{ success: boolean; id?: string; error?: unknown }> => {
  try {
    const user = auth.currentUser;
    const uid = user?.uid;

    // Calculate capped percentage
    const percentageScore = calculatePercentageScore(
      result.score,
      result.totalQuestions,
      result.gameType
    );

    // Validate percentage is within bounds
    if (percentageScore < 0 || percentageScore > 100) {
      console.error('Invalid percentage calculated:', percentageScore);
      throw new Error('Percentage calculation error');
    }

    console.log('🔍 Debug Info:');
    console.log('- User authenticated:', !!user);
    console.log('- User UID:', uid || 'none');
    console.log('- Game type:', result.gameType);
    console.log('- Score:', result.score, '/', result.totalQuestions);
    console.log('- Calculated percentage:', percentageScore + '%');

    const docData: MemoryResultData = {
      ...result,
      percentageScore,
      userId: uid || null,
      userEmail: user?.email || 'anonymous',
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      timestamp: Date.now(),
    };

    console.log('📝 Document data to save:', JSON.stringify(docData, null, 2));

    if (uid) {
      // Try saving to user's subcollection first
      console.log('🎯 Attempting to save to user collection...');
      try {
        const userDocRef = doc(firestore, 'users', uid);
        const resultRef = doc(collection(userDocRef, 'memoryResults'));
        
        console.log('📍 User collection path:', `users/${uid}/memoryResults`);
        
        await setDoc(resultRef, docData);
        console.log('✅ Memory result saved to user collection:', resultRef.id);

        // Try to send notification
        try {
          await NotificationService.sendLocalNotification(
            'Memory Game Result Saved',
            `Your ${result.gameType} game result (${percentageScore}%) was saved.`
          );
        } catch (nErr) {
          console.warn('⚠️ Notification send failed', nErr);
        }

        return { success: true, id: resultRef.id };
      } catch (userSaveError: any) {
        console.error('❌ Error saving to user collection:', userSaveError);
        console.error('Error code:', userSaveError.code);
        console.error('Error message:', userSaveError.message);
        
        // Fall back to public collection
        console.log('🔄 Falling back to public collection...');
        return await saveToPublicCollection(docData);
      }
    } else {
      // No authenticated user - try public collection
      console.log('👤 No authenticated user, saving to public collection...');
      return await saveToPublicCollection(docData);
    }
  } catch (error: any) {
    console.error('💥 Critical error in saveMemoryResult:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error };
  }
};

/**
 * Helper function to save to public collection
 */
async function saveToPublicCollection(docData: MemoryResultData) {
  try {
    console.log('📍 Public collection path: publicMemoryResults');
    
    // Remove userId for public collection to avoid confusion
    const publicDocData = {
      ...docData,
      userId: null,
    };

    const colRef = collection(firestore, 'publicMemoryResults');
    const docRef = await addDoc(colRef, publicDocData);
    
    console.log('✅ Memory result saved to public collection:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (publicError: any) {
    console.error('❌ Error saving to public collection:', publicError);
    console.error('Public error code:', publicError.code);
    console.error('Public error message:', publicError.message);
    
    return { 
      success: false, 
      error: publicError,
      details: {
        code: publicError.code,
        message: publicError.message,
        authState: auth.currentUser ? 'authenticated' : 'not authenticated'
      }
    };
  }
}

/**
 * Get user's memory game history
 */
export const getMemoryResults = async (userId: string) => {
  try {
    const memoryResultsRef = collection(firestore, 'users', userId, 'memoryResults');
    const q = query(memoryResultsRef, orderBy('timestamp', 'desc'), limit(50));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching memory results:', error);
    return [];
  }
};

/**
 * Get statistics for a specific game type
 */
export const getGameTypeStats = async (userId: string, gameType: MemoryGameType) => {
  try {
    const memoryResultsRef = collection(firestore, 'users', userId, 'memoryResults');
    const q = query(
      memoryResultsRef,
      where('gameType', '==', gameType),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => doc.data() as MemoryResultData);
    
    if (results.length === 0) {
      return null;
    }
    
    const avgScore = results.reduce((sum, r) => sum + r.percentageScore, 0) / results.length;
    const bestScore = Math.max(...results.map(r => r.percentageScore));
    const gamesPlayed = results.length;
    
    return {
      averageScore: Math.round(avgScore),
      bestScore,
      gamesPlayed,
      lastPlayed: results[0].timestamp,
    };
  } catch (error) {
    console.error('Error fetching game type stats:', error);
    return null;
  }
};

/**
 * Helper function to test Firebase connection
 */
export async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test 1: Check auth state
    const user = auth.currentUser;
    console.log('Auth test - User:', user ? `${user.uid} (${user.email})` : 'Not authenticated');
    
    // Test 2: Try to read from a simple collection
    const testCollection = collection(firestore, 'test');
    console.log('Firestore test - Collection reference created:', !!testCollection);
    
    // Test 3: Try a simple write operation
    const testData = {
      test: true,
      timestamp: serverTimestamp(),
      platform: Platform.OS
    };
    
    const testDocRef = await addDoc(testCollection, testData);
    console.log('✅ Firebase write test successful:', testDocRef.id);
    
    return { success: true, message: 'Firebase connection working' };
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
}