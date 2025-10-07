// MathPlayMultiplication.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// IMPORTANT: add secrets.js in your project root and export ASSEMBLY_API_KEY from it
import { ASSEMBLY_API_KEY } from "../../../../secrets";

type MathPlayScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "MathPlayMultiplication"
>;

const INITIAL_TIME = 120; // seconds
const TOTAL_QUESTIONS = 10;

type Question = {
  a: number;
  b: number;
  correctAnswer: number;
  options: number[]; // length 4
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeMultiplicationQuestion(minOperand = 1, maxOperand = 12): Question {
  const a = randInt(minOperand, maxOperand);
  const b = randInt(minOperand, maxOperand);
  const correct = a * b;

  const options = new Set<number>();
  options.add(correct);

  while (options.size < 4) {
    const offsetChoice = [-10, -8, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 8, 10];
    const offset = offsetChoice[Math.floor(Math.random() * offsetChoice.length)];
    const candidate = correct + offset;
    if (candidate >= 0) options.add(candidate);
  }

  const optionsArr = shuffle(Array.from(options));
  return {
    a,
    b,
    correctAnswer: correct,
    options: optionsArr,
  };
}

function parseSpokenNumber(text: string): number | null {
  if (!text) return null;
  const t = text.toLowerCase().trim();
  const digits = t.match(/-?\d+/);
  if (digits) return parseInt(digits[0], 10);

  const wordsToNum: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100,
  };

  if (wordsToNum[t] !== undefined) return wordsToNum[t];

  const parts = t.split(/[\s-]+/);
  let total = 0;
  for (const p of parts) {
    if (wordsToNum[p] !== undefined) {
      if (p === "hundred") total = Math.max(1, total) * 100;
      else total += wordsToNum[p];
    }
  }
  return total > 0 ? total : null;
}

async function transcribeWithAssembly(uri: string): Promise<{ text?: string; error?: string }> {
  if (!ASSEMBLY_API_KEY || ASSEMBLY_API_KEY.trim() === "" || ASSEMBLY_API_KEY.startsWith("sk-REPLACE")) {
    console.warn("AssemblyAI key missing or placeholder — using DEV stub for transcription.");
    await new Promise((r) => setTimeout(r, 600));
    return { text: "24" };
  }

  try {
    const fileResp = await fetch(uri);
    const blob = await fileResp.blob();

    const uploadResp = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: ASSEMBLY_API_KEY, "content-type": "application/octet-stream" },
      body: blob as any,
    });

    if (!uploadResp.ok) {
      const txt = await uploadResp.text();
      return { error: `Upload failed: ${uploadResp.status}` };
    }

    const uploadJson = await uploadResp.json();
    const uploadUrl = uploadJson.upload_url || uploadJson["upload_url"];
    if (!uploadUrl) return { error: "Upload succeeded but no upload_url returned." };

    const createResp = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: ASSEMBLY_API_KEY, "content-type": "application/json" },
      body: JSON.stringify({ audio_url: uploadUrl }),
    });

    if (!createResp.ok) return { error: `Create transcript failed: ${createResp.status}` };

    const createJson = await createResp.json();
    const transcriptId = createJson.id;
    if (!transcriptId) return { error: "No transcript id returned." };

    const pollUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;
    const maxPolls = 30;
    const intervalMs = 1000;
    for (let i = 0; i < maxPolls; i++) {
      const pollResp = await fetch(pollUrl, {
        method: "GET",
        headers: { authorization: ASSEMBLY_API_KEY },
      });

      if (!pollResp.ok) return { error: `Polling failed: ${pollResp.status}` };

      const pollJson = await pollResp.json();
      const status = pollJson.status as string;
      if (status === "completed") return { text: pollJson.text ?? "" };
      if (status === "error") return { error: pollJson.error ?? "Transcription error" };

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    return { error: "Transcription timed out." };
  } catch (err: any) {
    console.error("transcribeWithAssembly exception:", err);
    return { error: "Network error. Please check your connection." };
  }
}

