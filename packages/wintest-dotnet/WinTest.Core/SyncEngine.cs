namespace WinTest.Core;

public static class SyncEngine
{
    public static async Task<T> WaitUntilAsync<T>(Func<T?> getValue, Func<T, bool> condition, int timeoutMs, int intervalMs, CancellationToken ct = default) where T : class
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            ct.ThrowIfCancellationRequested();
            var v = getValue();
            if (v is not null && condition(v)) return v;
            await Task.Delay(intervalMs, ct);
        }
        throw new TimeoutException($"Timeout após {timeoutMs}ms");
    }

    public static async Task WaitUntilAsync(Func<bool> condition, int timeoutMs, int intervalMs, CancellationToken ct = default)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeoutMs)
        {
            ct.ThrowIfCancellationRequested();
            if (condition()) return;
            await Task.Delay(intervalMs, ct);
        }
        throw new TimeoutException($"Timeout após {timeoutMs}ms");
    }

    public static T WaitFor<T>(Func<T?> probe, Func<T, bool> ready, WinTestConfig cfg, int? timeoutMs = null) where T : class
    {
        int timeout = timeoutMs ?? cfg.DefaultTimeoutMs;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        while (sw.ElapsedMilliseconds < timeout)
        {
            var v = probe();
            if (v is not null && ready(v)) return v;
            Thread.Sleep(cfg.RetryIntervalMs);
        }
        throw new TimeoutException($"Timeout após {timeout}ms");
    }
}
