from __future__ import annotations
import random, pathlib

class MockElementHandle:
    def __init__(self, text="", name="", class_name="Button", is_visible=True, is_enabled=True, is_selected=False):
        self.automation_id=""; self.name=name; self.class_name=class_name
        self.text=text; self.value=text; self.is_visible=is_visible; self.is_enabled=is_enabled; self.is_selected=is_selected
        self._attrs: dict[str,str]={}
        self.clicked=False; self.double_clicked=False; self.right_clicked=False; self.typed=""
    def click(self): self.clicked=True
    def double_click(self): self.double_clicked=True
    def right_click(self): self.right_clicked=True
    def hover(self): pass
    def type_text(self, text, clear_first=False):
        if clear_first: self.text=""; self.value=""
        self.text+=text; self.value+=text; self.typed=text
    def clear(self): self.text=""; self.value=""
    def drag_to(self, target): pass
    def get_attribute(self, name): return self._attrs.get(name,"")
    def set_attribute(self, name, value): self._attrs[name]=value

class MockWindowHandle:
    def __init__(self, title: str):
        self.title=title; self.is_visible=True
        self._by_id: dict[str, MockElementHandle]={}
        self._all: list[MockElementHandle]=[]
    def add_element(self, aid: str, el: MockElementHandle):
        el.automation_id=aid; self._by_id[aid]=el; self._all.append(el)
    def find_element(self, locator):
        from .locator import LocatorStrategy
        s=locator.strategy
        if s==LocatorStrategy.automation_id: return self._by_id.get(locator.value)
        if s==LocatorStrategy.name: return next((x for x in self._all if x.name==locator.value), None)
        if s==LocatorStrategy.class_name: return next((x for x in self._all if x.class_name==locator.value), None)
        if s==LocatorStrategy.xpath: return self._all[0] if self._all else None
        return None
    def find_elements(self, locator):
        one=self.find_element(locator)
        return [one] if one else []
    def maximize(self): pass
    def minimize(self): pass
    def focus(self): pass

class MockAppHandle:
    def __init__(self, exe: str, args=None, elements: dict | None=None):
        self.exe_path=exe; self.args=args
        self.process_id=random.randint(1000,99999)
        self._running=True
        title=exe if elements is not None else ("Mock Window - "+pathlib.Path(exe).stem if "/" not in exe and "attached" not in exe else exe)
        self.main_window=MockWindowHandle(title)
        if elements:
            for k,v in elements.items(): self.main_window.add_element(k,v)
    @property
    def is_running(self): return self._running
    def close(self): self._running=False
    def kill(self): self._running=False

class MockEngine:
    def launch(self, exe_path, args=None, working_dir=None, timeout_ms=10000):
        if not exe_path or not exe_path.strip(): 
            from .errors import InfraError
            raise InfraError("Caminho do executável não pode ser vazio")
        return MockAppHandle(exe_path, args)
    def attach(self, pid): return MockAppHandle(f"attached:{pid}")
    def attach_by_title(self, title): return MockAppHandle(f"attached:{title}")
