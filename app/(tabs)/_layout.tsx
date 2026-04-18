import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

<<<<<<< HEAD
export default function TabsLayout() {
=======
export default function Layout() {
>>>>>>> c1968d881bd70e524c450f8b8b3622d2313b5c86
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
<<<<<<< HEAD

=======
>>>>>>> c1968d881bd70e524c450f8b8b3622d2313b5c86
}