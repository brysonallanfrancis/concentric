export type Goal = "strength" | "hypertrophy" | "endurance";
export type Units = "lb" | "kg";
export type ExerciseKind = "barbell" | "bodyweight" | "machine";
export type MountType = "forearm" | "upperArm" | "chest" | "bar" | "stack";
export type SetOutcome = "verified" | "near" | "quitEarly";

export type GoalRange = {
  goal: Goal;
  title: string;
  min: number;
  max: number;
  description: string;
};

export type Exercise = {
  id: string;
  name: string;
  kind: ExerciseKind;
  mounts: MountType[];
  defaultMount: MountType;
  mvt: number;
  loadStepLb: number;
};

export type RepResult = {
  meanVelocity: number;
  rom: number;
  eccentricSeconds: number | null;
  failed: boolean;
};

export type SetRecord = {
  id: string;
  exerciseId: string;
  performedAt: string;
  loadLb: number;
  mount: MountType;
  goal: Goal;
  reps: RepResult[];
  outcome: SetOutcome;
  repsLeftEstimate: number;
  note: string;
};

export type Session = {
  id: string;
  name: string;
  performedAt: string;
  sets: SetRecord[];
};

export type Settings = {
  onboarded: boolean;
  goal: Goal;
  oneSetPerExercise: boolean;
  trackNegatives: boolean;
  units: Units;
  bodyweightLb: number;
  haptics: boolean;
  demoMode: boolean;
};
