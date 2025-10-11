// app/src/screens/Assessments/MathAssessmentStart.tsx
import { PALETTE } from "@/app/design/colors";
import { RootStackParamList } from "@/app/navigation/AppNavigator";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from "@/app/contexts/SettingsContext"; // Import the settings context

type NavProp = NativeStackNavigationProp<RootStackParamList, "MathAssessmentStart">;

const MathAssessmentStart: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  
  // Use settings context
  const { theme, getFontScale } = useSettings();
  const fontScale = getFontScale();
  const isDark = theme === 'dark';

  const onStart = () => navigation.navigate("MathAssessment");

  // Dynamic colors based on theme
  const bgColor = isDark ? '#1a1a1a' : '#F7FAFC';
  const textColor = isDark ? '#fff' : PALETTE.teal;
  const mutedTextColor = isDark ? '#aaa' : '#64748b';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const cardBorderColor = isDark ? PALETTE.teal : PALETTE.lightTeal;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[
          styles.title, 
          { 
            color: textColor,
            fontSize: 30 * fontScale 
          }
        ]}>
          Math Assessment
        </Text>
        
        <Text style={[
          styles.subtitle, 
          { 
            color: mutedTextColor,
            fontSize: 16 * fontScale 
          }
        ]}>
          Short friendly test to track thinking & calculation
        </Text>

        <View style={[
          styles.card, 
          { 
            borderColor: cardBorderColor,
            backgroundColor: cardBg
          }
        ]}>
          <Text style={[
            styles.cardTitle, 
            { 
              color: textColor,
              fontSize: 18 * fontScale 
            }
          ]}>
            What to expect
          </Text>
          
          <Text style={[
            styles.line, 
            { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }
          ]}>
            • 10 easy-to-follow questions
          </Text>
          
          <Text style={[
            styles.line, 
            { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }
          ]}>
            • Takes about 5–10 minutes
          </Text>
          
          <Text style={[
            styles.line, 
            { 
              color: mutedTextColor,
              fontSize: 16 * fontScale 
            }
          ]}>
            • Results saved to your account
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.startBtn, { backgroundColor: PALETTE.teal }]} 
          onPress={onStart}
        >
          <Text style={[
            styles.startBtnText, 
            { 
              fontSize: 18 * fontScale 
            }
          ]}>
            Start Assessment
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MathAssessmentStart;

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  content: { 
    padding: 24, 
    alignItems: "center" 
  },
  title: { 
    fontWeight: "800", 
    marginBottom: 8, 
    textAlign: "center" 
  },
  subtitle: { 
    marginBottom: 20, 
    textAlign: "center" 
  },
  card: { 
    width: "100%", 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 18, 
    elevation: 3,
    borderWidth: 2
  },
  cardTitle: { 
    fontWeight: "700", 
    marginBottom: 8 
  },
  line: { 
    marginVertical: 2 
  },
  startBtn: { 
    width: "100%", 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  startBtnText: { 
    color: "#fff", 
    fontWeight: "800" 
  },
});