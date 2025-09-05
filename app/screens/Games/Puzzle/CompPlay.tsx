import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeComp } from "./puzzleGenerators";

export default function CompPlay() {
  const route = useRoute<any>();
  const diff = (route.params?.difficulty || "easy") as "easy"|"medium"|"hard";
  return <PuzzlePlayTemplate title="Comp" gameType="comp" makeQuestion={makeComp(diff)} />;
}
