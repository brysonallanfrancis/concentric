import { StyleSheet, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme/theme";

type Props = {
  label: string;
};

export function StatusPill({ label }: Props) {
  const colors = useTheme();
  const palette = colors.tones.info;
  return (
    <View style={[styles.pill, { backgroundColor: palette.background }]}>
      <View style={[styles.dot, { backgroundColor: palette.icon }]} />
      <Text style={[type.footnote, { color: palette.title, fontWeight: "500" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
