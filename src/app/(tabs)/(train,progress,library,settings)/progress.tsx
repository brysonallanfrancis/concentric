import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { OptionChips } from "@/components/OptionChips";
import { Section } from "@/components/Section";
import { SegmentedControl } from "@/components/SegmentedControl";
import { TrendChart, type TrendPoint } from "@/components/TrendChart";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { provisionalExercises } from "@/data/catalog";
import { linearFit } from "@/engine/profile";
import { formatDayDate, formatVelocity, formatWeight } from "@/lib/format";
import { describeSet, estimatedMaxFor, setsForExercise } from "@/lib/sets";
import type { Exercise, SetRecord } from "@/models/types";
import { radius, spacing, type, useTheme } from "@/theme/theme";

type TimeRange = "1M" | "3M" | "1Y";

const rangeDays: Record<TimeRange, number> = { "1M": 31, "3M": 92, "1Y": 366 };
const rangeLabel: Record<TimeRange, string> = { "1M": "the last month", "3M": "the last 3 months", "1Y": "the last year" };
const dayMs = 24 * 60 * 60 * 1000;
const recentSetLimit = 6;

export default function ProgressScreen() {
  const colors = useTheme();
  const { sets: history } = useHistory();
  const trackedExercises = provisionalExercises.filter((exercise) => setsForExercise(history, exercise.id).length > 0);

  if (trackedExercises.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[type.headline, { color: colors.text }]}>No sets yet</Text>
        <Text style={[type.subhead, styles.emptyText, { color: colors.textSecondary }]}>
          Finish a set and your estimated max, weights and reps will show up here.
        </Text>
      </View>
    );
  }

  return <ProgressDetails history={history} trackedExercises={trackedExercises} />;
}

function ProgressDetails({ history, trackedExercises }: { history: SetRecord[]; trackedExercises: Exercise[] }) {
  const colors = useTheme();
  const { settings } = useSettings();
  const [exerciseName, setExerciseName] = useState(trackedExercises[0].name);
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [now] = useState(() => Date.now());

  const exercise = trackedExercises.find((candidate) => candidate.name === exerciseName) ?? trackedExercises[0];
  const cutoff = now - rangeDays[timeRange] * dayMs;
  const sets = setsForExercise(history, exercise.id).filter((set) => Date.parse(set.performedAt) >= cutoff);

  const points: TrendPoint[] = sets.flatMap((set) => {
    const valueLb = estimatedMaxFor(set, settings.bodyweightLb);
    return valueLb === null ? [] : [{ time: Date.parse(set.performedAt), valueLb, verified: set.outcome === "verified" }];
  });
  const trend = linearFit(
    points.map((point) => point.time),
    points.map((point) => point.valueLb),
  );
  const newest = points[0];
  const oldest = points[points.length - 1];
  const currentMax = newest && trend ? trend.intercept + trend.slope * newest.time : newest?.valueLb;
  const change = trend && newest && oldest ? trend.slope * (newest.time - oldest.time) : null;

  const verified = sets.filter((set) => set.outcome === "verified").length;
  const speedSets = sets.filter((set) => set.loadLb === sets[0]?.loadLb && set.reps.length > 0);
  const firstRepNow = speedSets[0]?.reps[0]?.meanVelocity;
  const firstRepThen = speedSets.length > 1 ? speedSets[speedSets.length - 1].reps[0]?.meanVelocity : undefined;

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

      {currentMax !== undefined && (
        <View style={[styles.maxCard, { backgroundColor: colors.surface }]} accessible>
          <Text style={[type.footnote, { color: colors.textSecondary }]}>
            Estimated max (1RM){exercise.kind === "bodyweight" ? " · includes bodyweight" : ""}
          </Text>
          <Text style={[type.metric, { color: colors.text }]}>{formatWeight(currentMax, settings.units)}</Text>
          {change !== null && (
            <Text style={[type.subhead, { color: colors.textSecondary }]}>
              {change >= 0 ? "+" : "−"}
              {formatWeight(Math.abs(change), settings.units)} over {rangeLabel[timeRange]}
            </Text>
          )}
        </View>
      )}

      <Section
        title="Estimated max over time"
        footer="Each set's weight and reps to failure, turned into a one-rep max. Hollow dots didn't reach verified failure, so they're less certain."
        padded
      >
        {points.length > 0 ? (
          <TrendChart points={points} trend={trend} units={settings.units} />
        ) : (
          <Text style={[type.subhead, { color: colors.textSecondary }]}>No sets in this time range yet.</Text>
        )}
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: colors.chartLine }]} />
          <Text style={[type.footnote, { color: colors.textSecondary }]}>Verified failure</Text>
          <View style={[styles.legendDot, styles.legendHollow, { borderColor: colors.chartLine }]} />
          <Text style={[type.footnote, { color: colors.textSecondary }]}>Near or stopped short</Text>
        </View>
      </Section>

      {sets.length > 0 && (
        <Section title="Weight × reps">
          {sets.slice(0, recentSetLimit).map((set, index, shown) => (
            <ListRow
              key={set.id}
              title={describeSet(set, settings.units)}
              subtitle={formatDayDate(set.performedAt)}
              showSeparator={index < shown.length - 1}
            />
          ))}
        </Section>
      )}

      <Section title="Summary">
        {firstRepNow !== undefined && (
          <ListRow
            title={`First-rep speed at ${formatWeight(sets[0].loadLb, settings.units)}`}
            value={
              firstRepThen !== undefined
                ? `${formatVelocity(firstRepThen)} → ${formatVelocity(firstRepNow)} m/s`
                : `${formatVelocity(firstRepNow)} m/s`
            }
            showSeparator
          />
        )}
        <ListRow title="Verified failures" value={`${verified} of ${sets.length} sets`} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.xl,
  },
  emptyText: {
    textAlign: "center",
  },
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
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.xs,
  },
  legendHollow: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
  },
  maxCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: 2,
  },
});
