// app/types/assessment.ts
export type AnswerRecord = {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
};

export type AssessmentResultPayload = {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // percent
  timeSpent: number; // seconds
  difficulty: string;
  answers: AnswerRecord[];
  completedAt: string; // store as ISO string to make transport easy
  cognitiveLevel: "excellent" | "good" | "fair" | "needs_attention";
  // optional voice metrics
  voiceAnswersCount?: number;
  avgVoiceResponseMs?: number;
};
