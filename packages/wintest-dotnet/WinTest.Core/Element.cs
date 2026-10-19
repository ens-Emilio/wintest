using WinTest.Core.Automation;
using WinTest.Core.Evidence;

namespace WinTest.Core;

public sealed class Element
{
    private readonly IElementHandle _h;
    private readonly WinTestConfig _cfg;
    private readonly EvidenceCollector? _evidence;

    internal Element(IElementHandle handle, WinTestConfig cfg, EvidenceCollector? evidence = null)
    { _h = handle; _cfg = cfg; _evidence = evidence; }

    // Expor para testes internos
    internal IElementHandle Handle => _h;

    private void WaitReady()
    {
        // exists já garantido; verifica visible->enabled->stable
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < _cfg.DefaultTimeoutMs)
        {
            if (_h.IsVisible && _h.IsEnabled) break;
            Thread.Sleep(_cfg.RetryIntervalMs);
            if (sw.ElapsedMilliseconds >= _cfg.DefaultTimeoutMs)
                throw new LocatorError(Locator.ByAutomationId(_h.AutomationId), _cfg.DefaultTimeoutMs, $"Elemento não ficou pronto (visible={_h.IsVisible}, enabled={_h.IsEnabled})");
        }
        // estabilidade 200ms sem mudança
        Thread.Sleep(50);
    }

    private void Exec(string action, Action doAction, Locator? locator = null)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        try
        {
            WaitReady();
            doAction();
            _evidence?.LogStep(action, locator, sw.ElapsedMilliseconds, true);
        }
        catch (WinTestException ex)
        {
            _evidence?.LogStep(action, locator, sw.ElapsedMilliseconds, false, ex.Message);
            throw;
        }
        catch (Exception ex)
        {
            _evidence?.LogStep(action, locator, sw.ElapsedMilliseconds, false, ex.Message);
            throw new InfraError($"{action} falhou: {ex.Message}", ex);
        }
    }

    public void Click() => Exec("Click", () => _h.Click());
    public void DoubleClick() => Exec("DoubleClick", () => _h.DoubleClick());
    public void RightClick() => Exec("RightClick", () => _h.RightClick());
    public void Hover() => Exec("Hover", () => _h.Hover());
    public void TypeText(string text, bool clearFirst = false) => Exec($"TypeText '{text}'", () => _h.TypeText(text, clearFirst));
    public void Clear() => Exec("Clear", () => _h.Clear());
    public void DragAndDrop(Element target) => Exec("DragAndDrop", () => _h.DragTo(target._h));

    public string GetText() => _h.Text;
    public string GetValue() => _h.Value;
    public bool IsVisible() => _h.IsVisible;
    public bool IsEnabled() => _h.IsEnabled;
    public bool IsSelected() => _h.IsSelected;
    public string GetAttribute(string name) => _h.GetAttribute(name);

    public void WaitUntilEnabled(int? timeoutMs = null)
    {
        int t = timeoutMs ?? _cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < t) { if (_h.IsEnabled) return; Thread.Sleep(_cfg.RetryIntervalMs); }
        throw new LocatorError(Locator.ByAutomationId(_h.AutomationId), t, "Elemento não ficou habilitado");
    }
    public void WaitUntilVisible(int? timeoutMs = null)
    {
        int t = timeoutMs ?? _cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < t) { if (_h.IsVisible) return; Thread.Sleep(_cfg.RetryIntervalMs); }
        throw new LocatorError(Locator.ByAutomationId(_h.AutomationId), t, "Elemento não ficou visível");
    }
    public void WaitUntilTextEquals(string text, int? timeoutMs = null)
    {
        int t = timeoutMs ?? _cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < t) { if (_h.Text == text) return; Thread.Sleep(_cfg.RetryIntervalMs); }
        throw new AssertionError("WaitUntilTextEquals falhou", text, _h.Text);
    }
}
