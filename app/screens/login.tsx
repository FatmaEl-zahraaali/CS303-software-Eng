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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const PRIMARY_COLOR = '#248A80';

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    router.replace("/Homepage"); 
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
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showButton}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#94A3B8" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: PRIMARY_COLOR }]} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/screens/SignupScreen")}>
            <Text style={styles.switchText}>
              Don't have an account? 
              <Text style={[styles.link, { color: PRIMARY_COLOR }]}> Sign Up</Text>
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
    padding: 30,
    borderRadius: 35,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
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
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2A3A48',
  },
  showButton: {
    padding: 5,
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
    marginTop: 25, 
    textAlign: "center", 
    fontSize: 15,
    color: '#64748B',
  },
  link: { 
    fontWeight: "bold",
  },
});