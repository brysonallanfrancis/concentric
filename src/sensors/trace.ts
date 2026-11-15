export const exercises = ["Squat", "Bench", "Deadlift", "Press", "Pull-up", "Push-up", "Dip", "Other"] as const;
export const mounts = ["Forearm", "Upper arm", "Pocket", "Chest", "Bar", "Stack"] as const;

export type Exercise = (typeof exercises)[number];
export type Mount = (typeof mounts)[number];

export type MotionSample = {
  t: number;
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  rx: number;
  ry: number;
  rz: number;
};

export type TraceSetup = {
  exercise: Exercise;
  mount: Mount;
  loadLb: number;
};

export type TraceLabel = {
  actualReps: number;
  reachedFailure: boolean;
  note: string;
};

export type Trace = {
  version: 1;
  recordedAt: string;
  platform: string;
  requestedIntervalMs: number;
  setup: TraceSetup;
  label: TraceLabel;
  samples: MotionSample[];
};

export function traceFileName(trace: Trace): string {
  const stamp = trace.recordedAt.slice(0, 19).replace(/:/g, "-");
  const exercise = trace.setup.exercise.toLowerCase().replace(/[^a-z]/g, "");
  const mount = trace.setup.mount.toLowerCase().replace(/[^a-z]/g, "");
  const outcome = trace.label.reachedFailure ? "fail" : "nofail";
  return `${stamp}_${exercise}_${mount}_${trace.setup.loadLb}lb_${trace.label.actualReps}r_${outcome}.json`;
}
