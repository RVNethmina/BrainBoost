import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeComp } from "./puzzleGenerators";
import { useSettings } from "@/app/contexts/SettingsContext"; // Add this import

export default function CompPlay() {
  const route = useRoute<any>();
  const diff = (route.params?.difficulty || "easy") as "easy"|"medium"|"hard";
  const { theme, getFontScale } = useSettings(); // Add settings hook
  
  return (
    <PuzzlePlayTemplate 
      title="Comp" 
      gameType="comp" 
      makeQuestion={makeComp(diff)}
      theme={theme}
      fontScale={getFontScale()}
    />
  );
}