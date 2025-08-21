// SignupScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from "react-native";
import { auth, firestore } from "../../../config/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { NotificationService } from "../../../config/NotificationService";

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize notifications when component mounts
    const setupNotifications = async () => {
      console.log('🔔 Setting up notifications...');
      const success = await NotificationService.initialize();
      if (success) {
        console.log('✅ Notifications initialized successfully');
      } else {
        console.log('❌ Failed to initialize notifications');
      }
    };

    // Test Firebase connection
    const testFirebaseConnection = async () => {
      try {
        console.log('🔥 Testing Firebase connection...');
        console.log('Auth instance exists:', !!auth);
        console.log('Firestore instance exists:', !!firestore);
        
        // Try to read from Firestore to test connection
        const testCollection = collection(firestore, 'test');
        console.log('✅ Firestore connection test passed');
      } catch (error) {
        console.error('❌ Firebase connection test failed:', error);
      }
    };

    setupNotifications();
    testFirebaseConnection();
  }, []);

  // Test notification function
  const testNotification = async () => {
    console.log('🧪 Testing notification...');
    const success = await NotificationService.testNotification();
    if (success) {
      Alert.alert("Test Success", "Notification sent! Check your notification bar.");
      console.log('✅ Test notification sent successfully');
    } else {
      Alert.alert("Test Failed", "Failed to send notification. Check permissions and logs.");
      console.log('❌ Test notification failed');
    }
  };

  const handleSignup = async () => {
    console.log('\n🚀 ===== STARTING SIGNUP PROCESS =====');
    
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
      console.log('📧 Email:', email);
      console.log('🔒 Password length:', password.length);
      
      // 1️⃣ Create user in Firebase Auth
      console.log('\n1️⃣ Creating user in Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ User created in Auth successfully!');
      console.log('👤 User ID:', user.uid);
      console.log('📧 User Email:', user.email);

      // 2️⃣ Store user profile in Firestore
      console.log('\n2️⃣ Creating user document in Firestore...');
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const userData = {
          email: user.email,
          uid: user.uid,
          createdAt: new Date().toISOString(),
          displayName: email.split('@')[0],
          isActive: true,
          platform: Platform.OS,
        };

        console.log('📝 User data to save:', JSON.stringify(userData, null, 2));
        console.log('🗂️ Document path: users/' + user.uid);
        
        await setDoc(userDocRef, userData);
        console.log('✅ User document created in Firestore successfully!');

        // Verify the document was actually created
        console.log('🔍 Verifying document creation...');
        
        // Small delay to ensure the document is fully written
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (firestoreError: any) {
        console.error('❌ FIRESTORE ERROR:', firestoreError);
        console.error('Error code:', firestoreError.code);
        console.error('Error message:', firestoreError.message);
        throw new Error("Failed to create user profile: " + firestoreError.message);
      }

      // 3️⃣ Send local notification
      console.log('\n3️⃣ Sending welcome notification...');
      try {
        const notificationId = await NotificationService.sendLocalNotification(
          "Welcome to BrainBoost! 🎉",
          `Hi ${email.split('@')[0]}! Your account has been created successfully.`
        );
        
        if (notificationId) {
          console.log('✅ Notification sent successfully! ID:', notificationId);
        } else {
          console.log('⚠️ Notification failed to send (but signup continues)');
        }
      } catch (notificationError) {
        console.error('❌ Notification error:', notificationError);
        // Don't fail the signup if notification fails
      }

      // 4️⃣ Show success alert
      console.log('\n4️⃣ Showing success message...');
      Alert.alert(
        "Success! 🎉", 
        "Your account has been created successfully!\n\nCheck Firebase Console to verify your user data.",
        [
          {
            text: "Continue",
            onPress: () => {
              console.log('✅ User chose to continue - navigating to Welcome');
              navigation.navigate("Welcome");
            }
          }
        ]
      );

      console.log('🎉 ===== SIGNUP PROCESS COMPLETED SUCCESSFULLY =====\n');

    } catch (error: any) {
      console.error('\n❌ ===== SIGNUP PROCESS FAILED =====');
      console.error('Error object:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      let errorMessage = "An error occurred during signup";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Please check your internet connection";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Signup Error", errorMessage + "\n\nCheck console for detailed logs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button 
        title={isLoading ? "Creating Account..." : "Sign Up"} 
        onPress={handleSignup} 
        disabled={isLoading}
      />
      
      <View style={{ marginTop: 10 }}>
        <Button 
          title="Test Notification" 
          onPress={testNotification} 
          color="#007AFF"
        />
      </View>
      
      <View style={{ marginTop: 20 }}>
        <Button 
          title="Back to Welcome" 
          onPress={() => navigation.navigate("Welcome")} 
          color="#666"
        />
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
  },
});