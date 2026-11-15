import { router, Stack, useLocalSearchParams, useNavigation, usePreventRemove } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { useSettings } from "@/context/SettingsContext";
import { findExercise, goalRanges, mountInfo, provisionalExercises } from "@/data/catalog";
import { previewSet } from "@/data/placeholderHistory";
import { classifySet, completedReps } from "@/engine/failure";
import { formatLoad, formatVelocity } from "@/lib/format";
import { failureBuzz, repTap, successBuzz, warningBuzz } from "@/lib/haptics";
import type { MountType } from "@/models/types";
import { radius, spacing, type, useTheme } from "@/theme/theme";

type Phase = "ready" | "calibrating" | "tracking";

const calibrationMs = 2000;
const previewRepIntervalMs = 2400;
const endAfterFailureMs = 1500;

export default function LiveSetScreen() {
  const colors = useTheme();
  const { settings } = useSettings();
  const params = useLocalSearchParams<{ exerciseId: string; mount: MountType; loadLb: string }>();
  const exercise = findExercise(params.exerciseId) ?? provisionalExercises[0];
  const loadLb = Number(params.loadLb ?? 0);
  const mount = params.mount ?? exercise.defaultMount;
  const range = goalRanges[settings.goal];
  const preview = previewSet(exercise.id, loadLb, settings.goal);

  const [phase, setPhase] = useState<Phase>("ready");
  const [shownCount, setShownCount] = useState(0);
  const [showQuitPrompt, setShowQuitPrompt] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaving = useRef(false);
  const navigation = useNavigation();


  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const shownReps = preview.reps.slice(0, shownCount);
  const completed = completedReps(shownReps);
  const lastVelocity = completed.length > 0 ? completed[completed.length - 1].meanVelocity : null;
  const classification = classifySet(shownReps, exercise.mvt);

  const loadText = formatLoad(exercise.kind, loadLb, settings.units);

  function lockSheet(locked: boolean) {
    navigation.getParent()?.setOptions({ gestureEnabled: !locked });
  }

  function leave() {
    leaving.current = true;
    if (timer.current) clearTimeout(timer.current);
    lockSheet(false);
  }

  function handleBegin() {
    lockSheet(true);
    setPhase("calibrating");
    repTap(settings.haptics);
    timer.current = setTimeout(() => {
      setPhase("tracking");
      successBuzz(settings.haptics);
      scheduleRep(0);
    }, calibrationMs);
  }

  function scheduleRep(count: number) {
    timer.current = setTimeout(() => {
      const next = count + 1;
      const rep = preview.reps[count];
      setShownCount(next);
      if (rep.failed) {
        failureBuzz(settings.haptics);
        timer.current = setTimeout(() => finish(next), endAfterFailureMs);
        return;
      }
      repTap(settings.haptics);
      if (next < preview.reps.length) scheduleRep(next);
    }, previewRepIntervalMs);
  }

  function finish(count: number) {
    leave();
    router.replace({
      pathname: "/set/summary",
      params: { exerciseId: exercise.id, mount, loadLb: String(loadLb), reps: String(count) },
    });
  }

  function handleEndSet() {
    if (classification.outcome === "quitEarly" && !showQuitPrompt) {
      warningBuzz(settings.haptics);
      setShowQuitPrompt(true);
      return;
    }
    finish(shownCount);
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
    if (phase === "ready") {
      router.back();
      return;
    }
    confirmCancel(() => router.back());
  }

  usePreventRemove(phase !== "ready", ({ data }) => {
    if (leaving.current) {
      navigation.dispatch(data.action);
      return;
    }
    confirmCancel(() => navigation.dispatch(data.action));
  });

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerTitle: () => <LiveHeaderTitle title={`${exercise.name} · ${loadText}`} subtitle="One set to failure" />,
          headerLeft: () => <HeaderCloseButton label="Cancel set" onPress={handleClose} />,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {phase === "ready" && (
          <View style={styles.ready}>
            <MountIllustration mount={mount} />
            <Text style={[type.title, { color: colors.text }]}>Mount your phone</Text>
            <Text style={[type.subhead, { color: colors.textSecondary }]}>
              {mountInfo[mount].instructions} Then tap Begin and hold still for 2 seconds while Concentric finds gravity.
            </Text>
          </View>
        )}

        {phase === "calibrating" && <CalibrationCard />}

        {phase === "tracking" && (
          <>
            <StatusPill label={`Tracking · ${mountInfo[mount].label.toLowerCase()}`} />
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
              <RepBarChart reps={shownReps} mvt={exercise.mvt} minimumSlots={Math.max(5, range.min)} />
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        {phase === "ready" && <PrimaryButton title="Begin" large onPress={handleBegin} />}
        {phase === "tracking" && !showQuitPrompt && (
          <>
            <Text style={[type.footnote, styles.hint, { color: colors.textSecondary }]}>
              Keep going until you can&apos;t. A tap on every rep; we&apos;ll catch the rep that fails.
            </Text>
            <PrimaryButton title="End Set" variant="dark" large onPress={handleEndSet} />
          </>
        )}
        {phase === "tracking" && showQuitPrompt && (
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
