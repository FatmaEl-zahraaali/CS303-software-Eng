import React, { useState, useEffect, useRef } from "react";
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
import {
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  getAuth,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const handled = useRef(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: "660014656338-unmi37vvfnc5n07vfv9vstf6itoek2a6.apps.googleusercontent.com",
    androidClientId: "660014656338-0ur8u9pfcmffidhbsglijglpaoqer8dk.apps.googleusercontent.com",
    webClientId: "660014656338-unmi37vvfnc5n07vfv9vstf6itoek2a6.apps.googleusercontent.com",
    redirectUri: AuthSession.makeRedirectUri({
      scheme: "myapp",
    }),
  });

const handleRegister = async () => {
  if (!name || !email || !password) {
    Alert.alert("Error", "Please fill all fields");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    Alert.alert("Success", "Account created successfully");
    router.replace("/Homepage");

  } catch (error) {
    console.log("REGISTER ERROR:", error.code, error.message);
    Alert.alert("Error", error.message);
  }
};

  useEffect(() => {
    const loginWithGoogle = async () => {
      try {
        if (!response || response.type !== "success") return;
        if (handled.current) return;

        handled.current = true;
         const idToken = response?.authentication?.idToken;
         if (!idToken) {
        handled.current = false;
        return;
      }
        const credential = GoogleAuthProvider.credential(idToken);
         const result = await signInWithCredential(auth, credential);

      const user = result.user;

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              name: user.displayName || "No Name",
              email: user.email,
              role: "student",
              provider: "google",
              createdAt: new Date().toISOString(),
            });
          }
          Alert.alert("Success", "Google Login Success");
          router.replace("/Homepage");
        }
      } catch (error) {
        Alert.alert("Google Error", error.message);
      }finally {
  if (response?.type === "success") {
    handled.current = false;
  }
}
    };
    loginWithGoogle();
  }, [response]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.box}>
          <Text style={styles.title}>Create Account</Text>
          <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
          <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.link}>{showPassword ? "Hide Password" : "Show Password"}</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.option, role === "student" && styles.selected]} onPress={() => setRole("student")}>
              <Text style={role === "student" ? { color: "#FF4500", fontWeight: 'bold' } : {}}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.option, role === "doctor" && styles.selectedOrange]} onPress={() => setRole("doctor")}>
              <Text style={role === "doctor" ? { color: "#fff", fontWeight: 'bold' } : {}}>Doctor</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleRegister}>
            <Text style={styles.btnText}>Register</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ backgroundColor: "#DB4437", padding: 14, borderRadius: 8, marginTop: 10 }} 
            onPress={() => promptAsync({ useProxy: true })}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>Sign in with Google</Text>
          </TouchableOpacity>
          <Text style={styles.switchText}>
            Already have an account?
            <Text style={styles.link} onPress={() => router.push("/screens/login")}> Login</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", paddingVertical: 30 },
  box: { width: width * 0.9, backgroundColor: "#fff", padding: 25, borderRadius: 12, elevation: 5 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 25, color: "#FF4500" },
  input: { width: "100%", padding: 14, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
  btn: { backgroundColor: "#FF4500", padding: 14, borderRadius: 8, marginTop: 15 },
  btnText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  option: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#ccc", margin: 5, borderRadius: 8, alignItems: "center" },
  selected: { borderColor: "#FF4500" },
  selectedOrange: { backgroundColor: "#FF4500", borderColor: "#FF4500" },
  switchText: { marginTop: 18, textAlign: "center" },
  link: { color: "#FF4500", fontWeight: "bold", marginTop: 5 },
});