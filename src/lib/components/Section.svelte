<script lang="ts">
  export let title: string;
  export let icon = "";
</script>

<section class="section">
  <header>
    {#if icon}<span class="icon">{icon}</span>{/if}
    <h3>{title}</h3>
    <div class="actions"><slot name="actions" /></div>
  </header>
  <div class="body">
    <slot />
  </div>
</section>

<style>
  .section {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(var(--panel-2), var(--panel));
  }
  .icon {
    font-size: 14px;
    opacity: 0.9;
  }
  h3 {
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-dim);
  }
  .actions {
    margin-left: auto;
    display: flex;
    gap: 6px;
  }
  .body {
    padding: 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
