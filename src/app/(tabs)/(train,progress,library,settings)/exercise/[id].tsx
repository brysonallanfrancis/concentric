import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScatterChart } from "@/components/ScatterChart";
import { Section } from "@/components/Section";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { findExercise, formatGoalRange, goalRanges, kindInfo, mountInfo } from "@/data/catalog";
import { estimateOneRepMax, fitLine } from "@/engine/profile";
import { formatDayDate, formatVelocity } from "@/lib/format";
import { describeSet, fastestVelocity, setsForExercise } from "@/lib/sets";
import { spacing, type, useTheme } from "@/theme/theme";

const historyLimit = 8;

export default function ExerciseDetailScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const { sets } = useHistory();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = findExercise(id);

  if (!exercise) {
    return (
      <View style={styles.missing}>
        <Text style={[type.headline, { color: colors.text }]}>Exercise not found</Text>
      </View>
    );
  }

  const allSets = setsForExercise(sets, exercise.id);
  const history = allSets.slice(0, historyLimit);
  const points = allSets.map((set) => ({ loadLb: set.loadLb, velocity: fastestVelocity(set.reps) }));
  const fit = fitLine(points);
  const speedMax = estimateOneRepMax(fit, exercise.mvt);
  const range = goalRanges[settings.goal];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: exercise.name }} />
      <Section title="Setup">
        <ListRow title="Type" value={kindInfo[exercise.kind].title} showSeparator />
        <ListRow title="Phone placement" value={mountInfo[exercise.defaultMount].shortLabel} showSeparator />
        <ListRow title="Goal" value={`${range.title} · ${formatGoalRange(range)}`} showSeparator />
        <ListRow title="Failure speed" value={`${formatVelocity(exercise.mvt)} m/s`} />
      </Section>
      <Section title="Recent sets">
        {history.length === 0 ? (
          <Text style={[type.subhead, styles.empty, { color: colors.textSecondary }]}>
            No sets yet. Your first set will show up here.
          </Text>
        ) : (
          history.map((set, index) => (
            <ListRow
              key={set.id}
              title={describeSet(set, settings.units)}
              subtitle={formatDayDate(set.performedAt)}
              showSeparator={index < history.length - 1}
            />
          ))
        )}
      </Section>
      {fit !== null && (
        <Section
          title="Weight vs. speed"
          footer="Fastest rep of each set. Speed drops as the weight goes up; the dashed line runs to your failure speed."
          padded
        >
          <ScatterChart points={points} fit={fit} mvt={exercise.mvt} oneRepMaxLb={speedMax} units={settings.units} />
        </Section>
      )}
      <View style={styles.action}>
        <PrimaryButton
          title="Start a Set"
          onPress={() => router.push({ pathname: "/set/setup", params: { exerciseId: exercise.id } })}
        />
      </View>
    </ScrollView>
  );
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
  empty: {
    padding: spacing.lg,
  },
  action: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
});
