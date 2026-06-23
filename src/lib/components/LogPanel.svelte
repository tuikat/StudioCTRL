<script lang="ts">
  import { logs, clearLogs, statusHint, type LogEntry } from "../logstore";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ close: void }>();

  let expanded: number | null = null;
  let errorsOnly = false;

  $: rows = errorsOnly ? $logs.filter((e) => !e.ok) : $logs;

  function fmt(v: unknown): string {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  function statusLabel(e: LogEntry): string {
    return e.status === 0 ? "ERR" : String(e.status);
  }
</script>

<div class="drawer">
  <header>
    <span class="title">Activity log</span>
    <span class="count">{rows.length}</span>
    <label class="filter">
      <input type="checkbox" bind:checked={errorsOnly} />
      errors only
    </label>
    <div class="spacer" />
    <button class="link" on:click={clearLogs} type="button">Clear</button>
    <button class="x" on:click={() => dispatch("close")} type="button" title="Hide log">✕</button>
  </header>

  <div class="list">
    {#if rows.length === 0}
      <div class="empty">No activity yet. Adjust a control to see requests here.</div>
    {/if}
    {#each rows as e (e.id)}
      <div
        class="row"
        class:err={!e.ok}
        on:click={() => (expanded = expanded === e.id ? null : e.id)}
        on:keydown={(ev) => ev.key === "Enter" && (expanded = expanded === e.id ? null : e.id)}
        role="button"
        tabindex="0"
      >
        <span class="time mono">{e.time}</span>
        <span class="method mono {e.method.toLowerCase()}">{e.method}</span>
        <span class="path mono">{e.path}</span>
        <span class="status mono" class:bad={!e.ok}>{statusLabel(e)}</span>
        <span class="ms mono">{e.ms}ms</span>
        <span class="host mono">{e.host}</span>
      </div>
      {#if !e.ok && expanded !== e.id}
        <div class="hint">{statusHint(e.status)}</div>
      {/if}
      {#if expanded === e.id}
        <div class="detail mono">
          {#if !e.ok}<div class="hint inline">{statusHint(e.status)}</div>{/if}
          {#if e.reqBody !== null && e.reqBody !== undefined && fmt(e.reqBody) !== "null"}
            <div><span class="k">request</span> {fmt(e.reqBody)}</div>
          {/if}
          {#if e.error}<div><span class="k">error</span> {e.error}</div>{/if}
          {#if e.resBody !== null && e.resBody !== undefined}
            <div><span class="k">response</span> {fmt(e.resBody)}</div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .drawer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40vh;
    min-height: 220px;
    background: var(--bg-1);
    border-top: 1px solid var(--border-strong);
    box-shadow: 0 -12px 30px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    z-index: 80;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--panel);
  }
  .title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-dim);
  }
  .count {
    font-size: 11px;
    color: var(--text-faint);
    background: var(--bg-3);
    border-radius: 10px;
    padding: 1px 8px;
  }
  .filter {
    font-size: 11.5px;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
  }
  .filter input {
    accent-color: var(--accent);
  }
  .spacer {
    flex: 1;
  }
  .link {
    background: none;
    border: none;
    color: var(--text-faint);
    font-size: 12px;
  }
  .link:hover {
    color: var(--text);
  }
  .x {
    background: none;
    border: none;
    color: var(--text-faint);
    font-size: 14px;
  }
  .x:hover {
    color: var(--text);
  }
  .list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }
  .empty {
    color: var(--text-faint);
    font-size: 12px;
    padding: 18px 16px;
  }
  .row {
    display: grid;
    grid-template-columns: 70px 44px 1fr auto 56px auto;
    gap: 10px;
    align-items: center;
    padding: 5px 14px;
    font-size: 12px;
    cursor: pointer;
    border-left: 2px solid transparent;
  }
  .row:hover {
    background: var(--bg-2);
  }
  .row.err {
    border-left-color: var(--rec);
    background: rgba(255, 59, 59, 0.05);
  }
  .time {
    color: var(--text-faint);
  }
  .method {
    font-weight: 700;
    font-size: 11px;
  }
  .method.put {
    color: var(--accent);
  }
  .method.post {
    color: var(--warn);
  }
  .method.get {
    color: var(--text-dim);
  }
  .path {
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status {
    color: var(--ok);
    font-weight: 600;
    text-align: right;
  }
  .status.bad {
    color: var(--rec);
  }
  .ms,
  .host {
    color: var(--text-faint);
    font-size: 11px;
    text-align: right;
  }
  .hint {
    padding: 0 14px 6px 86px;
    font-size: 11.5px;
    color: #ff9b9b;
  }
  .hint.inline {
    padding: 0 0 6px 0;
  }
  .detail {
    padding: 4px 14px 10px 86px;
    font-size: 11.5px;
    color: var(--text-dim);
    background: var(--bg-0);
    line-height: 1.6;
    word-break: break-all;
  }
  .detail .k {
    display: inline-block;
    width: 64px;
    color: var(--text-faint);
  }
</style>
