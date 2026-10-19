using WinTest.Core;
using WinTest.Core.Automation;
using WinTest.Core.Evidence;

int passed = 0, failed = 0;
void Test(string name, Action body)
{
    try { body(); Console.WriteLine($"  PASS {name}"); passed++; }
    catch (Exception ex) { Console.WriteLine($"  FAIL {name}: {ex.GetType().Name}: {ex.Message}"); failed++; }
}
void Assert(bool cond, string msg) { if (!cond) throw new Exception("Assert falhou: " + msg); }

Console.WriteLine("WinTest .NET - Testes");

Test("Locator.ByAutomationId", () => {
    var l = Locator.ByAutomationId("login__form__entrar__button");
    Assert(l.Strategy == LocatorStrategy.AutomationId, "strategy");
    Assert(l.Value == "login__form__entrar__button", "value");
});
Test("Locator.ByName", () => { var l = Locator.ByName("Entrar"); Assert(l.Strategy == LocatorStrategy.Name, "name"); });
Test("Locator priorities", () => {
    Assert(Locator.ByAutomationId("x").ToString().Contains("AutomationId"), "aid str");
});
Test("WinTestConfig defaults", () => {
    var c = new WinTestConfig();
    Assert(c.DefaultTimeoutMs == 10000, "timeout");
    Assert(c.RetryIntervalMs == 500, "interval");
    Assert(c.AutoClose == true, "autoclose");
});
Test("Application.Launch + IsRunning + Close", () => {
    var app = Application.Launch("calc.exe");
    Assert(app.IsRunning, "running");
    Assert(app.MainWindow.GetTitle().Length > 0, "title");
    app.Close();
    Assert(!app.IsRunning, "closed");
});
Test("Application.Launch empty path -> InfraError", () => {
    bool threw = false;
    try { Application.Launch(""); } catch (InfraError) { threw = true; }
    Assert(threw, "should throw InfraError");
});
Test("Application.Kill", () => {
    var app = Application.Launch("notepad.exe");
    app.Kill();
    Assert(!app.IsRunning, "killed");
});
Test("Window.FindElement by AutomationId", () => {
    var engine = new MockEngine();
    var app2 = new MockAppHandle("TestApp", new Dictionary<string, MockElementHandle>{
        ["login__form__entrar__button"] = new MockElementHandle{ Name="Entrar", Text="Entrar" }
    });
    var cfg = new WinTestConfig{ DefaultTimeoutMs=1000, RetryIntervalMs=50 };
    var win = new Window(app2.MainWindow, cfg);
    var el = win.FindElement(Locator.ByAutomationId("login__form__entrar__button"));
    Assert(el.GetText()=="Entrar", "text");
});
Test("Window.FindElement not found -> LocatorError", () => {
    var app2 = new MockAppHandle("Empty", (Dictionary<string, MockElementHandle>?)null);
    var win = new Window(app2.MainWindow, new WinTestConfig{ DefaultTimeoutMs=300, RetryIntervalMs=50 });
    bool threw=false;
    try { win.FindElement(Locator.ByAutomationId("nao_existe__x")); } catch (LocatorError e) { threw=true; Assert(e.Category=="LocatorError","cat"); }
    Assert(threw, "should throw LocatorError");
});
Test("Window.FindElements empty", () => {
    var app2 = new MockAppHandle("Empty", (Dictionary<string, MockElementHandle>?)null);
    var win = new Window(app2.MainWindow, new WinTestConfig());
    var els = win.FindElements(Locator.ByAutomationId("x"));
    Assert(els.Count==0, "empty");
});
Test("Element.Click + TypeText + Clear + GetText", () => {
    var h = new MockElementHandle{ Text="hello", IsVisible=true, IsEnabled=true };
    var el = new Element(h, new WinTestConfig{ DefaultTimeoutMs=500, RetryIntervalMs=20 });
    el.Click();
    Assert(h.Clicked, "clicked");
    el.TypeText(" world");
    Assert(el.GetText()=="hello world", "type");
    el.Clear();
    Assert(el.GetText()=="", "clear");
    el.TypeText("novo", clearFirst:true);
    Assert(el.GetValue()=="novo", "clearFirst");
});
Test("Element.DoubleClick/RightClick/Hover", () => {
    var h = new MockElementHandle{ IsVisible=true, IsEnabled=true };
    var el = new Element(h, new WinTestConfig{ DefaultTimeoutMs=500, RetryIntervalMs=20 });
    el.DoubleClick(); Assert(h.DoubleClicked,"dc");
    el.RightClick(); Assert(h.RightClicked,"rc");
    el.Hover();
});
Test("Element.IsVisible/IsEnabled/IsSelected/GetAttribute", () => {
    var h = new MockElementHandle{ IsVisible=true, IsEnabled=false, IsSelected=true, Text="t" };
    h.SetAttribute("HelpText","ajuda");
    var el = new Element(h, new WinTestConfig());
    Assert(el.IsVisible()==true,"vis");
    Assert(el.IsEnabled()==false,"ena");
    Assert(el.IsSelected()==true,"sel");
    Assert(el.GetAttribute("HelpText")=="ajuda","attr");
});
Test("Element.WaitUntilEnabled/Visible/TextEquals", () => {
    var h = new MockElementHandle{ IsVisible=true, IsEnabled=true, Text="ok" };
    var el = new Element(h, new WinTestConfig{ DefaultTimeoutMs=500, RetryIntervalMs=20 });
    el.WaitUntilEnabled();
    el.WaitUntilVisible();
    el.WaitUntilTextEquals("ok");
    bool threw=false;
    try { el.WaitUntilTextEquals("nope", 100); } catch (AssertionError) { threw=true; }
    Assert(threw, "text equals should fail");
});
Test("Element.DragAndDrop", () => {
    var h1 = new MockElementHandle{ IsVisible=true, IsEnabled=true };
    var h2 = new MockElementHandle{ IsVisible=true, IsEnabled=true };
    var cfg = new WinTestConfig{ DefaultTimeoutMs=500, RetryIntervalMs=20 };
    new Element(h1,cfg).DragAndDrop(new Element(h2,cfg));
});
Test("WinTestAssert.TextEquals pass/fail", () => {
    var h = new MockElementHandle{ Text="hello", IsVisible=true, IsEnabled=true };
    var el = new Element(h, new WinTestConfig());
    WinTestAssert.TextEquals(el, "hello");
    bool threw=false;
    try { WinTestAssert.TextEquals(el, "world"); } catch (AssertionError e) { threw=true; Assert(e.Expected=="world","exp"); }
    Assert(threw,"should fail");
});
Test("WinTestAssert TextContains/IsVisible/IsEnabled/IsChecked", () => {
    var h = new MockElementHandle{ Text="hello world", IsVisible=true, IsEnabled=true, IsSelected=false };
    var el = new Element(h, new WinTestConfig());
    WinTestAssert.TextContains(el, "world");
    WinTestAssert.IsVisible(el);
    WinTestAssert.IsEnabled(el);
    WinTestAssert.IsUnchecked(el);
    h.IsSelected=true;
    WinTestAssert.IsChecked(el);
});
Test("WinTestAssert Exists/NotExists/WindowTitleEquals", () => {
    var app2 = new MockAppHandle("MyApp", new Dictionary<string, MockElementHandle>{ ["a__b"] = new MockElementHandle{} });
    var win = new Window(app2.MainWindow, new WinTestConfig{ DefaultTimeoutMs=300, RetryIntervalMs=20 });
    WinTestAssert.Exists(win, Locator.ByAutomationId("a__b"));
    WinTestAssert.NotExists(win, Locator.ByAutomationId("nope__x"));
    WinTestAssert.WindowTitleEquals(win, "MyApp");
});
Test("PageObject base", () => {
    var app2 = new MockAppHandle("LoginWindow", new Dictionary<string, MockElementHandle>{
        ["login__form__usuario__input"] = new MockElementHandle{ Text="" },
        ["login__form__entrar__button"] = new MockElementHandle{ Text="Entrar" }
    });
    var win = new Window(app2.MainWindow, new WinTestConfig{ DefaultTimeoutMs=500, RetryIntervalMs=20 });
    var page = new TestLoginPage(win);
    page.EnterUser("admin");
    Assert(page.GetEnterButtonText()=="Entrar","btn text");
    page.ClickEnter();
    Assert(((MockElementHandle)app2.MainWindow.FindElement(Locator.ByAutomationId("login__form__entrar__button"))!).Clicked,"clicked");
});
Test("EvidenceCollector JUnit + HTML + steps", () => {
    var cfg = new WinTestConfig{ EvidenceDir = Path.Combine(Path.GetTempPath(), "wintest-dotnet-test-"+Guid.NewGuid().ToString("N")[..8]) };
    var col = new EvidenceCollector(cfg, "test-run-1");
    col.StartTest("Login deve entrar");
    col.LogStep("Click", Locator.ByAutomationId("x"), 12, true);
    col.EndTest(true);
    col.StartTest("Falha esperada");
    col.EndTest(false, new AssertionError("falhou","a","b"));
    col.SaveAll();
    Assert(File.Exists(Path.Combine(cfg.EvidenceDir, "test-run-1", "junit.xml")),"junit");
    Assert(File.Exists(Path.Combine(cfg.EvidenceDir, "test-run-1", "report.html")),"html");
    Assert(File.Exists(Path.Combine(cfg.EvidenceDir, "test-run-1", "evidence.json")),"json");
    var junit = File.ReadAllText(Path.Combine(cfg.EvidenceDir, "test-run-1", "junit.xml"));
    Assert(junit.Contains("testsuite"),"junit content");
    Directory.Delete(cfg.EvidenceDir, true);
});
Test("SyncEngine WaitUntilAsync", () => {
    int calls=0;
    var task = SyncEngine.WaitUntilAsync<string>(() => { calls++; return calls>=3 ? "ready" : null; }, v=>v=="ready", 2000, 20);
    var r = task.GetAwaiter().GetResult();
    Assert(r=="ready","sync");
});

Console.WriteLine(passed + " passed, " + failed + " failed");
if (failed>0) Environment.Exit(1);

class TestLoginPage : PageObject
{
    public TestLoginPage(Window w, WinTestConfig? c=null): base(w,c){}
    public void EnterUser(string u) => Find(Locator.ByAutomationId("login__form__usuario__input")).TypeText(u, true);
    public void ClickEnter() => Find(Locator.ByAutomationId("login__form__entrar__button")).Click();
    public string GetEnterButtonText() => Find(Locator.ByAutomationId("login__form__entrar__button")).GetText();
}
