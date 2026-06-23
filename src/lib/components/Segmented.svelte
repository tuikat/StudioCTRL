<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let options: { value: string; label: string }[];
  export let value: string;
  const dispatch = createEventDispatcher<{ change: string }>();
  function pick(v: string) {
    value = v;
    dispatch("change", v);
  }
</script>

<div class="seg" role="tablist">
  {#each options as opt}
    <button
      class:active={opt.value === value}
      on:click={() => pick(opt.value)}
      type="button"
      role="tab"
    >
      {opt.label}
    </button>
  {/each}
</div>

<style>
  .seg {
    display: inline-flex;
    background: var(--bg-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 2px;
    gap: 2px;
  }
  button {
    background: none;
    border: none;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-dim);
    border-radius: 5px;
    transition: background 0.12s, color 0.12s;
  }
  button.active {
    background: var(--accent-dim);
    color: #04201b;
    font-weight: 600;
  }
  button:hover:not(.active) {
    color: var(--text);
  }
</style>
