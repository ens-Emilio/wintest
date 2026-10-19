import { LocatorStrategy } from "./locator.js";
import { InfraError } from "./errors.js";

export interface IElementHandle {
  automationId: string; name: string; className: string;
  text: string; value: string;
  isVisible: boolean; isEnabled: boolean; isSelected: boolean;
  click(): void; doubleClick(): void; rightClick(): void; hover(): void;
  typeText(text: string, clearFirst: boolean): void; clear(): void; dragTo(target: IElementHandle): void;
  getAttribute(name: string): string;
}

export interface IWindowHandle {
  title: string; isVisible: boolean;
  findElement(locator: { strategy: LocatorStrategy; value: string }): IElementHandle | null;
  findElements(locator: { strategy: LocatorStrategy; value: string }): IElementHandle[];
  maximize(): void; minimize(): void; focus(): void;
}

export interface IAppHandle {
  processId: number; isRunning: boolean; mainWindow: IWindowHandle;
  close(): void; kill(): void;
}

export interface IAutomationEngine {
  launch(exePath: string, args?: string, workingDir?: string, timeoutMs?: number): IAppHandle;
  attach(processId: number): IAppHandle;
  attachByTitle(title: string): IAppHandle;
}

export class MockElementHandle implements IElementHandle {
  automationId = ""; name = ""; className = "Button";
  text = ""; value = ""; isVisible = true; isEnabled = true; isSelected = false;
  clicked = false; doubleClicked = false; rightClicked = false; typed = "";
  private attrs = new Map<string, string>();
  constructor(init?: Partial<MockElementHandle>) { if (init) Object.assign(this, init); }
  click() { this.clicked = true; }
  doubleClick() { this.doubleClicked = true; }
  rightClick() { this.rightClicked = true; }
  hover() {}
  typeText(text: string, clearFirst: boolean) {
    if (clearFirst) { this.text = ""; this.value = ""; }
    this.text += text; this.value += text; this.typed = text;
  }
  clear() { this.text = ""; this.value = ""; }
  dragTo(_target: IElementHandle) {}
  getAttribute(name: string) { return this.attrs.get(name) ?? ""; }
  setAttribute(name: string, value: string) { this.attrs.set(name, value); }
}

export class MockWindowHandle implements IWindowHandle {
  title: string; isVisible = true;
  private byId = new Map<string, MockElementHandle>();
  private all: MockElementHandle[] = [];
  constructor(title: string) { this.title = title; }
  addElement(aid: string, el: MockElementHandle) { el.automationId = aid; this.byId.set(aid, el); this.all.push(el); }
  findElement(locator: { strategy: LocatorStrategy; value: string }): IElementHandle | null {
    if (locator.strategy === LocatorStrategy.AutomationId) return this.byId.get(locator.value) ?? null;
    if (locator.strategy === LocatorStrategy.Name) return this.all.find(x => x.name === locator.value) ?? null;
    if (locator.strategy === LocatorStrategy.ClassName) return this.all.find(x => x.className === locator.value) ?? null;
    if (locator.strategy === LocatorStrategy.XPath) return this.all[0] ?? null;
    return null;
  }
  findElements(locator: { strategy: LocatorStrategy; value: string }): IElementHandle[] {
    if (locator.strategy === LocatorStrategy.AutomationId) { const e = this.byId.get(locator.value); return e ? [e] : []; }
    if (locator.strategy === LocatorStrategy.Name) return this.all.filter(x => x.name === locator.value);
    if (locator.strategy === LocatorStrategy.ClassName) return this.all.filter(x => x.className === locator.value);
    if (locator.strategy === LocatorStrategy.XPath) return [...this.all];
    return [];
  }
  maximize() {} minimize() {} focus() {}
}

export class MockAppHandle implements IAppHandle {
  processId = Math.floor(1000 + Math.random() * 90000);
  isRunning = true;
  mainWindow: MockWindowHandle;
  constructor(public exePath: string, public args?: string, elements?: Record<string, MockElementHandle>) {
    const title = elements ? exePath : (exePath.includes("attached") ? exePath : `Mock Window - ${exePath.replace(/^.*[/\\]/, "").replace(/\..*$/, "")}`);
    this.mainWindow = new MockWindowHandle(title);
    if (elements) for (const [k, v] of Object.entries(elements)) this.mainWindow.addElement(k, v);
  }
  close() { this.isRunning = false; }
  kill() { this.isRunning = false; }
}

export class MockEngine implements IAutomationEngine {
  launch(exePath: string, args?: string, _workingDir?: string, _timeoutMs?: number): IAppHandle {
    if (!exePath?.trim()) throw new InfraError("Caminho do executável não pode ser vazio");
    return new MockAppHandle(exePath, args);
  }
  attach(processId: number): IAppHandle { return new MockAppHandle(`attached:${processId}`); }
  attachByTitle(title: string): IAppHandle { return new MockAppHandle(`attached:${title}`); }
}
