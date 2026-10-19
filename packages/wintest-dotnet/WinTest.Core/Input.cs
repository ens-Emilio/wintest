namespace WinTest.Core;

public static class Keyboard
{
    private static readonly List<string> _history = new();
    public static IReadOnlyList<string> History => _history;
    public static void ClearHistory() => _history.Clear();

    public static void PressKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) throw new ArgumentException("key não pode ser vazio", nameof(key));
        _history.Add($"PressKey:{key}");
    }
    public static void TypeGlobally(string text)
    {
        if (text is null) throw new ArgumentNullException(nameof(text));
        _history.Add($"TypeGlobally:{text}");
    }
    public static void HoldKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) throw new ArgumentException("key não pode ser vazio", nameof(key));
        _history.Add($"HoldKey:{key}");
    }
    public static void ReleaseKey(string key)
    {
        if (string.IsNullOrWhiteSpace(key)) throw new ArgumentException("key não pode ser vazio", nameof(key));
        _history.Add($"ReleaseKey:{key}");
    }
    public static void SendShortcut(string combo)
    {
        if (string.IsNullOrWhiteSpace(combo)) throw new ArgumentException("combo não pode ser vazio", nameof(combo));
        _history.Add($"SendShortcut:{combo}");
    }
}

public static class Mouse
{
    private static readonly List<string> _history = new();
    public static IReadOnlyList<string> History => _history;
    public static void ClearHistory() => _history.Clear();

    public static void MoveTo(int x, int y) => _history.Add($"MoveTo:{x},{y}");
    public static void Scroll(int delta) => _history.Add($"Scroll:{delta}");
}
