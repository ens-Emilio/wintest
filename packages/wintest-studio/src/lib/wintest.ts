// Shared types — espelha spec/api-spec.json (fonte da verdade)
export type LocatorStrategy = "AutomationId" | "Name" | "ClassName" | "XPath" | "Image";
export interface Locator { strategy: LocatorStrategy; value: string; }
export interface UINode { AutomationId: string; Name: string; ControlType: string; children?: UINode[]; }
export interface StepLog { timestamp: string; action: string; locator?: string; durationMs: number; result: "ok"|"fail"; }
export interface RunResult { runId: string; tests: { name: string; status: "passed"|"failed"; durationMs: number; error?: string }[]; }

export const MOCK_TREE: UINode[] = [
  { AutomationId: "login__window", Name: "Login", ControlType: "Window", children: [
    { AutomationId: "login__form__usuario__input", Name: "Usuário", ControlType: "Edit" },
    { AutomationId: "login__form__senha__input", Name: "Senha", ControlType: "Edit" },
    { AutomationId: "login__form__entrar__button", Name: "Entrar", ControlType: "Button" },
    { AutomationId: "home__titulo__text", Name: "Bem-vindo", ControlType: "Text" },
  ]},
  { AutomationId: "calc__window", Name: "Calculadora", ControlType: "Window", children: [
    { AutomationId: "calc__display__result__text", Name: "0", ControlType: "Text" },
    { AutomationId: "calc__keys__7__button", Name: "7", ControlType: "Button" },
    { AutomationId: "calc__keys__plus__button", Name: "+", ControlType: "Button" },
  ]},
];

export function flattenTree(nodes: UINode[]): UINode[] {
  return nodes.flatMap(n => [n, ...(n.children ? flattenTree(n.children) : [])]);
}
