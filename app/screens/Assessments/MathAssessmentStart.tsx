// app/src/screens/Assessments/MathAssessmentStart.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type NavProp = NativeStackNavigationProp<RootStackParamList, "MathAssessmentStart">;

const MathAssessmentStart: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const onStart = () => navigation.navigate("MathAssessment");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Math Assessment</Text>
        <Text style={styles.subtitle}>Short friendly test to track thinking & calculation</Text>

        <View style={[styles.card, { borderColor: PALETTE.lightTeal }]}>
          <Text style={styles.cardTitle}>What to expect</Text>
          <Text style={styles.line}>• 10 easy-to-follow questions</Text>
          <Text style={styles.line}>• Takes about 5–10 minutes</Text>
          <Text style={styles.line}>• Results saved to your account</Text>
        </View>

        <TouchableOpacity style={[styles.startBtn, { backgroundColor: PALETTE.teal }]} onPress={onStart}>
          <Text style={styles.startBtnText}>Start Assessment</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MathAssessmentStart;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7FAFC" },
  content: { padding: 24, alignItems: "center" },
  title: { fontSize: 30, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#64748b", marginBottom: 20, textAlign: "center" },
  card: { width: "100%", backgroundColor: "#fff", padding: 18, borderRadius: 12, marginBottom: 18, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  line: { fontSize: 16, color: "#475569", marginVertical: 2 },
  startBtn: { width: "100%", paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  startBtnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
