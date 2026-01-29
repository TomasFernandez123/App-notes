import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import {
  Stack,
  useRootNavigationState,
  useRouter,
  useSegments,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { NotesProvider } from "@/providers/NoteProvider";

SplashScreen.preventAutoHideAsync();

// Custom theme with app's background color to prevent color flash
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B0F14",
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0B0F14",
  },
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // DON'T hide splash here - let RootLayoutNav handle it after auth resolves
  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <NotesProvider>
        <RootLayoutNav />
      </NotesProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const router = useRouter();
  const segments = useSegments();
  const navState = useRootNavigationState();

  const { loading, user } = useAuth();

  useEffect(() => {
    // Don't do anything if navigation isn't ready or auth is still loading
    if (!navState?.key || loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      router.replace("/(app)");
    }

    // Hide splash screen ONLY after auth state is resolved and navigation is ready
    SplashScreen.hideAsync();
  }, [navState?.key, loading, user, segments]);

  // Keep splash screen visible while loading - return null instead of ActivityIndicator
  if (loading || !navState?.key) {
    return null;
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? customDarkTheme : customLightTheme}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0B0F14" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </ThemeProvider>
  );
}
