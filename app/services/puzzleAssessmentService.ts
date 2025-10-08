// // services/puzzleAssessmentService.ts
// import { auth, firestore } from "@/config/firebaseConfig";
// import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

// export type PuzzleAssessmentPayload = {
//   totalTime: number;
//   tasksCompleted: number;
//   overallAccuracy: number;
//   averageReactionTime: number;
//   puzzleScore: number;
//   performanceLevel: string;
//   rawResults: any[];
// };

// export async function savePuzzleAssessment(payload: PuzzleAssessmentPayload) {
//   try {
//     const user = auth.currentUser;
//     const uid = user?.uid;
//     const docData = {
//       ...payload,
//       createdAt: serverTimestamp(),
//       userId: uid || null,
//       userEmail: user?.email || "anonymous",
//       assessmentType: "puzzle",
//       version: "1.0",
//     };

//     if (uid) {
//       const userDocRef = doc(firestore, "users", uid);
//       const assessmentRef = doc(collection(userDocRef, "puzzleAssessments"));
//       await setDoc(assessmentRef, docData);
//       console.log("✅ Puzzle assessment saved", assessmentRef.id);
//     } else {
//       const colRef = collection(firestore, "publicPuzzleAssessments");
//       await setDoc(doc(colRef), docData);
//       console.log("✅ Puzzle assessment saved (public)");
//     }
//   } catch (err) {
//     console.error("❌ Error saving puzzle assessment", err);
//   }
// }

// export function getPersonalizedPuzzleRecommendations(payload: {
//   overallAccuracy: number;
//   averageReactionTime: number;
//   puzzleScore: number;
// }) {
//   const recs: string[] = [];
//   if (payload.overallAccuracy < 70) recs.push("Practice logic puzzles daily");
//   if (payload.averageReactionTime > 2000) recs.push("Try timed puzzle challenges to improve speed");
//   if (payload.puzzleScore < 50) recs.push("Start with easier puzzles and gradually increase difficulty");
//   if (payload.puzzleScore > 80) recs.push("Challenge yourself with Sudoku and strategy puzzles");
//   return recs;
// }




// import { auth, firestore } from "@/config/firebaseConfig";
// import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

// export type PuzzleAssessmentPayload = {
//   totalTime: number;
//   tasksCompleted: number;
//   overallAccuracy: number;
//   averageReactionTime: number;
//   puzzleScore: number;
//   performanceLevel: string;
//   rawResults: any[];
// };

// export async function savePuzzleAssessment(payload: PuzzleAssessmentPayload) {
//   try {
//     const user = auth.currentUser;
//     const uid = user?.uid;
//     const docData = {
//       ...payload,
//       createdAt: serverTimestamp(),
//       userId: uid || null,
//       userEmail: user?.email || "anonymous",
//       assessmentType: "puzzle",
//     };

//     if (uid) {
//       const userDocRef = doc(firestore, "users", uid);
//       const assessmentRef = doc(collection(userDocRef, "puzzleAssessments"));
//       await setDoc(assessmentRef, docData);
//     } else {
//       const colRef = collection(firestore, "publicPuzzleAssessments");
//       await setDoc(doc(colRef), docData);
//     }
//   } catch (err) {
//     console.error("❌ Error saving puzzle assessment", err);
//   }
// }

// export function getPuzzleRecommendations(payload: {
//   overallAccuracy: number;
//   averageReactionTime: number;
//   puzzleScore: number;
// }) {
//   const recs: string[] = [];
//   if (payload.overallAccuracy < 70) recs.push("Practice Odd-One-Out and Sequences for accuracy");
//   if (payload.averageReactionTime > 2000) recs.push("Do more timed Jigsaw and Target challenges to improve speed");
//   if (payload.puzzleScore < 50) recs.push("Start with easy puzzles and gradually increase difficulty");
//   if (payload.puzzleScore > 80) recs.push("Challenge yourself with expert Sudoku or larger Jigsaw puzzles");
//   return recs;
// }
// app/services/puzzleAssessmentService.ts
import { NotificationService } from "@/config/NotificationService";
import { auth, firestore } from "@/config/firebaseConfig";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";

export type PuzzleAssessmentPayload = {
  totalTime: number;
  tasksCompleted: number;
  overallAccuracy: number;
  averageReactionTime: number;
  puzzleScore: number;
  performanceLevel: string;
  rawResults: any[];
  createdAt?: Date;
};

export type SavePuzzleResponse = { success: true; id: string } | { success: false; error: unknown };

export async function savePuzzleAssessment(payload: PuzzleAssessmentPayload): Promise<SavePuzzleResponse> {
  try {
    const user = auth.currentUser;
    const uid = user?.uid ?? null;

    const data = {
      totalTime: payload.totalTime,
      tasksCompleted: payload.tasksCompleted,
      overallAccuracy: payload.overallAccuracy,
      averageReactionTime: payload.averageReactionTime,
      puzzleScore: payload.puzzleScore,
      performanceLevel: payload.performanceLevel,
      rawResults: payload.rawResults ?? [],
      platform: Platform.OS,
      createdAt: serverTimestamp(),
      userId: uid,
      userEmail: user?.email ?? "anonymous",
    };

    console.log("Saving puzzle assessment:", uid ? "authenticated" : "anonymous");

    if (uid) {
      const ref = doc(collection(firestore, "users", uid, "puzzleAssessments"));
      await setDoc(ref, data);
      try {
        await NotificationService.sendLocalNotification(
          "Assessment saved",
          `Your puzzle assessment (${payload.performanceLevel}) has been recorded.`
        );
      } catch (_) {}
      return { success: true, id: ref.id };
    } else {
      // save to public collection
      const ref = await addDoc(collection(firestore, "publicPuzzleAssessments"), data);
      return { success: true, id: ref.id };
    }
  } catch (error) {
    console.error("savePuzzleAssessment error:", error);
    return { success: false, error };
  }
}

/** 
 * Generate personalized recommendations based on accuracy and speed
 */
export function getPuzzleRecommendations({
  overallAccuracy,
  averageReactionTime,
  puzzleScore,
}: {
  overallAccuracy: number;
  averageReactionTime: number;
  puzzleScore: number;
}): string[] {
  const recs: string[] = [];
  if (overallAccuracy < 60) recs.push("Practice simpler puzzles to improve accuracy.");
  if (averageReactionTime > 2000) recs.push("Try to respond a bit faster — focus on pattern recognition.");
  if (puzzleScore > 80) recs.push("Excellent! Try advanced difficulty puzzles next.");
  else if (puzzleScore >= 60) recs.push("Good progress. Maintain a steady pace and stay focused.");
  else recs.push("Focus on accuracy first, speed will improve over time.");
  recs.push("Play brain games like Sudoku, Jigsaw, and Sequences regularly.");
  return recs;
}
