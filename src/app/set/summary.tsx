import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OutcomeHero } from "@/components/OutcomeHero";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ProgressionCard } from "@/components/ProgressionCard";
import { RepBarChart } from "@/components/RepBarChart";
import { StatTile } from "@/components/StatTile";
import { Tag } from "@/components/Tag";
import { TextFieldRow } from "@/components/TextFieldRow";
import { useSettings } from "@/context/SettingsContext";
import { findExercise, formatGoalRange, goalRanges, provisionalExercises } from "@/data/catalog";
import { classifySet } from "@/engine/failure";
import { recommendNextSet } from "@/engine/progression";
import { formatLoad, formatVelocity, plural } from "@/lib/format";
import { averageEccentric, averageVelocity } from "@/lib/sets";
import type { RepResult } from "@/models/types";
import { radius, spacing, type, useTheme } from "@/theme/theme";

export default function SummaryScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ exerciseId: string; loadLb: string; reps: string }>();
  const exercise = findExercise(params.exerciseId) ?? provisionalExercises[0];
  const loadLb = Number(params.loadLb ?? 0);
  const range = goalRanges[settings.goal];
  const reps = parseReps(params.reps);
  const [note, setNote] = useState("");

  const classification = classifySet(reps, exercise.mvt);
  const completed = classification.completedReps;
  const failedIndex = reps.findIndex((rep) => rep.failed);
  const inRange = completed >= range.min && completed <= range.max;
  const lastCompleted = reps.filter((rep) => !rep.failed).at(-1);
  const negatives = averageEccentric(reps);
  const progression = recommendNextSet(exercise, range, loadLb, completed, classification.outcome);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.dismissTo("/")} accessibilityRole="button" hitSlop={12}>
              <Text style={[type.headline, { color: colors.tint }]}>Done</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardDismissMode="interactive" contentContainerStyle={styles.content}>
        <OutcomeHero
          outcome={classification.outcome}
          failedRepNumber={failedIndex >= 0 ? failedIndex + 1 : null}
          repsLeftEstimate={classification.repsLeftEstimate}
        />

        <View style={styles.resultRow}>
          <Text style={[type.title, { color: colors.text }]}>
            {plural(completed, "rep")} · {formatLoad(exercise.kind, loadLb, settings.units)}
          </Text>
          <Tag label={inRange ? `In goal range ${formatGoalRange(range)}` : `Goal range ${formatGoalRange(range)}`} />
        </View>

        <View style={styles.tiles}>
          <StatTile label="Avg speed" value={formatVelocity(averageVelocity(reps))} unit="m/s" />
          <StatTile label="Last rep" value={lastCompleted ? formatVelocity(lastCompleted.meanVelocity) : "—"} unit="m/s" />
          {settings.trackNegatives && <StatTile label="Negatives" value={negatives ? negatives.toFixed(1) : "—"} unit="s avg" />}
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
          <RepBarChart reps={reps} mvt={exercise.mvt} />
        </View>

        <ProgressionCard progression={progression} kind={exercise.kind} range={range} stepLb={exercise.loadStepLb} units={settings.units} />

        <View style={[styles.noteCard, { backgroundColor: colors.surface }]}>
          <TextFieldRow placeholder="Add a note about this set" value={note} onChange={setNote} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton title="Next Exercise" large onPress={() => router.dismissTo("/set/pick")} />
      </View>
    </View>
  );
}

function parseReps(value: string | undefined): RepResult[] {
  if (!value) return [];
  try {
    return JSON.parse(value) as RepResult[];
  } catch {
    return [];
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  resultRow: {
    gap: spacing.sm,
    alignItems: "flex-start",
  },
  tiles: {
    flexDirection: "row",
    gap: spacing.md,
  },
  chartCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  noteCard: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
});
