<script lang="ts">
  import { MOCK_TREE, flattenTree, type UINode } from '$lib/wintest';
  let filter = $state('');
  let selected: UINode | null = $state(null);
  let flat = $derived(flattenTree(MOCK_TREE).filter(n => !filter || n.AutomationId.includes(filter)));
  function treeJson() { return JSON.stringify(MOCK_TREE, null, 2); }
</script>
<h2>Inspector — Árvore UIA</h2>
<p style="color:#666">Mock (Linux) · Com Wine: lê <code>/tmp/wintest-uia.sock</code> via UIA bridge. Valida <code>spec/automation-ids.md</code>.</p>
<input placeholder="Filtrar por AutomationId (ex: login__)" bind:value={filter} style="width:100%;padding:8px;margin:8px 0" />
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div style="border:1px solid #ddd;padding:8px;max-height:60vh;overflow:auto">
    <div style="font-weight:bold;margin-bottom:8px">Árvore ({flat.length} nós)</div>
    {#each flat as n}<div style="padding:4px;cursor:pointer;background:{selected?.AutomationId===n.AutomationId?'#e0f2fe':''}" onclick={() => selected=n}><code>{n.AutomationId}</code> — {n.Name} <small style="color:#888">({n.ControlType})</small></div>{/each}
  </div>
  <div style="border:1px solid #ddd;padding:8px">
    {#if selected}<div><b>{selected.AutomationId}</b><pre style="background:#f5f5f5;padding:8px;overflow:auto">{JSON.stringify(selected,null,2)}</pre>
      <div style="margin-top:8px"><code>Locator.byAutomationId("{selected.AutomationId}")</code></div>
      <div style="margin-top:4px;color:#666">Highlight: borda azul no app (via Wine UIA bridge quando disponível)</div>
    {:else}<div style="color:#888">Selecione um nó à esquerda</div>{/if}
    <details style="margin-top:12px"><summary>JSON completo</summary><pre style="background:#f5f5f5;padding:8px;overflow:auto">{treeJson()}</pre></details>
  </div>
</div>
