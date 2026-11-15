import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Section } from "@/components/Section";
import { useSettings } from "@/context/SettingsContext";
import { findExercise, formatGoalRange, goalRanges, kindInfo, mountInfo } from "@/data/catalog";
import { setsForExercise } from "@/data/placeholderHistory";
import { formatDayDate, formatVelocity } from "@/lib/format";
import { describeSet } from "@/lib/sets";
import { spacing, type, useTheme } from "@/theme/theme";

const historyLimit = 8;

export default function ExerciseDetailScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = findExercise(id);

  if (!exercise) {
    return (
      <View style={styles.missing}>
        <Text style={[type.headline, { color: colors.text }]}>Exercise not found</Text>
      </View>
    );
  }

  const history = setsForExercise(exercise.id).slice(0, historyLimit);
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
