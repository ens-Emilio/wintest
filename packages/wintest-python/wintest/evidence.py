from __future__ import annotations
import json, os, base64, time, html
from dataclasses import dataclass, field
from datetime import datetime, timezone

@dataclass
class StepLog:
    timestamp: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    action: str = ""
    locator: str | None = None
    duration_ms: int = 0
    result: str = "ok"
    error: str | None = None

@dataclass
class TestEvidence:
    name: str = ""
    status: str = "passed"
    duration_ms: int = 0
    steps: list[StepLog] = field(default_factory=list)
    error_category: str | None = None
    error_message: str | None = None
    expected: str | None = None
    actual: str | None = None
    screenshot_path: str | None = None

def _sanitize(s: str) -> str:
    return "".join(c if c not in '<>:"/\\|?*' else "_" for c in s)

_DOT_PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=")

class EvidenceCollector:
    def __init__(self, config, run_id: str | None = None):
        self.config = config
        self.run_id = run_id or datetime.now().strftime("%Y%m%d-%H%M%S")
        self.tests: list[TestEvidence] = []
        self._current: TestEvidence | None = None
        self._start: float | None = None

    def start_test(self, name: str):
        self._current = TestEvidence(name=name)
        self._start = time.monotonic()

    def log_step(self, action: str, locator, duration_ms: int, ok: bool, error: str | None = None):
        if not self._current: return
        self._current.steps.append(StepLog(action=action, locator=str(locator) if locator else None, duration_ms=duration_ms, result="ok" if ok else "fail", error=error))

    def end_test(self, passed: bool, error=None):
        if not self._current: return
        self._current.duration_ms = int((time.monotonic() - (self._start or 0)) * 1000)
        self._current.status = "passed" if passed else "failed"
        if error is not None:
            self._current.error_category = getattr(error, "category", type(error).__name__)
            self._current.error_message = str(error)
            if hasattr(error, "expected"): self._current.expected = error.expected
            if hasattr(error, "actual"): self._current.actual = error.actual
            try:
                d = os.path.join(self.config.evidence_dir, self.run_id, _sanitize(self._current.name))
                os.makedirs(d, exist_ok=True)
                p = os.path.join(d, "failure.png")
                open(p,"wb").write(_DOT_PNG)
                self._current.screenshot_path = p
            except Exception: pass
        self.tests.append(self._current)
        self._current = None

    def save_all(self):
        run_dir = os.path.join(self.config.evidence_dir, self.run_id)
        os.makedirs(run_dir, exist_ok=True)
        for t in self.tests:
            td = os.path.join(run_dir, _sanitize(t.name))
            os.makedirs(td, exist_ok=True)
            with open(os.path.join(td, "steps.jsonl"), "w", encoding="utf-8") as f:
                for s in t.steps: f.write(json.dumps(s.__dict__, ensure_ascii=False) + "\n")
        with open(os.path.join(run_dir, "junit.xml"), "w", encoding="utf-8") as f:
            f.write(_junit(self.run_id, self.tests))
        with open(os.path.join(run_dir, "report.html"), "w", encoding="utf-8") as f:
            f.write(_html(self.run_id, self.tests))
        tests_json = []
        for t in self.tests:
            d = dict(t.__dict__)
            d["steps"] = [s.__dict__ for s in t.steps]
            tests_json.append(d)
        with open(os.path.join(run_dir, "evidence.json"), "w", encoding="utf-8") as f:
            json.dump({"runId": self.run_id, "tests": tests_json}, f, indent=2, ensure_ascii=False)

def _junit(run_id, tests):
    total=len(tests); failures=sum(1 for t in tests if t.status=="failed")
    skipped=sum(1 for t in tests if t.status=="skipped")
    lines=[f'<?xml version="1.0" encoding="UTF-8"?>', f'<testsuite name="WinTest-{html.escape(run_id)}" tests="{total}" failures="{failures}" errors="0" skipped="{skipped}">']
    for t in tests:
        lines.append(f'  <testcase classname="WinTest" name="{html.escape(t.name)}" time="{t.duration_ms/1000:.3f}">')
        if t.status=="failed":
            lines.append(f'    <failure message="{html.escape(t.error_message or "")}" type="{t.error_category}">{html.escape(t.error_message or "")} Expected:{html.escape(t.expected or "")} Actual:{html.escape(t.actual or "")}</failure>')
        lines.append("  </testcase>")
    lines.append("</testsuite>")
    return "\n".join(lines)

def _html(run_id, tests):
    rows="\n".join(f"<tr><td>{html.escape(t.name)}</td><td class='{t.status}'>{t.status}</td><td>{t.duration_ms}ms</td><td>{html.escape(t.error_message or '-')}</td></tr>" for t in tests)
    return f"""<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>WinTest {html.escape(run_id)}</title>
<style>body{{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px}}table{{width:100%;border-collapse:collapse}}th,td{{border:1px solid #ddd;padding:8px;text-align:left}}th{{background:#f5f5f5}}.passed{{color:green}}.failed{{color:red}}</style>
</head><body><h1>WinTest — Relatorio {html.escape(run_id)}</h1>
<p>Total: {len(tests)} · Passaram: {sum(1 for t in tests if t.status=="passed")} · Falharam: {sum(1 for t in tests if t.status=="failed")}</p>
<table><tr><th>Teste</th><th>Status</th><th>Duracao</th><th>Erro</th></tr>{rows}</table></body></html>"""
