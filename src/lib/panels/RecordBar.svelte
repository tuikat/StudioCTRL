<script lang="ts">
  import type { CameraConfig, CameraState } from "../types";
  import * as api from "../api";
  import { dispatch, patchValues, linkMode } from "../cameras";

  export let id: number;
  export let config: CameraConfig;
  export let state: CameraState;

  $: online = state.status === "online";
  $: recording = state.values.recording === true;
  $: timecode = state.values.timecode ?? "--:--:--:--";

  let clipName = "";

  function toggleRecord() {
    if (recording) {
      dispatch(id, (h) => api.stopRecord(h));
      patchValues(id, { recording: false });
    } else {
      const name = clipName.trim() || undefined;
      dispatch(id, (h) => api.startRecord(h, name));
      patchValues(id, { recording: true });
    }
  }
</script>

<div class="recordbar" class:recording>
  <div class="left">
    <button
      class="rec"
      class:on={recording}
      disabled={!online}
      on:click={toggleRecord}
      type="button"
      title={recording ? "Stop recording" : "Start recording"}
    >
      <span class="dot" />
      {recording ? "STOP" : "REC"}
    </button>
    <div class="tc mono">{timecode}</div>
  </div>

  <div class="mid">
    <input
      class="clip"
      placeholder="Clip name (optional)"
      bind:value={clipName}
      disabled={!online}
    />
  </div>

  <div class="right">
    {#if $linkMode}
      <span class="badge link">LINK · all cameras</span>
    {:else}
      <span class="badge">{config.name}</span>
    {/if}
  </div>
</div>

<style>
  .recordbar {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 16px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .recordbar.recording {
    border-color: var(--rec);
    box-shadow: 0 0 0 1px var(--rec), 0 0 24px var(--rec-glow);
  }
  .left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .rec {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 8px;
    border: 1px solid var(--border-strong);
    background: var(--bg-3);
    color: var(--text);
    font-weight: 700;
    letter-spacing: 0.06em;
    font-size: 13px;
  }
  .rec .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--rec);
    box-shadow: 0 0 10px var(--rec-glow);
  }
  .rec.on {
    background: var(--rec);
    border-color: var(--rec);
    color: #fff;
    animation: pulse 1.4s ease-in-out infinite;
  }
  .rec.on .dot {
    background: #fff;
    box-shadow: none;
  }
  .rec:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  @keyframes pulse {
    0%,
    100% {
      box-shadow: 0 0 0 0 var(--rec-glow);
    }
    50% {
      box-shadow: 0 0 0 6px transparent;
    }
  }
  .tc {
    font-size: 20px;
    letter-spacing: 0.06em;
    color: var(--text);
  }
  .mid {
    flex: 1;
  }
  .clip {
    width: 100%;
    max-width: 320px;
    background: var(--bg-2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    font-size: 13px;
    outline: none;
  }
  .clip:focus {
    border-color: var(--accent);
  }
  .badge {
    font-size: 12px;
    color: var(--text-dim);
    padding: 5px 10px;
    border: 1px solid var(--border);
    border-radius: 20px;
  }
  .badge.link {
    color: #04201b;
    background: var(--accent);
    border-color: var(--accent);
    font-weight: 700;
  }
</style>
