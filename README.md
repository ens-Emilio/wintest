# WinTest — Plataforma Única de Testes Windows (3 SDKs) | WinTest — Unified Windows Testing Platform | WinTest — Plataforma Unificada de Pruebas Windows

> **PT-BR** · [English](#english) · [Español](#español)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![CI Windows](https://github.com/ens-Emilio/wintest/actions/workflows/ci-windows.yml/badge.svg)](https://github.com/ens-Emilio/wintest/actions/workflows/ci-windows.yml)

Monorepo poliglota com **paridade total**: **.NET (FlaUI) · Python · TypeScript (Bun/Node)** — uma única especificação, três SDKs, mesma experiência.

```
spec/                  # Especificação unificada (fonte da verdade)
packages/
  wintest-dotnet/      # Stack A — Referência (FlaUI UIA2/UIA3)
  wintest-python/      # Stack B — Agilidade (PyPI)
  wintest-typescript/  # Stack C — Moderna (NPM/Bun)
tools/wintest-cli/     # CLI única: doctor / run / init
examples/calculator/   # Mesma Calculadora testada nos 3 SDKs
docs/                  # Site com abas .NET/Python/TS
```

---

## PT-BR — Português

### O que é

Plataforma única de testes de UI para Windows que permite testar qualquer aplicação Win32, WPF, WinForms, Electron e Qt com a mesma experiência, independente da linguagem do time.

### Quick Start

```bash
# CLI — verifica ambiente e scaffolda projetos
bun tools/wintest-cli/src/index.ts doctor
bun tools/wintest-cli/src/index.ts init my-app

# .NET (Stack A — Referência)
dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj -c Release

# Python (Stack B)
pip install -e packages/wintest-python
pytest packages/wintest-python/tests -v

# TypeScript (Stack C)
bun install --cwd packages/wintest-typescript
bun test packages/wintest-typescript/tests/wintest.test.ts

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
| 1. Motor | UI Automation nativo (FlaUI / pywinauto / UIA COM) |
| 2. Page Objects | Isola teste da UI |
| 3. Sync | `exists → visible → enabled → stable(200ms)` — 10s/500ms |
| 4. Orchestrator | Launch/Attach/Close/Kill + isolamento |
| 5. Evidence | `junit.xml + report.html + steps.jsonl + failure.png` unificado |

### Spec & Docs

- `spec/api-spec.md` + `api-spec.json` — contrato (nenhum SDK diverge)
- `spec/locators.md` — prioridade `AutomationId > Name > ClassName > XPath > Image`
- `spec/automation-ids.md` — guia para devs (`janela__secao__elemento__tipo`)
- `docs/` — documentação com abas tri-linguagem

### CI

`.github/workflows/ci-windows.yml` — 3 jobs paralelos em `windows-latest` (sessão gráfica real).

### Licença

Apache 2.0 — veja [LICENSE](LICENSE).

---

## English

### What it is

A unified Windows UI testing platform that lets you test any Win32, WPF, WinForms, Electron, or Qt application with the same experience, regardless of your team's language.

### Quick Start

```bash
# CLI — check environment & scaffold projects
bun tools/wintest-cli/src/index.ts doctor
bun tools/wintest-cli/src/index.ts init my-app

# .NET (Stack A — Reference)
dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj -c Release

# Python (Stack B)
pip install -e packages/wintest-python
pytest packages/wintest-python/tests -v

# TypeScript (Stack C)
bun install --cwd packages/wintest-typescript
bun test packages/wintest-typescript/tests/wintest.test.ts

# Examples (Calculator — 7+8=15) on all 3 stacks
dotnet run --project examples/calculator/dotnet/CalculatorTests.csproj -c Release
pytest examples/calculator/python/test_calculator.py -v
bun test ./examples/calculator/typescript/calculator.test.ts
```

### Example — Login (same API in 3 languages)

**C#:**
```csharp
var app = Application.Launch("MyApp.exe");
var win = app.MainWindow;
win.FindElement(Locator.ByAutomationId("login__form__user__input")).TypeText("admin", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__login__button")).Click();
WinTestAssert.TextEquals(win.FindElement(Locator.ByAutomationId("home__title__text")), "Welcome");
app.Close();
```

**Python:**
```python
from wintest import Application, Locator, Assert
app = Application.launch("MyApp.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__user__input")).type_text("admin", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__login__button")).click()
Assert.text_equals(win.find_element(Locator.by_automation_id("home__title__text")), "Welcome")
app.close()
```

**TypeScript:**
```typescript
import { Application, Locator, Assert } from "@wintest/typescript";
const app = Application.launch("MyApp.exe");
const win = app.mainWindow;
win.findElement(Locator.byAutomationId("login__form__user__input")).typeText("admin", true);
win.findElement(Locator.byAutomationId("login__form__login__button")).click();
Assert.textEquals(win.findElement(Locator.byAutomationId("home__title__text")), "Welcome");
app.close();
```

### Architecture — 5 Layers

| Layer | Responsibility |
|-------|---------------|
| 1. Engine | Native UI Automation (FlaUI / pywinauto / UIA COM) |
| 2. Page Objects | Isolates tests from UI |
| 3. Sync | `exists → visible → enabled → stable(200ms)` — 10s/500ms |
| 4. Orchestrator | Launch/Attach/Close/Kill + isolation |
| 5. Evidence | Unified `junit.xml + report.html + steps.jsonl + failure.png` |

### Spec & Docs

- `spec/api-spec.md` + `api-spec.json` — contract (no SDK diverges)
- `spec/locators.md` — priority `AutomationId > Name > ClassName > XPath > Image`
- `spec/automation-ids.md` — guide for app devs (`window__section__element__type`)
- `docs/` — tri-language tabbed documentation

### CI

`.github/workflows/ci-windows.yml` — 3 parallel jobs on `windows-latest` (real graphical session).

### License

Apache 2.0 — see [LICENSE](LICENSE).

---

## Español

### Qué es

Plataforma unificada de pruebas de UI para Windows que permite probar cualquier aplicación Win32, WPF, WinForms, Electron o Qt con la misma experiencia, sin importar el lenguaje del equipo.

### Inicio Rápido

```bash
# CLI — verifica entorno y crea proyectos
bun tools/wintest-cli/src/index.ts doctor
bun tools/wintest-cli/src/index.ts init my-app

# .NET (Stack A — Referencia)
dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj -c Release

# Python (Stack B)
pip install -e packages/wintest-python
pytest packages/wintest-python/tests -v

# TypeScript (Stack C)
bun install --cwd packages/wintest-typescript
bun test packages/wintest-typescript/tests/wintest.test.ts

# Ejemplos (Calculadora — 7+8=15) en 3 stacks
dotnet run --project examples/calculator/dotnet/CalculatorTests.csproj -c Release
pytest examples/calculator/python/test_calculator.py -v
bun test ./examples/calculator/typescript/calculator.test.ts
```

### Ejemplo — Login (misma API en 3 lenguajes)

**C#:**
```csharp
var app = Application.Launch("MiApp.exe");
var win = app.MainWindow;
win.FindElement(Locator.ByAutomationId("login__form__usuario__input")).TypeText("admin", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__entrar__button")).Click();
WinTestAssert.TextEquals(win.FindElement(Locator.ByAutomationId("home__titulo__text")), "Bienvenido");
app.Close();
```

**Python:**
```python
from wintest import Application, Locator, Assert
app = Application.launch("MiApp.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__usuario__input")).type_text("admin", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__entrar__button")).click()
Assert.text_equals(win.find_element(Locator.by_automation_id("home__titulo__text")), "Bienvenido")
app.close()
```

**TypeScript:**
```typescript
import { Application, Locator, Assert } from "@wintest/typescript";
const app = Application.launch("MiApp.exe");
const win = app.mainWindow;
win.findElement(Locator.byAutomationId("login__form__usuario__input")).typeText("admin", true);
win.findElement(Locator.byAutomationId("login__form__entrar__button")).click();
Assert.textEquals(win.findElement(Locator.byAutomationId("home__titulo__text")), "Bienvenido");
app.close();
```

### Arquitectura — 5 Capas

| Capa | Responsabilidad |
|------|----------------|
| 1. Motor | UI Automation nativo (FlaUI / pywinauto / UIA COM) |
| 2. Page Objects | Aísla la prueba de la UI |
| 3. Sync | `exists → visible → enabled → stable(200ms)` — 10s/500ms |
| 4. Orchestrator | Launch/Attach/Close/Kill + aislamiento |
| 5. Evidence | Unificado `junit.xml + report.html + steps.jsonl + failure.png` |

### Spec y Docs

- `spec/api-spec.md` + `api-spec.json` — contrato (ningún SDK diverge)
- `spec/locators.md` — prioridad `AutomationId > Name > ClassName > XPath > Image`
- `spec/automation-ids.md` — guía para devs (`ventana__seccion__elemento__tipo`)
- `docs/` — documentación con pestañas en 3 lenguajes

### CI

`.github/workflows/ci-windows.yml` — 3 jobs paralelos en `windows-latest` (sesión gráfica real).

### Licencia

Apache 2.0 — ver [LICENSE](LICENSE).
