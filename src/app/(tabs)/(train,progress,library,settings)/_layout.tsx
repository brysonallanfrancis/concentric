import { Stack } from "expo-router";
import { useTheme } from "@/theme/theme";

export const unstable_settings = {
  anchor: "index",
  progress: { anchor: "progress" },
  library: { anchor: "library" },
  settings: { anchor: "settings" },
};

export default function TabStackLayout() {
  const colors = useTheme();
  return (
    <Stack screenOptions={{ headerTintColor: colors.tint, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ title: "Train", headerLargeTitleEnabled: true }} />
      <Stack.Screen name="progress" options={{ title: "Progress", headerLargeTitleEnabled: true }} />
      <Stack.Screen name="library" options={{ title: "Library", headerLargeTitleEnabled: true }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerLargeTitleEnabled: true }} />
      <Stack.Screen name="exercise/[id]" options={{ title: "" }} />
      <Stack.Screen name="workout/[day]" options={{ title: "Workout" }} />
      <Stack.Screen name="record" options={{ title: "Record Trace" }} />
    </Stack>
  );
}
