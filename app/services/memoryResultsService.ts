// services/memoryResultsService.ts
import { NotificationService } from '@/config/NotificationService';
import { auth, firestore } from '@/config/firebaseConfig';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

export type MemoryResultPayload = {
  score: number;
  totalQuestions: number;
  timeTaken: number; // seconds
  level: number;
  endedBy: string;
  gameType: string; // 'pattern', 'cards', 'sequence', 'spatial'
  attempts?: number; // for games that allow retries
  difficulty?: string; // easy, medium, hard, expert
};

export async function saveMemoryResult(payload: MemoryResultPayload) {
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
      attempts: payload.attempts || 1,
      difficulty: payload.difficulty || 'easy',
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
        const resultRef = doc(collection(userDocRef, 'memoryResults'));
        
        console.log('📍 User collection path:', `users/${uid}/memoryResults`);
        
        await setDoc(resultRef, docData);
        console.log('✅ Memory result saved to user collection:', resultRef.id);

        // Try to send notification
        try {
          await NotificationService.sendLocalNotification(
            'Memory Game Result Saved',
            `Your ${payload.gameType} game result (${percentage}%) was saved.`
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
}

async function saveToPublicCollection(docData: any) {
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
    
    // Last resort - try local storage or return error with detailed info
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

// Helper function to test Firebase connection
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