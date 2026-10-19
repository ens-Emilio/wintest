import { describe, test, expect } from "bun:test";
import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WinTestConfig } from "../src/config.ts";
import { Locator } from "../src/locator.ts";
import { LocatorError, AssertionError, InfraError } from "../src/errors.ts";
import { Application } from "../src/application.ts";
import { Window } from "../src/window.ts";
import { Element } from "../src/element.ts";
import { Assert } from "../src/assert.ts";
import { PageObject } from "../src/pageObject.ts";
import { EvidenceCollector } from "../src/evidence.ts";
import { MockAppHandle, MockElementHandle } from "../src/automation.ts";

describe("Locator", () => {
  test("byAutomationId", () => {
    const l = Locator.byAutomationId("login__form__entrar__button");
    expect(l.strategy).toBe("AutomationId" as unknown as typeof l.strategy);
    expect(String(l)).toContain("login__form");
  });
  test("byName", () => { expect(Locator.byName("Entrar").value).toBe("Entrar"); });
});

describe("WinTestConfig", () => {
  test("defaults", () => {
    const c = new WinTestConfig();
    expect(c.defaultTimeoutMs).toBe(10000);
    expect(c.retryIntervalMs).toBe(500);
    expect(c.autoClose).toBe(true);
  });
});

describe("Application", () => {
  test("launch + isRunning + close", () => {
    const app = Application.launch("calc.exe");
    expect(app.isRunning).toBe(true);
    expect(app.mainWindow.getTitle().length).toBeGreaterThan(0);
    app.close();
    expect(app.isRunning).toBe(false);
  });
  test("empty path throws InfraError", () => {
    expect(() => Application.launch("")).toThrow(InfraError);
  });
  test("kill", () => {
    const app = Application.launch("notepad.exe");
    app.kill();
    expect(app.isRunning).toBe(false);
  });
});

describe("Window", () => {
  test("findElement by AutomationId", () => {
    const h = new MockAppHandle("TestApp", undefined, { "login__form__entrar__button": new MockElementHandle({ text: "Entrar", name: "Entrar" }) });
    const win = new Window(h.mainWindow, new WinTestConfig({ defaultTimeoutMs: 500, retryIntervalMs: 20 }));
    const el = win.findElement(Locator.byAutomationId("login__form__entrar__button"));
    expect(el.getText()).toBe("Entrar");
  });
  test("findElement not found throws LocatorError", () => {
    const h = new MockAppHandle("Empty");
    const win = new Window(h.mainWindow, new WinTestConfig({ defaultTimeoutMs: 200, retryIntervalMs: 20 }));
    expect(() => win.findElement(Locator.byAutomationId("nao_existe__x"))).toThrow(LocatorError);
  });
  test("findElements empty", () => {
    const h = new MockAppHandle("Empty");
    const win = new Window(h.mainWindow, new WinTestConfig());
    expect(win.findElements(Locator.byAutomationId("x")).length).toBe(0);
  });
});

describe("Element", () => {
  test("click + typeText + clear", () => {
    const h = new MockElementHandle({ text: "hello", isVisible: true, isEnabled: true });
    const el = new Element(h, new WinTestConfig({ defaultTimeoutMs: 500, retryIntervalMs: 20 }));
    el.click(); expect(h.clicked).toBe(true);
    el.typeText(" world"); expect(el.getText()).toBe("hello world");
    el.clear(); expect(el.getText()).toBe("");
    el.typeText("novo", true); expect(el.getValue()).toBe("novo");
  });
  test("doubleClick/rightClick/hover", () => {
    const h = new MockElementHandle({ isVisible: true, isEnabled: true });
    const el = new Element(h, new WinTestConfig({ defaultTimeoutMs: 500, retryIntervalMs: 20 }));
    el.doubleClick(); expect(h.doubleClicked).toBe(true);
    el.rightClick(); expect(h.rightClicked).toBe(true);
    el.hover();
  });
  test("queries", () => {
    const h = new MockElementHandle({ isVisible: true, isEnabled: false, isSelected: true, text: "t" });
    h.setAttribute("HelpText","ajuda");
    const el = new Element(h, new WinTestConfig());
    expect(el.isVisible()).toBe(true);
    expect(el.isEnabled()).toBe(false);
    expect(el.isSelected()).toBe(true);
    expect(el.getAttribute("HelpText")).toBe("ajuda");
  });
  test("waitUntil", () => {
    const h = new MockElementHandle({ isVisible: true, isEnabled: true, text: "ok" });
    const el = new Element(h, new WinTestConfig({ defaultTimeoutMs: 300, retryIntervalMs: 20 }));
    el.waitUntilEnabled(); el.waitUntilVisible(); el.waitUntilTextEquals("ok");
    expect(() => el.waitUntilTextEquals("nope", 80)).toThrow(AssertionError);
  });
  test("dragAndDrop", () => {
    const h1 = new MockElementHandle({ isVisible: true, isEnabled: true });
    const h2 = new MockElementHandle({ isVisible: true, isEnabled: true });
    const cfg = new WinTestConfig({ defaultTimeoutMs: 300, retryIntervalMs: 20 });
    new Element(h1,cfg).dragAndDrop(new Element(h2,cfg));
  });
});

