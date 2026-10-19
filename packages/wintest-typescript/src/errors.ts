export abstract class WinTestError extends Error {
  abstract category: string;
  constructor(category: string, message: string) {
    super(message);
    this.name = category;
    (this as unknown as Record<string, unknown>).category = category;
  }
}

export class LocatorError extends WinTestError {
  category = "LocatorError";
  constructor(public locator: unknown, public timeoutMs: number, detail = "") {
    let msg = `Elemento não encontrado após ${timeoutMs}ms. Estratégia: ${locator}`;
    if (detail) msg += `. ${detail}`;
    super("LocatorError", msg);
  }
}

export class AssertionError extends WinTestError {
  category = "AssertionError";
  constructor(message: string, public expected: string, public actual: string) {
    super("AssertionError", `${message} | Esperado: '${expected}' | Obtido: '${actual}'`);
  }
}

export class InfraError extends WinTestError {
  category = "InfraError";
  constructor(message: string) { super("InfraError", message); }
}
