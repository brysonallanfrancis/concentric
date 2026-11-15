import { Stack } from "expo-router";
import { useTheme } from "@/theme/theme";

export const unstable_settings = {
  initialRouteName: "pick",
};

export default function SetFlowLayout() {
  const colors = useTheme();
  return (
    <Stack screenOptions={{ headerTintColor: colors.tint, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="pick" options={{ title: "Choose Exercise" }} />
      <Stack.Screen name="setup" options={{ title: "", headerBackTitle: "Exercises" }} />
      <Stack.Screen name="live" options={{ title: "", headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="summary" options={{ title: "Set Complete", headerBackVisible: false, gestureEnabled: false }} />
    </Stack>
  );
}
