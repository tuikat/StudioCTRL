// Shared types for StudioCTRL.

export type CameraStatus = "offline" | "connecting" | "online" | "error";

/** Persisted, user-editable configuration for one of the 8 camera slots. */
export interface CameraConfig {
  id: number; // 1..8
  name: string;
  host: string; // e.g. "192.168.1.50", "studiocam1.local", or with scheme/port
  enabled: boolean;
}

/** Live, in-memory state for a camera (not persisted). */
export interface CameraState {
  status: CameraStatus;
  model: string | null;
  error: string | null;
  // Cached supported-value lists fetched on connect.
  supportedISOs: number[];
  supportedGains: number[];
  supportedShutterSpeeds: number[];
  whiteBalanceRange: { min: number; max: number } | null;
  whiteBalanceTintRange: { min: number; max: number } | null;
  // Latest known values (best-effort, refreshed by polling).
  values: CameraValues;
}

export interface CameraValues {
  iso: number | null;
  gain: number | null;
  whiteBalance: number | null;
  whiteBalanceTint: number | null;
  shutterAngle: number | null;
  shutterSpeed: number | null;
  shutterMeasurement: "ShutterAngle" | "ShutterSpeed" | null;
  irisApertureStop: number | null;
  irisNormalised: number | null;
  focusNormalised: number | null;
  zoomNormalised: number | null;
  ois: boolean | null;
  autoExposureMode: string | null;
  recording: boolean | null;
  timecode: string | null;
  lift: ColorWheelValue;
  gamma: ColorWheelValue;
  gain_cc: ColorWheelValue;
  offset: ColorWheelValue;
  contrast: { pivot: number; adjust: number } | null;
  color: { hue: number; saturation: number } | null;
  lumaMix: number | null;
}

export interface ColorWheelValue {
  red: number;
  green: number;
  blue: number;
  luma: number;
}

export function emptyValues(): CameraValues {
  return {
    iso: null,
    gain: null,
    whiteBalance: null,
    whiteBalanceTint: null,
    shutterAngle: null,
    shutterSpeed: null,
    shutterMeasurement: null,
    irisApertureStop: null,
    irisNormalised: null,
    focusNormalised: null,
    zoomNormalised: null,
    ois: null,
    autoExposureMode: null,
    recording: null,
    timecode: null,
    lift: { red: 0, green: 0, blue: 0, luma: 0 },
    gamma: { red: 0, green: 0, blue: 0, luma: 0 },
    gain_cc: { red: 1, green: 1, blue: 1, luma: 1 },
    offset: { red: 0, green: 0, blue: 0, luma: 0 },
    contrast: { pivot: 0.5, adjust: 1 },
    color: { hue: 0, saturation: 1 },
    lumaMix: 1,
  };
}

export function emptyState(): CameraState {
  return {
    status: "offline",
    model: null,
    error: null,
    supportedISOs: [],
    supportedGains: [],
    supportedShutterSpeeds: [],
    whiteBalanceRange: null,
    whiteBalanceTintRange: null,
    values: emptyValues(),
  };
}

/** Response shape returned by the Rust `camera_request` command. */
export interface ApiResponse {
  status: number;
  ok: boolean;
  body: unknown | null;
}
