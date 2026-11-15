import { StyleSheet, Text, View } from "react-native";
import { radius, spacing, type, useTheme } from "@/theme/theme";

type Props = {
  label: string;
  value: string;
  unit?: string;
};

export function StatTile({ label, value, unit }: Props) {
  const colors = useTheme();
  return (
    <View
      style={[styles.tile, { backgroundColor: colors.surface }]}
      accessible
      accessibilityLabel={`${label}: ${value}${unit ? ` ${unit}` : ""}`}
    >
      <Text style={[type.footnote, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
        {unit && <Text style={[type.subhead, { color: colors.textSecondary }]}> {unit}</Text>}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
