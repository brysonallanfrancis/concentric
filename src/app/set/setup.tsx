import { router, Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Callout } from "@/components/Callout";
import { ListRow } from "@/components/ListRow";
import { MountIllustration } from "@/components/MountIllustration";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Section } from "@/components/Section";
import { SegmentedControl } from "@/components/SegmentedControl";
import { StepperRow } from "@/components/StepperRow";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { findExercise, formatGoalRange, goalRanges, mountInfo, needsSafetyPrompt } from "@/data/catalog";
import { completedReps } from "@/engine/failure";
import { recommendNextSet } from "@/engine/progression";
import { formatWeight } from "@/lib/format";
import { describeSet, lastSetFor } from "@/lib/sets";
import type { Exercise, Goal, MountType, Units } from "@/models/types";
import { spacing, type, useTheme } from "@/theme/theme";

const startingLoadLb: Record<Exercise["kind"], number> = { barbell: 135, bodyweight: 0, machine: 100 };

export default function SetupScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const exercise = findExercise(exerciseId);

  if (!exercise) {
    return (
      <View style={styles.missing}>
        <Text style={[type.headline, { color: colors.text }]}>Exercise not found</Text>
      </View>
    );
  }

  return <SetupForm key={exercise.id} exercise={exercise} goal={settings.goal} units={settings.units} />;
}

function SetupForm({ exercise, goal, units }: { exercise: Exercise; goal: Goal; units: Units }) {
  const { sets } = useHistory();
  const range = goalRanges[goal];
  const last = lastSetFor(sets, exercise.id);
  const suggestion = last
    ? recommendNextSet(exercise, range, last.loadLb, completedReps(last.reps).length, last.outcome)
    : null;

  const [mount, setMount] = useState<MountType>(exercise.defaultMount);
  const [loadLb, setLoadLb] = useState(suggestion?.nextLoadLb ?? startingLoadLb[exercise.kind]);

  const loadLabel = exercise.kind === "bodyweight" ? "Added weight" : "Weight";
  const loadFooter = last ? `Last time: ${describeSet(last, units)}. Suggested weight is filled in.` : undefined;

  function handleStart() {
    router.push({ pathname: "/set/live", params: { exerciseId: exercise.id, mount, loadLb: String(loadLb) } });
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: exercise.name }} />
      <Section title="Phone placement" padded>
        <MountIllustration mount={mount} />
        <PlacementText mount={mount} />
        {exercise.mounts.length > 1 && (
          <SegmentedControl<MountType>
            label="Phone placement"
            options={exercise.mounts.map((value) => ({ value, label: mountInfo[value].shortLabel }))}
            value={mount}
            onChange={setMount}
          />
        )}
      </Section>

      <Section title="This set" footer={loadFooter}>
        <StepperRow
          label={loadLabel}
          value={loadLb}
          step={exercise.loadStepLb}
          format={(value) => formatWeight(value, units)}
          onChange={setLoadLb}
          showSeparator
        />
        <ListRow title="Goal" value={`${range.title} · fail at ${formatGoalRange(range)}`} />
      </Section>

      {needsSafetyPrompt(exercise) && (
        <View style={styles.callout}>
          <Callout
            tone="warning"
            message={`Going to failure on ${exercise.name.toLowerCase()}: set the safety bars just below your bottom position, or have a spotter ready.`}
          />
        </View>
      )}

      <View style={styles.action}>
        <PrimaryButton title="Start Set" large onPress={handleStart} />
      </View>
    </ScrollView>
  );
}

function PlacementText({ mount }: { mount: MountType }) {
  const colors = useTheme();
  return <Text style={[type.subhead, { color: colors.text }]}>{mountInfo[mount].instructions}</Text>;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  callout: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  action: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
