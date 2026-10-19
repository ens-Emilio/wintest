import type { WinTestConfig } from "./config.js";
import type { IElementHandle, IWindowHandle } from "./automation.js";
import { Locator } from "./locator.js";
import { LocatorError, InfraError } from "./errors.js";
import { Element } from "./element.js";
import type { EvidenceCollector } from "./evidence.js";

export class Window {
  constructor(private handle: IWindowHandle, private cfg: WinTestConfig, private evidence?: EvidenceCollector) {}

  getTitle(): string { return this.handle.title; }
  maximize(): void { this.handle.maximize(); }
  minimize(): void { this.handle.minimize(); }
  focus(): void { this.handle.focus(); }
  get isVisible(): boolean { return this.handle.isVisible; }

  waitUntilVisible(timeoutMs?: number): void {
    const t = timeoutMs ?? this.cfg.defaultTimeoutMs;
    const start = Date.now();
    while (Date.now() - start < t) {
      if (this.handle.isVisible) return;
      Bun.sleepSync(this.cfg.retryIntervalMs);
    }
    throw new InfraError(`Janela não ficou visível após ${t}ms`);
  }

  waitUntilClosed(timeoutMs?: number): void {
    const t = timeoutMs ?? this.cfg.defaultTimeoutMs;
    const start = Date.now();
    while (Date.now() - start < t) {
      if (!this.handle.isVisible) return;
      Bun.sleepSync(this.cfg.retryIntervalMs);
    }
    throw new InfraError(`Janela não fechou após ${t}ms`);
  }

  findElement(locator: Locator, timeoutMs?: number): Element {
    const t = timeoutMs ?? this.cfg.defaultTimeoutMs;
    const start = Date.now();
    let found: IElementHandle | null = null;
    const deadline = Date.now() + t;
    while (Date.now() < deadline) {
      found = this.handle.findElement(locator);
      if (found) break;
      Bun.sleepSync(this.cfg.retryIntervalMs);
    }
    if (!found) throw new LocatorError(locator, t);
    Bun.sleepSync(50);
    this.evidence?.logStep(`FindElement ${locator}`, locator, Date.now() - start, true);
    return new Element(found, this.cfg, this.evidence);
  }

  findElements(locator: Locator): Element[] {
    return this.handle.findElements(locator).map(h => new Element(h, this.cfg, this.evidence));
  }
}
