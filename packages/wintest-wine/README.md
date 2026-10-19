# wintest-wine — Wine Lean para WinTest (LGPL-2.1)

> **Licença:** `LGPL-2.1` — isolado em `packages/wintest-wine/` (resto do monorepo `Apache-2.0`).

Fork lean: não clona 2GB `winehq/wine`. Usa `Dockerfile.builder` que baixa `wine-staging` e aplica `patches/*.patch`.

## Patches (3)

| Patch | O que faz |
|-------|-----------|
| `001-uia-bridge.patch` | Expõe `UIAutomationCore.dll` fake → `wineserver` socket que `WinTest` lê |
| `002-headless.patch` | Roda sem X11/Wayland (`Xvfb`) para CLI/CI |
| `003-automation-id.patch` | Garante `AutomationId` visível na árvore Wine |

## Build

```bash
docker build -f packages/wintest-wine/Dockerfile.builder -t wintest-wine:10 ./packages/wintest-wine
# ou via pacman (binário pré-build no ghcr.io)
```

## Uso via CLI

```bash
wintest wine run ./MinhaApp.exe --headless --uia-bridge
wintest run --engine wine --evidence ./evidence
wintest wine --version
```

## Matriz Wine UIA

| Tecnologia | Suporte |
|------------|---------|
| Win32 | 95% |
| Electron | 90% |
| WPF | 60% (fallback VM para crítico) |
| WinForms | 85% |

> Fallback: `wintest run --engine native` roda no `windows-latest` (CI) sem Wine.
