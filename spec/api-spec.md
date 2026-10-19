# WinTest — Especificação da API Unificada v1.0

> **Contrato.** Todo SDK (.NET, Python, TypeScript) implementa exatamente este comportamento. Nenhum SDK diverge.

## 1. Convenções

| Regra | Valor |
|-------|-------|
| Idioma API | Inglês |
| Idioma relatórios | Português |
| Timeout padrão | 10 000 ms |
| Intervalo de polling | 500 ms |
| Nomenclatura | Mesmo nome conceitual; casing por linguagem (PascalCase / snake_case / camelCase) |
| Evidência | Toda falha gera screenshot + log automaticamente |

## 2. Configuração Global

```json
{
  "defaultTimeoutMs": 10000,
  "retryIntervalMs": 500,
  "evidenceDir": "./evidence",
  "videoEnabled": false,
  "reportLanguage": "pt-BR",
  "autoClose": true
}
```

## 3. Módulos

### A — Application
| Operação | Parâmetros | Retorno | Erro |
|----------|-----------|---------|------|
| Launch | executablePath, args?, timeoutMs?, workingDir? | Application | InfraError |
| Attach | processId \| windowTitle | Application | InfraError |
| Close | — | void | — |
| Kill | timeoutMs? | void | — |
| IsRunning | — | bool | — |
| MainWindow | — | Window | InfraError |

### B — Window
`FindElement(locator, timeout?) → Element` · `FindElements(locator, timeout?) → Element[]` · `GetTitle() → string` · `Maximize/Minimize/Focus()` · `WaitUntilVisible/WaitUntilClosed(timeout?)`

### C — Element
Ações: `Click, DoubleClick, RightClick, Hover, TypeText(text, clearFirst?), Clear, DragAndDrop(target)`  
Consultas: `GetText, GetValue, IsVisible, IsEnabled, IsSelected, GetAttribute(name)`  
Esperas: `WaitUntilEnabled, WaitUntilVisible, WaitUntilTextEquals(text, timeout?)`  
**Regra:** toda ação executa `exists → visible → enabled → stable(200ms sem mudança de layout)` antes de agir.

### D — Locator (prioridade)
1. `AutomationId` 2. `Name` 3. `ClassName+Type` 4. `XPath` 5. `Image`

```csharp
Locator.ByAutomationId("login__form__entrar__button")
Locator.ByName("Entrar")
Locator.ByClassName("Button")
Locator.ByXPath("/Window/Group/Button[2]")
Locator.ByImage("baseline.png", threshold: 0.95)
```

### E — Keyboard & Mouse
`PressKey, TypeGlobally, HoldKey, ReleaseKey, MoveTo, Scroll` — suporta Enter/Tab/Esc/Setas/Ctrl+Shift+Alt/F1-F12 e combos `Ctrl+S`.

### F — Assert
`TextEquals, TextContains, IsVisible, IsEnabled, IsChecked, IsUnchecked, Exists, NotExists, WindowTitleEquals` — registra esperado vs obtido, screenshot em falha.

### G — Evidence
Saída por execução: `evidence/{runId}/{testName}/junit.xml + report.html + steps.jsonl + failure.png + video.mp4?`
Formatos obrigatórios: JUnit XML (CI) e HTML (humano).

## 4. Erros (3 categorias)
- **LocatorError** — elemento não encontrado após timeout (contém strategy + tempo)
- **AssertionError** — assert falhou (esperado vs obtido)
- **InfraError** — app não iniciou / travou / sem sessão gráfica

## 5. Fluxo Padrão
Launch → MainWindow → FindElement(AutomationId) → Action(com espera) → Assert → Log/Screenshot → Close → Relatório

## 6. Paridade
Nenhuma feature em apenas um SDK. Versionamento sincronizado SemVer (1.2.0 = os três em 1.2.0). Mudança de API só via atualização deste documento.
