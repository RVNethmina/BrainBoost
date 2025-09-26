import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

export default function OnboardingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Welcome!</Text>
      <Text style={styles.subtitle}>Choose how you'd like to continue</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: PALETTE.teal }]}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: PALETTE.orange }]}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Learn More */}
      <Text style={styles.learnMoreText}>
        New to brain training?{" "}
        <Text style={{ color: PALETTE.red, fontWeight: "600" }}>Learn More</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, // circular
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: PALETTE.teal,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: PALETTE.lightTeal,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  learnMoreText: {
    fontSize: 12,
    color: PALETTE.lightTeal,
    textAlign: "center",
  },
});
