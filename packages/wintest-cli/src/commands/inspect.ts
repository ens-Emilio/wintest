export function inspectCmd(args: string[]): void {
  if (args[0] === "--help" || !args[0]) {
    console.log(`wintest inspect — inspetor de árvore UIA (Accessibility Insights no Linux)

Uso:
  wintest inspect [--engine mock|wine] [--filter <AutomationId>]
  wintest inspect --exe <caminho.exe> [--headless]

No Linux sem Wine: mostra árvore mock de exemplo.
Com Wine+UIA bridge: lê /tmp/wintest-uia.sock.
`);
  }
  const filterIdx = args.indexOf("--filter");
  const filter = filterIdx >= 0 ? args[filterIdx + 1] : null;
  const exeIdx = args.indexOf("--exe");
  const exe = exeIdx >= 0 ? args[exeIdx + 1] : null;
  if (exe) console.log(`[inspect] alvo: ${exe} ${args.includes("--headless") ? "(headless)" : ""}`);

  const mockTree = [
    { AutomationId: "login__window", Name: "Login", ControlType: "Window", children: [
      { AutomationId: "login__form__usuario__input", Name: "Usuário", ControlType: "Edit" },
      { AutomationId: "login__form__senha__input", Name: "Senha", ControlType: "Edit" },
      { AutomationId: "login__form__entrar__button", Name: "Entrar", ControlType: "Button" },
      { AutomationId: "home__titulo__text", Name: "Bem-vindo", ControlType: "Text" },
    ]},
  ];

  const filtered = filter
    ? mockTree.flatMap((n) => (n.children ?? []).filter((c) => (c as { AutomationId: string }).AutomationId.includes(filter)))
    : mockTree;

  console.log(JSON.stringify(filtered, null, 2));
  console.log(`\nDica: IDs seguem spec/automation-ids.md (janela__secao__elemento__tipo).`);
  console.log(`Studio: wintest studio (abre Inspector visual).`);
}
