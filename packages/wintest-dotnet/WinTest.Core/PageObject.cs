namespace WinTest.Core;

/// <summary>Base para Page Objects. Isola o teste da UI.</summary>
public abstract class PageObject
{
    protected Window Window { get; }
    protected WinTestConfig Config { get; }

    protected PageObject(Window window, WinTestConfig? config = null)
    { Window = window; Config = config ?? new WinTestConfig(); }

    protected Element Find(Locator locator, int? timeoutMs = null) => Window.FindElement(locator, timeoutMs);
}
