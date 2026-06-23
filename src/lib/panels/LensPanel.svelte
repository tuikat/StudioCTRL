<script lang="ts">
  import Section from "../components/Section.svelte";
  import Slider from "../components/Slider.svelte";
  import Toggle from "../components/Toggle.svelte";
  import Button from "../components/Button.svelte";
  import type { CameraState } from "../types";
  import * as api from "../api";
  import { dispatch, patchValues } from "../cameras";
  import { throttle } from "../util";

  export let id: number;
  export let state: CameraState;
  $: disabled = state.status !== "online";
  $: v = state.values;

  const sendIris = throttle((stop: number) => {
    patchValues(id, { irisApertureStop: stop });
    dispatch(id, (h) => api.setIrisStop(h, stop));
  }, 120);
  const sendFocus = throttle((n: number) => {
    patchValues(id, { focusNormalised: n });
    dispatch(id, (h) => api.setFocus(h, n));
  }, 100);
  const sendZoom = throttle((n: number) => {
    patchValues(id, { zoomNormalised: n });
    dispatch(id, (h) => api.setZoom(h, n));
  }, 100);

  function autoFocus() {
    dispatch(id, (h) => api.doAutoFocus(h));
  }
  function setOis(on: boolean) {
    patchValues(id, { ois: on });
    dispatch(id, (h) => api.setOis(h, on));
  }
</script>

<Section title="Lens" icon="⊚">
  <Slider
    label="Iris (aperture)"
    value={v.irisApertureStop ?? 4}
    min={1}
    max={16}
    step={0.1}
    decimals={1}
    unit="ƒ"
    {disabled}
    on:input={(e) => sendIris(e.detail)}
  />
  <div class="focus">
    <Slider
      label="Focus"
      value={v.focusNormalised ?? 0.5}
      min={0}
      max={1}
      step={0.005}
      decimals={2}
      {disabled}
      on:input={(e) => sendFocus(e.detail)}
    />
    <Button variant="ghost" {disabled} on:click={autoFocus} title="Trigger autofocus">
      Auto focus
    </Button>
  </div>
  <Slider
    label="Zoom"
    value={v.zoomNormalised ?? 0}
    min={0}
    max={1}
    step={0.01}
    decimals={2}
    {disabled}
    on:input={(e) => sendZoom(e.detail)}
  />
  <div class="ois">
    <span class="sub">Optical stabilisation</span>
    <Toggle checked={v.ois ?? false} {disabled} on:change={(e) => setOis(e.detail)} />
  </div>
</Section>

<style>
  .focus {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  .focus :global(.slider) {
    width: 100%;
  }
  .ois {
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
