import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Ionicons name="construct-outline" size={100} color="#4A90E2" style={styles.icon} />

      <Text style={styles.errorCode}>404</Text>
      <Text style={styles.title}>Oops! Page Not Found</Text>
      <Text style={styles.subtitle}>
        The page you are looking for doesn't exist or has been moved.
      </Text>

       
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace("/(tabs)/Homepage")}       
      >
        <Ionicons name="home-outline" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  errorCode: {
    fontSize: 80,
    fontWeight: "900",
    color: "#4A90E2",
    opacity: 0.2,
    position: 'absolute',
    top: '25%',
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#4A90E2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});