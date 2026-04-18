import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";


const { width } = Dimensions.get("window");
const CARD_SIZE = width * 0.3; // 

export default function Subject() {
  const { subject } = useLocalSearchParams<{ subject: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{subject}</Text>

      
      <View style={styles.row}>
        
        <TouchableOpacity
          style={[styles.card, styles.attendanceCard]}
          onPress={() => router.push({ pathname: "/attendance", params: { subject } })}
        >
          <Text style={styles.cardText}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.quizCard]}
          onPress={() => router.push({ pathname: "/questionsbank", params: { subject } })}
        >
          <Text style={styles.cardText}>QuestionsBank</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    paddingTop: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#2d3436",
  },
  row: {
    flexDirection: "row", 
    justifyContent: "space-evenly", 
    width: "100%",
    paddingHorizontal: 10,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE, 
    borderRadius: 20, 
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  attendanceCard: {
    backgroundColor: "#ff7a00",
  },
  quizCard: {
    backgroundColor: "#ff7a00",
  },
  cardText: {
    color: "#fff",
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
  },
});