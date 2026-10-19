from __future__ import annotations
from .errors import AssertionError, LocatorError

class Assert:
    @staticmethod
    def text_equals(el, expected: str, evidence=None):
        actual = el.get_text()
        if actual != expected: raise AssertionError("TextEquals falhou", expected, actual)

    @staticmethod
    def text_contains(el, substring: str, evidence=None):
        actual = el.get_text()
        if substring not in actual: raise AssertionError("TextContains falhou", substring, actual)

    @staticmethod
    def is_visible(el, evidence=None):
        if not el.is_visible(): raise AssertionError("IsVisible falhou", "visible", "not visible")

    @staticmethod
    def is_enabled(el, evidence=None):
        if not el.is_enabled(): raise AssertionError("IsEnabled falhou", "enabled", "disabled")

    @staticmethod
    def is_checked(el, evidence=None):
        if not el.is_selected(): raise AssertionError("IsChecked falhou", "checked", "unchecked")

    @staticmethod
    def is_unchecked(el, evidence=None):
        if el.is_selected(): raise AssertionError("IsUnchecked falhou", "unchecked", "checked")

    @staticmethod
    def exists(window, locator, evidence=None):
        try: window.find_element(locator, timeout_ms=500)
        except LocatorError: raise AssertionError("Exists falhou", "exists", "not found")

    @staticmethod
    def not_exists(window, locator, evidence=None):
        try:
            window.find_element(locator, timeout_ms=300)
            raise AssertionError("NotExists falhou", "not exists", "found")
        except LocatorError: pass

    @staticmethod
    def window_title_equals(window, expected: str, evidence=None):
        actual = window.get_title()
        if actual != expected: raise AssertionError("WindowTitleEquals falhou", expected, actual)
