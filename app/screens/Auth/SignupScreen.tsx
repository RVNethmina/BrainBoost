import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, Image, Platform } from "react-native";
import { auth, firestore } from "../../../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { NotificationService } from "../../../config/NotificationService";

const PALETTE = {
  red: "#F04F4E",
  teal: "#639D9D",
  lightTeal: "#92BABA",
  orange: "#F3A421",
  lightPink: "#FBD4D3",
};

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const setupNotifications = async () => {
      console.log("🔔 Setting up notifications...");
      const success = await NotificationService.initialize();
      console.log(success ? "✅ Notifications initialized" : "❌ Failed to initialize notifications");
    };

    const testFirebaseConnection = async () => {
      try {
        console.log("🔥 Testing Firebase connection...");
        console.log("Auth instance exists:", !!auth);
        console.log("Firestore instance exists:", !!firestore);
        console.log("✅ Firestore connection test passed");
      } catch (error) {
        console.error("❌ Firebase connection test failed:", error);
      }
    };

    setupNotifications();
    testFirebaseConnection();
  }, []);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, "users", user.uid);
      const userData = {
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        displayName: email.split("@")[0],
        isActive: true,
        platform: Platform.OS,
      };
      await setDoc(userDocRef, userData);

      try {
        await NotificationService.sendLocalNotification(
          "Welcome to BrainBoost! 🎉",
          `Hi ${email.split("@")[0]}! Your account has been created successfully.`
        );
      } catch (notificationError) {
        console.error("❌ Notification error:", notificationError);
      }

      Alert.alert(
        "Success! 🎉",
        "Your account has been created successfully!\n\nCheck Firebase Console to verify your user data.",
        [
          {
            text: "Continue",
            onPress: () => navigation.navigate("Welcome"),
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      let errorMessage = "An error occurred during signup";
      if (error.code === "auth/email-already-in-use") errorMessage = "This email is already registered";
      else if (error.code === "auth/invalid-email") errorMessage = "Invalid email address";
      else if (error.code === "auth/weak-password") errorMessage = "Password is too weak";
      else if (error.code === "auth/network-request-failed") errorMessage = "Network error. Please check your internet connection";
      else if (error.message) errorMessage = error.message;
      Alert.alert("Signup Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo at top center */}
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
      />

      <Text style={styles.title}>Create Account</Text>

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

      <TouchableOpacity
        style={[styles.button, { backgroundColor: PALETTE.red }]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? "Creating Account..." : "Sign Up"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 12 }}
        onPress={() => navigation.navigate("SignIn")}
      >
        <Text style={[styles.linkText]}>Already have an account?</Text>
      </TouchableOpacity>

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
