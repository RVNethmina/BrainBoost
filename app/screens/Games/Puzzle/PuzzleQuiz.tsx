// import { PALETTE } from "@/app/design/colors";
// import { RootStackParamList } from "@/app/navigation/AppNavigator";
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import React, { useState } from "react";
// import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

// type Nav = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

// const games = [
//   { key: "odd",   name: "Find Odd One",   icon: "🔍", route: "OddPlay"   as const },
//   { key: "seq",   name: "Next Number Game",   icon: "🔢", route: "SeqPlay"   as const },
//   { key: "arrow", name: "Follow The Arrow", icon: "↕️", route: "ArrowPlay" as const },
//   { key: "comp",  name: "Find Largest Number",  icon: "🔺", route: "CompPlay"  as const },
//   { key: "jigsaw", name: "Jigsaw",            icon: "🧩", route: "JigsawPlay"       as const },
//   { key: "sudoku", name: "Sudoku",            icon: "🧮", route: "SudokuPlay"       as const },
//   { key: "target", name: "Target Number",     icon: "🎯", route: "TargetNumberPlay" as const },
//   { key: "order",  name: "Tap in Order",      icon: "1️⃣", route: "OrderTapPlay"    as const },
//   { key: "jigsawClassic", name: "Jigsaw (Classic)", icon: "🧩", route: "JigsawClassicPlay" as const },

// ];

// const diffs = [
//   { key: "easy",   name: "Easy",   color: PALETTE.lightTeal, border: PALETTE.teal,   text: PALETTE.teal,   selBg: PALETTE.teal },
//   { key: "medium", name: "Medium", color: "#FFEDCC",         border: PALETTE.orange, text: PALETTE.orange, selBg: PALETTE.orange },
//   { key: "hard",   name: "Hard",   color: "#FFE0E0",         border: PALETTE.red,    text: PALETTE.red,    selBg: PALETTE.red },
// ] as const;

// export default function PuzzleQuiz() {
//   const nav = useNavigation<Nav>();
//   const [game, setGame] = useState<typeof games[number] | null>(null);
//   const [diff, setDiff] = useState<typeof diffs[number] | null>(null);

//   const start = () => {
//     if (!game || !diff) return Alert.alert("Choose puzzle & difficulty", "Pick a game and a level to start.");
//     nav.navigate(game.route as any, { difficulty: diff.key });
//   };

//   return (
//     <View className="flex-1" style={{ backgroundColor: PALETTE.lightPink }}>
//       {/* Header — same pattern as MathQuiz */}
//       <View className="flex-row items-center justify-between px-5 pt-12 pb-6" style={{ backgroundColor: PALETTE.teal }}>
//         <TouchableOpacity onPress={() => nav.goBack()} className="items-center justify-center w-14 h-14 rounded-xl" style={{ backgroundColor: "#FFFFFF" }}>
//           <Text className="text-3xl" style={{ color: PALETTE.teal }}>←</Text>
//         </TouchableOpacity>
//         <Text className="text-3xl font-bold text-white">Puzzle Quiz</Text>
//         <View className="w-14" />
//       </View>

//       <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
//         {/* Big icon + title (mirrors MathQuiz hero) */}
//         <View className="items-center my-8">
//           <View className="items-center justify-center w-40 h-40 mb-6 rounded-full" style={{ backgroundColor: PALETTE.teal }}>
//             <Text className="text-7xl">🧩</Text>
//           </View>
//           <Text className="mb-4 text-4xl font-bold" style={{ color: PALETTE.teal }}>Puzzles</Text>
//           <Text className="mb-8 text-2xl text-center" style={{ color: PALETTE.teal }}>Choose a game and difficulty</Text>
//         </View>

//         {/* Choose game (row of chips) */}
//         <View className="p-6 mb-6 rounded-3xl" style={{ backgroundColor: "#FFFFFF", elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}>
//           <Text className="mb-4 text-2xl font-bold text-center" style={{ color: PALETTE.teal }}>Choose Game</Text>
//           <View className="flex-row flex-wrap justify-between gap-3">
//             {games.map(g => {
//               const selected = game?.key === g.key;
//               return (
//                 <TouchableOpacity
//                   key={g.key}
//                   className="items-center justify-center flex-1 py-4 rounded-2xl mx-1"
//                   style={{ backgroundColor: selected ? PALETTE.teal : "#F3F4F6", borderWidth: 2, borderColor: selected ? PALETTE.teal : "#E5E7EB" }}
//                   onPress={() => setGame(g)}
//                 >
//                   <Text className="text-2xl">{g.icon}</Text>
//                   <Text className="mt-1 text-lg font-semibold" style={{ color: selected ? "#FFFFFF" : PALETTE.teal }}>{g.name}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>

