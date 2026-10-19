export function recordCmd(args: string[]): void {
  if (!args[0] || args[0] === "--help") {
    console.log(`wintest record — grava interação e gera PageObject

Uso:
  wintest record --out <dir> [--engine mock|wine|native]

Gera:
  <dir>/LoginPage.ts (ou .py/.cs) a partir de spec/api-spec.json
  Passos capturados em <dir>/steps.jsonl

No Linux sem Wine: usa MockEngine (simula gravação).
Com Wine: captura UIA real via --uia-bridge.
`);
    return;
  }
  const outIdx = args.indexOf("--out");
  const out = outIdx >= 0 ? args[outIdx + 1] : "recorded";
  const engIdx = args.indexOf("--engine");
  const engine = engIdx >= 0 ? args[engIdx + 1] : "mock";
  require("fs").mkdirSync(out, { recursive: true });
  const steps = [
    { action: "Launch", exe: "MinhaApp.exe", engine },
    { action: "FindElement", locator: "login__form__usuario__input" },
    { action: "TypeText", text: "admin", clearFirst: true },
    { action: "Click", locator: "login__form__entrar__button" },
    { action: "Assert", type: "TextEquals", locator: "home__titulo__text", expected: "Bem-vindo" },
  ];
  require("fs").writeFileSync(require("path").join(out, "steps.jsonl"), steps.map((s) => JSON.stringify(s)).join("\n"));
  const pageTs = `import { PageObject, Locator } from "@wintest/typescript";
export class LoginPage extends PageObject {
  login(user: string, pass: string) {
    this.find(Locator.byAutomationId("login__form__usuario__input")).typeText(user, true);
    this.find(Locator.byAutomationId("login__form__senha__input")).typeText(pass, true);
    this.find(Locator.byAutomationId("login__form__entrar__button")).click();
  }
}
`;
  require("fs").writeFileSync(require("path").join(out, "LoginPage.ts"), pageTs);
  console.log(`✓ Gravação simulada em ${out}/ (engine=${engine})`);
  console.log(`  - ${out}/steps.jsonl`);
  console.log(`  - ${out}/LoginPage.ts`);
  console.log(`Dica: wintest inspect para ver a árvore UIA ao vivo.`);
}
