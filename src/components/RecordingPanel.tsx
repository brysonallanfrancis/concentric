import { StyleSheet, Text, View } from "react-native";
import { liveWindowSize, type LiveStats, type RecorderStatus } from "@/sensors/useMotionRecorder";
import { radius, spacing, type, useTheme } from "@/theme/theme";
import { LiveTraceChart } from "./LiveTraceChart";
import { PrimaryButton } from "./PrimaryButton";
import { StatTile } from "./StatTile";

type Props = {
  title: string;
  status: Exclude<RecorderStatus, "idle">;
  countdown: number;
  live: LiveStats;
  onStop: () => void;
};

export function RecordingPanel({ title, status, countdown, live, onStop }: Props) {
  const colors = useTheme();
  const counting = status === "countdown";

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: colors.surfaceRaised }]}>
        <View style={[styles.dot, { backgroundColor: counting ? colors.textSecondary : colors.danger }]} />
        <Text style={[type.footnote, { color: colors.text }]}>{counting ? "Get in position" : "Recording"} · {title}</Text>
      </View>

      <View style={styles.hero} accessible accessibilityLiveRegion="polite">
        <Text style={[type.sectionHeader, { color: colors.textSecondary }]}>{counting ? "Starting in" : "Elapsed"}</Text>
        <Text style={[type.largeNumber, styles.heroNumber, { color: colors.text }]}>
          {counting ? countdown : formatElapsed(live.elapsedSeconds)}
        </Text>
      </View>

      <View style={styles.tiles}>
        <StatTile label="Samples" value={`${live.sampleCount}`} />
        <StatTile label="Sample rate" value={live.sampleRateHz.toFixed(0)} unit="Hz" />
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
        <Text style={[type.footnote, { color: colors.textSecondary }]}>Vertical acceleration · last 3 s</Text>
        <LiveTraceChart
          values={live.recentVertical}
          capacity={liveWindowSize}
          range={8}
          accessibilityLabel="Live chart of vertical acceleration"
        />
      </View>

      <Text style={[type.footnote, styles.hint, { color: colors.textSecondary }]}>
        Do the set, then tap Stop. You&apos;ll label the reps next.
      </Text>
      <PrimaryButton title={counting ? "Cancel" : "Stop"} variant="dark" large onPress={onStop} />
    </View>
  );
}

function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  badge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.lg,
  },
  heroNumber: {
    fontSize: 96,
    lineHeight: 104,
  },
  tiles: {
    flexDirection: "row",
    gap: spacing.md,
  },
  chartCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    textAlign: "center",
  },
});
