import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

export default function WelcomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>Brain Boost</Text>
      <Text style={styles.subtitle}>Smart fun for sharp minds</Text>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Onboarding")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
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
    borderRadius: 50, // makes it circular
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: PALETTE.teal,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: PALETTE.lightTeal,
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: PALETTE.red,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // for Android shadow
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
