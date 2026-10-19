import type { Window } from "./window.js";
import type { Locator } from "./locator.js";
import type { WinTestConfig } from "./config.js";

export abstract class PageObject {
  constructor(protected window: Window, protected config?: WinTestConfig) {}
  protected find(locator: Locator, timeoutMs?: number) { return this.window.findElement(locator, timeoutMs); }
}
