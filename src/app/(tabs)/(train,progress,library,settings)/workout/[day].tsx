import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RepBarChart } from "@/components/RepBarChart";
import { Section } from "@/components/Section";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { findExercise } from "@/data/catalog";
import { formatDayDate, formatVelocity } from "@/lib/format";
import { averageEccentric, averageVelocity, dayKey, describeSet } from "@/lib/sets";
import { spacing, type, useTheme } from "@/theme/theme";

export default function WorkoutScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const { sets } = useHistory();
  const { day } = useLocalSearchParams<{ day: string }>();
  const workout = sets.filter((set) => dayKey(set.performedAt) === day).reverse();

  if (workout.length === 0) {
    return (
      <View style={styles.missing}>
        <Text style={[type.headline, { color: colors.text }]}>Workout not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: formatDayDate(workout[0].performedAt) }} />
      {workout.map((set) => {
        const exercise = findExercise(set.exerciseId);
        const negatives = averageEccentric(set.reps);
        return (
          <Section key={set.id} title={exercise?.name ?? "Exercise"} padded>
            <View style={styles.setText}>
              <Text style={[type.headline, { color: colors.text }]}>{describeSet(set, settings.units)}</Text>
              <Text style={[type.subhead, { color: colors.textSecondary }]}>
                Avg {formatVelocity(averageVelocity(set.reps))} m/s
                {negatives !== null ? ` · Negatives ${negatives.toFixed(1)} s` : ""}
              </Text>
            </View>
            <RepBarChart reps={set.reps} mvt={exercise?.mvt ?? 0} height={110} />
            {set.note !== "" && <Text style={[type.subhead, styles.note, { color: colors.text }]}>{set.note}</Text>}
          </Section>
        );
      })}
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
  setText: {
    gap: 2,
    marginBottom: spacing.md,
  },
  note: {
    marginTop: spacing.md,
  },
});