//         {/* Choose difficulty (identical style to MathQuiz list) */}
//         <View className="p-6 mb-8 rounded-3xl" style={{ backgroundColor: "#FFFFFF", elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}>
//           <Text className="mb-6 text-3xl font-bold text-center" style={{ color: PALETTE.teal }}>Choose Difficulty</Text>
//           <View className="space-y-5">
//             {diffs.map(d => {
//               const isSel = diff?.key === d.key;
//               return (
//                 <TouchableOpacity
//                   key={d.key}
//                   className="flex-row items-center justify-start py-5 pl-5 rounded-2xl"
//                   style={{ backgroundColor: isSel ? d.selBg : d.color, borderWidth: 3, borderColor: isSel ? d.selBg : d.border }}
//                   onPress={() => setDiff(d)}
//                   accessibilityRole="button"
//                 >
//                   <Text className="mr-4 text-3xl">{d.key==="easy"?"🟢":d.key==="medium"?"🟠":"🔴"}</Text>
//                   <View>
//                     <Text className="text-2xl font-bold" style={{ color: isSel ? "#FFFFFF" : d.text }}>{d.name}</Text>
//                     <Text className="text-lg" style={{ color: isSel ? "#FFFFFF" : d.text }}>
//                       {d.key==="easy"?"Gentle warm-up":d.key==="medium"?"A little challenge":"Focused challenge"}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         </View>

//         <TouchableOpacity
//           className="flex-row items-center justify-center py-6 mb-10 rounded-3xl"
//           style={{ backgroundColor: game && diff ? PALETTE.teal : "#CCCCCC", elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 5 }}
//           onPress={start}
//           disabled={!game || !diff}
//         >
//           <Text className="mr-3 text-3xl">🎮</Text>
//           <Text className="text-2xl font-semibold text-white">Start</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }
// screens/Games/Puzzle/PuzzleQuiz.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type Nav = NativeStackNavigationProp<RootStackParamList, "BrainGames">;

const games = [
  { key: "odd",   name: "Find Odd One",      icon: "🔍", route: "OddPlay" as const },
  { key: "seq",   name: "Next Number Game",  icon: "🔢", route: "SeqPlay" as const },
  { key: "arrow", name: "Follow The Arrow",  icon: "↕️", route: "ArrowPlay" as const },
  { key: "comp",  name: "Find Largest",      icon: "🔺", route: "CompPlay" as const },
  { key: "jigsaw", name: "Jigsaw",           icon: "🧩", route: "JigsawPlay" as const },
  { key: "sudoku", name: "Sudoku",           icon: "🧮", route: "SudokuPlay" as const },
  { key: "target", name: "Target Number",    icon: "🎯", route: "TargetNumberPlay" as const },
  { key: "order",  name: "Tap in Order",     icon: "1️⃣", route: "OrderTapPlay" as const },
];

const diffs = [
  { key: "easy",   name: "Easy",   color: PALETTE.lightTeal, border: PALETTE.teal,   text: PALETTE.teal,   selBg: PALETTE.teal },
  { key: "medium", name: "Medium", color: "#FFEDCC",         border: PALETTE.orange, text: PALETTE.orange, selBg: PALETTE.orange },
  { key: "hard",   name: "Hard",   color: "#FFE0E0",         border: PALETTE.red,    text: PALETTE.red,    selBg: PALETTE.red },
] as const;

