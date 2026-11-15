import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { radius, spacing, type, useTheme } from "@/theme/theme";

export function CalibrationCard() {
  const colors = useTheme();
  const palette = colors.tones.info;
  return (
    <View style={[styles.card, { backgroundColor: palette.background }]} accessible accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={palette.icon} />
      <View style={styles.text}>
        <Text style={[type.headline, { color: palette.title }]}>Hold still — calibrating</Text>
        <Text style={[type.subhead, { color: palette.text }]}>Finding gravity. Don&apos;t move for 2 seconds.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
