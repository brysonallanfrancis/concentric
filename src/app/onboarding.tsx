import { ScrollView, StyleSheet, Text } from "react-native";
import { GoalForm } from "@/components/GoalForm";
import { useSettings } from "@/context/SettingsContext";
import { spacing, type, useTheme } from "@/theme/theme";

export default function OnboardingScreen() {
  const colors = useTheme();
  const { settings, updateSettings } = useSettings();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.background }}>
      <Text style={[type.subhead, styles.intro, { color: colors.textSecondary }]}>
        Every set goes to failure. Your goal decides the rep range you should fail in, and Concentric adjusts the weight to keep you there.
      </Text>
      <GoalForm
        initialValues={settings}
        submitTitle="Continue"
        onSubmit={(values) => updateSettings({ ...values, onboarded: true })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
});
