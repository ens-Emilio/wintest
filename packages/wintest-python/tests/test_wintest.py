import tempfile, os, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from wintest import Application, Locator, Assert, WinTestConfig, PageObject
from wintest.errors import LocatorError, AssertionError, InfraError
from wintest.automation import MockAppHandle, MockElementHandle, MockEngine
from wintest.evidence import EvidenceCollector
from wintest.window import Window
from wintest.element import Element

def test_locator():
    l = Locator.by_automation_id("login__form__entrar__button")
    assert l.strategy.value == "AutomationId"
    assert "login__form" in str(l)
    assert Locator.by_name("Entrar").strategy.value == "Name"

def test_config_defaults():
    c = WinTestConfig()
    assert c.default_timeout_ms == 10000
    assert c.retry_interval_ms == 500
    assert c.auto_close is True

def test_application_launch_close():
    app = Application.launch("calc.exe")
    assert app.is_running
    assert len(app.main_window.get_title()) > 0
    app.close()
    assert not app.is_running

def test_application_empty_path():
    try:
        Application.launch("")
        assert False, "should throw"
    except InfraError: pass

def test_application_kill():
    app = Application.launch("notepad.exe")
    app.kill()
    assert not app.is_running

def test_window_find_by_automation_id():
    app_handle = MockAppHandle("TestApp", elements={"login__form__entrar__button": MockElementHandle(text="Entrar", name="Entrar")})
    win = Window(app_handle.main_window, WinTestConfig(default_timeout_ms=500, retry_interval_ms=20))
    el = win.find_element(Locator.by_automation_id("login__form__entrar__button"))
    assert el.get_text() == "Entrar"

def test_window_not_found():
    app_handle = MockAppHandle("Empty")
    win = Window(app_handle.main_window, WinTestConfig(default_timeout_ms=200, retry_interval_ms=20))
    try:
        win.find_element(Locator.by_automation_id("nao_existe__x"))
        assert False
    except LocatorError as e:
        assert e.category == "LocatorError"

def test_window_find_elements_empty():
    app_handle = MockAppHandle("Empty")
    win = Window(app_handle.main_window, WinTestConfig())
    assert win.find_elements(Locator.by_automation_id("x")) == []

def test_element_actions():
    h = MockElementHandle(text="hello", is_visible=True, is_enabled=True)
    el = Element(h, WinTestConfig(default_timeout_ms=500, retry_interval_ms=20))
    el.click(); assert h.clicked
    el.type_text(" world"); assert el.get_text() == "hello world"
    el.clear(); assert el.get_text() == ""
    el.type_text("novo", clear_first=True); assert el.get_value() == "novo"

def test_element_double_right_hover():
    h = MockElementHandle(is_visible=True, is_enabled=True)
    el = Element(h, WinTestConfig(default_timeout_ms=500, retry_interval_ms=20))
    el.double_click(); assert h.double_clicked
    el.right_click(); assert h.right_clicked
    el.hover()

def test_element_queries():
    h = MockElementHandle(is_visible=True, is_enabled=False, is_selected=True, text="t")
    h.set_attribute("HelpText","ajuda")
    el = Element(h, WinTestConfig())
    assert el.is_visible() is True
    assert el.is_enabled() is False
    assert el.is_selected() is True
    assert el.get_attribute("HelpText") == "ajuda"

def test_element_waits():
    h = MockElementHandle(is_visible=True, is_enabled=True, text="ok")
    el = Element(h, WinTestConfig(default_timeout_ms=300, retry_interval_ms=20))
    el.wait_until_enabled(); el.wait_until_visible(); el.wait_until_text_equals("ok")
    try:
        el.wait_until_text_equals("nope", timeout_ms=100)
        assert False
    except AssertionError: pass

def test_drag_and_drop():
    h1 = MockElementHandle(is_visible=True, is_enabled=True)
    h2 = MockElementHandle(is_visible=True, is_enabled=True)
    cfg = WinTestConfig(default_timeout_ms=500, retry_interval_ms=20)
    Element(h1,cfg).drag_and_drop(Element(h2,cfg))

def test_assert_text_equals():
    h = MockElementHandle(text="hello", is_visible=True, is_enabled=True)
    el = Element(h, WinTestConfig())
    Assert.text_equals(el, "hello")
    try: Assert.text_equals(el, "world"); assert False
    except AssertionError as e: assert e.expected == "world"

def test_assert_variants():
    h = MockElementHandle(text="hello world", is_visible=True, is_enabled=True, is_selected=False)
    el = Element(h, WinTestConfig())
    Assert.text_contains(el, "world")
    Assert.is_visible(el); Assert.is_enabled(el); Assert.is_unchecked(el)
    h.is_selected = True; Assert.is_checked(el)

def test_assert_exists_not_exists():
    app_handle = MockAppHandle("MyApp", elements={"a__b": MockElementHandle()})
    win = Window(app_handle.main_window, WinTestConfig(default_timeout_ms=300, retry_interval_ms=20))
    Assert.exists(win, Locator.by_automation_id("a__b"))
    Assert.not_exists(win, Locator.by_automation_id("nope__x"))
    Assert.window_title_equals(win, "MyApp")

def test_page_object():
    app_handle = MockAppHandle("LoginWindow", elements={
        "login__form__usuario__input": MockElementHandle(text=""),
        "login__form__entrar__button": MockElementHandle(text="Entrar"),
    })
    win = Window(app_handle.main_window, WinTestConfig(default_timeout_ms=500, retry_interval_ms=20))
    class LoginPage(PageObject):
        def enter_user(self, u): self.find(Locator.by_automation_id("login__form__usuario__input")).type_text(u, clear_first=True)
        def click_enter(self): self.find(Locator.by_automation_id("login__form__entrar__button")).click()
    page = LoginPage(win)
    page.enter_user("admin")
    page.click_enter()
    assert app_handle.main_window.find_element(Locator.by_automation_id("login__form__entrar__button")).clicked

def test_evidence(tmp_path=None):
    import tempfile
    d = tempfile.mkdtemp()
    cfg = WinTestConfig(evidence_dir=d)
    col = EvidenceCollector(cfg, "test-run-1")
    col.start_test("Login deve entrar")
    col.log_step("Click", Locator.by_automation_id("x"), 12, True)
    col.end_test(True)
    col.start_test("Falha esperada")
    col.end_test(False, AssertionError("falhou","a","b"))
    col.save_all()
    assert os.path.exists(os.path.join(d, "test-run-1", "junit.xml"))
    assert os.path.exists(os.path.join(d, "test-run-1", "report.html"))
    assert os.path.exists(os.path.join(d, "test-run-1", "evidence.json"))
    import shutil; shutil.rmtree(d)

if __name__ == "__main__":
    tests = [v for k,v in globals().items() if k.startswith("test_")]
    passed=failed=0
    for t in tests:
        try: t(); print(f"  ✓ {t.__name__}"); passed+=1
        except Exception as e: print(f"  ✗ {t.__name__}: {e}"); import traceback; traceback.print_exc(); failed+=1
    print(f"\n{passed} passed, {failed} failed")
    sys.exit(1 if failed else 0)
