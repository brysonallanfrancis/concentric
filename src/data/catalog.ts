import type { Exercise, ExerciseKind, Goal, GoalRange, MountType } from "@/models/types";

export const goalRanges: Record<Goal, GoalRange> = {
  strength: { goal: "strength", title: "Strength", min: 3, max: 6, description: "Fail at 3–6 reps. Heavy weight, max force." },
  hypertrophy: { goal: "hypertrophy", title: "Hypertrophy", min: 6, max: 12, description: "Fail at 6–12 reps. Build muscle size." },
  endurance: { goal: "endurance", title: "Endurance", min: 15, max: 25, description: "Fail at 15+ reps. Lighter weight, longer sets." },
};

export const goals: Goal[] = ["strength", "hypertrophy", "endurance"];

export function formatGoalRange(range: GoalRange): string {
  return range.goal === "endurance" ? `${range.min}+` : `${range.min}–${range.max}`;
}

export const mountInfo: Record<MountType, { label: string; shortLabel: string; instructions: string }> = {
  forearm: {
    label: "Forearm armband",
    shortLabel: "Forearm",
    instructions: "Wear your phone in a forearm armband, screen facing out. Your forearm moves with the bar.",
  },
  upperArm: {
    label: "Upper-arm armband",
    shortLabel: "Upper arm",
    instructions: "Wear your phone high on your upper arm, screen facing out, strapped tight so it can't bounce.",
  },
  chest: {
    label: "Chest strap",
    shortLabel: "Chest",
    instructions: "Strap your phone to the center of your chest. Your torso carries it through every rep.",
  },
  bar: {
    label: "On the bar",
    shortLabel: "Bar",
    instructions: "Strap your phone tight to the bar next to your grip, where it won't hit the rack or the J-hooks.",
  },
  stack: {
    label: "Weight stack",
    shortLabel: "Weight stack",
    instructions: "Strap your phone to the top plate of the stack, clear of the pin and the guide rods.",
  },
};

export const kindInfo: Record<ExerciseKind, { title: string; sectionTitle: string; badge: string }> = {
  barbell: { title: "Barbell", sectionTitle: "Barbell · phone on your forearm", badge: "Bar" },
  bodyweight: { title: "Body", sectionTitle: "Bodyweight · phone on your body", badge: "Body" },
  machine: { title: "Machine", sectionTitle: "Machines · phone on the weight stack", badge: "Stack" },
};

export const exerciseKinds: ExerciseKind[] = ["barbell", "bodyweight", "machine"];

export const provisionalExercises: Exercise[] = [
  { id: "back-squat", name: "Back Squat", kind: "barbell", mounts: ["forearm", "bar"], defaultMount: "forearm", mvt: 0.3, loadStepLb: 5 },
  { id: "bench-press", name: "Bench Press", kind: "barbell", mounts: ["forearm", "bar"], defaultMount: "forearm", mvt: 0.17, loadStepLb: 5 },
  { id: "overhead-press", name: "Overhead Press", kind: "barbell", mounts: ["forearm", "bar"], defaultMount: "forearm", mvt: 0.19, loadStepLb: 5 },
  { id: "deadlift", name: "Deadlift", kind: "barbell", mounts: ["forearm", "bar"], defaultMount: "forearm", mvt: 0.15, loadStepLb: 10 },
  { id: "pull-up", name: "Pull-up", kind: "bodyweight", mounts: ["chest", "upperArm"], defaultMount: "chest", mvt: 0.2, loadStepLb: 5 },
  { id: "push-up", name: "Push-up", kind: "bodyweight", mounts: ["chest", "upperArm"], defaultMount: "chest", mvt: 0.2, loadStepLb: 5 },
  { id: "dip", name: "Dip", kind: "bodyweight", mounts: ["chest", "upperArm"], defaultMount: "chest", mvt: 0.2, loadStepLb: 5 },
  { id: "leg-press", name: "Leg Press", kind: "machine", mounts: ["stack"], defaultMount: "stack", mvt: 0.3, loadStepLb: 10 },
  { id: "chest-press", name: "Chest Press", kind: "machine", mounts: ["stack"], defaultMount: "stack", mvt: 0.2, loadStepLb: 10 },
];

export function findExercise(id: string): Exercise | undefined {
  return provisionalExercises.find((exercise) => exercise.id === id);
}

export function needsSafetyPrompt(exercise: Exercise): boolean {
  return exercise.id === "back-squat" || exercise.id === "bench-press";
}

export const starterPlanIds = ["back-squat", "bench-press", "pull-up"];
