namespace WinTest.Core;

public abstract class WinTestException : Exception
{
    public string Category { get; }
    protected WinTestException(string category, string message) : base(message) => Category = category;
    protected WinTestException(string category, string message, Exception inner) : base(message, inner) => Category = category;
}

public sealed class LocatorError : WinTestException
{
    public Locator Locator { get; }
    public int TimeoutMs { get; }
    public LocatorError(Locator locator, int timeoutMs)
        : base("LocatorError", $"Elemento não encontrado após {timeoutMs}ms. Estratégia: {locator}")
    { Locator = locator; TimeoutMs = timeoutMs; }
    public LocatorError(Locator locator, int timeoutMs, string detail)
        : base("LocatorError", $"Elemento não encontrado após {timeoutMs}ms. Estratégia: {locator}. {detail}")
    { Locator = locator; TimeoutMs = timeoutMs; }
}

public sealed class AssertionError : WinTestException
{
    public string Expected { get; }
    public string Actual { get; }
    public AssertionError(string message, string expected, string actual)
        : base("AssertionError", $"{message} | Esperado: '{expected}' | Obtido: '{actual}'")
    { Expected = expected; Actual = actual; }
}

public sealed class InfraError : WinTestException
{
    public InfraError(string message) : base("InfraError", message) { }
    public InfraError(string message, Exception inner) : base("InfraError", message, inner) { }
}
