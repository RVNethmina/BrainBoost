// SignInScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { auth } from "../../../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // ✅ Navigate immediately to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });

      // Optional: show success notification on mobile only
      if (Platform.OS !== "web") {
        Alert.alert("Success", "Logged in successfully!");
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === "auth/user-not-found") errorMessage = "User not found";
      else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password";
      else if (error.code === "auth/invalid-email") errorMessage = "Invalid email";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image source={require("../../assets/logo.png")} style={styles.logo} />

      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: PALETTE.red }]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? "Logging In..." : "Sign In"}</Text>
      </TouchableOpacity>

      {/* Forgot Password */}
      <TouchableOpacity
        style={{ marginTop: 10 }}
        onPress={() => Alert.alert("Forgot Password", "Password reset functionality coming soon!")}
      >
        <Text style={[styles.linkText]}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Create Account */}
      <TouchableOpacity
        style={{ marginTop: 12 }}
        onPress={() => navigation.navigate("Signup")}
      >
        <Text style={[styles.linkText]}>Create Account</Text>
      </TouchableOpacity>

      {/* Back to Welcome */}
      <TouchableOpacity
        style={{ marginTop: 20 }}
        onPress={() => navigation.navigate("Welcome")}
      >
        <Text style={[styles.linkText, { color: "#666" }]}>Back to Welcome</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#ffffff" },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
    resizeMode: "cover",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: PALETTE.teal },
  input: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: "#ddd",
    fontSize: 16,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600", textAlign: "center" },
  linkText: { fontSize: 14, color: PALETTE.lightTeal, textAlign: "center", textDecorationLine: "underline" },
});
