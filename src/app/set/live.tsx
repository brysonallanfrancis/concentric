import { router, Stack, useLocalSearchParams, useNavigation, usePreventRemove } from "expo-router";
import { useRef, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { CalibrationCard } from "@/components/CalibrationCard";
import { Callout } from "@/components/Callout";
import { GoalRangeMeter } from "@/components/GoalRangeMeter";
import { HeaderCloseButton } from "@/components/HeaderCloseButton";
import { LiveHeaderTitle } from "@/components/LiveHeaderTitle";
import { MountIllustration } from "@/components/MountIllustration";
import { PrimaryButton } from "@/components/PrimaryButton";
import { RepBarChart } from "@/components/RepBarChart";
import { RepCounter } from "@/components/RepCounter";
import { StatusPill } from "@/components/StatusPill";
import { useHistory } from "@/context/HistoryContext";
import { useSettings } from "@/context/SettingsContext";
import { findExercise, goalRanges, mountInfo, provisionalExercises } from "@/data/catalog";
import { demoTraceFor } from "@/data/demoTraces";
import { classifySet, completedReps } from "@/engine/failure";
import { useLiveSet } from "@/hooks/useLiveSet";
import { formatLoad, formatVelocity } from "@/lib/format";
import { warningBuzz } from "@/lib/haptics";
import type { MountType, RepResult } from "@/models/types";
import { createLiveSensorSource, createReplaySensorSource } from "@/sensors/sensorSource";
import { radius, spacing, type, useTheme } from "@/theme/theme";

export default function LiveSetScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const { addSets } = useHistory();
  const params = useLocalSearchParams<{ exerciseId: string; mount: MountType; loadLb: string }>();
  const exercise = findExercise(params.exerciseId) ?? provisionalExercises[0];
  const loadLb = Number(params.loadLb ?? 0);
  const mount = params.mount ?? exercise.defaultMount;
  const range = goalRanges[settings.goal];

  const [showQuitPrompt, setShowQuitPrompt] = useState(false);
  const leaving = useRef(false);
  const [left, setLeft] = useState(false);
  const navigation = useNavigation();
  const live = useLiveSet({ haptics: settings.haptics, onFailureDetected: finish });

  const completed = completedReps(live.reps);
  const lastVelocity = completed.length > 0 ? completed[completed.length - 1].meanVelocity : null;
  const classification = classifySet(live.reps, exercise.mvt);
  const loadText = formatLoad(exercise.kind, loadLb, settings.units);
  const sourceLabel = settings.demoMode ? "Demo · replaying a recorded set" : `Tracking · ${mountInfo[mount].label.toLowerCase()}`;

  function lockSheet(locked: boolean) {
    navigation.getParent()?.setOptions({ gestureEnabled: !locked });
  }

  function leave() {
    leaving.current = true;
    setLeft(true);
    live.stop();
    lockSheet(false);
  }

  async function handleBegin() {
    lockSheet(true);
    const source = settings.demoMode ? createReplaySensorSource(demoTraceFor(exercise.kind)) : createLiveSensorSource();
    const error = await live.begin(source);
    if (error) {
      lockSheet(false);
      Alert.alert("Can't start tracking", error);
    }
  }

  function finish(reps: RepResult[]) {
    leave();
    const result = classifySet(reps, exercise.mvt);
    const performedAt = new Date();
    const id = `${performedAt.getTime()}`;
    addSets([
      {
        id,
        exerciseId: exercise.id,
        performedAt: performedAt.toISOString(),
        loadLb,
        mount,
        goal: settings.goal,
        reps,
        outcome: result.outcome,
        repsLeftEstimate: result.repsLeftEstimate,
        note: "",
      },
    ]);
    router.replace({ pathname: "/set/summary", params: { setId: id } });
  }

  function handleEndSet() {
    if (live.reps.length === 0) {
      handleClose();
      return;
    }
    if (classification.outcome === "quitEarly" && !showQuitPrompt) {
      warningBuzz(settings.haptics);
      setShowQuitPrompt(true);
      return;
    }
    finish(live.reps);
  }

  function confirmCancel(onConfirm: () => void) {
    Alert.alert("Cancel this set?", "Nothing from this set will be saved.", [
      { text: "Keep Lifting", style: "cancel" },
      {
        text: "Cancel Set",
        style: "destructive",
        onPress: () => {
          leave();
          onConfirm();
        },
      },
    ]);
  }

  function handleClose() {
    if (live.phase === "ready") {
      router.back();
      return;
    }
    confirmCancel(() => router.back());
  }

  usePreventRemove(live.phase !== "ready" && !left, ({ repeat }) => {
    if (leaving.current) {
      repeat();
      return;
    }
    confirmCancel(repeat);
  });

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerTitle: () => <LiveHeaderTitle title={`${exercise.name} · ${loadText}`} subtitle="One set to failure" />,
          headerLeft: () => <HeaderCloseButton label="Cancel set" onPress={handleClose} />,
        }}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        {live.phase === "ready" && (
          <View style={styles.ready}>
            {settings.demoMode && (
              <Callout
                tone="info"
                title="Demo mode is on"
                message="Begin replays a recorded set through the same rep detection used with real sensors. Turn it off in Settings to track your own lift."
              />
            )}
            <MountIllustration mount={mount} />
            <Text style={[type.title, { color: colors.text }]}>Mount your phone</Text>
            <Text style={[type.subhead, { color: colors.textSecondary }]}>
              {mountInfo[mount].instructions} Then tap Begin and hold still for 2 seconds while Concentric finds gravity.
            </Text>
          </View>
        )}

        {live.phase === "calibrating" && <CalibrationCard />}

        {live.phase === "tracking" && (
          <>
            <StatusPill label={sourceLabel} />
            {showQuitPrompt && lastVelocity !== null && (
              <Callout
                tone="warning"
                alert
                title="You've got more in you"
                message={`Your last rep still moved at ${formatVelocity(lastVelocity)} m/s. That's about ${classification.repsLeftEstimate} ${
                  classification.repsLeftEstimate === 1 ? "rep" : "reps"
                } short of failure.`}
              />
            )}
            <RepCounter reps={completed.length} lastVelocity={lastVelocity} />
            <GoalRangeMeter reps={completed.length} range={range} />
            <View style={styles.chart}>
              <Text style={[type.sectionHeader, { color: colors.textSecondary }]}>Each rep</Text>
              <RepBarChart reps={live.reps} mvt={exercise.mvt} minimumSlots={Math.max(5, range.min)} />
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        {live.phase === "ready" && <PrimaryButton title="Begin" large onPress={handleBegin} />}
        {live.phase === "tracking" && !showQuitPrompt && (
          <>
            <Text style={[type.footnote, styles.hint, { color: colors.textSecondary }]}>
              Keep going until you can&apos;t. A tap on every rep; we&apos;ll catch the rep that fails.
            </Text>
            <PrimaryButton title="End Set" variant="dark" large onPress={handleEndSet} />
          </>
        )}
        {live.phase === "tracking" && showQuitPrompt && (
          <View style={styles.choice}>
            <View style={styles.choiceButton}>
              <PrimaryButton title="Keep Going" variant="tinted" large onPress={() => setShowQuitPrompt(false)} />
            </View>
            <View style={styles.choiceButton}>
              <PrimaryButton title="End Anyway" variant="dark" large onPress={handleEndSet} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  ready: {
    gap: spacing.md,
  },
  chart: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  hint: {
    textAlign: "center",
  },
  choice: {
    flexDirection: "row",
    gap: spacing.md,
  },
  choiceButton: {
    flex: 1,
  },
});
