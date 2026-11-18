import { DeviceMotion } from "expo-sensors";
import { createSampleConverter } from "./motionSample";
import type { MotionSample, Trace } from "./trace";

export const sensorIntervalMs = 10;
const replayTickMs = 50;

export type SensorSource = {
  start: (onSample: (sample: MotionSample) => void) => Promise<string | null>;
  stop: () => void;
};

export function createLiveSensorSource(): SensorSource {
  let subscription: { remove: () => void } | null = null;

  return {
    async start(onSample) {
      if (!(await DeviceMotion.isAvailableAsync())) {
        return "Motion sensors aren't available on this device.";
      }
      const permission = await DeviceMotion.requestPermissionsAsync();
      if (!permission.granted) {
        return "Concentric needs Motion & Fitness access to measure your reps. You can turn it on in Settings.";
      }
      const toSample = createSampleConverter();
      DeviceMotion.setUpdateInterval(sensorIntervalMs);
      subscription = DeviceMotion.addListener((measurement) => {
        const sample = toSample(measurement);
        if (sample) onSample(sample);
      });
      return null;
    },
    stop() {
      subscription?.remove();
      subscription = null;
    },
  };
}

export function createReplaySensorSource(trace: Trace): SensorSource {
  let timer: ReturnType<typeof setInterval> | null = null;

  return {
    async start(onSample) {
      let next = 0;
      let elapsed = 0;
      timer = setInterval(() => {
        elapsed += replayTickMs / 1000;
        while (next < trace.samples.length && trace.samples[next].t <= elapsed) {
          onSample(trace.samples[next]);
          next++;
        }
        if (next >= trace.samples.length && timer) clearInterval(timer);
      }, replayTickMs);
      return null;
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
    },
  };
}
