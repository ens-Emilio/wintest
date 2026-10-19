namespace WinTest.Core;

public enum LocatorStrategy { AutomationId, Name, ClassName, XPath, Image }

public sealed class Locator
{
    public LocatorStrategy Strategy { get; }
    public string Value { get; }
    public string? Extra { get; }
    public double ImageThreshold { get; }

    private Locator(LocatorStrategy s, string v, string? extra = null, double threshold = 0.95)
    { Strategy = s; Value = v; Extra = extra; ImageThreshold = threshold; }

    public static Locator ByAutomationId(string id) => new(LocatorStrategy.AutomationId, id);
    public static Locator ByName(string name) => new(LocatorStrategy.Name, name);
    public static Locator ByClassName(string className, string? controlType = null) => new(LocatorStrategy.ClassName, className, controlType);
    public static Locator ByXPath(string xpath) => new(LocatorStrategy.XPath, xpath);
    public static Locator ByImage(string imagePath, double threshold = 0.95) => new(LocatorStrategy.Image, imagePath, null, threshold);

    public override string ToString() => Extra is null ? $"{Strategy}='{Value}'" : $"{Strategy}='{Value}' Extra='{Extra}'";
}
