// app/services/mathAssessmentService.ts
import { NotificationService } from "@/config/NotificationService";
import { auth, firestore } from "@/config/firebaseConfig";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";

export type AssessmentPayload = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // percentage 0-100
  timeSpent: number; // seconds
  difficulty?: string;
  answers?: { questionId: number; selectedAnswer: number; isCorrect: boolean }[];
  completedAt?: Date;
  cognitiveLevel?: "excellent" | "good" | "fair" | "needs_attention";
  assessmentType?: string; // e.g. 'cognitive_math_elderly'
  // optional voice metrics
  voiceAnswersCount?: number;
  avgVoiceResponseMs?: number;
};

export type SaveAssessmentResponse = { success: true; id: string } | { success: false; error: unknown };

export async function saveAssessment(payload: AssessmentPayload): Promise<SaveAssessmentResponse> {
  try {
    const user = auth.currentUser;
    const uid = user?.uid ?? null;

    const docData = {
      totalQuestions: payload.totalQuestions,
      correctAnswers: payload.correctAnswers,
      incorrectAnswers: payload.incorrectAnswers,
      score: payload.score,
      timeSpent: payload.timeSpent,
      difficulty: payload.difficulty ?? "mixed",
      answers: payload.answers ?? [],
      completedAt: payload.completedAt ?? new Date(),
      cognitiveLevel: payload.cognitiveLevel ?? "needs_attention",
      assessmentType: payload.assessmentType ?? "cognitive_math_elderly",
      voiceAnswersCount: payload.voiceAnswersCount ?? 0,
      avgVoiceResponseMs: payload.avgVoiceResponseMs ?? 0,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      userId: uid ?? null,
      userEmail: user?.email ?? "anonymous",
    };

    console.log("Saving assessment, user:", uid ? "authenticated" : "anonymous");

    if (uid) {
      try {
        // Save to user's subcollection: users/{uid}/assessments
        const resultRef = doc(collection(firestore, "users", uid, "assessments"));
        await setDoc(resultRef, docData);
        console.log("Saved assessment to user collection:", resultRef.id);

        // local notification
        try {
          await NotificationService.sendLocalNotification(
            "Assessment saved",
            `Your assessment (${docData.score}%) was saved.`
          );
        } catch (nErr) {
          console.warn("Notification send failed", nErr);
        }

        return { success: true, id: resultRef.id };
      } catch (userSaveError) {
        console.error("Error saving to user subcollection:", userSaveError);
        // fallback to public
        return await saveToPublicCollection(docData);
      }
    } else {
      // no user => save to public collection
      return await saveToPublicCollection(docData);
    }
  } catch (err) {
    console.error("saveAssessment error:", err);
    return { success: false, error: err };
  }
}

async function saveToPublicCollection(docData: any): Promise<SaveAssessmentResponse> {
  try {
    const colRef = collection(firestore, "publicAssessments");
    const docRef = await addDoc(colRef, docData);
    console.log("Saved to publicAssessments:", docRef.id);
    try {
      await NotificationService.sendLocalNotification("Assessment saved (public)", `Score: ${docData.score}%`);
    } catch (_) {}
    return { success: true, id: docRef.id };
  } catch (publicErr) {
    console.error("saveToPublicCollection error:", publicErr);
    return { success: false, error: publicErr };
  }
}
