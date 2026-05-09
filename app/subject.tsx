import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";

const { width, height } = Dimensions.get('window');

export default function Subject() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { width: windowWidth } = useWindowDimensions();

  const PRIMARY_COLOR = "#135D56";
  const LIGHT_BG = "#E0F2F1";
  const GRADIENT_START = "#135D56";
  const GRADIENT_END = "#1B7A6E";

  const isMobile = windowWidth < 600;
  const isTablet = windowWidth >= 600 && windowWidth < 1024;

  const CARD_SIZE = isMobile
    ? windowWidth * 0.8
    : isTablet
    ? windowWidth * 0.35
    : windowWidth * 0.22;

  const [backActive, setBackActive] = useState(false);

  const Card = ({ title, icon, onPress, isNew = false, color = PRIMARY_COLOR }: any) => {
    const [active, setActive] = useState(false);

    return (
      <Pressable
        onPress={onPress}
        onHoverIn={() => Platform.OS === "web" && setActive(true)}
        onHoverOut={() => Platform.OS === "web" && setActive(false)}
        onPressIn={() => setActive(true)}
        onPressOut={() => setActive(false)}
        style={[
          styles.card,
          { width: CARD_SIZE },
          active && styles.cardActive,
        ]}
      >
        <LinearGradient
          colors={active ? [PRIMARY_COLOR, GRADIENT_END] : ['#fff', '#fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.cardGradient, active && styles.cardActive]}
        >
          <View
            style={[
              styles.iconBox,
              { backgroundColor: active ? "rgba(255,255,255,0.2)" : LIGHT_BG },
            ]}
          >
            <Ionicons
              name={icon}
              size={32}
              color={active ? "#fff" : color}
            />
          </View>

          <Text style={[styles.cardText, { color: active ? "#fff" : "#2A3A48" }]}>
            {title}
          </Text>

          {isNew && !active && (
            <View style={styles.newBadge}>
              <LinearGradient
                colors={[PRIMARY_COLOR, GRADIENT_END]}
                style={styles.newBadgeGradient}
              >
                <Text style={styles.newBadgeText}>NEW</Text>
              </LinearGradient>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />

      <LinearGradient
        colors={[GRADIENT_START, GRADIENT_END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>{code}</Text>

        <Pressable
          onPress={() => router.back()}
          onHoverIn={() => Platform.OS === "web" && setBackActive(true)}
          onHoverOut={() => Platform.OS === "web" && setBackActive(false)}
          onPressIn={() => setBackActive(true)}
          onPressOut={() => setBackActive(false)}
          style={[
            styles.backBtn,
            backActive && {
              backgroundColor: "#fff",
              transform: [{ scale: 1.1 }],
            },
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={backActive ? PRIMARY_COLOR : "#fff"}
          />
        </Pressable>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.body}>
          <LinearGradient
            colors={[LIGHT_BG, '#fff']}
            style={styles.logo}
          >
            <Ionicons name="school" size={55} color={PRIMARY_COLOR} />
          </LinearGradient>

          <Text style={styles.title}>Choose Option</Text>
          <Text style={styles.subtitle}>Select what you want to do</Text>

          <View style={styles.grid}>
            <Card
              title="Attendance"
              icon="checkmark-done-circle"
              onPress={() =>
                router.push({ pathname: "/attendance", params: { code } })
              }
              color={PRIMARY_COLOR}
            />

            <Card
              title="Questions"
              icon="help-circle"
              onPress={() =>
                router.push({ pathname: "/questionsbank", params: { code } })
              }
              color={PRIMARY_COLOR}
            />

            <Card
              title="AI Assistant"
              icon="chatbubbles"
              onPress={() =>
                router.push({ pathname: "/screens/AI/ai-assistant", params: { code } })
              }
              isNew={true}
              color={PRIMARY_COLOR}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const PRIMARY_COLOR = "#135D56";
const LIGHT_BG = "#E0F2F1";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingHorizontal: 24,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  body: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 24,
  },
  logo: {
    backgroundColor: LIGHT_BG,
    padding: 24,
    borderRadius: 60,
    marginBottom: 20,
    elevation: 4,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    maxWidth: 1000,
  },
  card: {
    borderRadius: 28,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    height: 190,
    minWidth: 220,
    maxWidth: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardActive: {
    transform: [{ scale: 1.02 }],
    elevation: 10,
  },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  newBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 20,
    overflow: "hidden",
  },
  newBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
});
