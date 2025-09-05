import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeOdd } from "./puzzleGenerators";

type Params = { difficulty: "easy" | "medium" | "hard" };

export default function OddPlay() {
  const route = useRoute<any>();
  const diff: Params["difficulty"] = route.params?.difficulty || "easy";
  return <PuzzlePlayTemplate title="Odd" gameType="odd" makeQuestion={makeOdd(diff)} />;
}
