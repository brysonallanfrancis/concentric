import type { SetRecord } from "@/models/types";

const storageKey = "sets";

export function loadSets(): SetRecord[] {
  const json = typeof localStorage === "undefined" ? null : localStorage.getItem(storageKey);
  const sets: SetRecord[] = json ? JSON.parse(json) : [];
  return sets.sort((a, b) => b.performedAt.localeCompare(a.performedAt));
}

function write(sets: SetRecord[]) {
  if (typeof localStorage !== "undefined") localStorage.setItem(storageKey, JSON.stringify(sets));
}

export function saveSets(sets: SetRecord[]) {
  const ids = new Set(sets.map((set) => set.id));
  write([...loadSets().filter((set) => !ids.has(set.id)), ...sets]);
}

export function saveNote(id: string, note: string) {
  write(loadSets().map((set) => (set.id === id ? { ...set, note } : set)));
}

export function deleteAllSets() {
  write([]);
}
