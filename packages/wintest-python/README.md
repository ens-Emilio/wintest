# WinTest Python SDK (Stack B)

```python
from wintest import Application, Locator, Assert, WinTestConfig

app = Application.launch("calc.exe")
win = app.main_window
win.find_element(Locator.by_automation_id("login__form__entrar__button")).click()
Assert.text_equals(win.find_element(Locator.by_name("Resultado")), "42")
app.close()
```

## Instalacao

```bash
pip install -e .
pytest tests -v
```
