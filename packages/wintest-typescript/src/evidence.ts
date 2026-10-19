import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface StepLog { timestamp: string; action: string; locator?: string; durationMs: number; result: "ok" | "fail"; error?: string; }
export interface TestEvidence {
  name: string; status: "passed" | "failed" | "skipped"; durationMs: number;
  steps: StepLog[]; errorCategory?: string; errorMessage?: string; expected?: string; actual?: string; screenshotPath?: string;
}

const DOT_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=", "base64");
function sanitize(s: string) { return s.replace(/[<>"\/\\|?*]/g, "_"); }
function esc(s: string) { return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }

export class EvidenceCollector {
  runId: string;
  tests: TestEvidence[] = [];
  private current: TestEvidence | null = null;
  private start = 0;

  constructor(private config: { evidenceDir: string }, runId?: string) {
    this.runId = runId ?? new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  }

  startTest(name: string) { this.current = { name, status: "passed", durationMs: 0, steps: [] }; this.start = Date.now(); }

  logStep(action: string, locator: unknown, durationMs: number, ok: boolean, error?: string) {
    if (!this.current) return;
    this.current.steps.push({ timestamp: new Date().toISOString(), action, locator: locator ? String(locator) : undefined, durationMs, result: ok ? "ok" : "fail", error });
  }

  endTest(passed: boolean, error?: unknown) {
    if (!this.current) return;
    this.current.durationMs = Date.now() - this.start;
    this.current.status = passed ? "passed" : "failed";
    if (error && !passed) {
      const e = error as Record<string, unknown>;
      this.current.errorCategory = (e.category as string) ?? (error as Error).name ?? "Error";
      this.current.errorMessage = String((error as Error).message ?? error);
      if (e.expected) this.current.expected = String(e.expected);
      if (e.actual) this.current.actual = String(e.actual);
      try {
        const dir = join(this.config.evidenceDir, this.runId, sanitize(this.current.name));
        mkdirSync(dir, { recursive: true });
        const p = join(dir, "failure.png");
        writeFileSync(p, DOT_PNG);
        this.current.screenshotPath = p;
      } catch {}
    }
    this.tests.push(this.current);
    this.current = null;
  }

  saveAll() {
    const runDir = join(this.config.evidenceDir, this.runId);
    mkdirSync(runDir, { recursive: true });
    for (const t of this.tests) {
      const td = join(runDir, sanitize(t.name));
      mkdirSync(td, { recursive: true });
      writeFileSync(join(td, "steps.jsonl"), t.steps.map(s => JSON.stringify(s)).join("\n"), "utf-8");
    }
    writeFileSync(join(runDir, "junit.xml"), junit(this.runId, this.tests), "utf-8");
    writeFileSync(join(runDir, "report.html"), htmlReport(this.runId, this.tests), "utf-8");
    writeFileSync(join(runDir, "evidence.json"), JSON.stringify({ runId: this.runId, tests: this.tests }, null, 2), "utf-8");
  }
}

function junit(runId: string, tests: TestEvidence[]): string {
  const failures = tests.filter(t => t.status === "failed").length;
  const skipped = tests.filter(t => t.status === "skipped").length;
  const lines: string[] = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<testsuite name="WinTest-${esc(runId)}" tests="${tests.length}" failures="${failures}" errors="0" skipped="${skipped}">`,
  ];
  for (const t of tests) {
    lines.push(`  <testcase classname="WinTest" name="${esc(t.name)}" time="${(t.durationMs/1000).toFixed(3)}">`);
    if (t.status === "failed") lines.push(`    <failure message="${esc(t.errorMessage ?? "")}" type="${t.errorCategory}">${esc(t.errorMessage ?? "")} Expected:${esc(t.expected ?? "")} Actual:${esc(t.actual ?? "")}</failure>`);
    lines.push("  </testcase>");
  }
  lines.push("</testsuite>");
  return lines.join("\n");
}

function htmlReport(runId: string, tests: TestEvidence[]): string {
  const rows = tests.map(t => `<tr><td>${esc(t.name)}</td><td class='${t.status}'>${t.status}</td><td>${t.durationMs}ms</td><td>${esc(t.errorMessage ?? "-")}</td></tr>`).join("\n");
  return `<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>WinTest ${esc(runId)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.passed{color:green}.failed{color:red}</style>
</head><body><h1>WinTest — Relatório ${esc(runId)}</h1>
<p>Total: ${tests.length} · Passaram: ${tests.filter(t=>t.status==="passed").length} · Falharam: ${tests.filter(t=>t.status==="failed").length}</p>
<table><tr><th>Teste</th><th>Status</th><th>Duração</th><th>Erro</th></tr>${rows}</table></body></html>`;
}
