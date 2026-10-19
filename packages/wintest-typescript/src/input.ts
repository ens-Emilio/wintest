export class Keyboard {
  private static _history: string[] = [];
  static get history(): string[] { return [...Keyboard._history]; }
  static clearHistory(): void { Keyboard._history = []; }

  static pressKey(key: string): void {
    if (!key?.trim()) throw new Error("key não pode ser vazio");
    Keyboard._history.push(`PressKey:${key}`);
  }
  static typeGlobally(text: string): void {
    if (text === null || text === undefined) throw new Error("text não pode ser null");
    Keyboard._history.push(`TypeGlobally:${text}`);
  }
  static holdKey(key: string): void {
    if (!key?.trim()) throw new Error("key não pode ser vazio");
    Keyboard._history.push(`HoldKey:${key}`);
  }
  static releaseKey(key: string): void {
    if (!key?.trim()) throw new Error("key não pode ser vazio");
    Keyboard._history.push(`ReleaseKey:${key}`);
  }
  static sendShortcut(combo: string): void {
    if (!combo?.trim()) throw new Error("combo não pode ser vazio");
    Keyboard._history.push(`SendShortcut:${combo}`);
  }
}
export class Mouse {
  private static _history: string[] = [];
  static get history(): string[] { return [...Mouse._history]; }
  static clearHistory(): void { Mouse._history = []; }

  static moveTo(x: number, y: number): void { Mouse._history.push(`MoveTo:${x},${y}`); }
  static scroll(delta: number): void { Mouse._history.push(`Scroll:${delta}`); }
}
