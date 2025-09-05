import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeArrow } from "./puzzleGenerators";

export default function ArrowPlay() {
  const route = useRoute<any>();
  const diff = (route.params?.difficulty || "easy") as "easy"|"medium"|"hard";
  return <PuzzlePlayTemplate title="Arrow" gameType="arrow" makeQuestion={makeArrow(diff)} />;
}
