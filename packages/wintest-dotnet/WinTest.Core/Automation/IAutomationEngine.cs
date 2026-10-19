namespace WinTest.Core.Automation;

public interface IAutomationEngine
{
    IAppHandle Launch(string exePath, string? args, string? workingDir, int timeoutMs);
    IAppHandle Attach(int processId);
    IAppHandle AttachByTitle(string title);
}

public interface IAppHandle : IDisposable
{
    int ProcessId { get; }
    bool IsRunning { get; }
    IWindowHandle MainWindow { get; }
    void Close();
    void Kill();
}

public interface IWindowHandle
{
    string Title { get; }
    IElementHandle? FindElement(Locator locator);
    IReadOnlyList<IElementHandle> FindElements(Locator locator);
    void Maximize();
    void Minimize();
    void Focus();
    bool IsVisible { get; }
}

public interface IElementHandle
{
    string AutomationId { get; }
    string Name { get; }
    string ClassName { get; }
    string Text { get; }
    string Value { get; }
    bool IsVisible { get; }
    bool IsEnabled { get; }
    bool IsSelected { get; }
    void Click();
    void DoubleClick();
    void RightClick();
    void Hover();
    void TypeText(string text, bool clearFirst);
    void Clear();
    void DragTo(IElementHandle target);
    string GetAttribute(string name);
}
