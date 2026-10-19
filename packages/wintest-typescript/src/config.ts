import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface WinTestConfigData {
  defaultTimeoutMs: number;
  retryIntervalMs: number;
  evidenceDir: string;
  videoEnabled: boolean;
  reportLanguage: string;
  autoClose: boolean;
}

export class WinTestConfig implements WinTestConfigData {
  defaultTimeoutMs = 10_000;
  retryIntervalMs = 500;
  evidenceDir = "./evidence";
  videoEnabled = false;
  reportLanguage = "pt-BR";
  autoClose = true;

  constructor(partial?: Partial<WinTestConfigData>) {
    if (partial) Object.assign(this, partial);
  }

  static load(path?: string): WinTestConfig {
    const p = path ?? join(process.cwd(), "wintest.config.json");
    if (!existsSync(p)) return new WinTestConfig();
    try {
      const raw = JSON.parse(readFileSync(p, "utf-8"));
      const mapped: Record<string, unknown> = {};
      // already camelCase in JSON, but support snake_case too
      for (const [k, v] of Object.entries(raw)) {
        const camel = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        mapped[camel] = v;
      }
      return new WinTestConfig(mapped as Partial<WinTestConfigData>);
    } catch { return new WinTestConfig(); }
  }
}
