// services/attentionResultsService.ts
import { NotificationService } from '@/config/NotificationService';
import { auth, firestore } from '@/config/firebaseConfig';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

export type AttentionResultPayload = {
  score: number;
  totalTargets: number;
  timeTaken: number; // seconds
  averageReactionTime: number; // milliseconds
  accuracy: number; // percentage
  endedBy: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gameType?: string;
};

export async function saveAttentionResult(payload: AttentionResultPayload) {
  try {
    const user = auth.currentUser;
    const uid = user?.uid;
    const percentage = payload.totalTargets > 0
      ? Math.round((payload.score / payload.totalTargets) * 100)
      : 0;

    const docData = {
      score: payload.score,
      totalTargets: payload.totalTargets,
      percentage,
      timeTaken: payload.timeTaken,
      averageReactionTime: payload.averageReactionTime,
      accuracy: payload.accuracy,
      endedBy: payload.endedBy,
      difficulty: payload.difficulty,
      gameType: payload.gameType || 'attention',
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      userId: uid,
      userEmail: user?.email || 'anonymous',
    };

    console.log('Saving attention result for user:', uid ? 'authenticated' : 'anonymous');
    
    if (uid) {
      // Save under user's subcollection: users/{uid}/attentionResults
      try {
        const resultRef = doc(collection(firestore, 'users', uid, 'attentionResults'));
        await setDoc(resultRef, docData);
        console.log('Attention result saved to user collection:', resultRef.id);
        
        // Notify locally
        try {
          await NotificationService.sendLocalNotification(
            'Attention Result Saved',
            `Your attention score (${percentage}%) was saved. Avg reaction: ${payload.averageReactionTime}ms`
          );
        } catch (nErr) {
          console.warn('Notification send failed', nErr);
        }
        
        return { success: true, id: resultRef.id };
      } catch (userSaveError) {
        console.error('Error saving to user collection:', userSaveError);
        // Fall back to public collection if user save fails
        return await saveToPublicCollection(docData);
      }
    } else {
      // No user: save to a public collection
      return await saveToPublicCollection(docData);
    }
  } catch (error) {
    console.error('Error saving attention result:', error);
    return { success: false, error };
  }
}

async function saveToPublicCollection(docData: any) {
  try {
    const colRef = collection(firestore, 'publicAttentionResults');
    const docRef = await addDoc(colRef, {
      ...docData,
      userId: null, // Explicitly set to null for public records
    });
    console.log('Attention result saved to public collection:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (publicError) {
    console.error('Error saving to public collection:', publicError);
    return { success: false, error: publicError };
  }
}