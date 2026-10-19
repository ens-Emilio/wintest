<h1>WinTest Studio</h1>
<p>App Desktop — <strong>Tauri 2 + Svelte</strong> (8MB vs 180MB Electron).</p>
<ul>
  <li><a href="/inspector">Inspector</a> — árvore AutomationId ao vivo (via Wine UIA bridge ou Mock)</li>
  <li><a href="/runner">Runner</a> — executa <code>wintest run</code> e mostra logs/junit inline</li>
  <li><a href="/evidence">Evidence</a> — gallery <code>failure.png</code> + <code>steps.jsonl</code> timeline + <code>report.html</code></li>
</ul>
<p style="color:#666">CLI: <code>wintest studio</code> · <code>wintest studio --dev</code> · <code>wintest inspect --filter login__</code></p>
<pre style="background:#f5f5f5;padding:8px;overflow:auto">spec/api-spec.json é a fonte da verdade — nenhum SDK diverge.</pre>
