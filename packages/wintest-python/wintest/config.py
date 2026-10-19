from __future__ import annotations
import json, os
from dataclasses import dataclass

@dataclass
class WinTestConfig:
    default_timeout_ms: int = 10_000
    retry_interval_ms: int = 500
    evidence_dir: str = "./evidence"
    video_enabled: bool = False
    report_language: str = "pt-BR"
    auto_close: bool = True

    @classmethod
    def load(cls, path: str | None = None) -> "WinTestConfig":
        p = path or os.path.join(os.getcwd(), "wintest.config.json")
        if not os.path.exists(p):
            return cls()
        with open(p, encoding="utf-8") as f:
            data = json.load(f)
        mapping = {"defaultTimeoutMs":"default_timeout_ms","retryIntervalMs":"retry_interval_ms","evidenceDir":"evidence_dir","videoEnabled":"video_enabled","reportLanguage":"report_language","autoClose":"auto_close"}
        kwargs = {}
        for k,v in data.items():
            kwargs[mapping.get(k, k)] = v
        return cls(**{k: v for k,v in kwargs.items() if k in cls.__dataclass_fields__})
