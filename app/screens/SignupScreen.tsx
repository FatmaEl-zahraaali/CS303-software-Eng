import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { auth, db } from "../../config/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Info", "Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        phone,
        role,
        provider: "email",
        createdAt: serverTimestamp(),
      });
      setLoading(false);
      Alert.alert("Verify Your Email", "A link has been sent to your email.", [
        { text: "OK", onPress: () => router.replace("/screens/login") }
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Signup Error", error.message);
    }
  };

  return (
    <LinearGradient colors={["#4A90E2", "#6DD5FA"]} style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flexCenter}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          centerContent={true}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputGroup}>
                <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                />

                <TextInput
                style={styles.input}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
                />
            </View>

            <View style={styles.inputGroup}>
                <TextInput
                style={styles.input}
                placeholder="Phone Number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#999"
                />

                <TextInput
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
                />
            </View>

            <Text style={styles.label}>Select Your Role:</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.option, role === "student" && styles.selected]}
                onPress={() => setRole("student")}
              >
                <Ionicons name="school-outline" size={20} color={role === "student" ? "#4A90E2" : "#888"} />
                <Text style={[styles.optionText, { color: role === "student" ? "#4A90E2" : "#888" }]}>Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.option, role === "doctor" && styles.selected]}
                onPress={() => setRole("doctor")}
              >
                <Ionicons name="person-outline" size={20} color={role === "doctor" ? "#4A90E2" : "#888"} />
                <Text style={[styles.optionText, { color: role === "doctor" ? "#4A90E2" : "#888" }]}>Doctor</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && { backgroundColor: '#ccc' }]} 
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/screens/login")}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  flexCenter: { flex: 1, width: '100%', justifyContent: 'center' },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingVertical: 20    
  },
  card: {
    width: width * 0.94,     
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 30,   
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: { fontSize: 30, fontWeight: "bold", color: "#4A90E2", marginBottom: 25 },
  inputGroup: { width: '100%' },   
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    marginBottom: 10,  
    backgroundColor: '#f9f9f9',
    fontSize: 16
  },
  label: { alignSelf: 'flex-start', color: '#666', marginBottom: 8, marginLeft: 5, fontWeight: '600' },
  row: { flexDirection: "row", marginBottom: 20, width: '100%' },
  option: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: '#fdfdfd'
  },
  optionText: { marginLeft: 8, fontWeight: '500' },
  selected: { borderColor: "#4A90E2", backgroundColor: '#f0f7ff', borderWidth: 2 },
  button: { 
    backgroundColor: "#4A90E2", 
    padding: 16, 
    borderRadius: 15, 
    width: "100%", 
    alignItems: "center", 
    marginTop: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  loginText: { marginTop: 20, color: "#666" },
  loginBold: { fontWeight: "bold", color: "#4A90E2" },
});