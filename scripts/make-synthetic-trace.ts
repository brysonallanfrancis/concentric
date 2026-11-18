import { mkdirSync, writeFileSync } from "node:fs";
import type { MotionSample, Trace, TraceLabel, TraceSetup } from "@/sensors/trace";

const sampleRateHz = 100;
const gravity = 9.80665;
const accelerationBias = 0.04;
const noise = 0.08;
const outputDirectory = "assets/traces";

type Segment = { seconds: number; travel: number };

type Scenario = {
  file: string;
  setup: TraceSetup;
  label: TraceLabel;
  axis: number[];
  segments: Segment[];
};

function repSegments(travel: number, eccentricSeconds: number, concentricSeconds: number[], topPause: number): Segment[] {
  return concentricSeconds.flatMap((seconds) => [
    { seconds: eccentricSeconds, travel: -travel },
    { seconds: 0.15, travel: 0 },
    { seconds, travel },
    { seconds: topPause, travel: 0 },
  ]);
}

const scenarios: Scenario[] = [
  {
    file: "demo-squat-failure.json",
    setup: { exercise: "Squat", mount: "Forearm", loadLb: 225 },
    label: { actualReps: 8, reachedFailure: true, note: "Synthetic: 8 slowing reps, rep 9 stalls at 40% and is lowered." },
    axis: [0.3, -0.8, 0.5],
    segments: [
      { seconds: 2.5, travel: 0 },
      ...repSegments(0.5, 1.6, [0.8, 0.85, 0.9, 1.0, 1.1, 1.25, 1.45, 1.75], 0.6),
      { seconds: 1.6, travel: -0.5 },
      { seconds: 0.15, travel: 0 },
      { seconds: 1.5, travel: 0.2 },
      { seconds: 1.0, travel: 0 },
      { seconds: 1.2, travel: -0.2 },
      { seconds: 3, travel: 0 },
    ],
  },
  {
    file: "demo-pullup-stopped-short.json",
    setup: { exercise: "Pull-up", mount: "Chest", loadLb: 0 },
    label: { actualReps: 7, reachedFailure: false, note: "Synthetic: 7 reps, last rep still fast, then the lifter drops off the bar." },
    axis: [-0.2, 0.9, 0.35],
    segments: [
      { seconds: 2.5, travel: 0 },
      ...[0.7, 0.72, 0.75, 0.8, 0.86, 0.94, 1.02].flatMap((seconds) => [
        { seconds, travel: 0.45 },
        { seconds: 0.3, travel: 0 },
        { seconds: 1.2, travel: -0.45 },
        { seconds: 0.3, travel: 0 },
      ]),
      { seconds: 60, travel: 0 },
    ],
  },
];

mkdirSync(outputDirectory, { recursive: true });
for (const scenario of scenarios) {
  const trace = buildTrace(scenario);
  const path = `${outputDirectory}/${scenario.file}`;
  writeFileSync(path, JSON.stringify(trace));
  console.log(`Wrote ${trace.samples.length} samples to ${path}`);
}

function buildTrace(scenario: Scenario): Trace {
  const axis = normalize(scenario.axis);
  let seed = 7;
  const gaussian = () => {
    seed = (seed * 16807) % 2147483647;
    const u = seed / 2147483647;
    seed = (seed * 16807) % 2147483647;
    const v = seed / 2147483647;
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const samples: MotionSample[] = [];
  let t = 0;
  for (const segment of scenario.segments) {
    const count = Math.round(segment.seconds * sampleRateHz);
    const moving = segment.travel !== 0;
    for (let i = 0; i < count; i++) {
      const tau = i / sampleRateHz;
      const acceleration = moving
        ? ((segment.travel * Math.PI ** 2) / (2 * segment.seconds ** 2)) * Math.cos((Math.PI * tau) / segment.seconds)
        : 0;
      const a = acceleration + accelerationBias;
      samples.push({
        t: round(t),
        ax: round(a * axis[0] + gaussian() * noise),
        ay: round(a * axis[1] + gaussian() * noise),
        az: round(a * axis[2] + gaussian() * noise),
        gx: round(gravity * axis[0]),
        gy: round(gravity * axis[1]),
        gz: round(gravity * axis[2]),
        rx: round(gaussian() * (moving ? 12 : 1)),
        ry: round(gaussian() * (moving ? 12 : 1)),
        rz: round(gaussian() * (moving ? 12 : 1)),
      });
      t += 1 / sampleRateHz;
    }
  }

  return {
    version: 1,
    recordedAt: "2026-11-15T00:00:00.000Z",
    platform: "synthetic",
    requestedIntervalMs: 10,
    setup: scenario.setup,
    label: scenario.label,
    samples,
  };
}

function normalize(vector: number[]): number[] {
  const length = Math.hypot(...vector);
  return vector.map((value) => value / length);
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
