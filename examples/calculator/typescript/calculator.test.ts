import { describe, test, expect } from "bun:test";
import { WinTestConfig } from "../../../packages/wintest-typescript/src/config.ts";
import { Locator } from "../../../packages/wintest-typescript/src/locator.ts";
import { Assert } from "../../../packages/wintest-typescript/src/assert.ts";
import { PageObject } from "../../../packages/wintest-typescript/src/pageObject.ts";
import { Window } from "../../../packages/wintest-typescript/src/window.ts";
import { MockAppHandle, MockElementHandle } from "../../../packages/wintest-typescript/src/automation.ts";

class CalculatorPage extends PageObject {
  press(aid: string) { this.find(Locator.byAutomationId(aid)).click(); }
  get result() { return this.find(Locator.byAutomationId("calc__display__result__text")).getText(); }
  clear() { this.find(Locator.byAutomationId("calc__actions__clear__button")).click(); }
}

describe("Calculator (paridade)", () => {
  test("7 + 8 = 15", () => {
    const cfg = new WinTestConfig({ defaultTimeoutMs: 2000, retryIntervalMs: 50 });
    const elems = {
      "calc__keys__7__button": new MockElementHandle({ text: "7" }),
      "calc__keys__8__button": new MockElementHandle({ text: "8" }),
      "calc__keys__plus__button": new MockElementHandle({ text: "+" }),
      "calc__keys__equals__button": new MockElementHandle({ text: "=" }),
      "calc__actions__clear__button": new MockElementHandle({ text: "C" }),
      "calc__display__result__text": new MockElementHandle({ text: "15" }),
    };
    const app = new MockAppHandle("Calculator", undefined, elems);
    const win = new Window(app.mainWindow, cfg);
    const page = new CalculatorPage(win);
    page.press("calc__keys__7__button");
    page.press("calc__keys__plus__button");
    page.press("calc__keys__8__button");
    page.press("calc__keys__equals__button");
    Assert.textEquals(win.findElement(Locator.byAutomationId("calc__display__result__text")), "15");
  });

  test("C limpa display", () => {
    const cfg = new WinTestConfig({ defaultTimeoutMs: 500, retryIntervalMs: 20 });
    const app = new MockAppHandle("Calculator", undefined, {
      "calc__actions__clear__button": new MockElementHandle({ text: "C" }),
      "calc__display__result__text": new MockElementHandle({ text: "0" }),
    });
    const win = new Window(app.mainWindow, cfg);
    Assert.textEquals(win.findElement(Locator.byAutomationId("calc__display__result__text")), "0");
  });
});
