import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Chapters() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const chapters = [
    "Chapter 1",
    "Chapter 2",
    "Chapter 3",
    "Chapter 4",
    "Chapter 5",
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#135D56" barStyle="light-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{code}</Text>
          <Text style={styles.headerSubtitle}>Questions Bank</Text>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#135D56" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Ionicons name="book" size={55} color="#135D56" />
        </View>

        <Text style={styles.sectionTitle}>
          Select Chapter
        </Text>

        <View style={styles.cardsContainer}>
          {chapters.map((chapter, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/questionsbank",
                  params: {
                    code: code,
                    chapter: (index + 1).toString()
                  },
                })
              }
            >
              <Text style={styles.cardText}>
                {chapter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F4F4",
  },

  header: {
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#135D56",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#E0F2F1",
    marginTop: 2,
  },

  backBtn: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
  },

  body: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 40,
  },

  logoContainer: {
    backgroundColor: "#E0F2F1",
    padding: 22,
    borderRadius: 45,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 30,
  },

  cardsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 18,
  },

  card: {
    width: "85%",
    backgroundColor: "#fff",
    paddingVertical: 22,
    borderRadius: 22,
    alignItems: "center",
    elevation: 5,
  },

  cardText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#135D56",
  },
});