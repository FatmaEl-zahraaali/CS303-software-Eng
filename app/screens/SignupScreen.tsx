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

const { width } = Dimensions.get("window");



export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState("student");

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    Alert.alert("Success", "Registered!");
    router.replace("/Homepage");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Create Account</Text>

          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showButtonText}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>User</Text>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.option,
                role === "student" && styles.selected,
              ]}
              onPress={() => setRole("student")}
            >
              <Text>Student</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.option,
                role === "doctor" && styles.selectedOrange,
              ]}
              onPress={() => setRole("doctor")}
            >
              <Text>Doctor</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleRegister}>
            <Text style={styles.btnText}>Register</Text>
          </TouchableOpacity>

          <Text style={styles.switchText}>
            Already have an account?
            <Text
              style={styles.link}
              onPress={() => router.push("/screens/login")}
            >
              {" "}Login
            </Text>
          </Text>
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
  box: {
    width: width * 0.9,
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#FF4500",
  },
  input: {
    width: "100%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  showButtonText: { color: "#FF4500", fontWeight: "bold" },

  sectionTitle: {
    marginTop: 15,
    marginBottom: 5,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  option: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 5,
    borderRadius: 8,
    alignItems: "center",
  },

  selected: {
    backgroundColor: "#fff",
    borderColor: "#FF4500",
  },

  selectedOrange: {
    backgroundColor: "#FF4500",
    borderColor: "#FF4500",
  },

  btn: {
    backgroundColor: "#FF4500",
    padding: 14,
    borderRadius: 8,
    marginTop: 15,
  },

  btnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },

  switchText: { marginTop: 18, textAlign: "center" },
  link: { color: "#FF4500", fontWeight: "bold" },
});