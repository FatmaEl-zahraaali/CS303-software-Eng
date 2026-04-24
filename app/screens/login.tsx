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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please enter email and password");
    return;
  }

  setLoading(true);

  
  try {
    await signInWithEmailAndPassword(auth, email, password);

    router.replace("/Homepage");
  } catch (error) {
    let msg = "Something went wrong";

    switch (error.code) {
      case "auth/user-not-found":
        msg = "No account found with this email";
        break;
      case "auth/wrong-password":
        msg = "Incorrect password";
        break;
      case "auth/invalid-email":
        msg = "Invalid email format";
        break;
      case "auth/too-many-requests":
        msg = "Too many attempts. Try later";
        break;
    }

    Alert.alert("Login Failed", msg);
  }

  setLoading(false);
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: '#F4F7F7' }}
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
  <TextInput
    placeholder="Password"
    style={styles.input}
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />

  <TouchableOpacity
    onPress={() => setShowPassword(!showPassword)}
    style={styles.showButton}
  >
    <Text style={styles.showButtonText}>
      {showPassword ? "Hide" : "Show"}
    </Text>
  </TouchableOpacity>
</View>

         <TouchableOpacity
  style={styles.btn}
  onPress={handleLogin}
  disabled={loading}
>
  <Text style={styles.btnText}>
    {loading ? "Logging in..." : "Login"}
  </Text>
</TouchableOpacity>

          <Text style={styles.switchText}>
            Don't have an account?
            <Text
              style={styles.link}
              onPress={() => router.push("/screens/SignupScreen")}
            >
              {" "}Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  box: {
    width: width * 0.88,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  showButton: {
    padding: 5,
  },
  showButton: {
    marginLeft: 10,
  },
  showButtonText: {
    color: "#FF4500",
    fontWeight: "bold",
  },
  btn: {
    width: "100%",
    padding: 16,
    borderRadius: 15,
    marginTop: 15,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchText: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 15,
  },
  link: {
    color: "#FF4500",
    fontWeight: "bold",
  },
});