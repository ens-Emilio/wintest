class Keyboard:
    @staticmethod
    def press_key(key: str): pass
    @staticmethod
    def type_globally(text: str): pass
    @staticmethod
    def hold_key(key: str): pass
    @staticmethod
    def release_key(key: str): pass
    @staticmethod
    def send_shortcut(combo: str): pass

class Mouse:
    @staticmethod
    def move_to(x: int, y: int): pass
    @staticmethod
    def scroll(delta: int): pass
