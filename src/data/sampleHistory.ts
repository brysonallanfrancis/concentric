import { classifySet } from "@/engine/failure";
import type { Exercise, Goal, RepResult, SetRecord } from "@/models/types";
import { findExercise, goalRanges } from "./catalog";

const sampleOneRepMaxLb: Record<string, number> = {
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

const workouts = [
  ["back-squat", "deadlift", "leg-press"],
  ["bench-press", "pull-up", "overhead-press", "dip"],
];

const dayMs = 24 * 60 * 60 * 1000;
const weeks = 13;

let seed = 0;
function random(): number {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
}

function velocityAt(exercise: Exercise, loadLb: number): number {
  const oneRepMax = sampleOneRepMaxLb[exercise.id];
  const fastest = exercise.kind === "bodyweight" ? 1.0 : 1.15;
  return exercise.mvt + (fastest - exercise.mvt) * (1 - loadLb / oneRepMax);
}

function buildReps(exercise: Exercise, loadLb: number, completed: number, endsInFailure: boolean, lastAboveMvt: number): RepResult[] {
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

function sampleSet(exercise: Exercise, goal: Goal, week: number, performedAt: Date): SetRecord {
  const range = goalRanges[goal];
  const oneRepMax = sampleOneRepMaxLb[exercise.id] * (0.95 + week * 0.006);
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
    note: "",
  };
}

export function buildSampleSets(): SetRecord[] {
  seed = 11;
  const today = new Date();
  today.setHours(17, 30, 0, 0);
  const sets: SetRecord[] = [];
  for (let week = 0; week < weeks; week++) {
    workouts.forEach((exerciseIds, index) => {
      const daysAgo = (weeks - week) * 7 - index * 3 - 1;
      const performedAt = today.getTime() - daysAgo * dayMs;
      exerciseIds.forEach((id, order) => {
        sets.push(sampleSet(findExercise(id)!, "hypertrophy", week, new Date(performedAt + order * 6 * 60 * 1000)));
      });
    });
  }
  return sets;
}
