import type { WinTestConfig } from "./config.js";
import { Locator } from "./locator.js";
import { LocatorError, AssertionError, InfraError } from "./errors.js";
import type { IElementHandle } from "./automation.js";
import type { EvidenceCollector } from "./evidence.js";


export class Element {
  constructor(private handle: IElementHandle, private cfg: WinTestConfig, private evidence?: EvidenceCollector) {}
  get _handle(): IElementHandle { return this.handle; }

  private waitReady(): void {
    const start = Date.now();
    while (Date.now() - start < this.cfg.defaultTimeoutMs) {
      if (this.handle.isVisible && this.handle.isEnabled) break;
      Bun.sleepSync(this.cfg.retryIntervalMs);
      if (Date.now() - start >= this.cfg.defaultTimeoutMs) {
        throw new LocatorError(Locator.byAutomationId(this.handle.automationId), this.cfg.defaultTimeoutMs,
          `Elemento não ficou pronto (visible=${this.handle.isVisible}, enabled=${this.handle.isEnabled})`);
      }
    }
    Bun.sleepSync(50);
  }

  private exec(action: string, fn: () => void, locator?: unknown): void {
    const start = Date.now();
    try {
      this.waitReady();
      fn();
      this.evidence?.logStep(action, locator, Date.now() - start, true);
    } catch (e) {
      const err = e as Error;
      this.evidence?.logStep(action, locator, Date.now() - start, false, err.message);
      if (e instanceof LocatorError || e instanceof AssertionError || e instanceof InfraError) throw e;
      throw new InfraError(`${action} falhou: ${err.message}`);
    }
  }

  click(): void { this.exec("Click", () => this.handle.click()); }
  doubleClick(): void { this.exec("DoubleClick", () => this.handle.doubleClick()); }
  rightClick(): void { this.exec("RightClick", () => this.handle.rightClick()); }
  hover(): void { this.exec("Hover", () => this.handle.hover()); }
  typeText(text: string, clearFirst = false): void { this.exec(`TypeText '${text}'`, () => this.handle.typeText(text, clearFirst)); }
  clear(): void { this.exec("Clear", () => this.handle.clear()); }
  dragAndDrop(target: Element): void { this.exec("DragAndDrop", () => this.handle.dragTo(target.handle)); }

  getText(): string { return this.handle.text; }
  getValue(): string { return this.handle.value; }
  isVisible(): boolean { return this.handle.isVisible; }
  isEnabled(): boolean { return this.handle.isEnabled; }
  isSelected(): boolean { return this.handle.isSelected; }
  getAttribute(name: string): string { return this.handle.getAttribute(name); }

  waitUntilEnabled(timeoutMs?: number): void {
    const t = timeoutMs ?? this.cfg.defaultTimeoutMs;
    const start = Date.now();
    while (Date.now() - start < t) { if (this.handle.isEnabled) return; Bun.sleepSync(this.cfg.retryIntervalMs); }
    throw new LocatorError(Locator.byAutomationId(this.handle.automationId), t, "Elemento não ficou habilitado");
  }
  waitUntilVisible(timeoutMs?: number): void {
    const t = timeoutMs ?? this.cfg.defaultTimeoutMs;
    const start = Date.now();
    while (Date.now() - start < t) { if (this.handle.isVisible) return; Bun.sleepSync(this.cfg.retryIntervalMs); }
    throw new LocatorError(Locator.byAutomationId(this.handle.automationId), t, "Elemento não ficou visível");
  }
  waitUntilTextEquals(text: string, timeoutMs?: number): void {
    const t = timeoutMs ?? this.cfg.defaultTimeoutMs;
    const start = Date.now();
    while (Date.now() - start < t) { if (this.handle.text === text) return; Bun.sleepSync(this.cfg.retryIntervalMs); }
    throw new AssertionError("WaitUntilTextEquals falhou", text, this.handle.text);
  }
}
