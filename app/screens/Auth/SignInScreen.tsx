// SignInScreen.tsx
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
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
import { auth } from "../../../config/firebaseConfig";

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
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });

      if (Platform.OS !== "web") {
        Alert.alert("Success", "You are now logged in!");
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === "auth/user-not-found") errorMessage = "No account found with this email.";
      else if (error.code === "auth/wrong-password") errorMessage = "Incorrect password.";
      else if (error.code === "auth/invalid-email") errorMessage = "Invalid email format.";
      Alert.alert("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Image source={require("../../assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Log In to Your Account</Text>

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
          placeholder="Enter your Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: PALETTE.red }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? "Logging In..." : "Sign In"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 20 }}
          onPress={() => Alert.alert("Forgot Password", "Password reset will be available soon.")}
        >
          <Text style={styles.linkText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.linkText}>Create a New Account</Text>
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
    resizeMode: "contain",
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
