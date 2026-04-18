import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="(tabs)" />
      
      
      <Stack.Screen name="subject" />
      
    
      <Stack.Screen name="questionsbank" />
      
    
      <Stack.Screen name="attendance" />

   
      <Stack.Screen name="Login" />
    </Stack>
  );
}