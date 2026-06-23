<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let checked: boolean;
  export let label = "";
  export let disabled = false;
  const dispatch = createEventDispatcher<{ change: boolean }>();
  function toggle() {
    if (disabled) return;
    checked = !checked;
    dispatch("change", checked);
  }
</script>

<button class="toggle" class:on={checked} class:disabled on:click={toggle} type="button">
  <span class="track"><span class="knob" /></span>
  {#if label}<span class="label">{label}</span>{/if}
</button>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: none;
    border: none;
    padding: 0;
  }
  .toggle.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
  .track {
    width: 40px;
    height: 22px;
    border-radius: 12px;
    background: var(--bg-3);
    border: 1px solid var(--border);
    position: relative;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--text-dim);
    transition: transform 0.15s ease, background 0.15s ease;
  }
  .on .track {
    background: var(--accent-dim);
    border-color: var(--accent);
  }
  .on .knob {
    transform: translateX(18px);
    background: #fff;
  }
  .label {
    font-size: 13px;
    color: var(--text-dim);
  }
</style>
