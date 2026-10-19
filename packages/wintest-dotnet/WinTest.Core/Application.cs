using WinTest.Core.Automation;
using WinTest.Core.Evidence;

namespace WinTest.Core;

public sealed class Application : IDisposable
{
    private readonly IAppHandle _handle;
    private readonly WinTestConfig _cfg;
    private readonly EvidenceCollector? _evidence;

    internal Application(IAppHandle handle, WinTestConfig cfg, EvidenceCollector? evidence = null)
    { _handle = handle; _cfg = cfg; _evidence = evidence; }

    public int ProcessId => _handle.ProcessId;
    public bool IsRunning => _handle.IsRunning;
    public Window MainWindow => new Window(_handle.MainWindow, _cfg, _evidence);

    public static Application Launch(string exePath, WinTestConfig? cfg = null, string? args = null, string? workingDir = null, int? timeoutMs = null, IAutomationEngine? engine = null, EvidenceCollector? evidence = null)
    {
        cfg ??= WinTestConfig.Load();
        engine ??= CreateEngine();
        if (string.IsNullOrWhiteSpace(exePath)) throw new InfraError("Caminho do executável não pode ser vazio");
        // Em Linux/Mock, não exige arquivo existir; em Windows real, validaria
        try
        {
            var h = engine.Launch(exePath, args, workingDir, timeoutMs ?? cfg.DefaultTimeoutMs);
            return new Application(h, cfg, evidence);
        }
        catch (WinTestException) { throw; }
        catch (Exception ex) { throw new InfraError($"Falha ao iniciar aplicação '{exePath}': {ex.Message}", ex); }
    }

    public static Application Attach(int processId, WinTestConfig? cfg = null, IAutomationEngine? engine = null)
    {
        cfg ??= WinTestConfig.Load();
        engine ??= CreateEngine();
        try { return new Application(engine.Attach(processId), cfg); }
        catch (Exception ex) { throw new InfraError($"Falha ao anexar ao processo {processId}: {ex.Message}", ex); }
    }

    public static Application AttachByTitle(string title, WinTestConfig? cfg = null, IAutomationEngine? engine = null)
    {
        cfg ??= WinTestConfig.Load();
        engine ??= CreateEngine();
        try { return new Application(engine.AttachByTitle(title), cfg); }
        catch (Exception ex) { throw new InfraError($"Falha ao anexar à janela '{title}': {ex.Message}", ex); }
    }

    public void Close()
    {
        try { _handle.Close(); } catch { _handle.Kill(); }
    }

    public void Kill() => _handle.Kill();
    public void Dispose() { if (_cfg.AutoClose) { try { Close(); } catch { Kill(); } } _handle.Dispose(); }

    private static IAutomationEngine CreateEngine()
    {
        // Tenta FlaUI via reflection se disponível em Windows; caso contrário Mock
        // FlaUI será plugado quando pacote FlaUI.UIA3 estiver instalado
        return new MockEngine();
    }
}
