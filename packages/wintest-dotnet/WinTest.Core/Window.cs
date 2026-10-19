using System.Runtime.CompilerServices;
using WinTest.Core.Automation;
using WinTest.Core.Evidence;

[assembly: InternalsVisibleTo("WinTest.Tests")]
[assembly: InternalsVisibleTo("CalculatorTests")]

namespace WinTest.Core;

public sealed class Window
{
    private readonly IWindowHandle _handle;
    private readonly WinTestConfig _cfg;
    private readonly EvidenceCollector? _evidence;

    internal Window(IWindowHandle handle, WinTestConfig cfg, EvidenceCollector? evidence = null)
    { _handle = handle; _cfg = cfg; _evidence = evidence; }

    public string GetTitle() => _handle.Title;
    public void Maximize() => _handle.Maximize();
    public void Minimize() => _handle.Minimize();
    public void Focus() => _handle.Focus();
    public bool IsVisible => _handle.IsVisible;

    public void WaitUntilVisible(int? timeoutMs = null)
    {
        int t = timeoutMs ?? _cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < t)
        {
            if (_handle.IsVisible) return;
            Thread.Sleep(_cfg.RetryIntervalMs);
        }
        throw new InfraError($"Janela não ficou visível após {t}ms");
    }

    public void WaitUntilClosed(int? timeoutMs = null)
    {
        int t = timeoutMs ?? _cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < t)
        {
            if (!_handle.IsVisible) return;
            Thread.Sleep(_cfg.RetryIntervalMs);
        }
        throw new InfraError($"Janela não fechou após {t}ms");
    }

    public Element FindElement(Locator locator, int? timeoutMs = null)
    {
        int t = timeoutMs ?? _cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        IElementHandle? found = null;
        var deadline = DateTime.UtcNow.AddMilliseconds(t);
        while (DateTime.UtcNow < deadline)
        {
            found = _handle.FindElement(locator);
            if (found is not null) break;
            Thread.Sleep(_cfg.RetryIntervalMs);
        }
        if (found is null) throw new LocatorError(locator, t);
        var stableSw = System.Diagnostics.Stopwatch.StartNew();
        while (stableSw.ElapsedMilliseconds < 200) { Thread.Sleep(20); }
        _evidence?.LogStep($"FindElement {locator}", locator, sw.ElapsedMilliseconds, true);
        return new Element(found, _cfg, _evidence);
    }


    public IReadOnlyList<Element> FindElements(Locator locator, int? timeoutMs = null)
    {
        var handles = _handle.FindElements(locator);
        return handles.Select(h => new Element(h, _cfg, _evidence)).ToList();
    }
}
