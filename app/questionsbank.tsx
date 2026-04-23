import React, { useRef } from "react";
import { View,Text, StyleSheet, StatusBar, TouchableOpacity, Dimensions, Pressable, Platform, Animated} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");


type DifficultyLevel = "easy" | "medium" | "hard";

export default function QuestionsBank() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  const PRIMARY_COLOR = "#135D56"; 
  const ACCENT_ORANGE = "#135D56"; 

  
  const DifficultyButton = ({ level }: { level: DifficultyLevel }) => {
    
    const animValue = useRef(new Animated.Value(0)).current;

    
    const animate = (toValue: number) => {
      Animated.timing(animValue, {
        toValue: toValue,
        duration: 150, 
        useNativeDriver: false, 
      }).start();
    };

    
    const backgroundColor = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["#FFFFFF", ACCENT_ORANGE], 
    });

    const textColor = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["#135D56", "#FFFFFF"], 
    });

    const scale = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.04], 
    });

    return (
      <Pressable
        
        onPressIn={() => animate(1)}
        
        onPressOut={() => animate(0)}
        
        onHoverIn={() => Platform.OS === "web" && animate(1)}
        onHoverOut={() => Platform.OS === "web" && animate(0)}
        onPress={() => {
          console.log(`Selected: ${level}`);
        }}
        style={{ width: "100%", alignItems: "center" }}
      >
        <Animated.View
          style={[
            styles.rectCard,
            {
              backgroundColor: backgroundColor,
              transform: [{ scale: scale }],
            },
          ]}
        >
          <Animated.Text style={[styles.cardText, { color: textColor }]}>
            {level.toUpperCase()}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />

      
      <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
        <View>
          <Text style={styles.headerTitle}>{code || "Subject"}</Text>
          <Text style={styles.headerSubtitle}>Questions Bank</Text>
        </View>

        <TouchableOpacity 
           style={styles.backBtn} 
           onPress={() => router.back()}
           activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      
      <View style={styles.body}>
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={55} color={PRIMARY_COLOR} />
        </View>

        <Text style={styles.sectionTitle}>Select Difficulty</Text>

        
        <View style={styles.cardsContainer}>
          <DifficultyButton level="easy" />
          <DifficultyButton level="medium" />
          <DifficultyButton level="hard" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F4F4",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#e0f2f1",
    marginTop: 2,
  },
  backBtn: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 15,
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  logoContainer: {
    backgroundColor: "#E0F2F1",
    padding: 22,
    borderRadius: 45,
    marginBottom: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2A3A48",
    marginBottom: 30,
  },
  cardsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  rectCard: {
    width: "85%", 
    paddingVertical: 20,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  cardText: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});