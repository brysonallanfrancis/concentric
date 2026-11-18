import type { RepResult } from "@/models/types";
import type { MotionSample } from "@/sensors/trace";
import { analyzeTrace, provisionalAnalysisSettings, type AnalysisSettings } from "./traceAnalysis";
import { verticalAcceleration } from "./vertical";

export const repSettleSeconds = 0.3;
export const failureEndSeconds = 1.2;
export const calibrationSeconds = 2;
const calibrationAcceleration = 0.35;
const calibrationRotation = 30;
const calibrationSmoothing = 0.1;

export type LiveSetSnapshot = {
  reps: RepResult[];
  endedByFailure: boolean;
};

export function summarizeLiveSet(samples: MotionSample[], settings: AnalysisSettings = provisionalAnalysisSettings): LiveSetSnapshot {
  if (samples.length < 2) return { reps: [], endedByFailure: false };
  const latest = samples[samples.length - 1].t;
  const analysis = analyzeTrace(samples, settings);
  const settled = analysis.reps.filter((rep) => rep.concentric.endT <= latest - repSettleSeconds);
  const reps = settled.map((rep) => ({
    meanVelocity: rep.concentric.meanVelocity,
    rom: rep.concentric.rom,
    eccentricSeconds: rep.eccentricSeconds,
    failed: rep.partial,
  }));
  const last = settled[settled.length - 1];
  const endedByFailure = Boolean(last?.partial && latest - last.concentric.endT >= failureEndSeconds);
  return { reps, endedByFailure };
}

export type CalibrationState = {
  smoothedAcceleration: number;
  stillSince: number | null;
};

export const initialCalibration: CalibrationState = { smoothedAcceleration: 0, stillSince: null };

export function updateCalibration(state: CalibrationState, sample: MotionSample): CalibrationState {
  const smoothedAcceleration =
    state.smoothedAcceleration + calibrationSmoothing * (Math.abs(verticalAcceleration(sample)) - state.smoothedAcceleration);
  const rotation = Math.hypot(sample.rx, sample.ry, sample.rz);
  const still = smoothedAcceleration < calibrationAcceleration && rotation < calibrationRotation;
  return { smoothedAcceleration, stillSince: still ? (state.stillSince ?? sample.t) : null };
}

export function isCalibrated(state: CalibrationState, sample: MotionSample): boolean {
  return state.stillSince !== null && sample.t - state.stillSince >= calibrationSeconds;
}