const MathPlayMultiplication: React.FC = () => {
  const navigation = useNavigation<MathPlayScreenNavigationProp>();

  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showStartHint, setShowStartHint] = useState<boolean>(true);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const [lastTranscription, setLastTranscription] = useState<string | null>(null);

  // Answer feedback states
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const voiceStartTs = useRef<number | null>(null);
  const voiceResponseTimes = useRef<number[]>([]);
  const voiceAnswersCount = useRef<number>(0);

  useEffect(() => {
    const q: Question[] = Array.from({ length: TOTAL_QUESTIONS }, () =>
      makeMultiplicationQuestion(1, 12)
    );
    setQuestionList(q);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    }
    if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  useEffect(() => {
    if (timeLeft <= 0) endQuiz("time");
    if (currentQuestionIndex >= TOTAL_QUESTIONS) endQuiz("finished");
  }, [timeLeft, currentQuestionIndex]);

  useEffect(() => {
    return () => {
      (async () => {
        if (recordingRef.current) {
          try {
            await recordingRef.current.stopAndUnloadAsync();
          } catch (_) {}
          recordingRef.current = null;
        }
      })();
    };
  }, []);

  const speakQuestion = (q?: Question) => {
    if (!isRunning) return; // Only speak when quiz is running
    const current = q || questionList[currentQuestionIndex % questionList.length];
    if (!current) return;
    const text = `What is ${current.a} multiplied by ${current.b}?`;
    Speech.stop();
    Speech.speak(text, { rate: 0.9, pitch: 1.0 }); // Slightly slower for elderly users
  };

  const startRecording = async () => {
    if (!isRunning) return; // Only allow when quiz is running
    
    try {
      if (isRecording || recordingRef.current) {
        console.log("startRecording: already recording, ignoring.");
        return;
      }

      const perm = await Audio.requestPermissionsAsync();
      console.log("microphone permission:", perm);
      if (!perm.granted && perm.status !== "granted") {
        Alert.alert(
          "Microphone Permission Required",
          "Please enable microphone permission in your device settings.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      console.log("Setting audio mode...");
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log("Audio mode set successfully");

      const recordingOptions = {
        android: {
          extension: ".m4a",
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".caf",
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      };

      console.log("Creating new recording instance...");
      const recording = new Audio.Recording();
      
      console.log("Preparing to record...");
      await recording.prepareToRecordAsync(recordingOptions);
      console.log("Recording prepared successfully");
      
      console.log("Starting recording...");
      await recording.startAsync();
      console.log("Recording started successfully");

      recordingRef.current = recording;
      setIsRecording(true);
      voiceStartTs.current = Date.now();

      setTimeout(async () => {
        try {
          if (recordingRef.current) {
            const s = await recordingRef.current.getStatusAsync();
            if (s.isRecording) {
              console.log("Auto-stop triggered after 4 seconds");
              await stopRecordingAndTranscribe();
            }
          }
        } catch (e) {
          console.warn("Auto-stop error:", e);
        }
      }, 4000);
    } catch (err: any) {
      console.error("startRecording error:", err);
      
      Alert.alert(
        "Recording Error", 
        "Unable to start recording. Please try again.",
        [{ text: "OK", style: "default" }]
      );
      
      setIsRecording(false);
      
      try {
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
        }
      } catch (cleanupErr) {
        console.warn("Cleanup error:", cleanupErr);
      }
      recordingRef.current = null;
    }
  };

  const stopRecordingAndTranscribe = async () => {
    try {
      const rec = recordingRef.current;
      if (!rec) return;
      setIsRecording(false);

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      recordingRef.current = null;

      if (!uri) {
        Alert.alert("Recording Error", "No audio captured. Please try again.");
        return;
      }

      if (voiceStartTs.current) {
        const delta = Date.now() - voiceStartTs.current;
        voiceResponseTimes.current.push(delta);
      }

      setIsTranscribing(true);
      setLastTranscription("Processing your answer...");
      
      const { text, error } = await transcribeWithAssembly(uri);
      setIsTranscribing(false);

      if (error) {
        Alert.alert("Transcription Error", "Could not process your answer. Please try again.");
        setLastTranscription(null);
        return;
      }

      setLastTranscription(text || "");
      const parsed = parseSpokenNumber(text || "");
      if (parsed != null) {
        voiceAnswersCount.current += 1;
        handleAnswer(parsed);
      } else {
        Alert.alert(
          "Could Not Understand", 
          `I heard: "${text}"\n\nPlease speak clearly and say the number.`,
          [{ text: "Try Again", style: "default" }]
        );
      }
    } catch (err) {
      console.warn("stopRecordingAndTranscribe error", err);
      setIsTranscribing(false);
      setIsRecording(false);
      Alert.alert("Error", "An error occurred. Please try again.");
    }
  };

  const handleAnswer = (selected: number) => {
    if (!isRunning || showFeedback) return; // Prevent multiple selections
    const current = questionList[currentQuestionIndex % questionList.length];
    if (!current) return;

    setSelectedAnswer(selected);
    setShowFeedback(true);

    const isCorrect = selected === current.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Show feedback for 1 second, then move to next question
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      setLastTranscription(null);
      setCurrentQuestionIndex((i) => i + 1);
    }, 1000);
  };

  const endQuiz = (reason: "time" | "finished") => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const timeTaken = INITIAL_TIME - Math.max(0, timeLeft);
    const voiceCount = voiceAnswersCount.current;
    const avgVoiceMs = voiceResponseTimes.current.length
      ? Math.round(voiceResponseTimes.current.reduce((a, b) => a + b, 0) / voiceResponseTimes.current.length)
      : 0;

    navigation.navigate("MathResults" as any, {
      score,
      totalQuestions: TOTAL_QUESTIONS,
      timeTaken,
      endedBy: reason === "time" ? "timeUp" : "completed",
      gameType: "multiplication",
      voiceAnswersCount: voiceCount,
      avgVoiceResponseMs: avgVoiceMs,
    } as any);
  };

  const handleStart = () => {
    setShowStartHint(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const current = questionList[currentQuestionIndex % questionList.length];
  const progressPercent = Math.min(100, (currentQuestionIndex / TOTAL_QUESTIONS) * 100);

  // Helper to get option button style
  const getOptionStyle = (option: number) => {
    if (!showFeedback) return styles.optionDefault;
    
    const isCorrect = option === current?.correctAnswer;
    const isSelected = option === selectedAnswer;
    
    if (isCorrect) return styles.optionCorrect;
    if (isSelected && !isCorrect) return styles.optionWrong;
    return styles.optionDefault;
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 pt-12 pb-5"
        style={{ backgroundColor: PALETTE.lightPink }}
      >
        <View style={{ width: 40 }} />
        <View className="items-center">
          <Text style={{ fontSize: 22, fontWeight: "700", color: PALETTE.orange }}>
            Math Practice
          </Text>
          <Text style={{ fontSize: 16, color: PALETTE.orange, marginTop: 2 }}>
            Multiplication
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Main */}
      <View className="flex-1 px-5 py-6">
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            {current ? `${current.a} × ${current.b} = ?` : "Loading..."}
          </Text>

          {/* Options Grid */}
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {current?.options.slice(0, 2).map((option, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.optionButton, getOptionStyle(option)]}
                  onPress={() => handleAnswer(option)}
                  disabled={!isRunning || showFeedback}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              {current?.options.slice(2, 4).map((option, idx) => (
                <TouchableOpacity
                  key={idx + 2}
                  style={[styles.optionButton, getOptionStyle(option)]}
                  onPress={() => handleAnswer(option)}
                  disabled={!isRunning || showFeedback}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Voice Controls */}
            <View style={{ flexDirection: "row", marginTop: 18, gap: 12 }}>
              <TouchableOpacity
                onPress={() => speakQuestion()}
                disabled={!isRunning}
                style={[
                  styles.voiceButton,
                  { backgroundColor: isRunning ? PALETTE.orange : "#D1D5DB" }
                ]}
              >
                <Text style={[styles.voiceButtonText, { opacity: isRunning ? 1 : 0.5 }]}>
                  🔊 Read Question
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (isRecording) stopRecordingAndTranscribe();
                  else startRecording();
                }}
                disabled={!isRunning || isTranscribing}
                style={[
                  styles.voiceButton,
                  { 
                    backgroundColor: !isRunning || isTranscribing 
                      ? "#D1D5DB" 
                      : isRecording 
                        ? PALETTE.red 
                        : PALETTE.lightTeal 
                  }
                ]}
              >
                <Text style={[
                  styles.voiceButtonText,
                  { 
                    color: isRecording ? "white" : "#065F46",
                    opacity: (!isRunning || isTranscribing) ? 0.5 : 1
                  }
                ]}>
                  {isRecording ? "⏹ Stop" : "🎙 Speak Answer"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Messages */}
            <View style={styles.statusContainer}>
              {isTranscribing && (
                <View style={styles.statusBox}>
                  <Text style={styles.statusText}>🎯 Processing your answer...</Text>
                </View>
              )}
              {!isTranscribing && lastTranscription && !showFeedback && (
                <View style={styles.statusBox}>
                  <Text style={styles.statusLabel}>You said:</Text>
                  <Text style={styles.statusValue}>"{lastTranscription}"</Text>
                </View>
              )}
              {!isRunning && !showStartHint && (
                <View style={[styles.statusBox, { backgroundColor: "#FEF3C7" }]}>
                  <Text style={[styles.statusText, { color: "#92400E" }]}>
                    ⏸ Quiz Paused
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <Text style={styles.progressText}>
            Question {Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

        {/* Control Buttons */}
        <View style={{ marginTop: 24, alignItems: "center" }}>
          {!isRunning && showStartHint ? (
            <TouchableOpacity onPress={handleStart} style={[styles.controlButton, styles.startButton]}>
              <Text style={styles.controlButtonText}>🚀 Start Quiz</Text>
            </TouchableOpacity>
          ) : isRunning ? (
            <TouchableOpacity onPress={handlePause} style={[styles.controlButton, styles.pauseButton]}>
              <Text style={styles.controlButtonText}>⏸ Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleResume} style={[styles.controlButton, styles.resumeButton]}>
              <Text style={styles.controlButtonText}>▶ Resume</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MathPlayMultiplication;

const styles = StyleSheet.create({
  questionCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#FFE7C8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
    color: PALETTE.orange,
    letterSpacing: 1,
  },
  optionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 2,
  },
  optionDefault: {
    backgroundColor: "#FFFAF0",
    borderColor: "#FFE7C8",
  },
  optionCorrect: {
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
  },
  optionWrong: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
  },
  optionText: {
    fontSize: 26,
    fontWeight: "700",
    color: PALETTE.orange,
  },
  voiceButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  statusContainer: {
    marginTop: 16,
    minHeight: 60,
  },
  statusBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
  },
  statusText: {
    fontSize: 16,
    color: "#1E40AF",
    textAlign: "center",
    fontWeight: "600",
  },
  statusLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  progressText: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "600",
    color: "#374151",
  },
  progressTrack: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: PALETTE.orange,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
    color: PALETTE.orange,
    marginTop: 12,
  },
  controlButton: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  startButton: {
    backgroundColor: PALETTE.orange,
  },
  pauseButton: {
    backgroundColor: PALETTE.red,
  },
  resumeButton: {
    backgroundColor: PALETTE.orange,
  },
  controlButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 20,
  },
});