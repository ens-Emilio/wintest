class Keyboard:
    _history: list[str] = []

    @classmethod
    def history(cls) -> list[str]: return list(cls._history)
    @classmethod
    def clear_history(cls): cls._history.clear()

    @staticmethod
    def press_key(key: str):
        if not key or not key.strip(): raise ValueError("key não pode ser vazio")
        Keyboard._history.append(f"PressKey:{key}")
    @staticmethod
    def type_globally(text: str):
        if text is None: raise ValueError("text não pode ser None")
        Keyboard._history.append(f"TypeGlobally:{text}")
    @staticmethod
    def hold_key(key: str):
        if not key or not key.strip(): raise ValueError("key não pode ser vazio")
        Keyboard._history.append(f"HoldKey:{key}")
    @staticmethod
    def release_key(key: str):
        if not key or not key.strip(): raise ValueError("key não pode ser vazio")
        Keyboard._history.append(f"ReleaseKey:{key}")
    @staticmethod
    def send_shortcut(combo: str):
        if not combo or not combo.strip(): raise ValueError("combo não pode ser vazio")
        Keyboard._history.append(f"SendShortcut:{combo}")

class Mouse:
    _history: list[str] = []

    @classmethod
    def history(cls) -> list[str]: return list(cls._history)
    @classmethod
    def clear_history(cls): cls._history.clear()

    @staticmethod
    def move_to(x: int, y: int): Mouse._history.append(f"MoveTo:{x},{y}")
    @staticmethod
    def scroll(delta: int): Mouse._history.append(f"Scroll:{delta}")
