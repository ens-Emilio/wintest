from __future__ import annotations
from .config import WinTestConfig
from .errors import InfraError
from .window import Window
from .automation import MockEngine

_engine = None
def _get_engine():
    global _engine
    if _engine is None: _engine = MockEngine()
    return _engine

class Application:
    def __init__(self, handle, config, evidence=None):
        self._h = handle; self._cfg = config; self._evidence = evidence

    @property
    def process_id(self): return self._h.process_id
    @property
    def is_running(self): return self._h.is_running
    @property
    def main_window(self) -> Window: return Window(self._h.main_window, self._cfg, self._evidence)

    @classmethod
    def launch(cls, executable_path: str, config: WinTestConfig | None = None, args: str | None = None, working_dir: str | None = None, timeout_ms: int | None = None, engine=None, evidence=None):
        cfg = config or WinTestConfig.load()
        eng = engine or _get_engine()
        if not executable_path or not executable_path.strip(): raise InfraError("Caminho do executavel nao pode ser vazio")
        try:
            h = eng.launch(executable_path, args, working_dir, timeout_ms or cfg.default_timeout_ms)
            return cls(h, cfg, evidence)
        except InfraError: raise
        except Exception as e: raise InfraError(f"Falha ao iniciar aplicacao '{executable_path}': {e}") from e

    @classmethod
    def attach(cls, process_id: int, config=None, engine=None):
        cfg = config or WinTestConfig.load()
        eng = engine or _get_engine()
        try: return cls(eng.attach(process_id), cfg)
        except Exception as e: raise InfraError(f"Falha ao anexar ao processo {process_id}: {e}") from e

    @classmethod
    def attach_by_title(cls, title: str, config=None, engine=None):
        cfg = config or WinTestConfig.load()
        eng = engine or _get_engine()
        try: return cls(eng.attach_by_title(title), cfg)
        except Exception as e: raise InfraError(f"Falha ao anexar a janela '{title}': {e}") from e

    def close(self):
        try: self._h.close()
        except Exception: self._h.kill()
    def kill(self): self._h.kill()
    def __enter__(self): return self
    def __exit__(self, *a):
        if self._cfg.auto_close:
            try: self.close()
            except Exception: self.kill()
