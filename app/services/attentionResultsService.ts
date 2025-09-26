// app/src/services/attentionResultsService.ts
import { NotificationService } from '@/config/NotificationService';
import { auth, firestore } from '@/config/firebaseConfig';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

export type AttentionResultPayload = {
  score: number;
  totalQuestions: number;
  timeTaken: number; // seconds
  level: number;
  endedBy: string;
  gameType: string; // 'symbol_search', 'color_focus', 'speed_challenge'
  difficulty?: string; // easy, medium, hard
  accuracy: number; // percentage
  avgReactionTime: number; // milliseconds
  totalSelections: number;
  correctSelections: number;
  missedRounds?: number; // for time-limited rounds
};

export async function saveAttentionResult(payload: AttentionResultPayload) {
  try {
    const user = auth.currentUser;
    const uid = user?.uid;
    const percentage = payload.totalQuestions > 0
      ? Math.round((payload.score / payload.totalQuestions) * 100)
      : 0;

    console.log('🔍 Debug Info:');
    console.log('- User authenticated:', !!user);
    console.log('- User UID:', uid || 'none');
    console.log('- User email:', user?.email || 'none');
    console.log('- Auth state:', auth.currentUser ? 'signed in' : 'signed out');

    const docData = {
      score: payload.score,
      totalQuestions: payload.totalQuestions,
      percentage,
      timeTaken: payload.timeTaken,
      level: payload.level,
      endedBy: payload.endedBy,
      gameType: payload.gameType,
      difficulty: payload.difficulty || 'easy',
      accuracy: payload.accuracy,
      avgReactionTime: payload.avgReactionTime,
      totalSelections: payload.totalSelections,
      correctSelections: payload.correctSelections,
      missedRounds: payload.missedRounds || 0,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      userId: uid || null,
      userEmail: user?.email || 'anonymous',
      timestamp: Date.now(), // Add regular timestamp as backup
    };

    console.log('📝 Document data to save:', JSON.stringify(docData, null, 2));

    if (uid) {
      // Try saving to user's subcollection first
      console.log('🎯 Attempting to save to user collection...');
      try {
        const userDocRef = doc(firestore, 'users', uid);
        const resultRef = doc(collection(userDocRef, 'attentionResults'));
        
        console.log('📍 User collection path:', `users/${uid}/attentionResults`);
        
        await setDoc(resultRef, docData);
        console.log('✅ Attention result saved to user collection:', resultRef.id);

        // Try to send notification
        try {
          await NotificationService.sendLocalNotification(
            'Attention Game Result Saved',
            `Your ${payload.gameType} game result (${payload.accuracy}% accuracy) was saved.`
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
    console.error('💥 Critical error in saveAttentionResult:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error };
  }
}

async function saveToPublicCollection(docData: any) {
  try {
    console.log('📍 Public collection path: publicAttentionResults');
    
    // Remove userId for public collection to avoid confusion
    const publicDocData = {
      ...docData,
      userId: null,
    };

    const colRef = collection(firestore, 'publicAttentionResults');
    const docRef = await addDoc(colRef, publicDocData);
    
    console.log('✅ Attention result saved to public collection:', docRef.id);
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

// Helper function to get attention results for dashboard
export async function getAttentionResults(userId: string, limit: number = 10) {
  try {
    const userDocRef = doc(firestore, 'users', userId);
    const resultsRef = collection(userDocRef, 'attentionResults');
    
    // This would typically use orderBy and limit, but showing the structure
    console.log('📊 Fetching attention results for user:', userId);
    
    return { success: true, results: [] }; // Placeholder
  } catch (error) {
    console.error('Error fetching attention results:', error);
    return { success: false, error };
  }
}

// Helper function to get attention summary for dashboard
export function getAttentionSummary(results: AttentionResultPayload[]) {
  if (results.length === 0) {
    return {
      averageAccuracy: 0,
      averageReactionTime: 0,
      totalGamesPlayed: 0,
      bestScore: 0,
      improvementTrend: 'neutral' as 'improving' | 'declining' | 'neutral'
    };
  }

  const totalAccuracy = results.reduce((sum, r) => sum + r.accuracy, 0);
  const totalReactionTime = results.reduce((sum, r) => sum + r.avgReactionTime, 0);
  const scores = results.map(r => r.score);
  
  // Calculate improvement trend (last 5 vs previous 5)
  let improvementTrend: 'improving' | 'declining' | 'neutral' = 'neutral';
  if (results.length >= 6) {
    const recent = results.slice(-5);
    const previous = results.slice(-10, -5);
    const recentAvg = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;
    const previousAvg = previous.reduce((sum, r) => sum + r.accuracy, 0) / previous.length;
    
    if (recentAvg > previousAvg + 5) improvementTrend = 'improving';
    else if (recentAvg < previousAvg - 5) improvementTrend = 'declining';
  }

  return {
    averageAccuracy: Math.round(totalAccuracy / results.length),
    averageReactionTime: Math.round(totalReactionTime / results.length),
    totalGamesPlayed: results.length,
    bestScore: Math.max(...scores),
    improvementTrend
  };
}

// Helper function to test Firebase connection for attention results
export async function testAttentionFirebaseConnection() {
  try {
    console.log('🧪 Testing Attention Firebase connection...');
    
    const user = auth.currentUser;
    console.log('Auth test - User:', user ? `${user.uid} (${user.email})` : 'Not authenticated');
    
    const testCollection = collection(firestore, 'testAttention');
    console.log('Firestore test - Collection reference created:', !!testCollection);
    
    const testData = {
      test: true,
      gameType: 'test_attention',
      timestamp: serverTimestamp(),
      platform: Platform.OS
    };
    
    const testDocRef = await addDoc(testCollection, testData);
    console.log('✅ Attention Firebase write test successful:', testDocRef.id);
    
    return { success: true, message: 'Attention Firebase connection working' };
  } catch (error: any) {
    console.error('❌ Attention Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
}