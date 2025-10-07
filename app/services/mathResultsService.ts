// services/mathResultsService.ts
import { NotificationService } from "@/config/NotificationService";
import { auth, firestore } from "@/config/firebaseConfig";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";

export type MathResultPayload = {
  score: number;
  totalQuestions: number;
  timeTaken: number; // seconds
  endedBy: string;
  gameType?: string; // Add game type for better tracking
  voiceAnswersCount?: number;
  avgVoiceResponseMs?: number;
};

type SaveMathResultResponse = { success: true; id: string } | { success: false; error: unknown };

export async function saveMathResult(payload: MathResultPayload): Promise<SaveMathResultResponse> {
  try {
    const user = auth.currentUser;
    const uid = user?.uid;
    const percentage =
      payload.totalQuestions > 0 ? Math.round((payload.score / payload.totalQuestions) * 100) : 0;

    // Use payload.* explicitly and provide safe defaults (0) for optional voice fields
    const docData = {
      score: payload.score,
      totalQuestions: payload.totalQuestions,
      percentage,
      timeTaken: payload.timeTaken,
      endedBy: payload.endedBy,
      gameType: payload.gameType || "math",
      voiceAnswersCount: payload.voiceAnswersCount ?? 0,
      avgVoiceResponseMs: payload.avgVoiceResponseMs ?? 0,
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      userId: uid ?? null,
      userEmail: user?.email || "anonymous",
    };

    console.log("Saving math result for user:", uid ? "authenticated" : "anonymous");

    if (uid) {
      // Save under user's subcollection: users/{uid}/mathResults
      try {
        // create a new doc reference with an auto id in the user's subcollection
        const resultRef = doc(collection(firestore, "users", uid, "mathResults"));
        await setDoc(resultRef, docData);
        console.log("Result saved to user collection:", resultRef.id);

        // Notify locally (already wrapped in try/catch)
        try {
          await NotificationService.sendLocalNotification(
            "Result saved",
            `Your math result (${percentage}%) was saved.`
          );
        } catch (nErr) {
          console.warn("Notification send failed", nErr);
        }

        return { success: true, id: resultRef.id };
      } catch (userSaveError) {
        console.error("Error saving to user collection:", userSaveError);
        // Fall back to public collection if user save fails
        return await saveToPublicCollection(docData);
      }
    } else {
      // No user: save to a public collection
      return await saveToPublicCollection(docData);
    }
  } catch (error) {
    console.error("Error saving math result:", error);
    return { success: false, error };
  }
}

async function saveToPublicCollection(docData: any): Promise<SaveMathResultResponse> {
  try {
    const colRef = collection(firestore, "publicMathResults");
    const docRef = await addDoc(colRef, {
      ...docData,
      userId: null, // Explicitly set to null for public records
    });
    console.log("Result saved to public collection:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (publicError) {
    console.error("Error saving to public collection:", publicError);
    return { success: false, error: publicError };
  }
}
