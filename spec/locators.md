# Estratégia de Localização — WinTest

## Hierarquia (obrigatória, mesma nos 3 SDKs)

| Prioridade | Estratégia | Quando usar | Estabilidade |
|-----------|-----------|-------------|--------------|
| 1 | AutomationId | Sempre que possível | ★★★★★ |
| 2 | Name | Texto acessível quando AutomationId não existe | ★★★ |
| 3 | ClassName + Type | Filtrar por tipo de controle | ★★ |
| 4 | XPath (árvore UIA) | Último recurso estrutural | ★ |
| 5 | Imagem | Quando UIA não enxerga (canvas, app legado) | ★ |

## Regra
Toda busca aceita `timeoutMs` customizável. Polling a cada 500ms até `defaultTimeoutMs` (10s). Falha → `LocatorError` com estratégia + tempo.

## Exemplos
```
AutomationId: login__form__usuario__input
Name: "Entrar"
ClassName: Button (ClassName=Button, Type=Button)
XPath: /Pane[@AutomationId="main"]/Group/Button[1]
Image: screenshots/baseline/login_button.png
```
