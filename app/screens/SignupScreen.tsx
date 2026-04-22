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

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("doctor");

  const PRIMARY_COLOR = '#248A80';

  const handleRegister = () => {
    if (!name || !email || !password || (role === "student" && !studentId)) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    
    router.replace("/(tabs)/Homepage" as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: '#F4F7F7' }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerDecoration, { backgroundColor: PRIMARY_COLOR }]} />
        
        <View style={styles.box}>
          <Text style={[styles.title, { color: PRIMARY_COLOR }]}>Create Account</Text>
          <Text style={styles.subtitle}>Join our academic community</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholderTextColor="#94A3B8"
            />
          </View>

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

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={PRIMARY_COLOR} style={styles.icon} />
            <TextInput
              placeholder="Password"
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>I am a:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === "doctor" && { borderColor: PRIMARY_COLOR, backgroundColor: '#E8F4F3' },
              ]}
              onPress={() => setRole("doctor")}
            >
              <Ionicons 
                name="briefcase" 
                size={20} 
                color={role === "doctor" ? PRIMARY_COLOR : "#94A3B8"} 
              />
              <Text style={[styles.roleText, role === "doctor" && { color: PRIMARY_COLOR }]}>Doctor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                role === "student" && { borderColor: PRIMARY_COLOR, backgroundColor: '#E8F4F3' },
              ]}
              onPress={() => setRole("student")}
            >
              <Ionicons 
                name="school" 
                size={20} 
                color={role === "student" ? PRIMARY_COLOR : "#94A3B8"} 
              />
              <Text style={[styles.roleText, role === "student" && { color: PRIMARY_COLOR }]}>Student</Text>
            </TouchableOpacity>
          </View>

          {role === "student" && (
            <View style={styles.inputWrapper}>
              <Ionicons name="id-card-outline" size={20} color={PRIMARY_COLOR} style={styles.icon} />
              <TextInput
                placeholder="Student ID"
                style={styles.input}
                value={studentId}
                onChangeText={setStudentId}
                keyboardType="numeric"
                placeholderTextColor="#94A3B8"
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: PRIMARY_COLOR }]} 
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Register Now</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/Screens/login" as any)}>
            <Text style={styles.switchText}>
              Already have an account? 
              <Text style={[styles.link, { color: PRIMARY_COLOR }]}> Login</Text>
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
    paddingVertical: 40,
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
    borderRadius: 35,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    marginBottom: 12,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2A3A48',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: '#2A3A48',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    gap: 8,
  },
  roleText: {
    fontWeight: "600",
    color: '#64748B',
  },
  btn: {
    padding: 16,
    borderRadius: 15,
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  btnText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  switchText: { 
    marginTop: 20, 
    textAlign: "center", 
    fontSize: 14,
    color: '#64748B',
  },
  link: { 
    fontWeight: "bold",
  },
});