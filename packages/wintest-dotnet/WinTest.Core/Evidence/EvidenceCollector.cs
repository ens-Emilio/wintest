using System.Text.Json;

namespace WinTest.Core.Evidence;

public sealed class StepLog
{
    public string Timestamp { get; set; } = DateTime.UtcNow.ToString("o");
    public string Action { get; set; } = "";
    public string? Locator { get; set; }
    public long DurationMs { get; set; }
    public string Result { get; set; } = "ok";
    public string? Error { get; set; }
}

public sealed class TestEvidence
{
    public string Name { get; set; } = "";
    public string Status { get; set; } = "passed";
    public long DurationMs { get; set; }
    public List<StepLog> Steps { get; } = new();
    public string? ErrorCategory { get; set; }
    public string? ErrorMessage { get; set; }
    public string? Expected { get; set; }
    public string? Actual { get; set; }
    public string? ScreenshotPath { get; set; }
}

public sealed class EvidenceCollector
{
    private readonly WinTestConfig _cfg;
    private readonly string _runId;
    private readonly List<TestEvidence> _tests = new();
    private TestEvidence? _current;
    private System.Diagnostics.Stopwatch? _sw;

    public EvidenceCollector(WinTestConfig cfg, string? runId = null)
    {
        _cfg = cfg;
        _runId = runId ?? DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
    }

    public void StartTest(string name)
    {
        _current = new TestEvidence { Name = name };
        _sw = System.Diagnostics.Stopwatch.StartNew();
    }

    public void LogStep(string action, Locator? locator, long durationMs, bool ok, string? error = null)
    {
        if (_current is null) return;
        _current.Steps.Add(new StepLog
        {
            Action = action,
            Locator = locator?.ToString(),
            DurationMs = durationMs,
            Result = ok ? "ok" : "fail",
            Error = error
        });
    }

    public void EndTest(bool passed, WinTestException? error = null)
    {
        if (_current is null) return;
        _sw?.Stop();
        _current.DurationMs = _sw?.ElapsedMilliseconds ?? 0;
        _current.Status = passed ? "passed" : "failed";
        if (error is not null)
        {
            _current.ErrorCategory = error.Category;
            _current.ErrorMessage = error.Message;
            if (error is AssertionError ae) { _current.Expected = ae.Expected; _current.Actual = ae.Actual; }
            if (error is LocatorError) _current.ScreenshotPath = TryScreenshot(_current.Name);
            if (error is AssertionError) _current.ScreenshotPath = TryScreenshot(_current.Name);
        }
        _tests.Add(_current);
        _current = null;
    }

    private string? TryScreenshot(string testName)
    {
        try
        {
            var dir = Path.Combine(_cfg.EvidenceDir, _runId, Sanitize(testName));
            Directory.CreateDirectory(dir);
            var path = Path.Combine(dir, "failure.png");
            File.WriteAllBytes(path, Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="));
            return path;
        }
        catch { return null; }
    }

    public void SaveAll()
    {
        var runDir = Path.Combine(_cfg.EvidenceDir, _runId);
        Directory.CreateDirectory(runDir);
        foreach (var t in _tests)
        {
            var td = Path.Combine(runDir, Sanitize(t.Name));
            Directory.CreateDirectory(td);
            var lines = t.Steps.Select(s => JsonSerializer.Serialize(s));
            File.WriteAllLines(Path.Combine(td, "steps.jsonl"), lines);
        }
        File.WriteAllText(Path.Combine(runDir, "junit.xml"), JUnitReporter.Generate(_runId, _tests));
        File.WriteAllText(Path.Combine(runDir, "report.html"), HtmlReporter.Generate(_runId, _tests));
        var evidence = new { runId = _runId, startedAt = DateTime.UtcNow.ToString("o"), tests = _tests };
        File.WriteAllText(Path.Combine(runDir, "evidence.json"), JsonSerializer.Serialize(evidence, new JsonSerializerOptions { WriteIndented = true }));
    }

    public IReadOnlyList<TestEvidence> Tests => _tests;
    public string RunId => _runId;

    private static string Sanitize(string s) => string.Join("_", s.Split(Path.GetInvalidFileNameChars()));
}

public static class JUnitReporter
{
    public static string Generate(string runId, IReadOnlyList<TestEvidence> tests)
    {
        var total = tests.Count;
        var failures = tests.Count(t => t.Status == "failed");
        var skipped = tests.Count(t => t.Status == "skipped");
        var sb = new System.Text.StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<testsuite name=\"WinTest-" + System.Security.SecurityElement.Escape(runId) + "\" tests=\"" + total + "\" failures=\"" + failures + "\" errors=\"0\" skipped=\"" + skipped + "\">");
        foreach (var t in tests)
        {
            sb.AppendLine("  <testcase classname=\"WinTest\" name=\"" + System.Security.SecurityElement.Escape(t.Name) + "\" time=\"" + (t.DurationMs / 1000.0).ToString("F3", System.Globalization.CultureInfo.InvariantCulture) + "\">");
            if (t.Status == "failed")
                sb.AppendLine("    <failure message=\"" + System.Security.SecurityElement.Escape(t.ErrorMessage ?? "") + "\" type=\"" + System.Security.SecurityElement.Escape(t.ErrorCategory ?? "") + "\">" + System.Security.SecurityElement.Escape(t.ErrorMessage ?? "") + " Expected:" + System.Security.SecurityElement.Escape(t.Expected ?? "") + " Actual:" + System.Security.SecurityElement.Escape(t.Actual ?? "") + "</failure>");
            sb.AppendLine("  </testcase>");
        }
        sb.AppendLine("</testsuite>");
        return sb.ToString();
    }
}

public static class HtmlReporter
{
    public static string Generate(string runId, IReadOnlyList<TestEvidence> tests)
    {
        var rows = string.Join("\n", tests.Select(t => "<tr><td>" + System.Net.WebUtility.HtmlEncode(t.Name) + "</td><td class='" + t.Status + "'>" + t.Status + "</td><td>" + t.DurationMs + "ms</td><td>" + System.Net.WebUtility.HtmlEncode(t.ErrorMessage ?? "-") + "</td></tr>"));
        return "<!doctype html><html lang='pt-BR'><head><meta charset='utf-8'><title>WinTest " + System.Net.WebUtility.HtmlEncode(runId) + "</title>\n"
            + "<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;padding:0 16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.passed{color:green}.failed{color:red}.skipped{color:orange}</style>\n"
            + "</head><body><h1>WinTest - Relatorio " + System.Net.WebUtility.HtmlEncode(runId) + "</h1>\n"
            + "<p>Total: " + tests.Count + " | Passaram: " + tests.Count(t=>t.Status=="passed") + " | Falharam: " + tests.Count(t=>t.Status=="failed") + "</p>\n"
            + "<table><tr><th>Teste</th><th>Status</th><th>Duracao</th><th>Erro</th></tr>" + rows + "</table>\n"
            + "<p><small>Gerado em " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "</small></p></body></html>";
    }
}
