import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import type { Goal, MountType, SetOutcome, SetRecord } from "@/models/types";

type SetRow = {
  id: string;
  exercise_id: string;
  performed_at: string;
  load_lb: number;
  mount: MountType;
  goal: Goal;
  reps: string;
  outcome: SetOutcome;
  reps_left_estimate: number;
  note: string;
};

let database: SQLiteDatabase | null = null;

function db(): SQLiteDatabase {
  if (!database) {
    database = openDatabaseSync("concentric.db");
    database.execSync(`
      CREATE TABLE IF NOT EXISTS sets (
        id TEXT PRIMARY KEY NOT NULL,
        exercise_id TEXT NOT NULL,
        performed_at TEXT NOT NULL,
        load_lb REAL NOT NULL,
        mount TEXT NOT NULL,
        goal TEXT NOT NULL,
        reps TEXT NOT NULL,
        outcome TEXT NOT NULL,
        reps_left_estimate INTEGER NOT NULL,
        note TEXT NOT NULL DEFAULT ''
      );
    `);
  }
  return database;
}

export function loadSets(): SetRecord[] {
  return db()
    .getAllSync<SetRow>("SELECT * FROM sets ORDER BY performed_at DESC")
    .map((row) => ({
      id: row.id,
      exerciseId: row.exercise_id,
      performedAt: row.performed_at,
      loadLb: row.load_lb,
      mount: row.mount,
      goal: row.goal,
      reps: JSON.parse(row.reps),
      outcome: row.outcome,
      repsLeftEstimate: row.reps_left_estimate,
      note: row.note,
    }));
}

export function saveSets(sets: SetRecord[]) {
  db().withTransactionSync(() => {
    for (const set of sets) {
      db().runSync(
        "INSERT OR REPLACE INTO sets (id, exercise_id, performed_at, load_lb, mount, goal, reps, outcome, reps_left_estimate, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        set.id,
        set.exerciseId,
        set.performedAt,
        set.loadLb,
        set.mount,
        set.goal,
        JSON.stringify(set.reps),
        set.outcome,
        set.repsLeftEstimate,
        set.note,
      );
    }
  });
}

export function saveNote(id: string, note: string) {
  db().runSync("UPDATE sets SET note = ? WHERE id = ?", note, id);
}

export function deleteAllSets() {
  db().runSync("DELETE FROM sets");
}
