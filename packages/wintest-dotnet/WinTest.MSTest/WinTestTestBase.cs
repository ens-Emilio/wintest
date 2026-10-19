using WinTest.Core;
using WinTest.Core.Evidence;

namespace WinTest.MSTest;

/// <summary>Base para testes MSTest. Em runner real herda de TestContext.</summary>
public abstract class WinTestTestBase : IDisposable
{
    protected WinTestConfig Config { get; } = WinTestConfig.Load();
    protected EvidenceCollector Evidence { get; }
    protected Application? App { get; private set; }

    protected WinTestTestBase()
    {
        Evidence = new EvidenceCollector(Config);
    }

    protected Application Launch(string exePath, string? args = null)
    {
        App = Application.Launch(exePath, Config, args, evidence: Evidence);
        return App;
    }

    public void Dispose()
    {
        try { App?.Dispose(); } catch { }
        try { Evidence.SaveAll(); } catch { }
    }
}
