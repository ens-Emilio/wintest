from __future__ import annotations
import time
from .errors import LocatorError, AssertionError, InfraError
from .locator import Locator

class Element:
    def __init__(self, handle, config, evidence=None):
        self._h = handle; self._cfg = config; self._evidence = evidence

    def _wait_ready(self):
        start = time.monotonic()
        while (time.monotonic()-start)*1000 < self._cfg.default_timeout_ms:
            if self._h.is_visible and self._h.is_enabled: break
            time.sleep(self._cfg.retry_interval_ms/1000)
            if (time.monotonic()-start)*1000 >= self._cfg.default_timeout_ms:
                raise LocatorError(Locator.by_automation_id(self._h.automation_id), self._cfg.default_timeout_ms, f"Elemento nao ficou pronto (visible={self._h.is_visible}, enabled={self._h.is_enabled})")
        time.sleep(0.05)

    def _exec(self, action, fn, locator=None):
        start = time.monotonic()
        try:
            self._wait_ready()
            fn()
            if self._evidence: self._evidence.log_step(action, locator, int((time.monotonic()-start)*1000), True)
        except Exception as e:
            if self._evidence: self._evidence.log_step(action, locator, int((time.monotonic()-start)*1000), False, str(e))
            if isinstance(e, (LocatorError, AssertionError, InfraError)): raise
            raise InfraError(f"{action} falhou: {e}") from e

    def click(self): self._exec("Click", lambda: self._h.click())
    def double_click(self): self._exec("DoubleClick", lambda: self._h.double_click())
    def right_click(self): self._exec("RightClick", lambda: self._h.right_click())
    def hover(self): self._exec("Hover", lambda: self._h.hover())
    def type_text(self, text: str, clear_first: bool = False): self._exec(f"TypeText '{text}'", lambda: self._h.type_text(text, clear_first))
    def clear(self): self._exec("Clear", lambda: self._h.clear())
    def drag_and_drop(self, target: "Element"): self._exec("DragAndDrop", lambda: self._h.drag_to(target._h))

    def get_text(self) -> str: return self._h.text
    def get_value(self) -> str: return self._h.value
    def is_visible(self) -> bool: return self._h.is_visible
    def is_enabled(self) -> bool: return self._h.is_enabled
    def is_selected(self) -> bool: return self._h.is_selected
    def get_attribute(self, name: str) -> str: return self._h.get_attribute(name)

    def wait_until_enabled(self, timeout_ms: int | None = None):
        t = timeout_ms or self._cfg.default_timeout_ms
        start = time.monotonic()
        while (time.monotonic()-start)*1000 < t:
            if self._h.is_enabled: return
            time.sleep(self._cfg.retry_interval_ms/1000)
        raise LocatorError(Locator.by_automation_id(self._h.automation_id), t, "Elemento nao ficou habilitado")

    def wait_until_visible(self, timeout_ms: int | None = None):
        t = timeout_ms or self._cfg.default_timeout_ms
        start = time.monotonic()
        while (time.monotonic()-start)*1000 < t:
            if self._h.is_visible: return
            time.sleep(self._cfg.retry_interval_ms/1000)
        raise LocatorError(Locator.by_automation_id(self._h.automation_id), t, "Elemento nao ficou visivel")

    def wait_until_text_equals(self, text: str, timeout_ms: int | None = None):
        t = timeout_ms or self._cfg.default_timeout_ms
        start = time.monotonic()
        while (time.monotonic()-start)*1000 < t:
            if self._h.text == text: return
            time.sleep(self._cfg.retry_interval_ms/1000)
        raise AssertionError("WaitUntilTextEquals falhou", text, self._h.text)
