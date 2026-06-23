// In-app activity log. Records every control request (writes + any failures)
// so the user can see exactly what the camera returned.

import { writable, derived } from "svelte/store";

export interface LogEntry {
  id: number;
  time: string; // HH:MM:SS
  host: string;
  method: string;
  path: string; // short path, without the control/api/v1 prefix
  status: number; // 0 = no HTTP response (connection/proxy error)
  ok: boolean;
  ms: number;
  reqBody?: unknown;
  resBody?: unknown;
  error?: string;
}

const MAX = 300;
let seq = 0;

export const logs = writable<LogEntry[]>([]);
export const logErrorCount = derived(logs, ($l) => $l.filter((e) => !e.ok).length);

export function addLog(e: Omit<LogEntry, "id" | "time">) {
  const time = new Date().toTimeString().slice(0, 8);
  logs.update((list) => {
    const next = [{ ...e, id: ++seq, time }, ...list];
    if (next.length > MAX) next.length = MAX;
    return next;
  });
}

export function clearLogs() {
  logs.set([]);
}

/** Human-readable hint for common camera REST API status codes. */
export function statusHint(status: number): string {
  switch (status) {
    case 0:
      return "No response. Check the camera address and that it is reachable on the network.";
    case 200:
    case 204:
      return "OK";
    case 400:
      return "Bad request: the value is invalid or out of range for this camera.";
    case 403:
      return "Rejected: not changeable in the current state (often because auto exposure / auto focus is on, or the control is read-only).";
    case 404:
      return "Not found: this endpoint does not exist on the camera's firmware.";
    case 501:
      return "Not implemented: this camera or lens does not support this control.";
    default:
      return status >= 500 ? "Camera error." : "Request was not accepted.";
  }
}
