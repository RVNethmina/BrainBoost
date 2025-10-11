import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeOdd } from "./puzzleGenerators";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

type Params = { difficulty: "easy" | "medium" | "hard" };

export default function OddPlay() {
  const route = useRoute<any>();
  const diff: Params["difficulty"] = route.params?.difficulty || "easy";
  // Add settings hook
  const { theme, getFontScale } = useSettings();
  
  return (
    <PuzzlePlayTemplate 
      title="Odd" 
      gameType="odd" 
      makeQuestion={makeOdd(diff)}
      theme={theme}
      fontScale={getFontScale()}
    />
  );
}