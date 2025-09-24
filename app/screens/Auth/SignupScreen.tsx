import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, firestore } from "../../../config/firebaseConfig";
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
      await NotificationService.initialize();
    };
    setupNotifications();
  }, []);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, {
        email: user.email,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        displayName: email.split("@")[0],
        isActive: true,
        platform: Platform.OS,
      });

      try {
        await NotificationService.sendLocalNotification(
          "Welcome to BrainBoost 🎉",
          `Hi ${email.split("@")[0]}, your account has been created successfully!`
        );
      } catch {}

      Alert.alert("Success", "Your account has been created!", [
        { text: "Continue", onPress: () => navigation.navigate("Welcome") },
      ]);
    } catch (error: any) {
      let errorMessage = "An error occurred during signup.";
      if (error.code === "auth/email-already-in-use") errorMessage = "This email is already registered.";
      else if (error.code === "auth/invalid-email") errorMessage = "Invalid email address.";
      else if (error.code === "auth/weak-password") errorMessage = "Password is too weak.";
      else if (error.code === "auth/network-request-failed") errorMessage = "Please check your internet connection.";
      else if (error.message) errorMessage = error.message;
      Alert.alert("Signup Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Register Your Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />

        <TextInput
          style={styles.input}
          placeholder="Create a Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: PALETTE.red }]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Creating Account..." : "Sign Up"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.linkText}>Already have an account? Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 30 }} onPress={() => navigation.navigate("Welcome")}>
          <Text style={[styles.linkText, { color: "#444" }]}>Back to Welcome</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: "center" },
  container: { flex: 1, justifyContent: "center", padding: 30, backgroundColor: "#fff" },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    marginBottom: 30,
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: PALETTE.teal },
  input: {
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
    borderRadius: 12,
    borderColor: "#bbb",
    fontSize: 18,
  },
  button: {
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: { color: "#fff", fontSize: 20, fontWeight: "700", textAlign: "center" },
  linkText: { fontSize: 18, color: PALETTE.lightTeal, textAlign: "center", textDecorationLine: "underline" },
});
