# WinTest — Documentação | Documentation | Documentación

> **PT-BR** · [English](#english) · [Español](#español)

Site único com abas por linguagem. Mesma funcionalidade, mesma API, 3 SDKs. | Single docs site with language tabs. Same features, same API, 3 SDKs. | Sitio único con pestañas por lenguaje. Misma funcionalidad, misma API, 3 SDKs.

---

## PT-BR

### Login — mesmo teste nas 3 stacks

#### .NET
```csharp
var app = Application.Launch("MeuApp.exe");
var win = app.MainWindow;
win.FindElement(Locator.ByAutomationId("login__form__usuario__input")).TypeText("admin", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__senha__input")).TypeText("secret", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__entrar__button")).Click();
WinTestAssert.TextEquals(win.FindElement(Locator.ByAutomationId("home__titulo__text")), "Bem-vindo");
app.Close();
```

#### Python
```python
from wintest import Application, Locator, Assert
app = Application.launch("MeuApp.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__usuario__input")).type_text("admin", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__senha__input")).type_text("secret", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__entrar__button")).click()
Assert.text_equals(win.find_element(Locator.by_automation_id("home__titulo__text")), "Bem-vindo")
app.close()
```

#### TypeScript
```typescript
import { Application, Locator, Assert } from "@wintest/typescript";
const app = Application.launch("MeuApp.exe");
const win = app.mainWindow;
win.findElement(Locator.byAutomationId("login__form__usuario__input")).typeText("admin", true);
win.findElement(Locator.byAutomationId("login__form__senha__input")).typeText("secret", true);
win.findElement(Locator.byAutomationId("login__form__entrar__button")).click();
Assert.textEquals(win.findElement(Locator.byAutomationId("home__titulo__text")), "Bem-vindo");
app.close();
```

#### Page Object
```csharp
class LoginPage : PageObject {
    public LoginPage(Window w) : base(w) {}
    public void Login(string user, string pass) {
        Find(Locator.ByAutomationId("login__form__usuario__input")).TypeText(user, true);
        Find(Locator.ByAutomationId("login__form__senha__input")).TypeText(pass, true);
        Find(Locator.ByAutomationId("login__form__entrar__button")).Click();
    }
}
```

### Locator — prioridade
`AutomationId > Name > ClassName+Type > XPath > Image`. Sempre prefira `AutomationId` (estável, 5★).

### Evidências
Saída unificada: `evidence/{runId}/{testName}/junit.xml + report.html + steps.jsonl + failure.png`
- `junit.xml` — CI (GitHub Actions, Azure, Jenkins)
- `report.html` — humano legível
- `steps.jsonl` — log estruturado por passo
- `failure.png` — screenshot automático em falha

### Guia de AutomationIds
Ver `spec/automation-ids.md` — convenção `janela__secao__elemento__tipo` (ex: `login__form__entrar__button`).

---

## English

### Login — same test on 3 stacks

#### .NET
```csharp
var app = Application.Launch("MyApp.exe");
var win = app.MainWindow;
win.FindElement(Locator.ByAutomationId("login__form__user__input")).TypeText("admin", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__password__input")).TypeText("secret", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__login__button")).Click();
WinTestAssert.TextEquals(win.FindElement(Locator.ByAutomationId("home__title__text")), "Welcome");
app.Close();
```

#### Python
```python
from wintest import Application, Locator, Assert
app = Application.launch("MyApp.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__user__input")).type_text("admin", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__password__input")).type_text("secret", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__login__button")).click()
Assert.text_equals(win.find_element(Locator.by_automation_id("home__title__text")), "Welcome")
app.close()
```

#### TypeScript
```typescript
import { Application, Locator, Assert } from "@wintest/typescript";
const app = Application.launch("MyApp.exe");
const win = app.mainWindow;
win.findElement(Locator.byAutomationId("login__form__user__input")).typeText("admin", true);
win.findElement(Locator.byAutomationId("login__form__password__input")).typeText("secret", true);
win.findElement(Locator.byAutomationId("login__form__login__button")).click();
Assert.textEquals(win.findElement(Locator.byAutomationId("home__title__text")), "Welcome");
app.close();
```

### Locators — priority
`AutomationId > Name > ClassName+Type > XPath > Image`. Always prefer `AutomationId` (stable, 5★).

### Evidence
Unified output: `evidence/{runId}/{testName}/junit.xml + report.html + steps.jsonl + failure.png`

### AutomationIds Guide
See `spec/automation-ids.md` — convention `window__section__element__type`.

---

## Español

### Login — misma prueba en 3 stacks

#### .NET
```csharp
var app = Application.Launch("MiApp.exe");
var win = app.MainWindow;
win.FindElement(Locator.ByAutomationId("login__form__usuario__input")).TypeText("admin", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__clave__input")).TypeText("secret", clearFirst: true);
win.FindElement(Locator.ByAutomationId("login__form__entrar__button")).Click();
WinTestAssert.TextEquals(win.FindElement(Locator.ByAutomationId("home__titulo__text")), "Bienvenido");
app.Close();
```

#### Python
```python
from wintest import Application, Locator, Assert
app = Application.launch("MiApp.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__usuario__input")).type_text("admin", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__clave__input")).type_text("secret", clear_first=True)
win.find_element(Locator.by_automation_id("login__form__entrar__button")).click()
Assert.text_equals(win.find_element(Locator.by_automation_id("home__titulo__text")), "Bienvenido")
app.close()
```

#### TypeScript
```typescript
import { Application, Locator, Assert } from "@wintest/typescript";
const app = Application.launch("MiApp.exe");
const win = app.mainWindow;
win.findElement(Locator.byAutomationId("login__form__usuario__input")).typeText("admin", true);
win.findElement(Locator.byAutomationId("login__form__clave__input")).typeText("secret", true);
win.findElement(Locator.byAutomationId("login__form__entrar__button")).click();
Assert.textEquals(win.findElement(Locator.byAutomationId("home__titulo__text")), "Bienvenido");
app.close();
```

### Locators — prioridad
`AutomationId > Name > ClassName+Type > XPath > Image`. Siempre prefiera `AutomationId` (estable, 5★).

### Evidencias
Salida unificada: `evidence/{runId}/{testName}/junit.xml + report.html + steps.jsonl + failure.png`

### Guía de AutomationIds
Ver `spec/automation-ids.md` — convención `ventana__seccion__elemento__tipo`.
