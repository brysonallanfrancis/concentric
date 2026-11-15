import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { goalRanges, goals } from "@/data/catalog";
import type { Settings } from "@/models/types";
import { spacing } from "@/theme/theme";
import { PrimaryButton } from "./PrimaryButton";
import { RadioCard } from "./RadioCard";
import { Section } from "./Section";
import { ToggleRow } from "./ToggleRow";

export type GoalFormValues = Pick<Settings, "goal" | "oneSetPerExercise" | "trackNegatives">;

type Props = {
  initialValues: GoalFormValues;
  submitTitle: string;
  onSubmit: (values: GoalFormValues) => void;
};

export function GoalForm({ initialValues, submitTitle, onSubmit }: Props) {
  const [values, setValues] = useState(initialValues);

  return (
    <View style={styles.container}>
      <View style={styles.cards} accessibilityRole="radiogroup" accessibilityLabel="Training goal">
        {goals.map((goal) => (
          <RadioCard
            key={goal}
            title={goalRanges[goal].title}
            description={goalRanges[goal].description}
            selected={values.goal === goal}
            onPress={() => setValues({ ...values, goal })}
          />
        ))}
      </View>
      <Section title="Training style" footer="You can change your goal for a single exercise later.">
        <ToggleRow
          label="One all-out set per exercise"
          value={values.oneSetPerExercise}
          onChange={(oneSetPerExercise) => setValues({ ...values, oneSetPerExercise })}
          showSeparator
        />
        <ToggleRow
          label="Track negatives (tempo)"
          value={values.trackNegatives}
          onChange={(trackNegatives) => setValues({ ...values, trackNegatives })}
        />
      </Section>
      <View style={styles.footer}>
        <PrimaryButton title={submitTitle} onPress={() => onSubmit(values)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
  cards: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  footer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
});
