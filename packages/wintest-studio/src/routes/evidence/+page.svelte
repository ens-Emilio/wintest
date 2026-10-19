<script lang="ts">
  import type { StepLog } from '$lib/wintest';
  let runId = $state('calc-dotnet-20261019-030553');
  let junit = $derived(`<?xml version="1.0"?><testsuite name="WinTest-${runId}" tests="3" failures="0"><testcase name="7 + 8 = 15" time="1.2"/></testsuite>`);
  let steps: StepLog[] = $state([
    { timestamp: new Date().toISOString(), action: "FindElement login__form__entrar__button", durationMs: 12, result: "ok" },
    { timestamp: new Date().toISOString(), action: "Click", durationMs: 8, result: "ok" },
    { timestamp: new Date().toISOString(), action: "Assert TextEquals", durationMs: 3, result: "ok" },
  ]);
</script>
<h2>Evidence — junit + report + steps + screenshots</h2>
<p style="color:#666">Saída unificada: <code>evidence/{runId}/{testName}/</code> — <code>spec/evidence-schema.json</code></p>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
  <div>
    <h3>JUnit / Report</h3>
    <div>RunId: <code>{runId}</code></div>
    <pre style="background:#f5f5f5;padding:8px;overflow:auto">{junit}</pre>
    <div style="border:1px dashed #ccc;padding:16px;text-align:center;color:#888">failure.png gallery (mock 1x1) — com Wine: screenshot real via FlaUI</div>
  </div>
  <div>
    <h3>Steps timeline (steps.jsonl)</h3>
    <div style="border:1px solid #ddd;max-height:40vh;overflow:auto">
      {#each steps as s}<div style="padding:6px;border-bottom:1px solid #eee"><b>{s.action}</b> <small style="color:#888">{s.durationMs}ms</small> <span style="color:{s.result==='ok'?'green':'red'}">{s.result}</span></div>{/each}
    </div>
  </div>
</div>