export default function PuzzleQuiz() {
  const nav = useNavigation<Nav>();
  const [game, setGame] = useState<typeof games[number] | null>(null);
  const [diff, setDiff] = useState<typeof diffs[number] | null>(null);
  const { width } = useWindowDimensions();

  // responsive grid: 2 columns on small phones, 3 on wider screens
  const numCols = width < 380 ? 2 : width < 520 ? 3 : 3;

  const cardSize = useMemo(() => {
    // leave gutters for padding/margins; cap max width for large tablets
    const gutter = 24; // horizontal padding
    const gap = 10;    // spacing between cards
    const avail = Math.min(width, 720) - gutter * 2 - gap * (numCols - 1);
    const w = Math.floor(avail / numCols);
    // keep buttons tall enough for accessibility
    return Math.max(112, Math.min(160, w));
  }, [width, numCols]);

  const start = () => {
    if (!game || !diff) {
      return Alert.alert("Choose puzzle & difficulty", "Pick a game and a level to start.");
    }
    nav.navigate(game.route as any, { difficulty: (diff as any).key });
  };

  const renderGame = ({ item }: { item: typeof games[number] }) => {
    const selected = game?.key === item.key;
    return (
      <TouchableOpacity
        onPress={() => setGame(item)}
        accessibilityRole="button"
        accessibilityLabel={`Select game ${item.name}`}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={{
          width: cardSize,
          height: cardSize,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          backgroundColor: selected ? PALETTE.teal : "#F3F4F6",
          borderWidth: 2,
          borderColor: selected ? PALETTE.teal : "#E5E7EB",
          shadowColor: "#000",
          shadowRadius: 6,
          shadowOpacity: Platform.OS === "ios" ? 0.08 : 0,
          elevation: Platform.OS === "android" ? 2 : 0,
        }}
      >
        <Text style={{ fontSize: 28 }}>{item.icon}</Text>
        <Text
          numberOfLines={2}
          style={{
            marginTop: 6,
            textAlign: "center",
            fontSize: 14,
            fontWeight: "700",
            color: selected ? "#FFFFFF" : PALETTE.teal,
            paddingHorizontal: 8,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.lightPink }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: PALETTE.teal,
          paddingTop: Platform.select({ ios: 54, android: 28 }),
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => nav.goBack()}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 24, color: PALETTE.teal }}>←</Text>
        </TouchableOpacity>

        <Text
          style={{ fontSize: 20, fontWeight: "800", color: "white" }}
          numberOfLines={1}
        >
          Puzzle Quiz
        </Text>

        <View style={{ width: 44 }} />
      </View>

      {/* Hero (compact on small screens) */}
      <View
        style={{
          alignItems: "center",
          paddingTop: 12,
          paddingBottom: 8,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            width: width < 380 ? 84 : 108,
            height: width < 380 ? 84 : 108,
            borderRadius: 999,
            backgroundColor: PALETTE.teal,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          <Text style={{ fontSize: width < 380 ? 40 : 56 }}>🧩</Text>
        </View>
        <Text
          style={{ fontSize: 18, fontWeight: "800", color: PALETTE.teal, marginBottom: 4 }}
        >
          Puzzles
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: PALETTE.teal,
            opacity: 0.85,
            textAlign: "center",
            paddingHorizontal: 10,
          }}
        >
          Choose a game and difficulty
        </Text>
      </View>

      {/* Choose Game */}
      <View
        style={{
          flex: 1,
          backgroundColor: "white",
          marginHorizontal: 12,
          borderRadius: 20,
          paddingTop: 12,
          paddingBottom: 88, // room for sticky Start bar
          paddingHorizontal: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "800",
            color: PALETTE.teal,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Choose Game
        </Text>

        <FlatList
          data={games}
          keyExtractor={(it) => it.key}
          numColumns={numCols}
          contentContainerStyle={{ alignItems: "center" }}
          columnWrapperStyle={
            numCols > 1 ? { justifyContent: "space-between", width: "100%" } : undefined
          }
          renderItem={renderGame}
          showsVerticalScrollIndicator={false}
        />

        {/* Difficulty chips */}
        <View style={{ marginTop: 8 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: PALETTE.teal,
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Difficulty
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            {diffs.map((d) => {
              const selected = diff?.key === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => setDiff(d)}
                  accessibilityRole="button"
                  accessibilityLabel={`Set difficulty ${d.name}`}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  style={{
                    flex: 1,
                    height: 48,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: d.border,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selected ? d.selBg : d.color,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: selected ? "white" : d.text,
                    }}
                  >
                    {d.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Sticky bottom action bar */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 16,
          paddingBottom: Platform.select({ ios: 20, android: 12 }),
          paddingTop: 10,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={start}
          accessibilityRole="button"
          style={{
            height: 54,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: game && diff ? PALETTE.teal : "#A7F3D0",
            borderWidth: 2,
            borderColor: PALETTE.teal,
            opacity: game && diff ? 1 : 0.7,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>
            {game && diff ? `Start: ${game.name} · ${diff.name}` : "Select a game & difficulty"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
