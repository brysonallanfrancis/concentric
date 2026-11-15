import type { Exercise, GoalRange, SetOutcome } from "@/models/types";

export type ProgressionAction = "decrease" | "stay" | "increase" | "pushHarder";

export type Progression = {
  action: ProgressionAction;
  nextLoadLb: number;
  targetReps: number;
};

const decreaseFraction = 0.1;

export function recommendNextSet(
  exercise: Exercise,
  range: GoalRange,
  loadLb: number,
  completedReps: number,
  outcome: SetOutcome,
): Progression {
  if (outcome === "quitEarly") {
    return { action: "pushHarder", nextLoadLb: loadLb, targetReps: Math.max(range.min, completedReps + 1) };
  }
  if (completedReps < range.min) {
    const reduced = roundToStep(loadLb * (1 - decreaseFraction), exercise.loadStepLb);
    return { action: "decrease", nextLoadLb: Math.min(reduced, loadLb - exercise.loadStepLb), targetReps: range.min };
  }
  if (completedReps >= range.max) {
    return { action: "increase", nextLoadLb: loadLb + exercise.loadStepLb, targetReps: range.min };
  }
  return { action: "stay", nextLoadLb: loadLb, targetReps: completedReps + 1 };
}

function roundToStep(value: number, step: number): number {
  return Math.max(0, Math.round(value / step) * step);
}
