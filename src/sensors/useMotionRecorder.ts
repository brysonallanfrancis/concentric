import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { DeviceMotion, type DeviceMotionMeasurement } from "expo-sensors";
import { useEffect, useRef, useState } from "react";
import { verticalAcceleration } from "@/engine/vertical";
import type { MotionSample } from "./trace";

export const requestedIntervalMs = 10;

const countdownSeconds = 3;
export const liveWindowSize = 300;
const uiRefreshSeconds = 0.1;
const keepAwakeTag = "recording";

export type RecorderStatus = "idle" | "countdown" | "recording";

export type LiveStats = {
  elapsedSeconds: number;
  sampleCount: number;
  sampleRateHz: number;
  recentVertical: number[];
};

const emptyStats: LiveStats = { elapsedSeconds: 0, sampleCount: 0, sampleRateHz: 0, recentVertical: [] };

export function useMotionRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [countdown, setCountdown] = useState(0);
  const [live, setLive] = useState<LiveStats>(emptyStats);

  const samples = useRef<MotionSample[]>([]);
  const recentVertical = useRef<number[]>([]);
  const subscription = useRef<{ remove: () => void } | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const firstTimestamp = useRef<number | null>(null);
  const lastRefresh = useRef(0);

  useEffect(() => {
    return () => {
      subscription.current?.remove();
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      deactivateKeepAwake(keepAwakeTag);
    };
  }, []);

  async function start(): Promise<string | null> {
    if (!(await DeviceMotion.isAvailableAsync())) {
      return "Motion sensors aren't available on this device.";
    }
    const permission = await DeviceMotion.requestPermissionsAsync();
    if (!permission.granted) {
      return "Concentric needs Motion & Fitness access to measure your reps. You can turn it on in Settings.";
    }

    await activateKeepAwakeAsync(keepAwakeTag);
    setLive(emptyStats);
    setStatus("countdown");
    setCountdown(countdownSeconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let remaining = countdownSeconds;
    countdownTimer.current = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }
      clearCountdown();
      beginRecording();
    }, 1000);
    return null;
  }

  function beginRecording() {
    samples.current = [];
    recentVertical.current = [];
    firstTimestamp.current = null;
    lastRefresh.current = 0;
    DeviceMotion.setUpdateInterval(requestedIntervalMs);
    subscription.current = DeviceMotion.addListener(handleMeasurement);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatus("recording");
  }

  function handleMeasurement(measurement: DeviceMotionMeasurement) {
    const sample = toSample(measurement);
    if (!sample) return;
    samples.current.push(sample);

    recentVertical.current.push(verticalAcceleration(sample));
    if (recentVertical.current.length > liveWindowSize) recentVertical.current.shift();

    const elapsedSeconds = sample.t;
    if (elapsedSeconds - lastRefresh.current < uiRefreshSeconds) return;
    lastRefresh.current = elapsedSeconds;
    setLive({
      elapsedSeconds,
      sampleCount: samples.current.length,
      sampleRateHz: elapsedSeconds > 0 ? (samples.current.length - 1) / elapsedSeconds : 0,
      recentVertical: [...recentVertical.current],
    });
  }

  function toSample(measurement: DeviceMotionMeasurement): MotionSample | null {
    const { acceleration, accelerationIncludingGravity: total, rotationRate } = measurement;
    if (!acceleration) return null;
    if (firstTimestamp.current === null) firstTimestamp.current = acceleration.timestamp;
    return {
      t: round(acceleration.timestamp - firstTimestamp.current, 6),
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
  }

  function clearCountdown() {
    if (countdownTimer.current) clearInterval(countdownTimer.current);
    countdownTimer.current = null;
  }

  function stop(): MotionSample[] {
    clearCountdown();
    subscription.current?.remove();
    subscription.current = null;
    deactivateKeepAwake(keepAwakeTag);
    setStatus("idle");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return samples.current;
  }

  return { status, countdown, live, start, stop };
}

function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
