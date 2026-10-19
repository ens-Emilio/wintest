from __future__ import annotations
import time
from .errors import LocatorError, InfraError
from .element import Element

class Window:
    def __init__(self, handle, config, evidence=None):
        self._h = handle; self._cfg = config; self._evidence = evidence

    def get_title(self) -> str: return self._h.title
    def maximize(self): self._h.maximize()
    def minimize(self): self._h.minimize()
    def focus(self): self._h.focus()
    @property
    def is_visible(self): return self._h.is_visible

    def wait_until_visible(self, timeout_ms: int | None = None):
        t = timeout_ms or self._cfg.default_timeout_ms
        start = time.monotonic()
        while (time.monotonic()-start)*1000 < t:
            if self._h.is_visible: return
            time.sleep(self._cfg.retry_interval_ms/1000)
        raise InfraError(f"Janela nao ficou visivel apos {t}ms")

    def wait_until_closed(self, timeout_ms: int | None = None):
        t = timeout_ms or self._cfg.default_timeout_ms
        start = time.monotonic()
        while (time.monotonic()-start)*1000 < t:
            if not self._h.is_visible: return
            time.sleep(self._cfg.retry_interval_ms/1000)
        raise InfraError(f"Janela nao fechou apos {t}ms")

    def find_element(self, locator, timeout_ms: int | None = None) -> Element:
        t = timeout_ms or self._cfg.default_timeout_ms
        start = time.monotonic()
        found = None
        deadline = time.monotonic() + t/1000
        while time.monotonic() < deadline:
            found = self._h.find_element(locator)
            if found is not None: break
            time.sleep(self._cfg.retry_interval_ms/1000)
        if found is None:
            raise LocatorError(locator, t)
        time.sleep(0.05)
        elapsed = int((time.monotonic()-start)*1000)
        if self._evidence: self._evidence.log_step(f"FindElement {locator}", locator, elapsed, True)
        return Element(found, self._cfg, self._evidence)

    def find_elements(self, locator, timeout_ms: int | None = None):
        handles = self._h.find_elements(locator)
        return [Element(h, self._cfg, self._evidence) for h in handles]
