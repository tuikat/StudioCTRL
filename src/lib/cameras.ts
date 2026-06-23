// Central state for the 8 camera slots: persistence, selection, link mode,
// connection + polling, and a dispatch helper that targets one camera or all.

import { writable, get as getStore, derived } from "svelte/store";
import {
  type CameraConfig,
  type CameraState,
  emptyState,
} from "./types";
import * as api from "./api";

export const SLOT_COUNT = 8;
const STORE_KEY = "studioctrl.cameras.v1";

function defaultConfigs(): CameraConfig[] {
  return Array.from({ length: SLOT_COUNT }, (_, i) => ({
    id: i + 1,
    name: `Camera ${i + 1}`,
    host: "",
    enabled: false,
  }));
}

function loadConfigs(): CameraConfig[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultConfigs();
    const parsed = JSON.parse(raw) as CameraConfig[];
    const base = defaultConfigs();
    // Merge persisted values onto defaults so the array is always length 8.
    for (const c of parsed) {
      if (c && c.id >= 1 && c.id <= SLOT_COUNT) {
        base[c.id - 1] = { ...base[c.id - 1], ...c };
      }
    }
    return base;
  } catch {
    return defaultConfigs();
  }
}

export const configs = writable<CameraConfig[]>(loadConfigs());
configs.subscribe((c) => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(c));
  } catch {
    /* ignore quota / unavailable storage */
  }
});

// Live state per slot (index 0..7), not persisted.
export const states = writable<CameraState[]>(
  Array.from({ length: SLOT_COUNT }, () => emptyState()),
);

// Currently selected slot id (1..8).
export const selected = writable<number>(1);

// Link mode: when on, control changes are sent to every online camera.
export const linkMode = writable<boolean>(false);

export const selectedConfig = derived(
  [configs, selected],
  ([$configs, $selected]) => $configs[$selected - 1],
);
export const selectedState = derived(
  [states, selected],
  ([$states, $selected]) => $states[$selected - 1],
);

export function updateConfig(id: number, patch: Partial<CameraConfig>) {
  configs.update((list) => {
    const next = [...list];
    next[id - 1] = { ...next[id - 1], ...patch };
    return next;
  });
}

function patchState(id: number, patch: Partial<CameraState>) {
  states.update((list) => {
    const next = [...list];
    next[id - 1] = { ...next[id - 1], ...patch };
    return next;
  });
}

export function patchValues(id: number, patch: Partial<CameraState["values"]>) {
  states.update((list) => {
    const next = [...list];
    next[id - 1] = {
      ...next[id - 1],
      values: { ...next[id - 1].values, ...patch },
    };
    return next;
  });
}

/** Connect to a camera slot: probe + load capabilities + initial poll. */
export async function connect(id: number): Promise<void> {
  const cfg = getStore(configs)[id - 1];
  if (!cfg.host.trim()) {
    patchState(id, { status: "error", error: "No host/IP set" });
    return;
  }
  patchState(id, { status: "connecting", error: null });
  try {
    const model = await api.probe(cfg.host);
    patchState(id, { status: "online", model, error: null });
    // Capabilities (best-effort; ignore failures).
    const [isos, gains, shutters, wbRange, tintRange] = await Promise.all([
      api.getSupportedISOs(cfg.host).catch(() => []),
      api.getSupportedGains(cfg.host).catch(() => []),
      api.getSupportedShutters(cfg.host).catch(() => []),
      api.getRange(cfg.host, "control/api/v1/video/whiteBalance/description").catch(() => null),
      api.getRange(cfg.host, "control/api/v1/video/whiteBalanceTint/description").catch(() => null),
    ]);
    patchState(id, {
      supportedISOs: isos,
      supportedGains: gains,
      supportedShutterSpeeds: shutters,
      whiteBalanceRange: wbRange,
      whiteBalanceTintRange: tintRange,
    });
    await poll(id);
  } catch (e) {
    patchState(id, {
      status: "error",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}

export function disconnect(id: number) {
  patchState(id, { status: "offline", error: null });
}

/** Refresh volatile values (record state + timecode) for a slot. */
export async function poll(id: number): Promise<void> {
  const cfg = getStore(configs)[id - 1];
  const st = getStore(states)[id - 1];
  if (st.status !== "online" || !cfg.host) return;
  const [recording, timecode] = await Promise.all([
    api.getRecording(cfg.host).catch(() => null),
    api.getTimecode(cfg.host).catch(() => null),
  ]);
  patchValues(id, { recording, timecode });
}

/**
 * Run an action against a target camera. When link mode is on and `respectLink`
 * is true, the action is fanned out to every online camera instead.
 */
export async function dispatch(
  id: number,
  action: (host: string, targetId: number) => Promise<unknown>,
  respectLink = true,
): Promise<void> {
  const linked = getStore(linkMode);
  const $configs = getStore(configs);
  const $states = getStore(states);

  const targets: number[] =
    respectLink && linked
      ? $states
          .map((s, i) => ({ s, id: i + 1 }))
          .filter((x) => x.s.status === "online")
          .map((x) => x.id)
      : [id];

  await Promise.allSettled(
    targets.map((tid) => {
      const host = $configs[tid - 1].host;
      if (!host) return Promise.resolve();
      return action(host, tid);
    }),
  );
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

/** Start background polling of online cameras (record state + timecode). */
export function startPolling(intervalMs = 1500) {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    const $states = getStore(states);
    $states.forEach((s, i) => {
      if (s.status === "online") void poll(i + 1);
    });
  }, intervalMs);
}

export function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

/** Connect every enabled slot that has a host configured. */
export async function connectAllEnabled() {
  const $configs = getStore(configs);
  await Promise.allSettled(
    $configs
      .filter((c) => c.enabled && c.host.trim())
      .map((c) => connect(c.id)),
  );
}
