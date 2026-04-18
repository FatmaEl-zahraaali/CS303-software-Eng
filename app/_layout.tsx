<<<<<<< HEAD
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
=======
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';



SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack
       screenOptions={{
        headerShown: false,
      }}
      >
        <Stack.Screen name="screens/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
>>>>>>> c1968d881bd70e524c450f8b8b3622d2313b5c86
  );
}