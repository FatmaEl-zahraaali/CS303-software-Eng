import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";

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
      
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const userData = snap.data();
        
        if (userData.role === "doctor") {
          router.replace("/screens/DoctorProfile");
        } else if (userData.role === "student") {
          router.replace("/(tabs)/Homepage");
        }
      } else {
        router.replace("/+not-found");
      }

    } catch (error: any) {
      let msg = "Login failed. Please try again.";

      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        msg = "Account does not exist. Please check your email or sign up.";
      } else if (error.code === "auth/wrong-password") {
        msg = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Too many attempts. Account temporarily disabled.";
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
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={22} 
                color={PRIMARY_COLOR} 
              />
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
  showButtonText: { color: "#4A90E2", fontWeight: "bold" },
  btn: { width: "100%", padding: 16, borderRadius: 15, marginTop: 15, alignItems: 'center' },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  switchText: { marginTop: 18, textAlign: "center", fontSize: 15 },
  link: { color:"#4A90E2", fontWeight: "bold" },
});
