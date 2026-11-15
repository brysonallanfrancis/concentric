import { StyleSheet, Text, View } from "react-native";
import { formatGoalRange } from "@/data/catalog";
import type { GoalRange } from "@/models/types";
import { spacing, type, useTheme } from "@/theme/theme";

type Props = {
  reps: number;
  range: GoalRange;
};

export function GoalRangeMeter({ reps, range }: Props) {
  const colors = useTheme();
  const scaleMax = Math.max(range.max + 3, reps);
  const percent = (value: number) => `${(Math.min(value, scaleMax) / scaleMax) * 100}%` as const;

  const message =
    reps < range.min
      ? `${range.min - reps} ${range.min - reps === 1 ? "rep" : "reps"} to your goal range`
      : reps <= range.max
        ? "In your goal range"
        : "Past your goal range";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[type.subheadStrong, { color: colors.text }]}>{message}</Text>
        <Text style={[type.subhead, { color: colors.textSecondary }]}>fail at {formatGoalRange(range)}</Text>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.surfaceRaised }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`Rep ${reps}. Goal range is ${range.min} to ${range.max} reps.`}
      >
        <View style={[styles.band, { left: percent(range.min), width: percent(range.max - range.min), backgroundColor: colors.tintSoft }]} />
        <View style={[styles.fill, { width: percent(reps), backgroundColor: colors.tint }]} />
      </View>
      <View style={styles.labels} importantForAccessibility="no-hide-descendants">
        <Text style={[type.caption, styles.label, { left: percent(range.min), color: colors.textSecondary }]}>{range.min}</Text>
        <Text style={[type.caption, styles.label, { left: percent(range.max), color: colors.textSecondary }]}>{range.max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  track: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  band: {
    position: "absolute",
    top: 0,
    bottom: 0,
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 6,
  },
  labels: {
    height: 16,
  },
  label: {
    position: "absolute",
    transform: [{ translateX: -6 }],
  },
});
