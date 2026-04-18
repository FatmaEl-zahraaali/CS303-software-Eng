import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
          headerShown: false,
        tabBarActiveTintColor: "#FF4500",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color="#FF4500" />
          ),
        }}
      />
    </Tabs>
  );

}