import type { ExerciseKind, Units } from "@/models/types";

export const kgPerLb = 0.45359237;

export function formatWeight(lb: number, units: Units): string {
  if (units === "kg") return `${Math.round((lb * kgPerLb) * 2) / 2} kg`;
  return `${Math.round(lb)} lb`;
}

export function weightValue(lb: number, units: Units): number {
  return units === "kg" ? Math.round(lb * kgPerLb * 2) / 2 : Math.round(lb);
}

export function formatVelocity(metersPerSecond: number): string {
  return metersPerSecond.toFixed(2);
}

export function formatShortVelocity(metersPerSecond: number): string {
  return metersPerSecond.toFixed(2).replace(/^0/, "");
}

export function formatDayDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

export function formatLoad(kind: ExerciseKind, lb: number, units: Units): string {
  if (kind !== "bodyweight") return formatWeight(lb, units);
  return lb > 0 ? `Bodyweight + ${formatWeight(lb, units)}` : "Bodyweight";
}
