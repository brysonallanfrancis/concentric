import { Link, router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Section } from "@/components/Section";
import { Tag } from "@/components/Tag";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { findExercise, formatGoalRange, goalRanges, kindInfo, starterPlanIds } from "@/data/catalog";
import { formatLongDate } from "@/lib/format";
import { describeSession, groupSessions } from "@/lib/sets";
import { radius, spacing, type, useTheme } from "@/theme/theme";

export default function TrainScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const { sets } = useHistory();
  const range = goalRanges[settings.goal];
  const sessions = groupSessions(sets);
  const recent = sessions.slice(0, 3);
  const lastWorkoutIds = [...new Set([...(sessions[0]?.sets ?? [])].reverse().map((set) => set.exerciseId))];
  const plan = (lastWorkoutIds.length > 0 ? lastWorkoutIds : starterPlanIds).flatMap((id) => findExercise(id) ?? []);
  const lastExerciseId = lastWorkoutIds[0];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.subtitle}>
        <Text style={[type.subhead, { color: colors.textSecondary }]}>{formatLongDate(new Date())} ·</Text>
        <Link href="/goal" style={[type.subheadStrong, styles.goalLink, { color: colors.tint }]} accessibilityHint="Change your training goal">
          {range.title}
        </Link>
      </View>

      <View style={[styles.startCard, { backgroundColor: colors.surface }]}>
        <View style={styles.startText}>
          <Text style={[type.headline, { color: colors.text }]}>Start training</Text>
          <Text style={[type.subhead, { color: colors.textSecondary }]}>
            One all-out set per exercise. Your phone tells you if it was real failure.
          </Text>
        </View>
        <PrimaryButton title="Start a Set" onPress={() => router.push("/set/pick")} />
        {lastExerciseId && (
          <PrimaryButton
            title="Repeat Last Workout"
            variant="tinted"
            onPress={() => router.push({ pathname: "/set/setup", params: { exerciseId: lastExerciseId } })}
          />
        )}
      </View>

      <Section title="Today's plan">
        {plan.map((exercise, index) => (
          <ListRow
            key={exercise.id}
            title={exercise.name}
            subtitle={`1 set to failure · ${formatGoalRange(range)} reps`}
            accessory={<Tag label={kindInfo[exercise.kind].badge} />}
            chevron
            onPress={() => router.push({ pathname: "/set/setup", params: { exerciseId: exercise.id } })}
            showSeparator={index < plan.length - 1}
          />
        ))}
      </Section>

      <Section title="Recent">
        {recent.length === 0 ? (
          <Text style={[type.subhead, styles.empty, { color: colors.textSecondary }]}>
            No workouts yet. Your sets will show up here.
          </Text>
        ) : (
          recent.map((session, index) => (
            <ListRow
              key={session.id}
              title={session.name}
              subtitle={describeSession(session)}
              chevron
              onPress={() => router.push({ pathname: "/workout/[day]", params: { day: session.id } })}
              showSeparator={index < recent.length - 1}
            />
          ))
        )}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: spacing.lg,
  },
  goalLink: {
    paddingVertical: 10,
  },
  startCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  empty: {
    padding: spacing.lg,
  },
  startText: {
    gap: 2,
  },
});
