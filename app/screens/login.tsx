import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";

const { width } = Dimensions.get("window");
const PRIMARY_COLOR = "#4A90E2";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(), 
        password
      );

      const user = userCredential.user;
      console.log("LOGIN SUCCESS:", user.uid);

      router.replace("/Homepage");

    } catch (error: any) {
      console.log("LOGIN ERROR CODE:", error.code);

      let msg = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        msg = "This account does not exist. Please check your email or sign up.";
      } else if (error.code === "auth/wrong-password") {
        msg = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        msg = "The email address is badly formatted.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Access to this account has been temporarily disabled.";
      }

      Alert.alert("Login Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#F4F7F7" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerDecoration, { backgroundColor: PRIMARY_COLOR }]} />

        <View style={styles.box}>
          <Text style={[styles.title, { color: PRIMARY_COLOR }]}>Login</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              placeholder="Email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              placeholder="Password"
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showButtonText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: PRIMARY_COLOR }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Login</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.switchText}>
            Don't have an account?
            <Text
              style={styles.link}
              onPress={() => router.push("/screens/SignupScreen")}
            >
              {" "}Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 30 },
  headerDecoration: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 300,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  box: {
    width: width * 0.88,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  title: { fontSize: 40, fontWeight: "700", textAlign: "center", marginBottom: 20 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, padding: 14 },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  passwordInput: { flex: 1, padding: 14 },
  showButtonText: { color: "#FF4500", fontWeight: "bold" },
  btn: { width: "100%", padding: 16, borderRadius: 15, marginTop: 15, alignItems: 'center' },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  switchText: { marginTop: 18, textAlign: "center", fontSize: 15 },
  link: { color: "#FF4500", fontWeight: "bold" },
});