import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function QuestionsBank() {
  const { subject } = useLocalSearchParams();
  const subjectKey = (subject as string) || "CS303";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subject: {subjectKey}</Text>
      <Text style={styles.subtitle}>Select Difficulty</Text>

      {["easy", "medium", "hard"].map((lvl) => (
        <TouchableOpacity
          key={lvl}
          style={[styles.card, { backgroundColor: "#ff7a00" }]}
        >
          <Text style={styles.text}>{lvl.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#ff7a00",
  },
  card: {
    backgroundColor: "#ff7a00",
    paddingVertical: 18,
    width: "80%",
    marginVertical: 8,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

