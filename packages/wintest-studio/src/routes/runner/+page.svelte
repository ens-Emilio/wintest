<script lang="ts">
  let logs = $state<string[]>([]);
  let running = $state(false);
  let engine = $state('mock');
  let stack = $state('all');
  async function run() {
    running = true; logs = [`[runner] wintest run ${stack} --engine ${engine}`];
    // No Tauri real: invoke('run_tests', { stack, engine }); por enquanto simula
    await new Promise(r => setTimeout(r, 400));
    logs.push('[dotnet] 21 passed, 0 failed');
    logs.push('[python] 18 passed, 0 failed');
    logs.push('[typescript] 19 passed, 0 failed');
    logs.push('[evidence] ./evidence/{runId}/junit.xml + report.html');
    running = false;
  }
</script>
<h2>Runner — wintest run</h2>
<div style="display:flex;gap:8px;align-items:center;margin:8px 0">
  <label>Stack <select bind:value={stack}><option>all</option><option>dotnet</option><option>python</option><option>typescript</option></select></label>
  <label>Engine <select bind:value={engine}><option>mock</option><option>wine</option><option>native</option></select></label>
  <button onclick={run} disabled={running} style="padding:8px 16px">{running ? 'Executando…' : 'Run'}</button>
  <span style="color:#666">CLI: <code>wintest run {stack} --engine {engine}</code></span>
</div>
<pre style="background:#111;color:#0f0;padding:12px;min-height:200px;overflow:auto">{logs.join('\n') || 'Clique em Run para executar.'}</pre>
<div style="margin-top:8px"><a href="/evidence">Ver Evidence →</a></div>
