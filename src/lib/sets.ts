import { completedReps } from "@/engine/failure";
import { estimateMaxFromReps } from "@/engine/profile";
import type { RepResult, Session, SetRecord, Units } from "@/models/types";
import { findExercise } from "@/data/catalog";
import { formatDayDate, formatLoad, plural } from "./format";

export function describeOutcome(set: SetRecord): string {
  if (set.outcome === "verified") return "verified failure";
  if (set.outcome === "near") return "near failure";
  return `stopped ${set.repsLeftEstimate} short`;
}

export function describeSet(set: SetRecord, units: Units): string {
  const kind = findExercise(set.exerciseId)?.kind ?? "barbell";
  return `${formatLoad(kind, set.loadLb, units)} × ${completedReps(set.reps).length} · ${describeOutcome(set)}`;
}

export function describeSession(session: Session): string {
  const verified = session.sets.filter((set) => set.outcome === "verified").length;
  return `${formatDayDate(session.performedAt)} · ${plural(session.sets.length, "set")} · ${plural(verified, "verified failure")}`;
}

export function averageVelocity(reps: RepResult[]): number {
  const completed = completedReps(reps);
  if (completed.length === 0) return 0;
  return completed.reduce((sum, rep) => sum + rep.meanVelocity, 0) / completed.length;
}

export function averageEccentric(reps: RepResult[]): number | null {
  const values = reps.flatMap((rep) => (rep.eccentricSeconds === null ? [] : [rep.eccentricSeconds]));
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function fastestVelocity(reps: RepResult[]): number {
  return Math.max(0, ...completedReps(reps).map((rep) => rep.meanVelocity));
}

export function setsForExercise(sets: SetRecord[], exerciseId: string): SetRecord[] {
  return sets.filter((set) => set.exerciseId === exerciseId);
}

export function lastSetFor(sets: SetRecord[], exerciseId: string): SetRecord | undefined {
  return sets.find((set) => set.exerciseId === exerciseId);
}

export function dayKey(iso: string): string {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function groupSessions(sets: SetRecord[]): Session[] {
  const byDay = new Map<string, SetRecord[]>();
  for (const set of sets) {
    const day = dayKey(set.performedAt);
    byDay.set(day, [...(byDay.get(day) ?? []), set]);
  }
  return [...byDay].map(([day, daySets]) => ({
    id: day,
    name: [...new Set([...daySets].reverse().map((set) => findExercise(set.exerciseId)?.name ?? "Exercise"))].join(", "),
    performedAt: daySets[0].performedAt,
    sets: daySets,
  }));
}

export function repsToFailure(set: SetRecord): number {
  const completed = completedReps(set.reps).length;
  return set.outcome === "quitEarly" ? completed + set.repsLeftEstimate : completed;
}

export function estimatedMaxFor(set: SetRecord, bodyweightLb: number): number | null {
  const kind = findExercise(set.exerciseId)?.kind;
  const totalLb = kind === "bodyweight" ? bodyweightLb + set.loadLb : set.loadLb;
  return estimateMaxFromReps(totalLb, repsToFailure(set));
}
