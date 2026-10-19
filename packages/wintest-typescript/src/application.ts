import { WinTestConfig } from "./config.js";
import { InfraError } from "./errors.js";
import { Window } from "./window.js";
import { MockEngine, type IAutomationEngine } from "./automation.js";
import type { EvidenceCollector } from "./evidence.js";

let defaultEngine: IAutomationEngine | null = null;
function getEngine(): IAutomationEngine {
  if (!defaultEngine) defaultEngine = new MockEngine();
  return defaultEngine;
}

export class Application {
  private constructor(private handle: import("./automation.js").IAppHandle, private cfg: WinTestConfig, private evidence?: EvidenceCollector) {}

  get processId(): number { return this.handle.processId; }
  get isRunning(): boolean { return this.handle.isRunning; }
  get mainWindow(): Window { return new Window(this.handle.mainWindow, this.cfg, this.evidence); }

  static launch(executablePath: string, opts: { config?: WinTestConfig; args?: string; workingDir?: string; timeoutMs?: number; engine?: IAutomationEngine; evidence?: EvidenceCollector } = {}): Application {
    const cfg = opts.config ?? WinTestConfig.load();
    const eng = opts.engine ?? getEngine();
    if (!executablePath?.trim()) throw new InfraError("Caminho do executável não pode ser vazio");
    try {
      const h = eng.launch(executablePath, opts.args, opts.workingDir, opts.timeoutMs ?? cfg.defaultTimeoutMs);
      return new Application(h, cfg, opts.evidence);
    } catch (e) {
      if (e instanceof InfraError) throw e;
      throw new InfraError(`Falha ao iniciar aplicação '${executablePath}': ${(e as Error).message}`);
    }
  }

  static attach(processId: number, opts: { config?: WinTestConfig; engine?: IAutomationEngine } = {}): Application {
    const cfg = opts.config ?? WinTestConfig.load();
    const eng = opts.engine ?? getEngine();
    try { return new Application(eng.attach(processId), cfg); }
    catch (e) { throw new InfraError(`Falha ao anexar ao processo ${processId}: ${(e as Error).message}`); }
  }

  static attachByTitle(title: string, opts: { config?: WinTestConfig; engine?: IAutomationEngine } = {}): Application {
    const cfg = opts.config ?? WinTestConfig.load();
    const eng = opts.engine ?? getEngine();
    try { return new Application(eng.attachByTitle(title), cfg); }
    catch (e) { throw new InfraError(`Falha ao anexar à janela '${title}': ${(e as Error).message}`); }
  }

  close(): void { try { this.handle.close(); } catch { this.handle.kill(); } }
  kill(): void { this.handle.kill(); }
  dispose(): void { if (this.cfg.autoClose) { try { this.close(); } catch { this.kill(); } } }

  [Symbol.dispose as unknown as string](): void { this.dispose(); }
}
