import { useRoute } from "@react-navigation/native";
import React from "react";
import PuzzlePlayTemplate from "./PuzzlePlayTemplate";
import { makeSeq } from "./puzzleGenerators";

export default function SeqPlay() {
  const route = useRoute<any>();
  const diff = (route.params?.difficulty || "easy") as "easy"|"medium"|"hard";
  return <PuzzlePlayTemplate title="Seq" gameType="seq" makeQuestion={makeSeq(diff)} />;
}
