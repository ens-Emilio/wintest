export function acpCmd(args: string[]): void {
  if (args.includes("--login")) { console.log("[acp --login] redireciona para wintest auth login"); require("./auth.ts").authCmd(["login"]); return; }
  console.log(`wintest acp — Agent Client Protocol server

Uso:
  wintest acp [--login]

Inicia servidor ACP para integração com IDEs (VS Code, etc) — stub no Linux.
  wintest acp --login  →  wintest auth login
`);
}
