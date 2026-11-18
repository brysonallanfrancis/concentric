import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect, useRef, useState } from "react";
import { initialCalibration, isCalibrated, summarizeLiveSet, updateCalibration } from "@/engine/liveSet";
import { failureBuzz, repTap, successBuzz } from "@/lib/haptics";
import type { RepResult } from "@/models/types";
import type { SensorSource } from "@/sensors/sensorSource";
import type { MotionSample } from "@/sensors/trace";

export type LivePhase = "ready" | "calibrating" | "tracking";

const analysisIntervalSeconds = 0.25;
const keepAwakeTag = "live-set";

type Options = {
  haptics: boolean;
  onFailureDetected: (reps: RepResult[]) => void;
};

export function useLiveSet({ haptics, onFailureDetected }: Options) {
  const [phase, setPhase] = useState<LivePhase>("ready");
  const [reps, setReps] = useState<RepResult[]>([]);

  const source = useRef<SensorSource | null>(null);
  const samples = useRef<MotionSample[]>([]);
  const phaseRef = useRef<LivePhase>("ready");
  const calibration = useRef(initialCalibration);
  const lastAnalysisT = useRef(0);
  const repCount = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    return () => {
      source.current?.stop();
      deactivateKeepAwake(keepAwakeTag);
    };
  }, []);

  function changePhase(next: LivePhase) {
    phaseRef.current = next;
    setPhase(next);
  }

  async function begin(sensorSource: SensorSource): Promise<string | null> {
    samples.current = [];
    calibration.current = initialCalibration;
    lastAnalysisT.current = 0;
    repCount.current = 0;
    finished.current = false;
    setReps([]);
    source.current = sensorSource;
    changePhase("calibrating");
    repTap(haptics);
    await activateKeepAwakeAsync(keepAwakeTag);
    const error = await sensorSource.start(handleSample);
    if (error) {
      stop();
      changePhase("ready");
    }
    return error;
  }

  function handleSample(sample: MotionSample) {
    if (finished.current) return;
    samples.current.push(sample);

    if (phaseRef.current === "calibrating") {
      calibration.current = updateCalibration(calibration.current, sample);
      if (isCalibrated(calibration.current, sample)) {
        changePhase("tracking");
        successBuzz(haptics);
      }
      return;
    }

    if (sample.t - lastAnalysisT.current < analysisIntervalSeconds) return;
    lastAnalysisT.current = sample.t;

    const snapshot = summarizeLiveSet(samples.current);
    if (snapshot.reps.length !== repCount.current) {
      const newest = snapshot.reps[snapshot.reps.length - 1];
      if (snapshot.reps.length > repCount.current && newest) {
        if (newest.failed) failureBuzz(haptics);
        else repTap(haptics);
      }
      repCount.current = snapshot.reps.length;
      setReps(snapshot.reps);
    }
    if (snapshot.endedByFailure) {
      finished.current = true;
      stop();
      onFailureDetected(snapshot.reps);
    }
  }

  function stop() {
    source.current?.stop();
    deactivateKeepAwake(keepAwakeTag);
  }

  return { phase, reps, begin, stop };
}
