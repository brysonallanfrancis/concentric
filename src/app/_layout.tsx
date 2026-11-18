import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { HistoryProvider } from "@/context/HistoryContext";
import { SettingsProvider, useSettings } from "@/context/SettingsContext";
import { useTheme } from "@/theme/theme";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <RootStack />
      </HistoryProvider>
    </SettingsProvider>
  );
}

function RootStack() {
  const scheme = useColorScheme();
  const colors = useTheme();
  const { settings } = useSettings();

  return (
    <ThemeProvider value={scheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerTintColor: colors.tint, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={!settings.onboarded}>
          <Stack.Screen name="onboarding" options={{ title: "Your Goal", headerLargeTitleEnabled: true }} />
        </Stack.Protected>
        <Stack.Protected guard={settings.onboarded}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="set" options={{ presentation: "modal", headerShown: false }} />
          <Stack.Screen name="goal" options={{ presentation: "modal", title: "Your Goal" }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
