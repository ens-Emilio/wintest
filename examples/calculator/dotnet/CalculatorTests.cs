using WinTest.Core;
using WinTest.Core.Automation;
using WinTest.Core.Evidence;

// Page Object da Calculadora — mesmo ID nos 3 SDKs
class CalculatorPage : PageObject
{
    public CalculatorPage(Window w, WinTestConfig? c=null) : base(w,c) {}
    public void Press(string automationId) => Find(Locator.ByAutomationId(automationId)).Click();
    public string Result => Find(Locator.ByAutomationId("calc__display__result__text")).GetText();
    public void Clear() => Find(Locator.ByAutomationId("calc__actions__clear__button")).Click();
}

class CalculatorTests
{
    static int Main()
    {
        var cfg = new WinTestConfig { DefaultTimeoutMs = 2000, RetryIntervalMs = 50, EvidenceDir = "./evidence", AutoClose = true };
        var evidence = new EvidenceCollector(cfg, $"calc-dotnet-{DateTime.UtcNow:yyyyMMdd-HHmmss}");

        // Mock da calculadora: simula 7 + 8 = 15
        var calcElements = new Dictionary<string, MockElementHandle>
        {
            ["calc__keys__7__button"] = new MockElementHandle { Text = "7" },
            ["calc__keys__8__button"] = new MockElementHandle { Text = "8" },
            ["calc__keys__plus__button"] = new MockElementHandle { Text = "+" },
            ["calc__keys__equals__button"] = new MockElementHandle { Text = "=" },
            ["calc__actions__clear__button"] = new MockElementHandle { Text = "C" },
            ["calc__display__result__text"] = new MockElementHandle { Text = "15" },
        };
        // Result mock já retorna 15 para simplificar o exemplo

        int passed=0, failed=0;
        void Run(string name, Action body)
        {
            evidence.StartTest(name);
            try { body(); evidence.EndTest(true); Console.WriteLine($"  ✓ {name}"); passed++; }
            catch (Exception ex) { evidence.EndTest(false, ex is WinTestException wte ? wte : new InfraError(ex.Message)); Console.WriteLine($"  ✗ {name}: {ex.Message}"); failed++; }
        }

        // Em Windows real: var app = Application.Launch("calc.exe", cfg, evidence: evidence);
        // Aqui usamos Mock para rodar em qualquer OS
        var mockApp = new MockAppHandle("Calculator", calcElements);
        var window = new Window(mockApp.MainWindow, cfg, evidence);
        var page = new CalculatorPage(window, cfg);

        Run("7 + 8 = 15", () => {
            page.Press("calc__keys__7__button");
            page.Press("calc__keys__plus__button");
            page.Press("calc__keys__8__button");
            page.Press("calc__keys__equals__button");
            WinTestAssert.TextEquals(window.FindElement(Locator.ByAutomationId("calc__display__result__text")), "15", evidence);
        });

        Run("Botão C limpa display", () => {
            page.Clear();
            // simula clear
            calcElements["calc__display__result__text"].Text = "0";
            WinTestAssert.TextEquals(window.FindElement(Locator.ByAutomationId("calc__display__result__text")), "0", evidence);
        });

        Run("Texto contém", () => {
            WinTestAssert.TextContains(window.FindElement(Locator.ByAutomationId("calc__keys__7__button")), "7", evidence);
        });

        evidence.SaveAll();
        Console.WriteLine($"\n{passed} passed, {failed} failed — evidências em {cfg.EvidenceDir}/{evidence.RunId}/");
        return failed > 0 ? 1 : 0;
    }
}
