namespace WinTest.Core;

public static class Keyboard
{
    public static void PressKey(string key) { /* delegado ao engine em Windows real */ }
    public static void TypeGlobally(string text) { }
    public static void HoldKey(string key) { }
    public static void ReleaseKey(string key) { }
    public static void SendShortcut(string combo) { } // ex: "Ctrl+S"
}

public static class Mouse
{
    public static void MoveTo(int x, int y) { }
    public static void Scroll(int delta) { }
}
