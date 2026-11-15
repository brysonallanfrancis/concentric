import { StyleSheet, Text, View } from "react-native";
import { formatVelocity } from "@/lib/format";
import { type, useTheme } from "@/theme/theme";

type Props = {
  reps: number;
  lastVelocity: number | null;
};

export function RepCounter({ reps, lastVelocity }: Props) {
  const colors = useTheme();
  return (
    <View
      style={styles.container}
      accessible
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${reps} ${reps === 1 ? "rep" : "reps"}${lastVelocity !== null ? `, last rep ${formatVelocity(lastVelocity)} meters per second` : ""}`}
    >
      <Text style={[type.subheadStrong, styles.label, { color: colors.textSecondary }]}>REPS</Text>
      <Text style={[type.hero, { color: colors.text }]}>{reps}</Text>
      <Text style={[type.metric, styles.velocity, { color: colors.text }]}>
        {lastVelocity !== null ? formatVelocity(lastVelocity) : "—"}
        <Text style={[styles.unit, { color: colors.textSecondary }]}> m/s</Text>
      </Text>
      <Text style={[type.subhead, { color: colors.textSecondary }]}>last rep speed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  label: {
    letterSpacing: 1,
  },
  velocity: {
    marginTop: 4,
  },
  unit: {
    fontSize: 20,
    fontWeight: "500",
  },
});
