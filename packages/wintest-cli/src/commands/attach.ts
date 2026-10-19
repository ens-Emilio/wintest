export function attachCmd(args: string[]): void {
  const url = args[0] && !args[0].startsWith("-") ? args[0] : undefined;
  if (!url || args.includes("--help")) {
    console.log(`wintest attach — anexa TUI a backend já rodando (via serve/web)

Uso:
  wintest attach [url] [--dir <path>] [--continue] [--session <id>] [--fork]

Exemplos:
  wintest attach http://10.20.30.40:4096
  wintest attach --continue
`);
    return;
  }
  console.log(`[attach] conectando a ${url} — delega para wintest studio (Tauri) ou console`);
  try { require("child_process").execSync(`bun packages/wintest-cli/src/index.ts studio --help 2>&1 | head -5`,{stdio:"inherit"});}catch{}
}
