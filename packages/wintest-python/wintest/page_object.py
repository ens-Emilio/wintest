from __future__ import annotations

class PageObject:
    def __init__(self, window, config=None):
        self.window = window
        self.config = config
    def find(self, locator, timeout_ms=None):
        return self.window.find_element(locator, timeout_ms)
