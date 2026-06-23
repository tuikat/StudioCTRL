<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { ColorWheelValue } from "../types";

  export let label: string;
  export let value: ColorWheelValue;
  export let min: number;
  export let max: number;
  export let step = 0.01;
  export let def = 0; // default value used by the reset button

  const dispatch = createEventDispatcher<{ change: ColorWheelValue }>();

  const channels: { key: keyof ColorWheelValue; color: string; name: string }[] = [
    { key: "red", color: "#ff5b5b", name: "R" },
    { key: "green", color: "#54e07a", name: "G" },
    { key: "blue", color: "#5b8bff", name: "B" },
    { key: "luma", color: "#cfd6e2", name: "Y" },
  ];

  function set(key: keyof ColorWheelValue, e: Event) {
    const v = parseFloat((e.target as HTMLInputElement).value);
    value = { ...value, [key]: v };
    dispatch("change", value);
  }
  function reset() {
    value = { red: def, green: def, blue: def, luma: def };
    dispatch("change", value);
  }
  $: pct = (v: number) => ((v - min) / (max - min)) * 100;
</script>

<div class="cc">
  <div class="head">
    <span class="title">{label}</span>
    <button class="reset" on:click={reset} type="button" title="Reset {label}">⟲</button>
  </div>
  {#each channels as ch}
    <div class="ch">
      <span class="tag" style="color:{ch.color}">{ch.name}</span>
      <input
        type="range"
        {min}
        {max}
        {step}
        value={value[ch.key]}
        on:input={(e) => set(ch.key, e)}
        style="--c:{ch.color}; --pct:{pct(value[ch.key])}%"
      />
      <span class="num mono">{value[ch.key].toFixed(2)}</span>
    </div>
  {/each}
</div>

<style>
  .cc {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .title {
    font-size: 12px;
    color: var(--text-dim);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .reset {
    background: none;
    border: 1px solid var(--border);
    border-radius: 5px;
    color: var(--text-faint);
    width: 22px;
    height: 22px;
    line-height: 1;
    font-size: 13px;
  }
  .reset:hover {
    color: var(--text);
    border-color: var(--border-strong);
  }
  .ch {
    display: grid;
    grid-template-columns: 18px 1fr 44px;
    align-items: center;
    gap: 8px;
  }
  .tag {
    font-size: 11px;
    font-weight: 700;
    text-align: center;
  }
  .num {
    font-size: 11.5px;
    color: var(--text-dim);
    text-align: right;
  }
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 4px;
    background: linear-gradient(
      to right,
      var(--c) 0%,
      var(--c) var(--pct),
      var(--bg-3) var(--pct),
      var(--bg-3) 100%
    );
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--c);
    cursor: pointer;
  }
  input[type="range"]::-moz-range-thumb {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--c);
    cursor: pointer;
  }
</style>
