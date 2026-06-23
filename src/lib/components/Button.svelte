<script lang="ts">
  export let variant: "default" | "accent" | "ghost" | "danger" = "default";
  export let disabled = false;
  export let title = "";
</script>

<button class="btn {variant}" {disabled} {title} on:click type="button">
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 12px;
    font-size: 12.5px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--bg-3);
    color: var(--text);
    transition: background 0.12s ease, border-color 0.12s ease, transform 0.06s;
    white-space: nowrap;
  }
  .btn:hover:not(:disabled) {
    background: #232834;
    border-color: #3c4456;
  }
  .btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .accent {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: #04201b;
    font-weight: 600;
  }
  .accent:hover:not(:disabled) {
    background: var(--accent);
  }
  .ghost {
    background: transparent;
    border-color: var(--border);
    color: var(--text-dim);
  }
  .ghost:hover:not(:disabled) {
    color: var(--text);
    background: var(--bg-2);
  }
  .danger {
    background: var(--rec);
    border-color: var(--rec);
    color: #fff;
    font-weight: 600;
  }
  .danger:hover:not(:disabled) {
    filter: brightness(1.1);
  }
</style>
