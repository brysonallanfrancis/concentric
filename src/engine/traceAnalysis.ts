import type { MotionSample } from "@/sensors/trace";
import { cumulativeIntegral, median, rollingMaximum, zeroPhaseLowPass } from "./filters";
import { verticalAcceleration } from "./vertical";

export const provisionalAnalysisSettings = {
  smoothingCutoffHz: 6,
  stillWindowSeconds: 0.4,
  stillAcceleration: 0.25,
  stillRotationDegPerSecond: 25,
  movingVelocity: 0.05,
  minimumRepRom: 0.08,
  partialRomFraction: 0.7,
  maxEccentricGapSeconds: 1.5,
};

export type AnalysisSettings = typeof provisionalAnalysisSettings;

export type Phase = {
  direction: "up" | "down";
  startIndex: number;
  endIndex: number;
  startT: number;
  endT: number;
  rom: number;
  meanVelocity: number;
  peakVelocity: number;
};

export type Rep = {
  number: number;
  concentric: Phase;
  eccentricSeconds: number | null;
  partial: boolean;
};

export type TraceAnalysis = {
  sampleRateHz: number;
  t: number[];
  vertical: number[];
  velocity: number[];
  displacement: number[];
  still: boolean[];
  phases: Phase[];
  reps: Rep[];
};

export function analyzeTrace(samples: MotionSample[], settings: AnalysisSettings = provisionalAnalysisSettings): TraceAnalysis {
  const t = samples.map((sample) => sample.t);
  const duration = t[t.length - 1] - t[0];
  const sampleRateHz = duration > 0 ? (samples.length - 1) / duration : 100;

  const vertical = zeroPhaseLowPass(samples.map(verticalAcceleration), sampleRateHz, settings.smoothingCutoffHz);
  const still = findStillSamples(samples, vertical, sampleRateHz, settings);
  const rawVelocity = cumulativeIntegral(vertical, t);

  const firstPassVelocity = removeDrift(rawVelocity, still);
  const firstPassPhases = findPhases(firstPassVelocity, t, settings);
  const turnarounds = new Set(firstPassPhases.flatMap((phase) => [phase.startIndex, phase.endIndex]));
  const anchors = still.map((isStill, index) => isStill || turnarounds.has(index));

  const velocity = removeDrift(rawVelocity, anchors);
  const phases = findPhases(velocity, t, settings);
  const displacement = cumulativeIntegral(velocity, t);

  return { sampleRateHz, t, vertical, velocity, displacement, still, phases, reps: buildReps(phases, settings) };
}

function findStillSamples(
  samples: MotionSample[],
  vertical: number[],
  sampleRateHz: number,
  settings: AnalysisSettings,
): boolean[] {
  const windowSize = Math.round(settings.stillWindowSeconds * sampleRateHz);
  const acceleration = rollingMaximum(vertical.map(Math.abs), windowSize);
  const rotation = rollingMaximum(
    samples.map((sample) => Math.hypot(sample.rx, sample.ry, sample.rz)),
    windowSize,
  );
  return acceleration.map(
    (value, index) => value < settings.stillAcceleration && rotation[index] < settings.stillRotationDegPerSecond,
  );
}

function removeDrift(velocity: number[], anchors: boolean[]): number[] {
  const anchorIndexes = anchors.flatMap((isAnchor, index) => (isAnchor ? [index] : []));
  if (anchorIndexes.length === 0) return [...velocity];

  const drift = new Array<number>(velocity.length);
  const first = anchorIndexes[0];
  const last = anchorIndexes[anchorIndexes.length - 1];
  for (let i = 0; i <= first; i++) drift[i] = velocity[first];
  for (let i = last; i < velocity.length; i++) drift[i] = velocity[last];
  for (let k = 0; k < anchorIndexes.length - 1; k++) {
    const from = anchorIndexes[k];
    const to = anchorIndexes[k + 1];
    for (let i = from; i <= to; i++) {
      const fraction = to === from ? 0 : (i - from) / (to - from);
      drift[i] = velocity[from] + fraction * (velocity[to] - velocity[from]);
    }
  }
  return velocity.map((value, index) => value - drift[index]);
}

function findPhases(velocity: number[], t: number[], settings: AnalysisSettings): Phase[] {
  const phases: Phase[] = [];
  let index = 0;
  while (index < velocity.length) {
    if (Math.abs(velocity[index]) < settings.movingVelocity) {
      index++;
      continue;
    }
    const sign = Math.sign(velocity[index]);
    let start = index;
    while (start > 0 && Math.sign(velocity[start - 1]) === sign && velocity[start - 1] !== 0) start--;
    let end = index;
    while (end < velocity.length - 1 && Math.sign(velocity[end + 1]) === sign && velocity[end + 1] !== 0) end++;

    const phase = measurePhase(velocity, t, start, end, sign > 0 ? "up" : "down");
    if (phase.rom >= settings.minimumRepRom) phases.push(phase);
    index = end + 1;
  }
  return phases;
}

function measurePhase(velocity: number[], t: number[], start: number, end: number, direction: Phase["direction"]): Phase {
  let rom = 0;
  let peak = 0;
  for (let i = start + 1; i <= end; i++) {
    rom += Math.abs((velocity[i] + velocity[i - 1]) / 2) * (t[i] - t[i - 1]);
    peak = Math.max(peak, Math.abs(velocity[i]));
  }
  const seconds = t[end] - t[start];
  return {
    direction,
    startIndex: start,
    endIndex: end,
    startT: t[start],
    endT: t[end],
    rom,
    meanVelocity: seconds > 0 ? rom / seconds : 0,
    peakVelocity: peak,
  };
}

function buildReps(phases: Phase[], settings: AnalysisSettings): Rep[] {
  const reps: Rep[] = [];
  phases.forEach((phase, index) => {
    if (phase.direction !== "up") return;
    const previous = phases[index - 1];
    const eccentricSeconds =
      previous?.direction === "down" && phase.startT - previous.endT <= settings.maxEccentricGapSeconds
        ? previous.endT - previous.startT
        : null;
    const priorRoms = reps.filter((rep) => !rep.partial).map((rep) => rep.concentric.rom);
    const partial = priorRoms.length >= 2 && phase.rom < settings.partialRomFraction * median(priorRoms);
    reps.push({ number: reps.length + 1, concentric: phase, eccentricSeconds, partial });
  });
  return reps;
}
