import { StyleSheet, Text, View } from "react-native";
import { exerciseKinds, kindInfo } from "@/data/catalog";
import { lastSetFor } from "@/data/placeholderHistory";
import { describeSet } from "@/lib/sets";
import type { Exercise, Units } from "@/models/types";
import { spacing, type, useTheme } from "@/theme/theme";
import { ListRow } from "./ListRow";
import { Section } from "./Section";

type Props = {
  exercises: Exercise[];
  units: Units;
  onSelect: (exercise: Exercise) => void;
};

export function ExerciseList({ exercises, units, onSelect }: Props) {
  const colors = useTheme();
  const groups = exerciseKinds
    .map((kind) => ({ kind, items: exercises.filter((exercise) => exercise.kind === kind) }))
    .filter((group) => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[type.headline, { color: colors.text }]}>No matching exercises</Text>
        <Text style={[type.subhead, { color: colors.textSecondary }]}>Try a different name or filter.</Text>
      </View>
    );
  }

  return groups.map((group) => (
    <Section key={group.kind} title={kindInfo[group.kind].sectionTitle}>
      {group.items.map((exercise, index) => {
        const last = lastSetFor(exercise.id);
        return (
          <ListRow
            key={exercise.id}
            title={exercise.name}
            subtitle={last ? `Last: ${describeSet(last, units)}` : "Not tracked yet"}
            chevron
            onPress={() => onSelect(exercise)}
            showSeparator={index < group.items.length - 1}
          />
        );
      })}
    </Section>
  ));
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xxl,
  },
});
