import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeSeq } from "./puzzleGenerators";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

export default function SeqPlay() {
  const route = useRoute<any>();
  const diff = (route.params?.difficulty || "easy") as "easy"|"medium"|"hard";
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  
  return (
    <PuzzlePlayTemplate 
      title="Seq" 
      gameType="seq" 
      makeQuestion={makeSeq(diff)}
      theme={theme}
      fontScale={getFontScale()}
    />
  );
}