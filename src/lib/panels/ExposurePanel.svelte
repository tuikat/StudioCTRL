<script lang="ts">
  import Section from "../components/Section.svelte";
  import Slider from "../components/Slider.svelte";
  import Stepper from "../components/Stepper.svelte";
  import Segmented from "../components/Segmented.svelte";
  import Button from "../components/Button.svelte";
  import type { CameraState } from "../types";
  import * as api from "../api";
  import { dispatch, patchValues } from "../cameras";
  import { throttle } from "../util";

  export let id: number;
  export let state: CameraState;
  $: disabled = state.status !== "online";
  $: v = state.values;

  const FALLBACK_ISO = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
  const FALLBACK_GAIN = [-12, -6, 0, 6, 12, 18, 24, 30, 36];
  const FALLBACK_SHUTTER = [24, 25, 30, 48, 50, 60, 100, 120, 125, 250, 500, 1000, 2000];

  $: isoOpts = state.supportedISOs.length ? state.supportedISOs : FALLBACK_ISO;
  $: gainOpts = state.supportedGains.length ? state.supportedGains : FALLBACK_GAIN;
  $: shutterOpts = state.supportedShutterSpeeds.length
    ? state.supportedShutterSpeeds
    : FALLBACK_SHUTTER;
  $: wbMin = state.whiteBalanceRange?.min ?? 2500;
  $: wbMax = state.whiteBalanceRange?.max ?? 10000;

  const sendWB = throttle((k: number) => {
    patchValues(id, { whiteBalance: k });
    dispatch(id, (h) => api.setWhiteBalance(h, k));
  }, 120);
  const sendTint = throttle((t: number) => {
    patchValues(id, { whiteBalanceTint: t });
    dispatch(id, (h) => api.setWhiteBalanceTint(h, t));
  }, 120);
  const sendAngle = throttle((a: number) => {
    patchValues(id, { shutterAngle: a });
    dispatch(id, (h) => api.setShutterAngle(h, a));
  }, 120);

  function setIso(iso: number) {
    patchValues(id, { iso });
    dispatch(id, (h) => api.setIso(h, iso));
  }
  function setGain(g: number) {
    patchValues(id, { gain: g });
    dispatch(id, (h) => api.setGain(h, g));
  }
  function setShutterSpeed(s: number) {
    patchValues(id, { shutterSpeed: s });
    dispatch(id, (h) => api.setShutterSpeed(h, s));
  }
  function autoWB() {
    dispatch(id, (h) => api.autoWhiteBalance(h));
  }

  let shutterMode: "ShutterAngle" | "ShutterSpeed" = "ShutterAngle";
  function setShutterMode(m: string) {
    shutterMode = m as "ShutterAngle" | "ShutterSpeed";
    dispatch(id, (h) => api.setShutterMeasurement(h, shutterMode));
  }

  const AE_MODES = [
    { value: "Off", label: "Manual" },
    { value: "Iris", label: "Iris" },
    { value: "Shutter", label: "Shutter" },
    { value: "IrisAndShutter", label: "Both" },
  ];
  let aeMode = "Off";
  function setAE(m: string) {
    aeMode = m;
    if (m === "Off") dispatch(id, (h) => api.setAutoExposure(h, "Off", "Iris"));
    else dispatch(id, (h) => api.setAutoExposure(h, "Continuous", m));
  }
</script>

<Section title="Exposure" icon="◐">
  <div class="grid">
    <Stepper
      label="ISO"
      value={v.iso}
      options={isoOpts}
      {disabled}
      on:change={(e) => setIso(e.detail)}
    />
    <Stepper
      label="Gain"
      value={v.gain}
      options={gainOpts}
      unit="dB"
      {disabled}
      on:change={(e) => setGain(e.detail)}
    />
  </div>

  <div class="shutter">
    <div class="shutter-head">
      <span class="sub">Shutter</span>
      <Segmented
        options={[
          { value: "ShutterAngle", label: "Angle" },
          { value: "ShutterSpeed", label: "Speed" },
        ]}
        value={shutterMode}
        on:change={(e) => setShutterMode(e.detail)}
      />
    </div>
    {#if shutterMode === "ShutterAngle"}
      <Slider
        label="Shutter angle"
        value={v.shutterAngle ?? 180}
        min={5}
        max={360}
        step={1}
        unit="°"
        {disabled}
        on:input={(e) => sendAngle(e.detail)}
      />
    {:else}
      <Stepper
        label="Shutter speed (1/x)"
        value={v.shutterSpeed}
        options={shutterOpts}
        {disabled}
        on:change={(e) => setShutterSpeed(e.detail)}
      />
    {/if}
  </div>

  <div class="wb">
    <Slider
      label="White balance"
      value={v.whiteBalance ?? 5600}
      min={wbMin}
      max={wbMax}
      step={50}
      unit="K"
      {disabled}
      on:input={(e) => sendWB(e.detail)}
    />
    <Slider
      label="Tint"
      value={v.whiteBalanceTint ?? 0}
      min={state.whiteBalanceTintRange?.min ?? -50}
      max={state.whiteBalanceTintRange?.max ?? 50}
      step={1}
      {disabled}
      on:input={(e) => sendTint(e.detail)}
    />
  </div>

  <div class="ae">
    <span class="sub">Auto exposure</span>
    <Segmented options={AE_MODES} value={aeMode} on:change={(e) => setAE(e.detail)} />
  </div>

  <svelte:fragment slot="actions">
    <Button variant="ghost" {disabled} on:click={autoWB} title="Calculate auto white balance">
      Auto WB
    </Button>
  </svelte:fragment>
</Section>

<style>
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .shutter,
  .wb,
  .ae {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .shutter-head,
  .ae {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .sub {
    font-size: 12px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
</style>
