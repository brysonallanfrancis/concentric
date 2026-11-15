import type { MotionSample } from "@/sensors/trace";

export function verticalAcceleration(sample: MotionSample): number {
  const gravityLength = Math.hypot(sample.gx, sample.gy, sample.gz);
  if (gravityLength === 0) return 0;
  return (sample.ax * sample.gx + sample.ay * sample.gy + sample.az * sample.gz) / gravityLength;
}
