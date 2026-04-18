import { useRouter } from "expo-router";
import React from "react";
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ff7a00" barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Welcome </Text>
        <Text style={styles.subtitle}>Choose your subject</Text>
      </View>

      <View style={styles.body}>

       <TouchableOpacity
  style={styles.card}
  onPress={() => router.push("/screens/Scan202")}
>
  <Text style={styles.cardText}>CS303</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardText}>CS309</Text>
        </TouchableOpacity>

<TouchableOpacity
  style={styles.card}
  onPress={() => router.push("/")}
>
  <Text style={styles.cardText}>CS202</Text>
</TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff7a00",
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },

  subtitle: {
    fontSize: 16,
    color: "#fff",
    marginTop: 5,
    opacity: 0.9,
  },

  body: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    justifyContent: "center",
    gap: 20,
  },

  card: {
    backgroundColor: "#ff7a00",
    paddingVertical: 25,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  cardText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});