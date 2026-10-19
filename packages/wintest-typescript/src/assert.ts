import { AssertionError, LocatorError } from "./errors.js";
import type { Element } from "./element.js";
import type { Window } from "./window.js";
import type { Locator } from "./locator.js";

export class Assert {
  static textEquals(el: Element, expected: string): void {
    const actual = el.getText();
    if (actual !== expected) throw new AssertionError("TextEquals falhou", expected, actual);
  }
  static textContains(el: Element, substring: string): void {
    const actual = el.getText();
    if (!actual.includes(substring)) throw new AssertionError("TextContains falhou", substring, actual);
  }
  static isVisible(el: Element): void {
    if (!el.isVisible()) throw new AssertionError("IsVisible falhou", "visible", "not visible");
  }
  static isEnabled(el: Element): void {
    if (!el.isEnabled()) throw new AssertionError("IsEnabled falhou", "enabled", "disabled");
  }
  static isChecked(el: Element): void {
    if (!el.isSelected()) throw new AssertionError("IsChecked falhou", "checked", "unchecked");
  }
  static isUnchecked(el: Element): void {
    if (el.isSelected()) throw new AssertionError("IsUnchecked falhou", "unchecked", "checked");
  }
  static exists(window: Window, locator: Locator): void {
    try { window.findElement(locator, 500); }
    catch (e) { if (e instanceof LocatorError) throw new AssertionError("Exists falhou", "exists", "not found"); throw e; }
  }
  static notExists(window: Window, locator: Locator): void {
    try { window.findElement(locator, 300); throw new AssertionError("NotExists falhou", "not exists", "found"); }
    catch (e) { if (e instanceof LocatorError) return; throw e; }
  }
  static windowTitleEquals(window: Window, expected: string): void {
    const actual = window.getTitle();
    if (actual !== expected) throw new AssertionError("WindowTitleEquals falhou", expected, actual);
  }
}
