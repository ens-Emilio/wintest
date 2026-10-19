using WinTest.Core.Automation;

namespace WinTest.Core.Automation;

public sealed class MockEngine : IAutomationEngine
{
    public IAppHandle Launch(string exePath, string? args, string? workingDir, int timeoutMs)
    {
        if (string.IsNullOrWhiteSpace(exePath)) throw new InfraError("Caminho do executável não pode ser vazio");
        return new MockAppHandle(exePath, args);
    }
    public IAppHandle Attach(int processId) => new MockAppHandle($"attached:{processId}", (string?)null);
    public IAppHandle AttachByTitle(string title) => new MockAppHandle($"attached:{title}", (string?)null);
}

public sealed class MockAppHandle : IAppHandle
{
    private bool _running = true;
    public string ExePath { get; }
    public string? Args { get; }
    public int ProcessId { get; } = Random.Shared.Next(1000, 99999);
    public bool IsRunning => _running;
    public IWindowHandle MainWindow { get; }

    public MockAppHandle(string exe, string? args)
    {
        ExePath = exe; Args = args;
        MainWindow = new MockWindowHandle("Mock Window - " + Path.GetFileNameWithoutExtension(exe));
    }
    public MockAppHandle(string title, Dictionary<string, MockElementHandle>? elements)
    {
        ExePath = title; Args = null;
        var w = new MockWindowHandle(title);
        if (elements != null) foreach (var kv in elements) w.AddElement(kv.Key, kv.Value);
        MainWindow = w;
    }

    // Non-ambiguous: explicit factory for Attach cases
    public void Close() => _running = false;
    public void Kill() => _running = false;
    public void Dispose() => Kill();
}

public sealed class MockWindowHandle : IWindowHandle
{
    public string Title { get; private set; }
    public bool IsVisible => true;
    private readonly Dictionary<string, MockElementHandle> _byAutomationId = new();
    private readonly List<MockElementHandle> _all = new();

    public MockWindowHandle(string title) => Title = title;

    public void AddElement(string automationId, MockElementHandle el)
    {
        el.AutomationId = automationId;
        _byAutomationId[automationId] = el;
        _all.Add(el);
    }
    public void SetTitle(string t) => Title = t;

    public IElementHandle? FindElement(Locator locator) => locator.Strategy switch
    {
        LocatorStrategy.AutomationId => _byAutomationId.TryGetValue(locator.Value, out var e) ? e : null,
        LocatorStrategy.Name => _all.FirstOrDefault(x => x.Name == locator.Value),
        LocatorStrategy.ClassName => _all.FirstOrDefault(x => x.ClassName == locator.Value),
        LocatorStrategy.XPath => _all.FirstOrDefault(),
        LocatorStrategy.Image => null,
        _ => null
    };
    public IReadOnlyList<IElementHandle> FindElements(Locator locator) => locator.Strategy switch
    {
        LocatorStrategy.AutomationId => _byAutomationId.TryGetValue(locator.Value, out var e) ? new[] { e } : Array.Empty<IElementHandle>(),
        LocatorStrategy.Name => _all.Where(x => x.Name == locator.Value).ToArray(),
        LocatorStrategy.ClassName => _all.Where(x => x.ClassName == locator.Value).ToArray(),
        LocatorStrategy.XPath => _all.ToArray(),
        _ => Array.Empty<IElementHandle>()
    };
    public void Maximize() { }
    public void Minimize() { }
    public void Focus() { }
}

public sealed class MockElementHandle : IElementHandle
{
    public string AutomationId { get; set; } = "";
    public string Name { get; set; } = "";
    public string ClassName { get; set; } = "Button";
    public string Text { get; set; } = "";
    public string Value { get; set; } = "";
    public bool IsVisible { get; set; } = true;
    public bool IsEnabled { get; set; } = true;
    public bool IsSelected { get; set; } = false;
    private readonly Dictionary<string, string> _attrs = new();

    public bool Clicked { get; private set; }
    public bool DoubleClicked { get; private set; }
    public bool RightClicked { get; private set; }
    public string TypedText { get; private set; } = "";

    public void Click() => Clicked = true;
    public void DoubleClick() => DoubleClicked = true;
    public void RightClick() => RightClicked = true;
    public void Hover() { }
    public void TypeText(string text, bool clearFirst)
    {
        if (clearFirst) { Text = ""; Value = ""; }
        Text += text; Value += text; TypedText = text;
    }
    public void Clear() { Text = ""; Value = ""; }
    public void DragTo(IElementHandle target) { }
    public string GetAttribute(string name) => _attrs.TryGetValue(name, out var v) ? v : "";
    public void SetAttribute(string name, string value) => _attrs[name] = value;
}
