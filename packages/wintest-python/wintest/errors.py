from __future__ import annotations

class WinTestError(Exception):
    category: str = "WinTestError"
    def __init__(self, category: str, message: str):
        super().__init__(message)
        self.category = category

class LocatorError(WinTestError):
    def __init__(self, locator, timeout_ms: int, detail: str = ""):
        msg = f"Elemento não encontrado após {timeout_ms}ms. Estratégia: {locator}"
        if detail: msg += f". {detail}"
        super().__init__("LocatorError", msg)
        self.locator = locator
        self.timeout_ms = timeout_ms

class AssertionError(WinTestError):
    def __init__(self, message: str, expected: str, actual: str):
        super().__init__("AssertionError", f"{message} | Esperado: '{expected}' | Obtido: '{actual}'")
        self.expected = expected
        self.actual = actual

class InfraError(WinTestError):
    def __init__(self, message: str):
        super().__init__("InfraError", message)
