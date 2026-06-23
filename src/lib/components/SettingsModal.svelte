<script lang="ts">
  import { configs, states, updateConfig, connect } from "../cameras";
  import Button from "./Button.svelte";
  import { createEventDispatcher } from "svelte";

  export let id: number;
  const dispatch = createEventDispatcher<{ close: void }>();

  $: cfg = $configs[id - 1];
  $: st = $states[id - 1];

  let name = "";
  let host = "";
  let enabled = false;
  let initialised = -1;

  // Load fields when the target slot changes.
  $: if (cfg && initialised !== id) {
    name = cfg.name;
    host = cfg.host;
    enabled = cfg.enabled;
    initialised = id;
  }

  function save() {
    updateConfig(id, { name: name.trim() || `Camera ${id}`, host: host.trim(), enabled });
    dispatch("close");
  }
  function saveAndConnect() {
    updateConfig(id, { name: name.trim() || `Camera ${id}`, host: host.trim(), enabled: true });
    void connect(id);
    dispatch("close");
  }
</script>

<div class="overlay" on:click={() => dispatch("close")} on:keydown role="presentation">
  <div class="modal" on:click|stopPropagation on:keydown role="dialog" aria-modal="true">
    <header>
      <h2>Camera {id} settings</h2>
      <button class="x" on:click={() => dispatch("close")} type="button">✕</button>
    </header>

    <div class="field">
      <label for="cam-name">Name</label>
      <input id="cam-name" bind:value={name} placeholder="Camera {id}" />
    </div>

    <div class="field">
      <label for="cam-host">Host / IP address</label>
      <input
        id="cam-host"
        class="mono"
        bind:value={host}
        placeholder="192.168.1.50  or  studiocam1.local"
        autocomplete="off"
        spellcheck="false"
      />
      <p class="hint">
        Address of the camera's REST API (Camera Control over USB-C Ethernet). You can include a
        port (<code>host:8080</code>) or scheme (<code>https://</code>) if needed.
      </p>
    </div>

    <label class="check">
      <input type="checkbox" bind:checked={enabled} />
      <span>Auto-connect on startup</span>
    </label>

    {#if st.status === "error" && st.error}
      <div class="err">⚠ {st.error}</div>
    {:else if st.status === "online"}
      <div class="ok">● Connected{st.model ? `: ${st.model}` : ""}</div>
    {/if}

    <footer>
      <Button variant="ghost" on:click={() => dispatch("close")}>Cancel</Button>
      <Button on:click={save}>Save</Button>
      <Button variant="accent" disabled={!host.trim()} on:click={saveAndConnect}>
        Save &amp; connect
      </Button>
    </footer>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(4, 5, 8, 0.6);
    backdrop-filter: blur(4px);
    display: grid;
    place-items: center;
    z-index: 100;
  }
  .modal {
    width: 440px;
    max-width: calc(100vw - 40px);
    background: var(--panel);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 22px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  h2 {
    font-size: 16px;
  }
  .x {
    background: none;
    border: none;
    color: var(--text-faint);
    font-size: 16px;
  }
  .x:hover {
    color: var(--text);
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  label {
    font-size: 12px;
    color: var(--text-dim);
  }
  .field input {
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 9px 12px;
    font-size: 13px;
    outline: none;
    color: var(--text);
  }
  .field input:focus {
    border-color: var(--accent);
  }
  .hint {
    margin: 0;
    font-size: 11.5px;
    color: var(--text-faint);
    line-height: 1.5;
  }
  .hint code {
    background: var(--bg-3);
    padding: 1px 4px;
    border-radius: 3px;
  }
  .check {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
  }
  .check input {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
  }
  .err {
    color: #ff8a8a;
    font-size: 12.5px;
    background: rgba(255, 59, 59, 0.1);
    border: 1px solid rgba(255, 59, 59, 0.3);
    border-radius: 6px;
    padding: 8px 11px;
  }
  .ok {
    color: var(--ok);
    font-size: 12.5px;
  }
  footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
</style>
