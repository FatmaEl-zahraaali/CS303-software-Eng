import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";


export default function Layout() {

  return (
    <Tabs
      screenOptions={{
          headerShown: false,
        tabBarActiveTintColor: "#135D56",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color="#135D56" />
          ),
        }}
      />
    </Tabs>
  );
}

