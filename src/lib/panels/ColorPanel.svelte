<script lang="ts">
  import Section from "../components/Section.svelte";
  import Slider from "../components/Slider.svelte";
  import ColorChannels from "../components/ColorChannels.svelte";
  import Button from "../components/Button.svelte";
  import type { CameraState, ColorWheelValue } from "../types";
  import * as api from "../api";
  import { dispatch, patchValues } from "../cameras";
  import { throttle } from "../util";

  export let id: number;
  export let state: CameraState;
  $: disabled = state.status !== "online";
  $: v = state.values;

  const sendLift = throttle((val: ColorWheelValue) => {
    patchValues(id, { lift: val });
    dispatch(id, (h) => api.setLift(h, val));
  }, 100);
  const sendGamma = throttle((val: ColorWheelValue) => {
    patchValues(id, { gamma: val });
    dispatch(id, (h) => api.setGamma(h, val));
  }, 100);
  const sendGain = throttle((val: ColorWheelValue) => {
    patchValues(id, { gain_cc: val });
    dispatch(id, (h) => api.setColorGain(h, val));
  }, 100);
  const sendOffset = throttle((val: ColorWheelValue) => {
    patchValues(id, { offset: val });
    dispatch(id, (h) => api.setOffset(h, val));
  }, 100);
  const sendContrast = throttle((pivot: number, adjust: number) => {
    patchValues(id, { contrast: { pivot, adjust } });
    dispatch(id, (h) => api.setContrast(h, pivot, adjust));
  }, 100);
  const sendColor = throttle((hue: number, saturation: number) => {
    patchValues(id, { color: { hue, saturation } });
    dispatch(id, (h) => api.setColorAdjust(h, hue, saturation));
  }, 100);
  const sendLuma = throttle((lm: number) => {
    patchValues(id, { lumaMix: lm });
    dispatch(id, (h) => api.setLumaMix(h, lm));
  }, 100);

  function resetAll() {
    const lift = { red: 0, green: 0, blue: 0, luma: 0 };
    const gamma = { red: 0, green: 0, blue: 0, luma: 0 };
    const gain = { red: 1, green: 1, blue: 1, luma: 1 };
    const offset = { red: 0, green: 0, blue: 0, luma: 0 };
    patchValues(id, {
      lift,
      gamma,
      gain_cc: gain,
      offset,
      contrast: { pivot: 0.5, adjust: 1 },
      color: { hue: 0, saturation: 1 },
      lumaMix: 1,
    });
    dispatch(id, async (h) => {
      await api.setLift(h, lift);
      await api.setGamma(h, gamma);
      await api.setColorGain(h, gain);
      await api.setOffset(h, offset);
      await api.setContrast(h, 0.5, 1);
      await api.setColorAdjust(h, 0, 1);
      await api.setLumaMix(h, 1);
    });
  }
</script>

<Section title="Color Correction" icon="◑">
  <div class="wheels">
    <ColorChannels
      label="Lift"
      value={v.lift}
      min={-2}
      max={2}
      def={0}
      on:change={(e) => sendLift(e.detail)}
    />
    <ColorChannels
      label="Gamma"
      value={v.gamma}
      min={-4}
      max={4}
      def={0}
      on:change={(e) => sendGamma(e.detail)}
    />
    <ColorChannels
      label="Gain"
      value={v.gain_cc}
      min={0}
      max={16}
      def={1}
      on:change={(e) => sendGain(e.detail)}
    />
    <ColorChannels
      label="Offset"
      value={v.offset}
      min={-8}
      max={8}
      def={0}
      on:change={(e) => sendOffset(e.detail)}
    />
  </div>

  <div class="extras">
    <Slider
      label="Contrast"
      value={v.contrast?.adjust ?? 1}
      min={0}
      max={2}
      step={0.01}
      decimals={2}
      {disabled}
      on:input={(e) => sendContrast(v.contrast?.pivot ?? 0.5, e.detail)}
    />
    <Slider
      label="Pivot"
      value={v.contrast?.pivot ?? 0.5}
      min={0}
      max={1}
      step={0.01}
      decimals={2}
      {disabled}
      on:input={(e) => sendContrast(e.detail, v.contrast?.adjust ?? 1)}
    />
    <Slider
      label="Hue"
      value={v.color?.hue ?? 0}
      min={-1}
      max={1}
      step={0.01}
      decimals={2}
      {disabled}
      on:input={(e) => sendColor(e.detail, v.color?.saturation ?? 1)}
    />
    <Slider
      label="Saturation"
      value={v.color?.saturation ?? 1}
      min={0}
      max={2}
      step={0.01}
      decimals={2}
      {disabled}
      on:input={(e) => sendColor(v.color?.hue ?? 0, e.detail)}
    />
    <Slider
      label="Luma mix"
      value={v.lumaMix ?? 1}
      min={0}
      max={1}
      step={0.01}
      decimals={2}
      {disabled}
      on:input={(e) => sendLuma(e.detail)}
    />
  </div>

  <svelte:fragment slot="actions">
    <Button variant="ghost" {disabled} on:click={resetAll} title="Reset all color correction">
      Reset all
    </Button>
  </svelte:fragment>
</Section>

<style>
  .wheels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px 22px;
  }
  .extras {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 22px;
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }
</style>