describe("Assert", () => {
  test("textEquals", () => {
    const el = new Element(new MockElementHandle({ text: "hello" }), new WinTestConfig());
    Assert.textEquals(el, "hello");
    expect(() => Assert.textEquals(el, "world")).toThrow(AssertionError);
  });
  test("variants", () => {
    const h = new MockElementHandle({ text: "hello world", isVisible: true, isEnabled: true, isSelected: false });
    const el = new Element(h, new WinTestConfig());
    Assert.textContains(el, "world");
    Assert.isVisible(el); Assert.isEnabled(el); Assert.isUnchecked(el);
    h.isSelected = true; Assert.isChecked(el);
  });
  test("exists/notExists/windowTitle", () => {
    const h = new MockAppHandle("MyApp", undefined, { "a__b": new MockElementHandle({}) });
    const win = new Window(h.mainWindow, new WinTestConfig({ defaultTimeoutMs: 300, retryIntervalMs: 20 }));
    Assert.exists(win, Locator.byAutomationId("a__b"));
    Assert.notExists(win, Locator.byAutomationId("nope__x"));
    Assert.windowTitleEquals(win, "MyApp");
  });
});

describe("PageObject", () => {
  test("base", () => {
    const h = new MockAppHandle("LoginWindow", undefined, {
      "login__form__usuario__input": new MockElementHandle({ text: "" }),
      "login__form__entrar__button": new MockElementHandle({ text: "Entrar" }),
    });
    const win = new Window(h.mainWindow, new WinTestConfig({ defaultTimeoutMs: 500, retryIntervalMs: 20 }));
    class LoginPage extends PageObject {
      enterUser(u: string) { this.find(Locator.byAutomationId("login__form__usuario__input")).typeText(u, true); }
      clickEnter() { this.find(Locator.byAutomationId("login__form__entrar__button")).click(); }
      getBtn() { return this.find(Locator.byAutomationId("login__form__entrar__button")).getText(); }
    }
    const page = new LoginPage(win);
    page.enterUser("admin");
    expect(page.getBtn()).toBe("Entrar");
    page.clickEnter();
    expect((h.mainWindow.findElement(Locator.byAutomationId("login__form__entrar__button")) as MockElementHandle).clicked).toBe(true);
  });
});

describe("EvidenceCollector", () => {
  test("junit + html + steps", () => {
    const dir = mkdtempSync(join(tmpdir(), "wintest-ts-"));
    const cfg = new WinTestConfig({ evidenceDir: dir });
    const col = new EvidenceCollector(cfg, "test-run-1");
    col.startTest("Login deve entrar");
    col.logStep("Click", Locator.byAutomationId("x"), 12, true);
    col.endTest(true);
    col.startTest("Falha esperada");
    col.endTest(false, new AssertionError("falhou","a","b"));
    col.saveAll();
    expect(existsSync(join(dir, "test-run-1", "junit.xml"))).toBe(true);
    expect(existsSync(join(dir, "test-run-1", "report.html"))).toBe(true);
    expect(existsSync(join(dir, "test-run-1", "evidence.json"))).toBe(true);
    rmSync(dir, { recursive: true, force: true });
  });
});
