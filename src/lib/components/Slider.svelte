<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label: string;
  export let value: number;
  export let min: number;
  export let max: number;
  export let step = 1;
  export let unit = "";
  export let decimals = 0;
  export let disabled = false;

  const dispatch = createEventDispatcher<{ input: number; change: number }>();

  function onInput(e: Event) {
    value = parseFloat((e.target as HTMLInputElement).value);
    dispatch("input", value);
  }
  function onChange() {
    dispatch("change", value);
  }

  $: pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  $: display = isFinite(value) ? value.toFixed(decimals) : "-";
</script>

<div class="slider" class:disabled>
  <div class="row">
    <span class="label">{label}</span>
    <span class="val mono">{display}<span class="unit">{unit}</span></span>
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    {disabled}
    value={isFinite(value) ? value : min}
    on:input={onInput}
    on:change={onChange}
    style="--pct: {pct}%"
  />
</div>

<style>
  .slider {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .slider.disabled {
    opacity: 0.45;
    pointer-events: none;
  }
  .row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .label {
    color: var(--text-dim);
    font-size: 12px;
    letter-spacing: 0.02em;
  }
  .val {
    font-size: 13px;
    color: var(--text);
  }
  .unit {
    color: var(--text-faint);
    margin-left: 2px;
    font-size: 11px;
  }
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 5px;
    background: linear-gradient(
      to right,
      var(--accent) 0%,
      var(--accent) var(--pct),
      var(--bg-3) var(--pct),
      var(--bg-3) 100%
    );
    outline: none;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
    cursor: pointer;
    transition: transform 0.08s ease;
  }
  input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(1.15);
  }
  input[type="range"]::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--accent);
    cursor: pointer;
  }
</style>
