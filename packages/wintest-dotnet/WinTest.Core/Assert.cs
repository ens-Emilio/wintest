using WinTest.Core.Evidence;

namespace WinTest.Core;

public static class WinTestAssert
{
    private static void Fail(string msg, string expected, string actual, EvidenceCollector? evidence, string testName)
    {
        var ex = new AssertionError(msg, expected, actual);
        evidence?.LogStep($"Assert {msg}", null, 0, false, ex.Message);
        throw ex;
    }

    public static void TextEquals(Element el, string expected, EvidenceCollector? evidence = null)
    {
        var actual = el.GetText();
        if (actual != expected) Fail("TextEquals falhou", expected, actual, evidence, "");
    }
    public static void TextContains(Element el, string substring, EvidenceCollector? evidence = null)
    {
        var actual = el.GetText();
        if (!actual.Contains(substring)) Fail("TextContains falhou", substring, actual, evidence, "");
    }
    public static void IsVisible(Element el, EvidenceCollector? evidence = null)
    {
        if (!el.IsVisible()) Fail("IsVisible falhou", "visible", "not visible", evidence, "");
    }
    public static void IsEnabled(Element el, EvidenceCollector? evidence = null)
    {
        if (!el.IsEnabled()) Fail("IsEnabled falhou", "enabled", "disabled", evidence, "");
    }
    public static void IsChecked(Element el, EvidenceCollector? evidence = null)
    {
        if (!el.IsSelected()) Fail("IsChecked falhou", "checked", "unchecked", evidence, "");
    }
    public static void IsUnchecked(Element el, EvidenceCollector? evidence = null)
    {
        if (el.IsSelected()) Fail("IsUnchecked falhou", "unchecked", "checked", evidence, "");
    }
    public static void Exists(Window window, Locator locator, EvidenceCollector? evidence = null)
    {
        try { window.FindElement(locator, 1000); }
        catch (LocatorError) { Fail("Exists falhou", "exists", "not found", evidence, ""); }
    }
    public static void NotExists(Window window, Locator locator, EvidenceCollector? evidence = null)
    {
        try { window.FindElement(locator, 500); Fail("NotExists falhou", "not exists", "found", evidence, ""); }
        catch (LocatorError) { /* ok */ }
    }
    public static void WindowTitleEquals(Window window, string expected, EvidenceCollector? evidence = null)
    {
        var actual = window.GetTitle();
        if (actual != expected) Fail("WindowTitleEquals falhou", expected, actual, evidence, "");
    }
}
