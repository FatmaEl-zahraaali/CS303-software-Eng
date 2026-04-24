<<<<<<< Updated upstream:app/(tabs)/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/screens/login" />;
}
=======
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {}
      <Image
        source={require("../assets/images/EduTrac.png")}
        style={styles.background}
      />

      {}
      <View style={styles.overlay} />

      {}
      <View style={styles.topContent}>
        <Animatable.Text animation="fadeInDown" style={styles.title}>
          Welcome to EduTrac
        </Animatable.Text>
      </View>

      {}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/screens/login")}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </Animatable.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  topContent: {
    position: "absolute",
    top: 80,
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
  },

  bottom: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    alignItems: "center",
  },

  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
>>>>>>> Stashed changes:app/index.tsx
