import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function Subject() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { width } = useWindowDimensions();
  const PRIMARY_COLOR = "#135D56";
  const LIGHT_BG = "#E0F2F1";
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;

  const CARD_SIZE = isMobile
    ? width * 0.75
    : isTablet
      ? width * 0.35
      : width * 0.22;

  const [backActive, setBackActive] = useState(false);

  const Card = ({ title, icon, onPress, isNew = false }: any) => {
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
        <View
          style={[
            styles.iconBox,
            { backgroundColor: active ? "#ffffff30" : LIGHT_BG },
          ]}
        >
          <Ionicons
            name={icon}
            size={30}
            color={active ? "#fff" : PRIMARY_COLOR}
          />
        </View>

        <Text style={[styles.cardText, active && { color: "#fff" }]}>
          {title}
        </Text>
        {isNew && !active && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={PRIMARY_COLOR} barStyle="light-content" />


      <View style={styles.header}>       
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
              backgroundColor: PRIMARY_COLOR,
              transform: [{ scale: 1.1 }],
            },
          ]}>
          <Ionicons
            name="arrow-back"
            size={22}
            color={backActive ? "#fff" : PRIMARY_COLOR}
          />
        </Pressable>
      </View>

     <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
      <View style={styles.body}>
        <View style={styles.logo}>
          <Ionicons name="swap-horizontal-outline" size={55} color={PRIMARY_COLOR} />
        </View>

        <Text style={styles.title}>Options</Text>

        <View style={styles.grid}>
          <Card
            title="Attendance"
            icon="checkmark-done"
            onPress={() =>
              router.push({ pathname: "/attendance", params: { code } })
            }/>
          <Card
            title="Questions"
            icon="help-circle"
            onPress={() =>
              router.push({ pathname: "/chapters", params: { code } })
            }
          />
          <Card
              title="AI Assistant"
              icon="chatbubbles"
              onPress={() =>
                router.push({ pathname: "/screens/AI/ai-assistant", params: { code } })
              }
              isNew={true}
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
    borderRadius: 12,
  },
  body: {
    flex: 1,
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  logo: {
    backgroundColor: LIGHT_BG,
    padding: 20,
    borderRadius: 40,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    maxWidth: 1000,
  },
  card: {
    height: 180,
    minWidth: 220,
    maxWidth: 300,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  cardActive: {
    backgroundColor: PRIMARY_COLOR,
    transform: [{ scale: 1.06 }],
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2A3A48",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  newBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#135D56",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
});