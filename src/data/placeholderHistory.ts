import { classifySet } from "@/engine/failure";
import type { Exercise, Goal, RepResult, Session, SetRecord } from "@/models/types";
import { findExercise, goalRanges, provisionalExercises } from "./catalog";

const placeholderOneRepMaxLb: Record<string, number> = {
  "back-squat": 300,
  "bench-press": 225,
  "overhead-press": 145,
  deadlift: 365,
  "pull-up": 90,
  "push-up": 70,
  dip: 110,
  "leg-press": 600,
  "chest-press": 260,
};

const sessionTemplates = [
  { name: "Lower Body", exerciseIds: ["back-squat", "deadlift", "leg-press"] },
  { name: "Upper Body", exerciseIds: ["bench-press", "pull-up", "overhead-press", "dip"] },
];

const dayMs = 24 * 60 * 60 * 1000;
const weeks = 13;

let seed = 11;
function random(): number {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
}

function velocityAt(exercise: Exercise, loadLb: number): number {
  const oneRepMax = placeholderOneRepMaxLb[exercise.id];
  const fastest = exercise.kind === "bodyweight" ? 1.0 : 1.15;
  return exercise.mvt + (fastest - exercise.mvt) * (1 - loadLb / oneRepMax);
}

export function buildReps(exercise: Exercise, loadLb: number, completed: number, endsInFailure: boolean, lastAboveMvt: number): RepResult[] {
  const lastVelocity = exercise.mvt + lastAboveMvt;
  const first = Math.max(velocityAt(exercise, loadLb), lastVelocity + 0.15);
  const reps: RepResult[] = Array.from({ length: completed }, (_, index) => {
    const progress = completed > 1 ? index / (completed - 1) : 1;
    return {
      meanVelocity: first - (first - lastVelocity) * progress ** 1.6 + (random() - 0.5) * 0.02,
      rom: 0.48 + (random() - 0.5) * 0.03,
      eccentricSeconds: 3.2 + random() * 1.2,
      failed: false,
    };
  });
  if (endsInFailure) reps.push({ meanVelocity: 0.08, rom: 0.21, eccentricSeconds: null, failed: true });
  return reps;
}

function placeholderSet(exercise: Exercise, goal: Goal, week: number, performedAt: Date): SetRecord {
  const range = goalRanges[goal];
  const oneRepMax = placeholderOneRepMaxLb[exercise.id] * (0.95 + week * 0.006);
  const targetReps = range.min + Math.floor(random() * (range.max - range.min + 1));
  const rawLoad = oneRepMax / (1 + targetReps / 30);
  const loadLb = Math.round(rawLoad / exercise.loadStepLb) * exercise.loadStepLb;
  const roll = random();
  const reps =
    roll < 0.8
      ? buildReps(exercise, loadLb, targetReps, true, 0.02)
      : roll < 0.9
        ? buildReps(exercise, loadLb, targetReps, false, 0.03)
        : buildReps(exercise, loadLb, Math.max(1, targetReps - 2), false, 0.1);
  const classification = classifySet(reps, exercise.mvt);
  return {
    id: `${exercise.id}-${performedAt.getTime()}`,
    exerciseId: exercise.id,
    performedAt: performedAt.toISOString(),
    loadLb,
    mount: exercise.defaultMount,
    goal,
    reps,
    outcome: classification.outcome,
    repsLeftEstimate: classification.repsLeftEstimate,
  };
}

function buildPlaceholderSessions(): Session[] {
  const today = new Date();
  today.setHours(17, 30, 0, 0);
  const sessions: Session[] = [];
  for (let week = 0; week < weeks; week++) {
    sessionTemplates.forEach((template, index) => {
      const daysAgo = (weeks - week) * 7 - index * 3 - 1;
      const performedAt = new Date(today.getTime() - daysAgo * dayMs);
      const sets = template.exerciseIds.map((id, order) =>
        placeholderSet(findExercise(id)!, "hypertrophy", week, new Date(performedAt.getTime() + order * 6 * 60 * 1000)),
      );
      sessions.push({ id: `session-${performedAt.getTime()}`, name: template.name, performedAt: performedAt.toISOString(), sets });
    });
  }
  return sessions.reverse();
}

export const placeholderSessions = buildPlaceholderSessions();

export const todaysPlanIds = ["back-squat", "pull-up", "leg-press"];

export function setsForExercise(exerciseId: string): SetRecord[] {
  return placeholderSessions.flatMap((session) => session.sets).filter((set) => set.exerciseId === exerciseId);
}

export function lastSetFor(exerciseId: string): SetRecord | undefined {
  return setsForExercise(exerciseId)[0];
}

export function previewSet(exerciseId: string, loadLb: number, goal: Goal): SetRecord {
  seed = 23;
  const exercise = findExercise(exerciseId) ?? provisionalExercises[0];
  const range = goalRanges[goal];
  const reps =
    exercise.kind === "bodyweight"
      ? buildReps(exercise, loadLb, range.min + 1, false, 0.12)
      : buildReps(exercise, loadLb, Math.min(range.max - 1, range.min + 3), true, 0.03);
  const classification = classifySet(reps, exercise.mvt);
  return {
    id: "preview",
    exerciseId: exercise.id,
    performedAt: new Date().toISOString(),
    loadLb,
    mount: exercise.defaultMount,
    goal,
    reps,
    outcome: classification.outcome,
    repsLeftEstimate: classification.repsLeftEstimate,
  };
}
