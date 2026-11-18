import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { Section } from "@/components/Section";
import { SegmentedControl } from "@/components/SegmentedControl";
import { StepperRow } from "@/components/StepperRow";
import { ToggleRow } from "@/components/ToggleRow";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { formatGoalRange, goalRanges } from "@/data/catalog";
import { buildSampleSets } from "@/data/sampleHistory";
import { formatWeight, plural } from "@/lib/format";
import type { Units } from "@/models/types";
import { spacing } from "@/theme/theme";

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const { sets, addSets, clearHistory } = useHistory();
  const range = goalRanges[settings.goal];

  function loadSampleHistory() {
    const sample = buildSampleSets();
    addSets(sample);
    Alert.alert("Sample history added", `Added ${plural(sample.length, "set")} from the last 3 months.`);
  }

  function confirmClearHistory() {
    Alert.alert("Clear all history?", "Every saved set will be deleted. This can't be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear History", style: "destructive", onPress: clearHistory },
    ]);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Section title="Training">
        <ListRow
          title="Goal"
          value={`${range.title} · ${formatGoalRange(range)}`}
          chevron
          onPress={() => router.push("/goal")}
          showSeparator
        />
        <ToggleRow
          label="One all-out set per exercise"
          value={settings.oneSetPerExercise}
          onChange={(oneSetPerExercise) => updateSettings({ oneSetPerExercise })}
          showSeparator
        />
        <ToggleRow
          label="Track negatives (tempo)"
          value={settings.trackNegatives}
          onChange={(trackNegatives) => updateSettings({ trackNegatives })}
        />
      </Section>

      <Section title="Units" padded footer="Bodyweight is added to the load for pull-ups, push-ups and dips.">
        <SegmentedControl<Units>
          label="Units"
          options={[
            { value: "lb", label: "Pounds (lb)" },
            { value: "kg", label: "Kilograms (kg)" },
          ]}
          value={settings.units}
          onChange={(units) => updateSettings({ units })}
        />
      </Section>
      <Section>
        <StepperRow
          label="Bodyweight"
          value={settings.bodyweightLb}
          step={1}
          min={50}
          format={(value) => formatWeight(value, settings.units)}
          onChange={(bodyweightLb) => updateSettings({ bodyweightLb })}
        />
      </Section>

      <Section title="Feedback" footer="A tap on every rep and a stronger buzz when a rep fails, so you never need to look at the screen mid-set.">
        <ToggleRow label="Haptics" value={settings.haptics} onChange={(haptics) => updateSettings({ haptics })} />
      </Section>

      <Section
        title="Demo"
        footer="Demo mode replays recorded sets through the live screen, and sample history fills Progress with 3 months of sets, so you can try Concentric without lifting."
      >
        <ToggleRow label="Demo mode" value={settings.demoMode} onChange={(demoMode) => updateSettings({ demoMode })} showSeparator />
        <ListRow title="Load Sample History" chevron onPress={loadSampleHistory} />
      </Section>

      <Section title="History">
        <ListRow title="Saved sets" value={`${sets.length}`} showSeparator />
        <ListRow title="Clear History" onPress={confirmClearHistory} />
      </Section>

      <Section title="Developer" footer="Records raw motion data from a set for tuning rep detection.">
        <ListRow title="Record Trace" chevron onPress={() => router.push("/record")} />
      </Section>

      <View style={styles.version}>
        <ListRow title="Version" value={Constants.expoConfig?.version ?? "1.0.0"} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  version: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    borderRadius: 10,
    overflow: "hidden",
  },
});
