// Thin client over the Rust `camera_request` proxy command.
//
// We proxy every HTTP call through Rust (reqwest) rather than calling fetch()
// from the webview, because:
//   * the camera REST API does not send CORS headers, and
//   * the webview runs in a secure context, which blocks plain-http requests.
// Rust has neither restriction.

import { invoke } from "@tauri-apps/api/core";
import type { ApiResponse, ColorWheelValue } from "./types";

const API_BASE = "control/api/v1";

async function request(
  host: string,
  method: "GET" | "PUT" | "POST",
  path: string,
  body?: unknown,
): Promise<ApiResponse> {
  return invoke<ApiResponse>("camera_request", {
    host,
    method,
    path: `${API_BASE}/${path}`,
    body: body ?? null,
  });
}

export const get = (host: string, path: string) => request(host, "GET", path);
export const put = (host: string, path: string, body: unknown) =>
  request(host, "PUT", path, body);
export const post = (host: string, path: string, body?: unknown) =>
  request(host, "POST", path, body);

// ---- Connection / discovery ------------------------------------------------

/** Probe a camera; returns a model string on success, throws on failure. */
export async function probe(host: string): Promise<string> {
  const res = await get(host, "system");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const sys = res.body as Record<string, unknown> | null;
  // The REST API exposes a model name under a few possible keys across firmware.
  const model =
    (sys?.["deviceName"] as string) ||
    (sys?.["model"] as string) ||
    (sys?.["name"] as string) ||
    "Blackmagic Camera";
  return model;
}

// ---- Exposure --------------------------------------------------------------

export const setIso = (host: string, iso: number) =>
  put(host, "video/iso", { iso });

export const setGain = (host: string, gain: number) =>
  put(host, "video/gain", { gain });

export const setWhiteBalance = (host: string, whiteBalance: number) =>
  put(host, "video/whiteBalance", { whiteBalance });

export const setWhiteBalanceTint = (host: string, whiteBalanceTint: number) =>
  put(host, "video/whiteBalanceTint", { whiteBalanceTint });

export const autoWhiteBalance = (host: string) =>
  put(host, "video/whiteBalance/doAuto", {});

export const setShutterAngle = (host: string, shutterAngle: number) =>
  put(host, "video/shutter", { shutterAngle });

export const setShutterSpeed = (host: string, shutterSpeed: number) =>
  put(host, "video/shutter", { shutterSpeed });

export const setShutterMeasurement = (
  host: string,
  measurement: "ShutterAngle" | "ShutterSpeed",
) => put(host, "video/shutter/measurement", { measurement });

export const setAutoExposure = (host: string, mode: string, type: string) =>
  put(host, "video/autoExposure", { mode, type });

// ---- Lens ------------------------------------------------------------------

export const setIrisStop = (host: string, apertureStop: number) =>
  put(host, "lens/iris", { apertureStop });

export const setIrisNormalised = (host: string, normalised: number) =>
  put(host, "lens/iris", { normalised });

export const setFocus = (host: string, normalised: number) =>
  put(host, "lens/focus", { normalised });

export const doAutoFocus = (host: string, x = 0.5, y = 0.5) =>
  put(host, "lens/focus/doAutoFocus", { position: { x, y } });

export const setZoom = (host: string, normalised: number) =>
  put(host, "lens/zoom", { normalised });

export const setOis = (host: string, enabled: boolean) =>
  put(host, "lens/opticalImageStabilization", { enabled });

// ---- Color correction ------------------------------------------------------

export const setLift = (host: string, v: ColorWheelValue) =>
  put(host, "colorCorrection/lift", v);
export const setGamma = (host: string, v: ColorWheelValue) =>
  put(host, "colorCorrection/gamma", v);
export const setColorGain = (host: string, v: ColorWheelValue) =>
  put(host, "colorCorrection/gain", v);
export const setOffset = (host: string, v: ColorWheelValue) =>
  put(host, "colorCorrection/offset", v);
export const setContrast = (host: string, pivot: number, adjust: number) =>
  put(host, "colorCorrection/contrast", { pivot, adjust });
export const setColorAdjust = (host: string, hue: number, saturation: number) =>
  put(host, "colorCorrection/color", { hue, saturation });
export const setLumaMix = (host: string, lumaContribution: number) =>
  put(host, "colorCorrection/lumaContribution", { lumaContribution });

// ---- Record / transport ----------------------------------------------------

export const startRecord = (host: string, clipName?: string) =>
  post(host, "transports/0/record", clipName ? { clipName } : {});

export const stopRecord = (host: string) => post(host, "transports/0/stop");

export async function getRecording(host: string): Promise<boolean | null> {
  const res = await get(host, "transports/0/record");
  if (!res.ok) return null;
  const b = res.body as Record<string, unknown> | null;
  return (b?.["recording"] as boolean) ?? null;
}

export async function getTimecode(host: string): Promise<string | null> {
  const res = await get(host, "transports/0/timecode");
  if (!res.ok) return null;
  const b = res.body as Record<string, unknown> | null;
  return (b?.["display"] as string) ?? (b?.["timecode"] as string) ?? null;
}

// ---- Capability discovery --------------------------------------------------

async function getArray(host: string, path: string, key: string): Promise<number[]> {
  const res = await get(host, path);
  if (!res.ok) return [];
  const b = res.body as Record<string, unknown> | null;
  const arr = (b?.[key] as number[]) ?? (Array.isArray(b) ? (b as number[]) : []);
  return Array.isArray(arr) ? arr : [];
}

export const getSupportedISOs = (host: string) =>
  getArray(host, "video/supportedISOs", "supportedISOs");
export const getSupportedGains = (host: string) =>
  getArray(host, "video/supportedGains", "supportedGains");
export const getSupportedShutters = (host: string) =>
  getArray(host, "video/supportedShutters", "supportedShutterSpeeds");

export async function getRange(
  host: string,
  path: string,
): Promise<{ min: number; max: number } | null> {
  const res = await get(host, path);
  if (!res.ok) return null;
  const b = res.body as Record<string, unknown> | null;
  if (b && typeof b["min"] === "number" && typeof b["max"] === "number") {
    return { min: b["min"] as number, max: b["max"] as number };
  }
  return null;
}
