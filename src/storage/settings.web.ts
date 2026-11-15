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
  const json = typeof localStorage === "undefined" ? null : localStorage.getItem(storageKey);
  return json ? { ...defaultSettings, ...JSON.parse(json) } : defaultSettings;
}

export function saveSettings(settings: Settings) {
  if (typeof localStorage !== "undefined") localStorage.setItem(storageKey, JSON.stringify(settings));
}
