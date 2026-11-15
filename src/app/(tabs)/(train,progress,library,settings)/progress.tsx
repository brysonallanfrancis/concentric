import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { OptionChips } from "@/components/OptionChips";
import { ScatterChart } from "@/components/ScatterChart";
import { Section } from "@/components/Section";
import { SegmentedControl } from "@/components/SegmentedControl";
import { useSettings } from "@/context/SettingsContext";
import { provisionalExercises } from "@/data/catalog";
import { setsForExercise } from "@/data/placeholderHistory";
import { estimateOneRepMax, fitLine, type LoadVelocityPoint } from "@/engine/profile";
import { formatVelocity, formatWeight } from "@/lib/format";
import { fastestVelocity } from "@/lib/sets";
import type { SetRecord } from "@/models/types";
import { radius, spacing, type, useTheme } from "@/theme/theme";

type TimeRange = "1M" | "3M" | "1Y";

const rangeDays: Record<TimeRange, number> = { "1M": 31, "3M": 92, "1Y": 366 };
const dayMs = 24 * 60 * 60 * 1000;

const trackedExercises = provisionalExercises.filter((exercise) => setsForExercise(exercise.id).length > 0);

export default function ProgressScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const [exerciseName, setExerciseName] = useState(trackedExercises[0].name);
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [now] = useState(() => Date.now());

  const exercise = trackedExercises.find((candidate) => candidate.name === exerciseName) ?? trackedExercises[0];
  const allSets = setsForExercise(exercise.id);
  const cutoff = now - rangeDays[timeRange] * dayMs;
  const sets = allSets.filter((set) => Date.parse(set.performedAt) >= cutoff);
  const earlierSets = allSets.filter((set) => {
    const time = Date.parse(set.performedAt);
    return time < cutoff && time >= cutoff - rangeDays[timeRange] * dayMs;
  });

  const points = toPoints(sets);
  const fit = fitLine(points);
  const oneRepMax = estimateOneRepMax(fit, exercise.mvt);
  const earlierMax = estimateOneRepMax(fitLine(toPoints(earlierSets)), exercise.mvt);
  const change = oneRepMax !== null && earlierMax !== null ? oneRepMax - earlierMax : null;

  const verified = sets.filter((set) => set.outcome === "verified").length;
  const commonLoad = mostCommonLoad(sets);
  const fastestAtCommon = Math.max(0, ...sets.filter((set) => set.loadLb === commonLoad).map((set) => fastestVelocity(set.reps)));

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.chips}>
        <OptionChips
          label="Exercise"
          options={trackedExercises.map((candidate) => candidate.name)}
          value={exercise.name}
          onChange={setExerciseName}
          scrolls
        />
      </View>
      <View style={styles.controls}>
        <SegmentedControl
          label="Time range"
          options={[
            { value: "1M", label: "1M" },
            { value: "3M", label: "3M" },
            { value: "1Y", label: "1Y" },
          ]}
          value={timeRange}
          onChange={setTimeRange}
        />
      </View>

      <Section title="Weight vs. speed" footer="Fastest rep of each set. The dashed line runs to your failure speed to estimate your max." padded>
        {points.length > 0 ? (
          <ScatterChart points={points} fit={fit} mvt={exercise.mvt} oneRepMaxLb={oneRepMax} units={settings.units} />
        ) : (
          <Text style={[type.subhead, { color: colors.textSecondary }]}>No sets in this time range yet.</Text>
        )}
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: colors.chartLine }]} />
          <Text style={[type.footnote, { color: colors.textSecondary }]}>Set</Text>
          <View style={[styles.legendDot, { backgroundColor: colors.failureLine }]} />
          <Text style={[type.footnote, { color: colors.textSecondary }]}>Failure speed {formatVelocity(exercise.mvt)} m/s</Text>
        </View>
      </Section>

      {oneRepMax !== null && (
        <View style={[styles.maxCard, { backgroundColor: colors.surface }]} accessible>
          <Text style={[type.footnote, { color: colors.textSecondary }]}>Estimated max (1RM)</Text>
          <Text style={[type.metric, { color: colors.text }]}>{formatWeight(oneRepMax, settings.units)}</Text>
          {change !== null && (
            <Text style={[type.subhead, { color: colors.textSecondary }]}>
              {change >= 0 ? "+" : "−"}
              {formatWeight(Math.abs(change), settings.units)} vs. the {timeRange === "1M" ? "month" : "period"} before
            </Text>
          )}
        </View>
      )}

      <Section title="Bests">
        {commonLoad !== null && (
          <ListRow
            title={`Fastest at ${formatWeight(commonLoad, settings.units)}`}
            value={`${formatVelocity(fastestAtCommon)} m/s`}
            showSeparator
          />
        )}
        <ListRow title="Verified failures" value={`${verified} of ${sets.length} sets`} showSeparator />
        <ListRow title="Sets tracked" value={`${sets.length}`} />
      </Section>
    </ScrollView>
  );
}

function toPoints(sets: SetRecord[]): LoadVelocityPoint[] {
  return sets.map((set) => ({ loadLb: set.loadLb, velocity: fastestVelocity(set.reps) }));
}

function mostCommonLoad(sets: SetRecord[]): number | null {
  const counts = new Map<number, number>();
  for (const set of sets) counts.set(set.loadLb, (counts.get(set.loadLb) ?? 0) + 1);
  let best: number | null = null;
  for (const [load, count] of counts) {
    if (best === null || count > (counts.get(best) ?? 0)) best = load;
  }
  return best;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  chips: {
    marginTop: spacing.sm,
  },
  controls: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  maxCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: 2,
  },
});
