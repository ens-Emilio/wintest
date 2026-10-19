from wintest import Locator, Assert, WinTestConfig, PageObject
from wintest.automation import MockAppHandle, MockElementHandle
from wintest.window import Window
from wintest.evidence import EvidenceCollector

class CalculatorPage(PageObject):
    def press(self, aid: str): self.find(Locator.by_automation_id(aid)).click()
    @property
    def result(self): return self.find(Locator.by_automation_id("calc__display__result__text")).get_text()
    def clear(self): self.find(Locator.by_automation_id("calc__actions__clear__button")).click()

def test_7_plus_8():
    cfg = WinTestConfig(default_timeout_ms=2000, retry_interval_ms=50, evidence_dir="./evidence")
    evidence = EvidenceCollector(cfg, "calc-python")
    elems = {
        "calc__keys__7__button": MockElementHandle(text="7"),
        "calc__keys__8__button": MockElementHandle(text="8"),
        "calc__keys__plus__button": MockElementHandle(text="+"),
        "calc__keys__equals__button": MockElementHandle(text="="),
        "calc__actions__clear__button": MockElementHandle(text="C"),
        "calc__display__result__text": MockElementHandle(text="15"),
    }
    app = MockAppHandle("Calculator", elements=elems)
    win = Window(app.main_window, cfg, evidence)
    page = CalculatorPage(win)

    page.press("calc__keys__7__button")
    page.press("calc__keys__plus__button")
    page.press("calc__keys__8__button")
    page.press("calc__keys__equals__button")
    Assert.text_equals(win.find_element(Locator.by_automation_id("calc__display__result__text")), "15")

def test_clear():
    cfg = WinTestConfig(default_timeout_ms=500, retry_interval_ms=20)
    elems = {
        "calc__actions__clear__button": MockElementHandle(text="C"),
        "calc__display__result__text": MockElementHandle(text="0"),
    }
    app = MockAppHandle("Calculator", elements=elems)
    win = Window(app.main_window, cfg)
    Assert.text_equals(win.find_element(Locator.by_automation_id("calc__display__result__text")), "0")
