export class Keyboard {
  static pressKey(_key: string): void {}
  static typeGlobally(_text: string): void {}
  static holdKey(_key: string): void {}
  static releaseKey(_key: string): void {}
  static sendShortcut(_combo: string): void {}
}
export class Mouse {
  static moveTo(_x: number, _y: number): void {}
  static scroll(_delta: number): void {}
}
