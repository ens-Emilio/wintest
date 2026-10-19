export function githubCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help") {
    console.log(`wintest github — automação de repositório

Uso:
  wintest github install     setup workflow + guia de configuração
  wintest github run [--event <json>] [--token <pat>]

Normalmente usado em GitHub Actions (ci-windows.yml já existe).
`);
    return;
  }
  if (sub === "install") {
    console.log("[github install] Verificando .github/workflows/ci-windows.yml");
    const exists = require("fs").existsSync(".github/workflows/ci-windows.yml");
    console.log(exists ? "✓ Workflow já existe" : "✗ Workflow ausente — copie de .github/workflows/ci-windows.yml");
    console.log("Guia: https://github.com/ens-Emilio/wintest#ci");
    return;
  }
  if (sub === "run") {
    const eIdx=args.indexOf("--event"); const event=eIdx>=0?args[eIdx+1]: "push";
    const tIdx=args.indexOf("--token"); const token=tIdx>=0?args[tIdx+1]:"***";
    console.log(`[github run] event=${event} token=${token.slice(0,4)}*** — simula gh run`);
    return;
  }
  console.error(`github: subcomando desconhecido "${sub}"`); process.exit(1);
}
