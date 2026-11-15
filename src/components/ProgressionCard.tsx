import { StyleSheet, Text, View } from "react-native";
import type { Progression, ProgressionAction } from "@/engine/progression";
import { formatLoad, formatWeight } from "@/lib/format";
import type { ExerciseKind, GoalRange, Units } from "@/models/types";
import { radius, spacing, type, useTheme } from "@/theme/theme";
import { Icon, type IconName } from "./Icon";

type Props = {
  progression: Progression;
  kind: ExerciseKind;
  range: GoalRange;
  stepLb: number;
  units: Units;
};

const actionIcons: Record<ProgressionAction, IconName> = {
  increase: "arrowUp",
  decrease: "arrowDown",
  stay: "equal",
  pushHarder: "equal",
};

export function ProgressionCard({ progression, kind, range, stepLb, units }: Props) {
  const colors = useTheme();
  const weight = formatLoad(kind, progression.nextLoadLb, units);
  const { headline, detail } = describe(progression, range, weight, formatWeight(stepLb, units));

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]} accessible>
      <Text style={[type.sectionHeader, { color: colors.textSecondary }]}>Next time</Text>
      <View style={styles.row}>
        <Icon name={actionIcons[progression.action]} size={28} color={colors.tint} />
        <Text style={[type.title, styles.headline, { color: colors.text }]}>{headline}</Text>
      </View>
      <Text style={[type.subhead, { color: colors.textSecondary }]}>{detail}</Text>
    </View>
  );
}

function describe(progression: Progression, range: GoalRange, weight: string, step: string) {
  switch (progression.action) {
    case "increase":
      return {
        headline: `Go up to ${weight}`,
        detail: `You hit ${range.max} reps before failing. Add ${step} and aim for ${range.min}+.`,
      };
    case "decrease":
      return {
        headline: `Drop to ${weight}`,
        detail: `You failed before ${range.min} reps. A lighter weight keeps your failure inside your goal range.`,
      };
    case "pushHarder":
      return {
        headline: `Stay at ${weight}, go to failure`,
        detail: "You had reps left. Keep the weight and push until a rep stalls.",
      };
    case "stay":
      return {
        headline: `Stay at ${weight}, aim for ${progression.targetReps}+`,
        detail: `You failed mid-range. Reach ${range.max} reps before failure and we'll add ${step}.`,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  headline: {
    flex: 1,
  },
});
