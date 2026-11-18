import type { DeviceMotionMeasurement } from "expo-sensors";
import type { MotionSample } from "./trace";

export function createSampleConverter() {
  let firstTimestamp: number | null = null;

  return function toSample(measurement: DeviceMotionMeasurement): MotionSample | null {
    const { acceleration, accelerationIncludingGravity: total, rotationRate } = measurement;
    if (!acceleration) return null;
    if (firstTimestamp === null) firstTimestamp = acceleration.timestamp;
    return {
      t: round(acceleration.timestamp - firstTimestamp, 6),
      ax: round(acceleration.x),
      ay: round(acceleration.y),
      az: round(acceleration.z),
      gx: round(total.x - acceleration.x),
      gy: round(total.y - acceleration.y),
      gz: round(total.z - acceleration.z),
      rx: round(rotationRate?.alpha ?? 0, 2),
      ry: round(rotationRate?.beta ?? 0, 2),
      rz: round(rotationRate?.gamma ?? 0, 2),
    };
  };
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
