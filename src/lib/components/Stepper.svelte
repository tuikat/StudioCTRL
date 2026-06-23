<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { nearest } from "../util";

  export let label: string;
  export let value: number | null;
  export let options: number[];
  export let unit = "";
  export let disabled = false;

  const dispatch = createEventDispatcher<{ change: number }>();

  $: sorted = [...options].sort((a, b) => a - b);
  $: idx = value == null ? -1 : sorted.indexOf(nearest(sorted, value));

  function step(dir: number) {
    if (!sorted.length) return;
    let i = idx;
    if (i < 0) i = dir > 0 ? 0 : sorted.length - 1;
    else i = Math.min(sorted.length - 1, Math.max(0, i + dir));
    value = sorted[i];
    dispatch("change", value);
  }
</script>

<div class="stepper" class:disabled>
  <span class="label">{label}</span>
  <div class="control">
    <button on:click={() => step(-1)} type="button" disabled={disabled || idx <= 0}>−</button>
    <span class="value mono">{value == null ? "-" : value}<span class="unit">{unit}</span></span>
    <button
      on:click={() => step(1)}
      type="button"
      disabled={disabled || (idx >= 0 && idx >= sorted.length - 1)}>+</button
    >
  </div>
</div>

<style>
  .stepper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .stepper.disabled {
    opacity: 0.45;
    pointer-events: none;
  }
  .label {
    color: var(--text-dim);
    font-size: 12px;
  }
  .control {
    display: inline-flex;
    align-items: center;
    background: var(--bg-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }
  .control button {
    width: 30px;
    height: 30px;
    background: none;
    border: none;
    color: var(--text);
    font-size: 17px;
    line-height: 1;
  }
  .control button:hover:not(:disabled) {
    background: var(--bg-2);
    color: var(--accent);
  }
  .control button:disabled {
    opacity: 0.3;
  }
  .value {
    min-width: 64px;
    text-align: center;
    font-size: 13px;
    padding: 0 6px;
  }
  .unit {
    color: var(--text-faint);
    font-size: 11px;
    margin-left: 2px;
  }
</style>
