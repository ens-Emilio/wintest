namespace WinTest.Core;

public sealed class WinTestConfig
{
    public int DefaultTimeoutMs { get; set; } = 10_000;
    public int RetryIntervalMs { get; set; } = 500;
    public string EvidenceDir { get; set; } = "./evidence";
    public bool VideoEnabled { get; set; } = false;
    public string ReportLanguage { get; set; } = "pt-BR";
    public bool AutoClose { get; set; } = true;

    public static WinTestConfig Load(string? path = null)
    {
        path ??= Path.Combine(Directory.GetCurrentDirectory(), "wintest.config.json");
        if (!File.Exists(path)) return new WinTestConfig();
        var json = File.ReadAllText(path);
        return System.Text.Json.JsonSerializer.Deserialize<WinTestConfig>(json,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new WinTestConfig();
    }
}
