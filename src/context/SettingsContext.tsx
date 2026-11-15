import { createContext, use, useState, type ReactNode } from "react";
import type { Settings } from "@/models/types";
import { loadSettings, saveSettings } from "@/storage/settings";

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (changes: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  function updateSettings(changes: Partial<Settings>) {
    const next = { ...settings, ...changes };
    saveSettings(next);
    setSettings(next);
  }

  return <SettingsContext value={{ settings, updateSettings }}>{children}</SettingsContext>;
}

export function useSettings(): SettingsContextValue {
  const value = use(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
