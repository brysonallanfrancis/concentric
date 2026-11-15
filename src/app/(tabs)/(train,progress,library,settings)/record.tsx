import { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { ListRow } from "@/components/ListRow";
import { OptionChips } from "@/components/OptionChips";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RecordingPanel } from "@/components/RecordingPanel";
import { Section } from "@/components/Section";
import { StepperRow } from "@/components/StepperRow";
import { TextFieldRow } from "@/components/TextFieldRow";
import { ToggleRow } from "@/components/ToggleRow";
import { exercises, mounts, type MotionSample, type TraceLabel, type TraceSetup } from "@/sensors/trace";
import { deleteTrace, listTraces, saveTrace, shareTrace, type SavedTrace } from "@/sensors/traceFiles";
import { requestedIntervalMs, useMotionRecorder } from "@/sensors/useMotionRecorder";
import { spacing, type, useTheme } from "@/theme/theme";

const emptyLabel: TraceLabel = { actualReps: 0, reachedFailure: false, note: "" };

export default function RecordScreen() {
  const colors = useTheme();
  const recorder = useMotionRecorder();
  const [setup, setSetup] = useState<TraceSetup>({ exercise: "Squat", mount: "Forearm", loadLb: 135 });
  const [pending, setPending] = useState<{ samples: MotionSample[]; recordedAt: string } | null>(null);
  const [label, setLabel] = useState<TraceLabel>(emptyLabel);
  const [traces, setTraces] = useState<SavedTrace[]>(() => listTraces());

  const title = `${setup.exercise} · ${setup.loadLb} lb · ${setup.mount}`;

  async function handleStart() {
    const error = await recorder.start();
    if (error) Alert.alert("Can't record", error);
  }

  function handleStop() {
    const wasRecording = recorder.status === "recording";
    const samples = recorder.stop();
    if (!wasRecording || samples.length === 0) return;
    setLabel(emptyLabel);
    setPending({ samples, recordedAt: new Date().toISOString() });
  }

  function handleSave() {
    if (!pending) return;
    try {
      saveTrace({
        version: 1,
        recordedAt: pending.recordedAt,
        platform: Platform.OS,
        requestedIntervalMs,
        setup,
        label,
        samples: pending.samples,
      });
      setTraces(listTraces());
      setPending(null);
    } catch (error) {
      Alert.alert("Couldn't save the trace", String(error));
    }
  }

  function handleDiscard() {
    Alert.alert("Discard this recording?", "The sensor data from this set will be lost.", [
      { text: "Keep", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => setPending(null) },
    ]);
  }

  function handleDelete(trace: SavedTrace) {
    Alert.alert("Delete trace?", trace.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteTrace(trace);
          setTraces(listTraces());
        },
      },
    ]);
  }

  if (recorder.status !== "idle") {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ backgroundColor: colors.background }}>
        <RecordingPanel
          title={title}
          status={recorder.status}
          countdown={recorder.countdown}
          live={recorder.live}
          onStop={handleStop}
        />
      </ScrollView>
    );
  }

  if (pending) {
    const durationSeconds = pending.samples[pending.samples.length - 1].t;
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="interactive"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <Section
          title="Label this set"
          footer={`${title} · ${pending.samples.length} samples over ${durationSeconds.toFixed(1)} s`}
        >
          <StepperRow
            label="Completed reps"
            value={label.actualReps}
            step={1}
            onChange={(actualReps) => setLabel({ ...label, actualReps })}
            showSeparator
          />
          <ToggleRow
            label="Ended with a failed rep"
            value={label.reachedFailure}
            onChange={(reachedFailure) => setLabel({ ...label, reachedFailure })}
          />
        </Section>
        <Section title="Notes" footer="For example: paused at the bottom of rep 3, spotter helped on the last rep.">
          <TextFieldRow placeholder="Anything unusual" value={label.note} onChange={(note) => setLabel({ ...label, note })} />
        </Section>
        <View style={styles.actions}>
          <PrimaryButton title="Save Trace" onPress={handleSave} />
          <PrimaryButton title="Discard" variant="destructive" onPress={handleDiscard} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Section title="Lift" padded>
        <OptionChips
          label="Exercise"
          options={exercises}
          value={setup.exercise}
          onChange={(exercise) => setSetup({ ...setup, exercise })}
        />
      </Section>
      <Section title="Phone placement" padded footer="Barbell lifts: forearm. Push-ups and pull-ups: chest, pocket or upper arm.">
        <OptionChips label="Mount" options={mounts} value={setup.mount} onChange={(mount) => setSetup({ ...setup, mount })} />
      </Section>
      <Section title="Load" footer="For bodyweight lifts, enter the added weight.">
        <StepperRow
          label="Weight"
          value={setup.loadLb}
          step={5}
          unit="lb"
          onChange={(loadLb) => setSetup({ ...setup, loadLb })}
        />
      </Section>

      <View style={styles.actions}>
        <PrimaryButton title="Start Recording" large onPress={handleStart} />
        <Text style={[type.footnote, styles.center, { color: colors.textSecondary }]}>
          A 3-second countdown gives you time to get set. Your phone taps once per second, then twice when it starts.
        </Text>
      </View>

      <Section title={`Saved traces (${traces.length})`} footer={traces.length > 0 ? "Tap to share. Touch and hold to delete." : undefined}>
        {traces.length === 0 ? (
          <Text style={[type.subhead, styles.empty, { color: colors.textSecondary }]}>
            No traces yet. Record a set and it will show up here.
          </Text>
        ) : (
          traces.map((trace, index) => (
            <ListRow
              key={trace.uri}
              title={trace.name.replace(/\.json$/, "")}
              subtitle={`${trace.sizeKb} KB`}
              onPress={() => shareTrace(trace)}
              onLongPress={() => handleDelete(trace)}
              accessibilityHint="Opens the share sheet. Touch and hold to delete."
              showSeparator={index < traces.length - 1}
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
  actions: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  center: {
    textAlign: "center",
  },
  empty: {
    padding: spacing.lg,
  },
});
