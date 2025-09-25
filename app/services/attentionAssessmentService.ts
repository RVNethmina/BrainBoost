// app/src/services/attentionAssessmentService.ts
import { NotificationService } from '@/config/NotificationService';
import { auth, firestore } from '@/config/firebaseConfig';
import { addDoc, collection, doc, serverTimestamp, setDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Platform } from 'react-native';

export type AttentionAssessmentPayload = {
  totalTime: number; // seconds
  tasksCompleted: number; // 1-3
  overallAccuracy: number; // percentage
  averageReactionTime: number; // milliseconds
  attentionScore: number; // 0-100
  performanceLevel: string; // Superior, Above Average, etc.
  task1Accuracy: number;
  task1AvgRT: number;
  task2Accuracy: number;
  task2AvgRT: number;
  task3Accuracy: number;
  task3AvgRT: number;
  rawResults: any[]; // Individual trial results
};

export async function saveAttentionAssessment(payload: AttentionAssessmentPayload) {
  try {
    const user = auth.currentUser;
    const uid = user?.uid;

    console.log('🔍 Saving Attention Assessment:');
    console.log('- User authenticated:', !!user);
    console.log('- User UID:', uid || 'none');
    console.log('- Assessment score:', payload.attentionScore);

    const docData = {
      totalTime: payload.totalTime,
      tasksCompleted: payload.tasksCompleted,
      overallAccuracy: payload.overallAccuracy,
      averageReactionTime: payload.averageReactionTime,
      attentionScore: payload.attentionScore,
      performanceLevel: payload.performanceLevel,
      task1Accuracy: payload.task1Accuracy,
      task1AvgRT: payload.task1AvgRT,
      task2Accuracy: payload.task2Accuracy,
      task2AvgRT: payload.task2AvgRT,
      task3Accuracy: payload.task3Accuracy,
      task3AvgRT: payload.task3AvgRT,
      rawResults: payload.rawResults,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      userId: uid || null,
      userEmail: user?.email || 'anonymous',
      timestamp: Date.now(),
      assessmentType: 'attention',
      version: '1.0',
    };

    console.log('📝 Assessment data structure prepared');

    if (uid) {
      // Try saving to user's subcollection first
      console.log('🎯 Attempting to save to user assessments collection...');
      try {
        const userDocRef = doc(firestore, 'users', uid);
        const assessmentRef = doc(collection(userDocRef, 'attentionAssessments'));
        
        console.log('📍 User collection path:', `users/${uid}/attentionAssessments`);
        
        await setDoc(assessmentRef, docData);
        console.log('✅ Attention assessment saved to user collection:', assessmentRef.id);

        // Try to send notification
        try {
          await NotificationService.sendLocalNotification(
            'Attention Assessment Complete',
            `Your attention assessment (${payload.attentionScore}/100 - ${payload.performanceLevel}) has been saved.`
          );
        } catch (nErr) {
          console.warn('⚠️ Notification send failed', nErr);
        }

        return { success: true, id: assessmentRef.id };
      } catch (userSaveError: any) {
        console.error('❌ Error saving to user collection:', userSaveError);
        console.error('Error code:', userSaveError.code);
        console.error('Error message:', userSaveError.message);
        
        // Fall back to public collection
        console.log('🔄 Falling back to public collection...');
        return await saveToPublicAssessmentCollection(docData);
      }
    } else {
      // No authenticated user - try public collection
      console.log('👤 No authenticated user, saving to public collection...');
      return await saveToPublicAssessmentCollection(docData);
    }
  } catch (error: any) {
    console.error('💥 Critical error in saveAttentionAssessment:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return { success: false, error };
  }
}

async function saveToPublicAssessmentCollection(docData: any) {
  try {
    console.log('📍 Public collection path: publicAttentionAssessments');
    
    // Remove userId for public collection to avoid confusion
    const publicDocData = {
      ...docData,
      userId: null,
      // Remove raw results for privacy in public collection
      rawResults: docData.rawResults ? `${docData.rawResults.length} trials` : 'N/A',
    };

    const colRef = collection(firestore, 'publicAttentionAssessments');
    const docRef = await addDoc(colRef, publicDocData);
    
    console.log('✅ Attention assessment saved to public collection:', docRef.id);
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

// Helper function to get user's attention assessments
export async function getUserAttentionAssessments(userId: string, limitCount: number = 10) {
  try {
    console.log('📊 Fetching attention assessments for user:', userId);
    
    const userDocRef = doc(firestore, 'users', userId);
    const assessmentsRef = collection(userDocRef, 'attentionAssessments');
    const q = query(assessmentsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const assessments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`✅ Retrieved ${assessments.length} attention assessments`);
    return { success: true, assessments };
  } catch (error: any) {
    console.error('❌ Error fetching attention assessments:', error);
    return { success: false, error };
  }
}

// Helper function to calculate attention progress over time
export function calculateAttentionProgress(assessments: AttentionAssessmentPayload[]) {
  if (assessments.length < 2) {
    return {
      trend: 'insufficient_data' as const,
      scoreChange: 0,
      averageScore: assessments.length > 0 ? assessments[0].attentionScore : 0,
      assessmentCount: assessments.length,
    };
  }

  // Sort by timestamp (most recent first)
  const sortedAssessments = [...assessments].sort((a, b) => 
    (b as any).timestamp - (a as any).timestamp
  );

  const latest = sortedAssessments[0];
  const previous = sortedAssessments[1];
  const scoreChange = latest.attentionScore - previous.attentionScore;
  
  const averageScore = Math.round(
    assessments.reduce((sum, a) => sum + a.attentionScore, 0) / assessments.length
  );

  let trend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
  if (scoreChange > 5) trend = 'improving';
  else if (scoreChange < -5) trend = 'declining';
  else trend = 'stable';

  return {
    trend,
    scoreChange,
    averageScore,
    assessmentCount: assessments.length,
    latestScore: latest.attentionScore,
    bestScore: Math.max(...assessments.map(a => a.attentionScore)),
    averageAccuracy: Math.round(
      assessments.reduce((sum, a) => sum + a.overallAccuracy, 0) / assessments.length
    ),
    averageReactionTime: Math.round(
      assessments.reduce((sum, a) => sum + a.averageReactionTime, 0) / assessments.length
    ),
  };
}

// Get attention summary for dashboard
export function getAttentionSummary(assessments: AttentionAssessmentPayload[]) {
  if (assessments.length === 0) {
    return {
      hasData: false,
      message: 'No attention assessments completed yet',
      recommendation: 'Take your first attention assessment to establish a baseline',
    };
  }

  const progress = calculateAttentionProgress(assessments);
  const latest = assessments[0]; // Assuming sorted by date

  let summary = '';
  let recommendation = '';

  switch (latest.performanceLevel) {
    case 'Superior':
      summary = `Excellent attention abilities (${latest.attentionScore}/100)`;
      recommendation = 'Continue challenging yourself with complex attention tasks';
      break;
    case 'Above Average':
      summary = `Strong attention skills (${latest.attentionScore}/100)`;
      recommendation = 'Practice sustained attention exercises to maintain your edge';
      break;
    case 'Average':
      summary = `Normal attention performance (${latest.attentionScore}/100)`;
      recommendation = 'Regular training can help improve focus and concentration';
      break;
    case 'Below Average':
      summary = `Attention skills need development (${latest.attentionScore}/100)`;
      recommendation = 'Daily attention exercises and reducing distractions recommended';
      break;
    default:
      summary = `Attention assessment completed (${latest.attentionScore}/100)`;
      recommendation = 'Consider retaking assessment for updated results';
  }

  if (progress.trend === 'improving') {
    summary += ` - Improving (+${progress.scoreChange})`;
  } else if (progress.trend === 'declining') {
    summary += ` - Needs focus (${progress.scoreChange})`;
  }

  return {
    hasData: true,
    summary,
    recommendation,
    latestScore: latest.attentionScore,
    trend: progress.trend,
    assessmentCount: assessments.length,
  };
}

// Helper function to get personalized training recommendations
export function getPersonalizedRecommendations(assessment: AttentionAssessmentPayload) {
  const recommendations = [];

  // Task-specific recommendations
  if (assessment.task1Accuracy < 70) {
    recommendations.push({
      type: 'visual_search',
      title: 'Visual Search Training',
      description: 'Practice finding targets among distractors to improve selective attention',
      difficulty: 'Easy to Medium'
    });
  }

  if (assessment.task2Accuracy < 70) {
    recommendations.push({
      type: 'sustained_attention',
      title: 'Sustained Focus Exercises',
      description: 'Work on maintaining attention over longer periods with mindfulness or reading tasks',
      difficulty: 'Medium'
    });
  }

  if (assessment.task3Accuracy < 60) {
    recommendations.push({
      type: 'divided_attention',
      title: 'Multi-tasking Practice',
      description: 'Start with simple dual-task exercises and gradually increase complexity',
      difficulty: 'Hard'
    });
  }

  // Reaction time recommendations
  if (assessment.averageReactionTime > 1500) {
    recommendations.push({
      type: 'speed_training',
      title: 'Response Speed Training',
      description: 'Practice quick decision-making games to improve processing speed',
      difficulty: 'Variable'
    });
  }

  // General recommendations based on overall performance
  if (assessment.attentionScore < 55) {
    recommendations.push({
      type: 'lifestyle',
      title: 'Attention-Supporting Habits',
      description: 'Ensure adequate sleep, regular exercise, and minimize environmental distractions',
      difficulty: 'Ongoing'
    });
  }

  return recommendations;
}

// Test function for attention assessment Firebase connection
export async function testAttentionAssessmentConnection() {
  try {
    console.log('🧪 Testing Attention Assessment Firebase connection...');
    
    const user = auth.currentUser;
    console.log('Auth test - User:', user ? `${user.uid} (${user.email})` : 'Not authenticated');
    
    const testCollection = collection(firestore, 'testAttentionAssessments');
    console.log('Firestore test - Collection reference created:', !!testCollection);
    
    const testData = {
      test: true,
      assessmentType: 'attention_test',
      attentionScore: 75,
      timestamp: serverTimestamp(),
      platform: Platform.OS
    };
    
    const testDocRef = await addDoc(testCollection, testData);
    console.log('✅ Attention assessment Firebase write test successful:', testDocRef.id);
    
    return { success: true, message: 'Attention assessment Firebase connection working' };
  } catch (error: any) {
    console.error('❌ Attention assessment Firebase connection test failed:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
}