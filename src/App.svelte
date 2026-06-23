<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import SettingsModal from "./lib/components/SettingsModal.svelte";
  import Toggle from "./lib/components/Toggle.svelte";
  import Button from "./lib/components/Button.svelte";
  import RecordBar from "./lib/panels/RecordBar.svelte";
  import ExposurePanel from "./lib/panels/ExposurePanel.svelte";
  import LensPanel from "./lib/panels/LensPanel.svelte";
  import ColorPanel from "./lib/panels/ColorPanel.svelte";
  import {
    configs,
    selected,
    selectedConfig,
    selectedState,
    linkMode,
    SLOT_COUNT,
    connectAllEnabled,
    startPolling,
    stopPolling,
  } from "./lib/cameras";

  let editId: number | null = null;

  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable))
      return;
    if (e.key >= "1" && e.key <= String(SLOT_COUNT)) {
      selected.set(parseInt(e.key, 10));
    } else if (e.key.toLowerCase() === "l") {
      linkMode.update((v) => !v);
    }
  }

  onMount(() => {
    window.addEventListener("keydown", onKey);
    startPolling();
    void connectAllEnabled();
  });
  onDestroy(() => {
    window.removeEventListener("keydown", onKey);
    stopPolling();
  });

  $: cfg = $selectedConfig;
  $: st = $selectedState;
  $: configured = !!cfg.host;
</script>

<div class="app">
  <header class="topbar">
    <div class="brand">
      <div class="logo">◉</div>
      <div>
        <div class="title">StudioCTRL</div>
        <div class="subtitle">Blackmagic camera control</div>
      </div>
    </div>
    <div class="top-actions">
      <div class="link-toggle" class:on={$linkMode}>
        <span>Link all</span>
        <Toggle checked={$linkMode} on:change={(e) => linkMode.set(e.detail)} />
      </div>
      <Button variant="ghost" on:click={() => connectAllEnabled()}>Connect all</Button>
    </div>
  </header>

  <div class="main">
    <Sidebar on:edit={(e) => (editId = e.detail)} />

    <div class="content">
      <RecordBar id={$selected} config={cfg} state={st} />

      {#if !configured}
        <div class="empty">
          <div class="empty-icon">◉</div>
          <h2>{cfg.name} isn't configured</h2>
          <p>Add the camera's IP address or <code>.local</code> hostname to start controlling it.</p>
          <Button variant="accent" on:click={() => (editId = $selected)}>Configure camera</Button>
        </div>
      {:else}
        <div class="panels">
          <div class="col">
            <ExposurePanel id={$selected} state={st} />
            <LensPanel id={$selected} state={st} />
          </div>
          <div class="col wide">
            <ColorPanel id={$selected} state={st} />
          </div>
        </div>
      {/if}
    </div>
  </div>

  <footer class="statusbar">
    <span class="hint mono">keys 1-{SLOT_COUNT}: switch camera · L: link all</span>
    <span class="hint">
      {$configs.filter((c) => c.host).length} configured ·
      <span class="link-state" class:on={$linkMode}>{$linkMode ? "LINK MODE" : "single"}</span>
    </span>
  </footer>
</div>

{#if editId !== null}
  <SettingsModal id={editId} on:close={() => (editId = null)} />
{/if}

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-1);
    flex-shrink: 0;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: linear-gradient(135deg, var(--accent), var(--accent-dim));
    color: #04201b;
    font-size: 20px;
    box-shadow: 0 0 20px var(--accent-glow);
  }
  .title {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .subtitle {
    font-size: 11px;
    color: var(--text-faint);
  }
  .top-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .link-toggle {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    color: var(--text-dim);
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    transition: border-color 0.15s, color 0.15s;
  }
  .link-toggle.on {
    border-color: var(--accent);
    color: var(--accent);
  }
  .main {
    flex: 1;
    display: flex;
    min-height: 0;
  }
  .content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .panels {
    display: grid;
    grid-template-columns: minmax(320px, 1fr) minmax(420px, 1.3fr);
    gap: 16px;
    align-items: start;
  }
  .col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }
  .empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    text-align: center;
    color: var(--text-dim);
  }
  .empty-icon {
    font-size: 52px;
    color: var(--border-strong);
  }
  .empty h2 {
    font-size: 18px;
    color: var(--text);
  }
  .empty p {
    max-width: 360px;
    line-height: 1.5;
    font-size: 13px;
  }
  .empty code {
    background: var(--bg-3);
    padding: 1px 5px;
    border-radius: 3px;
  }
  .statusbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 16px;
    border-top: 1px solid var(--border);
    background: var(--bg-1);
    font-size: 11px;
    color: var(--text-faint);
    flex-shrink: 0;
  }
  .link-state.on {
    color: var(--accent);
    font-weight: 600;
  }
  @media (max-width: 900px) {
    .panels {
      grid-template-columns: 1fr;
    }
  }
</style>
