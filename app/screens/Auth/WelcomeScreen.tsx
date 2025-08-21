// WelcomeScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { auth } from "../../../config/firebaseConfig"; // Keep original path
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function WelcomeScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Logged in!");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BrainBoost!</Text>

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

      <Button title="Login" onPress={handleLogin} />
      <View style={{ marginTop: 10 }}>
        <Button title="Sign Up" onPress={() => navigation.navigate("Signup")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { 
    borderWidth: 1, 
    padding: 10, 
    marginVertical: 10, 
    borderRadius: 5,
    borderColor: '#ddd',
    fontSize: 16
  }
});