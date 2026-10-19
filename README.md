# WinTest — Plataforma Única de Testes Windows (3 SDKs) | WinTest — Unified Windows Testing Platform | WinTest — Plataforma Unificada de Pruebas Windows

> **PT-BR** · [English](#english) · [Español](#español)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI Windows](https://github.com/ens-Emilio/wintest/actions/workflows/ci-windows.yml/badge.svg)](https://github.com/ens-Emilio/wintest/actions/workflows/ci-windows.yml)

Monorepo poliglota com **paridade total**: **.NET (FlaUI) · Python · TypeScript (Bun/Node)** — uma única especificação, três SDKs, mesma experiência. Agora com **Wine lean** e **Studio Desktop (Tauri)** — tudo no mesmo repo.

```
spec/                  # Especificação unificada (fonte da verdade)
packages/
  wintest-dotnet/      # Stack A — Referência (FlaUI UIA2/UIA3)
  wintest-python/      # Stack B — Agilidade (PyPI)
  wintest-typescript/  # Stack C — Moderna (NPM/Bun)
  wintest-wine/        # Wine lean — LGPL-2.1 (Dockerfile + patches + runner)
  wintest-cli/         # CLI v2: doctor/run/wine/record/inspect/studio
  wintest-studio/      # App Desktop Tauri 2 + Svelte
tools/wintest-cli/     # Shim p/ compatibilidade (delega para packages/wintest-cli)
examples/calculator/   # Mesma Calculadora testada nos 3 SDKs
docs/                  # Site com abas .NET/Python/TS
ROADMAP.md             # Plano F1–F10 anotado (monorepo único)
```

---

## PT-BR — Português

### O que é

Plataforma única de testes de UI para Windows que permite testar qualquer aplicação Win32, WPF, WinForms, Electron e Qt com a mesma experiência, independente da linguagem do time. No Linux: `MockEngine` + `Wine lean` (sem VM). No Windows: `FlaUI` nativo.

### Quick Start

```bash
# CLI — verifica ambiente e scaffolda projetos
bun packages/wintest-cli/src/index.ts doctor
bun packages/wintest-cli/src/index.ts init my-app
bun packages/wintest-cli/src/index.ts wine --version
bun packages/wintest-cli/src/index.ts record --out recorded
bun packages/wintest-cli/src/index.ts inspect --filter login__

# .NET (Stack A — Referência)
dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj -c Release

# Python (Stack B)
pip install -e packages/wintest-python
pytest packages/wintest-python/tests -v

# TypeScript (Stack C)
bun install --cwd packages/wintest-typescript
bun test packages/wintest-typescript/tests/wintest.test.ts

# Wine lean (Linux sem Windows)
bun packages/wintest-cli/src/index.ts wine run ./MinhaApp.exe --headless --uia-bridge
bun packages/wintest-cli/src/index.ts run all --engine wine

# Studio Desktop
bun packages/wintest-cli/src/index.ts studio --dev   # Tauri dev
cd packages/wintest-studio && npm run tauri build     # AppImage

# Exemplos (Calculadora — 7+8=15) nos 3 SDKs
dotnet run --project examples/calculator/dotnet/CalculatorTests.csproj -c Release
pytest examples/calculator/python/test_calculator.py -v
bun test ./examples/calculator/typescript/calculator.test.ts
```

### Exemplo — Login (mesma API nas 3 linguagens)

**C#:**
```csharp
var app = Application.Launch("MeuApp.exe");
var win = app.MainWindow;
win.FindElement(Locator.ByAutomationId("login__form__usuario__input")).TypeText("admin", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__entrar__button")).Click();
WinTestAssert.TextEquals(win.FindElement(Locator.ByAutomationId("home__titulo__text")), "Bem-vindo");
app.Close();
```

**Python:**
```python
from wintest import Application, Locator, Assert
app = Application.launch("MeuApp.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__usuario__input")).type_text("admin", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__entrar__button")).click()
Assert.text_equals(win.find_element(Locator.by_automation_id("home__titulo__text")), "Bem-vindo")
app.close()
```

**TypeScript:**
```typescript
import { Application, Locator, Assert } from "@wintest/typescript";
const app = Application.launch("MeuApp.exe");
const win = app.mainWindow;
win.findElement(Locator.byAutomationId("login__form__usuario__input")).typeText("admin", true);
win.findElement(Locator.byAutomationId("login__form__entrar__button")).click();
Assert.textEquals(win.findElement(Locator.byAutomationId("home__titulo__text")), "Bem-vindo");
app.close();
```

### Arquitetura — 5 Camadas

| Camada | Responsabilidade |
|--------|-----------------|
| 1. Motor | UI Automation nativo (FlaUI / pywinauto / UIA COM) ou Mock/Wine lean no Linux |
| 2. Page Objects | Isola teste da UI |
| 3. Sync | `exists → visible → enabled → stable(200ms)` — 10s/500ms |
| 4. Orchestrator | Launch/Attach/Close/Kill + isolamento |
| 5. Evidence | `junit.xml + report.html + steps.jsonl + failure.png` unificado |

### Novidades F6–F10

- **Wine lean** (`packages/wintest-wine/`) — `Dockerfile.builder` + 3 patches (`uia-bridge/headless/automation-id`) + `runner/wine-runner.sh` — 400MB vs 30GB VM.
- **CLI v2** — `wine/record/inspect/studio` + `run --engine wine|mock|native` (inspirado `anomalyco/opencode`).
- **Studio** (`packages/wintest-studio/`) — `Tauri 2 + Svelte` 8MB — Inspector/Runner/Evidence.
- **Pack** — `dist/PKGBUILD` (AUR) + `CI package job` (NuGet/PyPI/NPM).
- **ROADMAP.md** — plano anotado F1–F10 (monorepo único).

### Spec & Docs

- `spec/api-spec.md` + `api-spec.json` — contrato (nenhum SDK diverge)
- `spec/locators.md` — prioridade `AutomationId > Name > ClassName > XPath > Image`
- `spec/automation-ids.md` — guia para devs (`janela__secao__elemento__tipo`)
- `docs/` — documentação com abas tri-linguagem + `ROADMAP.md`

### CI

`.github/workflows/ci-windows.yml` — 6 jobs: `dotnet/python/typescript/wine/studio/package` (windows + ubuntu).

### Licença

`Apache-2.0` — veja [LICENSE](LICENSE). `packages/wintest-wine/` é `LGPL-2.1` isolado.

---

## English

### What it is

A unified Windows UI testing platform that lets you test any Win32, WPF, WinForms, Electron, or Qt application with the same experience, regardless of your team's language. On Linux: `MockEngine` + lean `Wine`. On Windows: native `FlaUI`.

### Quick Start

```bash
bun packages/wintest-cli/src/index.ts doctor
bun packages/wintest-cli/src/index.ts init my-app

dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj -c Release
pip install -e packages/wintest-python && pytest packages/wintest-python/tests -v
bun install --cwd packages/wintest-typescript && bun test packages/wintest-typescript/tests/wintest.test.ts
bun packages/wintest-cli/src/index.ts wine run ./MyApp.exe --headless --uia-bridge
```

*See PT-BR section for API examples (same across 3 languages).*

### CI

`.github/workflows/ci-windows.yml` — 6 jobs (dotnet/python/typescript/wine/studio/package).

### License

`Apache-2.0` — see [LICENSE](LICENSE). `packages/wintest-wine/` is `LGPL-2.1`.

---

## Español

### Qué es

Plataforma unificada de pruebas de UI para Windows — 3 SDKs con paridad total. En Linux: `MockEngine` + `Wine` lean. En Windows: `FlaUI` nativo.

### Inicio Rápido

```bash
bun packages/wintest-cli/src/index.ts doctor
dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj -c Release
pip install -e packages/wintest-python && pytest packages/wintest-python/tests -v
bun test packages/wintest-typescript/tests/wintest.test.ts
```

*Ver sección PT-BR para ejemplos (misma API en 3 lenguajes).*

### Licencia

`Apache-2.0` — ver [LICENSE](LICENSE).
