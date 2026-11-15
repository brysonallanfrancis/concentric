import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { traceFileName, type Trace } from "./trace";

function tracesDirectory(): Directory {
  return new Directory(Paths.document, "traces");
}

export type SavedTrace = {
  name: string;
  uri: string;
  sizeKb: number;
};

export function saveTrace(trace: Trace): SavedTrace {
  const directory = tracesDirectory();
  directory.create({ idempotent: true });
  const file = new File(directory, traceFileName(trace));
  file.create({ overwrite: true });
  file.write(JSON.stringify(trace));
  return toSavedTrace(file);
}

export function listTraces(): SavedTrace[] {
  const directory = tracesDirectory();
  if (!directory.exists) return [];
  return directory
    .list()
    .filter((entry): entry is File => entry instanceof File && entry.name.endsWith(".json"))
    .map(toSavedTrace)
    .sort((a, b) => b.name.localeCompare(a.name));
}

export function deleteTrace(trace: SavedTrace) {
  new File(trace.uri).delete();
}

export async function shareTrace(trace: SavedTrace) {
  await Sharing.shareAsync(trace.uri, {
    mimeType: "application/json",
    UTI: "public.json",
    dialogTitle: trace.name,
  });
}

function toSavedTrace(file: File): SavedTrace {
  return { name: file.name, uri: file.uri, sizeKb: Math.round((file.size ?? 0) / 1024) };
}
