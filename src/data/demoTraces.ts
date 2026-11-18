import pullUpStoppedShort from "@/assets/traces/demo-pullup-stopped-short.json";
import squatFailure from "@/assets/traces/demo-squat-failure.json";
import type { ExerciseKind } from "@/models/types";
import type { Trace } from "@/sensors/trace";

export function demoTraceFor(kind: ExerciseKind): Trace {
  return (kind === "bodyweight" ? pullUpStoppedShort : squatFailure) as Trace;
}
