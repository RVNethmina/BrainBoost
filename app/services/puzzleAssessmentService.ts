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
import { auth, firestore } from "@/config/firebaseConfig";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

export type PuzzleAssessmentPayload = {
  totalTime: number;
  tasksCompleted: number;
  overallAccuracy: number;
  averageReactionTime: number;
  puzzleScore: number;
  performanceLevel: string;
  rawResults: any[];
};

export async function savePuzzleAssessment(payload: PuzzleAssessmentPayload) {
  try {
    const user = auth.currentUser;
    const uid = user?.uid;
    const docData = {
      ...payload,
      createdAt: serverTimestamp(),
      userId: uid || null,
      userEmail: user?.email || "anonymous",
      assessmentType: "puzzle",
    };

    if (uid) {
      const userDocRef = doc(firestore, "users", uid);
      const assessmentRef = doc(collection(userDocRef, "puzzleAssessments"));
      await setDoc(assessmentRef, docData);
    } else {
      const colRef = collection(firestore, "publicPuzzleAssessments");
      await setDoc(doc(colRef), docData);
    }
  } catch (err) {
    console.error("❌ Error saving puzzle assessment", err);
  }
}

export function getPuzzleRecommendations(payload: {
  overallAccuracy: number;
  averageReactionTime: number;
  puzzleScore: number;
}) {
  const recs: string[] = [];
  if (payload.overallAccuracy < 70) recs.push("Practice Odd-One-Out and Sequences for accuracy");
  if (payload.averageReactionTime > 2000) recs.push("Do more timed Jigsaw and Target challenges to improve speed");
  if (payload.puzzleScore < 50) recs.push("Start with easy puzzles and gradually increase difficulty");
  if (payload.puzzleScore > 80) recs.push("Challenge yourself with expert Sudoku or larger Jigsaw puzzles");
  return recs;
}
