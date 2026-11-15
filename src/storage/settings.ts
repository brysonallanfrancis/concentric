import Storage from "expo-sqlite/kv-store";
import type { Settings } from "@/models/types";

const storageKey = "settings";

export const defaultSettings: Settings = {
  onboarded: false,
  goal: "hypertrophy",
  oneSetPerExercise: true,
  trackNegatives: true,
  units: "lb",
  bodyweightLb: 180,
  haptics: true,
  demoMode: false,
};

export function loadSettings(): Settings {
  const json = Storage.getItemSync(storageKey);
  return json ? { ...defaultSettings, ...JSON.parse(json) } : defaultSettings;
}

export function saveSettings(settings: Settings) {
  Storage.setItemSync(storageKey, JSON.stringify(settings));
}
