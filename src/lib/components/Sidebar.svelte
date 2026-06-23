<script lang="ts">
  import { configs, states, selected, connect, disconnect } from "../cameras";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ edit: number }>();

  function select(id: number) {
    selected.set(id);
  }
  function statusColor(status: string): string {
    switch (status) {
      case "online":
        return "var(--ok)";
      case "connecting":
        return "var(--warn)";
      case "error":
        return "var(--rec)";
      default:
        return "var(--text-faint)";
    }
  }
</script>

<aside class="sidebar">
  <div class="cams">
    {#each $configs as cfg (cfg.id)}
      {@const st = $states[cfg.id - 1]}
      <div
        class="cam"
        class:active={$selected === cfg.id}
        class:recording={st.values.recording === true}
        on:click={() => select(cfg.id)}
        on:keydown={(e) => e.key === "Enter" && select(cfg.id)}
        role="button"
        tabindex="0"
      >
        <div class="num">{cfg.id}</div>
        <div class="info">
          <div class="name">{cfg.name}</div>
          <div class="host mono">{cfg.host || "not configured"}</div>
        </div>
        <div class="state">
          <span class="led" style="background:{statusColor(st.status)}" title={st.status} />
          {#if st.values.recording === true}<span class="rectag">●</span>{/if}
        </div>
        <div class="hover-actions">
          {#if st.status === "online" || st.status === "connecting"}
            <button
              title="Disconnect"
              on:click|stopPropagation={() => disconnect(cfg.id)}
              type="button">⏻</button
            >
          {:else}
            <button
              title="Connect"
              disabled={!cfg.host}
              on:click|stopPropagation={() => connect(cfg.id)}
              type="button">⇄</button
            >
          {/if}
          <button
            title="Settings"
            on:click|stopPropagation={() => dispatch("edit", cfg.id)}
            type="button">⚙</button
          >
        </div>
      </div>
    {/each}
  </div>
</aside>

<style>
  .sidebar {
    width: 240px;
    flex-shrink: 0;
    background: var(--bg-1);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: 10px;
    gap: 6px;
  }
  .cams {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .cam {
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 10px 11px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    background: var(--panel);
    cursor: pointer;
    transition: background 0.12s, border-color 0.12s;
  }
  .cam:hover {
    background: var(--panel-2);
  }
  .cam.active {
    border-color: var(--accent);
    background: var(--panel-2);
    box-shadow: 0 0 0 1px var(--accent-glow);
  }
  .cam.recording {
    border-color: var(--rec);
  }
  .num {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: var(--bg-3);
    color: var(--text-dim);
    font-weight: 700;
    font-size: 13px;
  }
  .active .num {
    background: var(--accent);
    color: #04201b;
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .host {
    font-size: 10.5px;
    color: var(--text-faint);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .led {
    width: 9px;
    height: 9px;
    border-radius: 50%;
  }
  .rectag {
    color: var(--rec);
    font-size: 11px;
    animation: blink 1.2s steps(2, start) infinite;
  }
  @keyframes blink {
    50% {
      opacity: 0.2;
    }
  }
  .hover-actions {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    gap: 4px;
    background: var(--panel-2);
    padding: 3px;
    border-radius: 6px;
  }
  .cam:hover .hover-actions {
    display: flex;
  }
  .hover-actions button {
    width: 26px;
    height: 26px;
    border: 1px solid var(--border);
    background: var(--bg-3);
    border-radius: 5px;
    color: var(--text-dim);
    font-size: 13px;
  }
  .hover-actions button:hover:not(:disabled) {
    color: var(--accent);
    border-color: var(--accent-dim);
  }
  .hover-actions button:disabled {
    opacity: 0.3;
  }
</style>
