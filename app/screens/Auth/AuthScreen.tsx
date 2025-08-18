// app/src/screens/Auth/AuthScreen.tsx
import { supabase } from "@/app/lib/superbase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

/**
 * AuthScreen
 * - Toggle between Login and SignUp
 * - Validate email / password strength
 * - Username uniqueness check (supabase 'profiles' table expected)
 * - Remember me flag is saved in AsyncStorage
 * - On start, checks session and remember flag -> navigates accordingly
 *
 * NOTE: Supabase handles secure password hashing on server side.
 */

type Props = {};

export default function AuthScreen({}: Props) {
  const navigation = useNavigation<any>();

  // Mode
  const [isLogin, setIsLogin] = useState(true);

  // Loading / app init
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  // Error messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // On mount: check session and remember flag
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        const remember = await AsyncStorage.getItem("remember_me");
        const rememberFlag = remember !== "false"; // default true if missing

        if (session && rememberFlag) {
          // We have an active session and user chose "remember me" previously
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        } else if (session && !rememberFlag) {
          // session exists but user didn't want "remember me" -> sign out
          await supabase.auth.signOut();
          await AsyncStorage.removeItem("remember_me");
          navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
        } else {
          // no session: go to Welcome / Onboarding flow
          // keep on this screen (you might navigate to Welcome first)
          // navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
        }
      } catch (err) {
        console.warn("Auth init error:", err);
      } finally {
        setIsInitializing(false);
      }
    })();
  }, [navigation]);

  // Validators
  function validateEmail(e: string) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
    return re.test(String(e).toLowerCase());
  }

  function validateStrongPassword(p: string) {
    // At least 8 chars, one uppercase, one lowercase, one digit, one special char
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return re.test(p);
  }

  // Check username uniqueness in 'profiles' table
  async function isUsernameUnique(u: string) {
    if (!u) return false;
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", u)
      .limit(1)
      .maybeSingle();
    if (error) {
      console.warn("username check error", error);
      // for safety, assume not unique on error to avoid conflicts
      return false;
    }
    return !data; // if no row returned -> unique
  }

  // Sign up handler
  async function handleSignUp() {
    setErrorMsg(null);

    if (!username.trim() || !email.trim() || !password || !repassword) {
      setErrorMsg("Please fill all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (password !== repassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!validateStrongPassword(password)) {
      setErrorMsg(
        "Password should be at least 8 characters and include uppercase, lowercase, number and special character."
      );
      return;
    }

    setLoading(true);
    try {
      const unique = await isUsernameUnique(username.trim());
      if (!unique) {
        setErrorMsg("Username already in use. Please choose another username.");
        setLoading(false);
        return;
      }

      // Sign up with Supabase auth (server handles hashing)
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to sign up.");
        setLoading(false);
        return;
      }

      // If the user object is returned immediately (depends on Supabase settings),
      // insert profile row linking to user id. If not returned, user might need to confirm email.
      const userId = data?.user?.id ?? null;

      if (userId) {
        const { error: insertErr } = await supabase.from("profiles").insert([
          {
            id: userId,
            username: username.trim(),
            email: email.trim(),
            created_at: new Date().toISOString(),
          },
        ]);
        if (insertErr) {
          console.warn("profile insert error", insertErr);
          setErrorMsg("Could not create profile. Please contact support.");
          setLoading(false);
          return;
        }
        // success: persist remember flag
        await AsyncStorage.setItem("remember_me", rememberMe ? "true" : "false");

        // navigate to Home (or to verification screen if email confirm required)
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      } else {
        // No immediate user object — likely email confirmation required
        Alert.alert(
          "Check your email",
          "A confirmation email was sent. Please check your inbox to activate your account."
        );
        // still save the username locally or instruct how to proceed
      }
    } catch (err: any) {
      console.warn("SignUp error", err);
      setErrorMsg(err?.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  // Login handler
  async function handleLogin() {
    setErrorMsg(null);
    if (!email.trim() || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    if (!validateEmail(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message || "Login failed.");
        setLoading(false);
        return;
      }

      // on success, set remember flag
      await AsyncStorage.setItem("remember_me", rememberMe ? "true" : "false");
      // go to Home
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err: any) {
      console.warn("Login error", err);
      setErrorMsg(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  if (isInitializing) {
    return (
      <View className="items-center justify-center flex-1 bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 p-6 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="justify-center flex-1">
        <Text className="mb-4 text-2xl font-bold text-center">BrainBoost</Text>

        {/* Toggle */}
        <View className="flex-row justify-center mb-6">
          <TouchableOpacity
            className={`px-4 py-2 rounded-l ${
              isLogin ? "bg-blue-600" : "bg-gray-200"
            }`}
            onPress={() => setIsLogin(true)}
          >
            <Text className={`${isLogin ? "text-white" : "text-black"}`}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-r ${
              !isLogin ? "bg-blue-600" : "bg-gray-200"
            }`}
            onPress={() => setIsLogin(false)}
          >
            <Text className={`${!isLogin ? "text-white" : "text-black"}`}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {!isLogin && (
          <>
            {/* Username */}
            <Text className="mb-1 text-sm">Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
              className="px-3 py-2 mb-3 border border-gray-300 rounded"
            />
          </>
        )}

        {/* Email */}
        <Text className="mb-1 text-sm">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          className="px-3 py-2 mb-3 border border-gray-300 rounded"
        />

        {/* Password */}
        <Text className="mb-1 text-sm">Password</Text>
        <View className="flex-row items-center px-2 py-1 mb-3 border border-gray-300 rounded">
          <TextInput
            style={{ flex: 1 }}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            className="px-2 py-1"
          />
          <TouchableOpacity onPress={() => setShowPassword((s) => !s)} className="px-2">
            <Text className="text-blue-600">{showPassword ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        </View>

        {/* Re-password (signup only) */}
        {!isLogin && (
          <>
            <Text className="mb-1 text-sm">Confirm Password</Text>
            <View className="flex-row items-center px-2 py-1 mb-3 border border-gray-300 rounded">
              <TextInput
                style={{ flex: 1 }}
                value={repassword}
                onChangeText={setRepassword}
                placeholder="Re-enter password"
                secureTextEntry={!showRePassword}
                autoCapitalize="none"
                className="px-2 py-1"
              />
              <TouchableOpacity onPress={() => setShowRePassword((s) => !s)} className="px-2">
                <Text className="text-blue-600">{showRePassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Remember me */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => setRememberMe((r) => !r)}
            className={`w-5 h-5 mr-2 items-center justify-center rounded ${rememberMe ? "bg-blue-600" : "bg-white border border-gray-400"
              }`}
          >
            {rememberMe && <Text className="text-white">✓</Text>}
          </TouchableOpacity>
          <Text onPress={() => setRememberMe((r) => !r)}>Remember me</Text>
        </View>

        {/* Error */}
        {errorMsg ? <Text className="mb-3 text-red-600">{errorMsg}</Text> : null}

        {/* Action Button */}
        <TouchableOpacity
          onPress={isLogin ? handleLogin : handleSignUp}
          disabled={loading}
          className={`py-3 rounded ${loading ? "bg-gray-400" : "bg-blue-600"}`}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-lg text-center text-white">
              {isLogin ? "Login" : "Create account"}
            </Text>
          )}
        </TouchableOpacity>

        {/* Footer links */}
        <View className="items-center mt-4">
          {isLogin ? (
            <TouchableOpacity
              onPress={() => {
                // navigate to forgot password or to SignUp
                setIsLogin(false);
              }}
            >
              <Text className="text-blue-600">Don't have an account? Sign up</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsLogin(true)}>
              <Text className="text-blue-600">Already have an account? Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
