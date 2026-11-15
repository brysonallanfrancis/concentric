import { writeFileSync } from "node:fs";
import type { MotionSample, Trace } from "@/sensors/trace";

const sampleRateHz = 100;
const gravity = 9.80665;
const accelerationBias = 0.04;
const noise = 0.08;

type Segment = { seconds: number; travel: number };

const segments: Segment[] = [{ seconds: 2, travel: 0 }];
const concentricSeconds = [0.8, 0.85, 0.9, 1.0, 1.1, 1.25, 1.45, 1.75];
for (const seconds of concentricSeconds) {
  segments.push({ seconds: 1.6, travel: -0.5 }, { seconds: 0.15, travel: 0 }, { seconds, travel: 0.5 }, { seconds: 0.6, travel: 0 });
}
segments.push(
  { seconds: 1.6, travel: -0.5 },
  { seconds: 0.15, travel: 0 },
  { seconds: 1.5, travel: 0.2 },
  { seconds: 1.0, travel: 0 },
  { seconds: 1.2, travel: -0.2 },
  { seconds: 2, travel: 0 },
);

const axis = normalize([0.3, -0.8, 0.5]);
let seed = 7;
const samples: MotionSample[] = [];
let t = 0;

for (const segment of segments) {
  const count = Math.round(segment.seconds * sampleRateHz);
  for (let i = 0; i < count; i++) {
    const tau = i / sampleRateHz;
    const acceleration =
      segment.travel === 0
        ? 0
        : ((segment.travel * Math.PI ** 2) / (2 * segment.seconds ** 2)) * Math.cos((Math.PI * tau) / segment.seconds);
    const moving = segment.travel !== 0;
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

const trace: Trace = {
  version: 1,
  recordedAt: "2026-11-15T00:00:00.000Z",
  platform: "synthetic",
  requestedIntervalMs: 10,
  setup: { exercise: "Squat", mount: "Forearm", loadLb: 225 },
  label: { actualReps: 8, reachedFailure: true, note: "Synthetic: 8 slowing reps, rep 9 stalls at 40% and is lowered." },
  samples,
};

const path = process.argv[2] ?? "__fixtures__/traces/synthetic-squat-failure.json";
writeFileSync(path, JSON.stringify(trace));
console.log(`Wrote ${samples.length} samples to ${path}`);

function normalize(vector: number[]): number[] {
  const length = Math.hypot(...vector);
  return vector.map((value) => value / length);
}

function gaussian(): number {
  seed = (seed * 16807) % 2147483647;
  const u = seed / 2147483647;
  seed = (seed * 16807) % 2147483647;
  const v = seed / 2147483647;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
