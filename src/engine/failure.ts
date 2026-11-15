import type { RepResult, SetOutcome } from "@/models/types";

export const nearFailureMargin = 0.05;
const maxRepsLeftEstimate = 10;

export type SetClassification = {
  outcome: SetOutcome;
  completedReps: number;
  repsLeftEstimate: number;
};

export function completedReps(reps: RepResult[]): RepResult[] {
  return reps.filter((rep) => !rep.failed);
}

export function classifySet(reps: RepResult[], mvt: number): SetClassification {
  const completed = completedReps(reps);
  const last = completed[completed.length - 1];

  if (reps.length > 0 && reps[reps.length - 1].failed) {
    return { outcome: "verified", completedReps: completed.length, repsLeftEstimate: 0 };
  }
  if (!last || last.meanVelocity <= mvt + nearFailureMargin) {
    return { outcome: "near", completedReps: completed.length, repsLeftEstimate: 0 };
  }
  return { outcome: "quitEarly", completedReps: completed.length, repsLeftEstimate: estimateRepsLeft(completed, mvt) };
}

export function estimateRepsLeft(completed: RepResult[], mvt: number): number {
  const velocities = completed.map((rep) => rep.meanVelocity);
  const last = velocities[velocities.length - 1];
  if (last === undefined || last <= mvt) return 0;

  const window = velocities.slice(-4);
  const dropPerRep = window.length >= 2 ? (window[0] - window[window.length - 1]) / (window.length - 1) : 0;
  if (dropPerRep <= 0) return maxRepsLeftEstimate;
  return Math.min(maxRepsLeftEstimate, Math.max(1, Math.round((last - mvt) / dropPerRep)));
}
