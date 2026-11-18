import { createContext, use, useState, type ReactNode } from "react";
import type { SetRecord } from "@/models/types";
import { deleteAllSets, loadSets, saveNote, saveSets } from "@/storage/history";

type HistoryContextValue = {
  sets: SetRecord[];
  addSets: (sets: SetRecord[]) => void;
  updateNote: (id: string, note: string) => void;
  clearHistory: () => void;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [sets, setSets] = useState<SetRecord[]>(loadSets);

  function addSets(newSets: SetRecord[]) {
    saveSets(newSets);
    setSets(loadSets());
  }

  function updateNote(id: string, note: string) {
    saveNote(id, note);
    setSets(sets.map((set) => (set.id === id ? { ...set, note } : set)));
  }

  function clearHistory() {
    deleteAllSets();
    setSets([]);
  }

  return <HistoryContext value={{ sets, addSets, updateNote, clearHistory }}>{children}</HistoryContext>;
}

export function useHistory(): HistoryContextValue {
  const value = use(HistoryContext);
  if (!value) throw new Error("useHistory must be used inside HistoryProvider");
  return value;
}
