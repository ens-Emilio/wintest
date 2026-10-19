export function wineCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help" || sub === "-h") {
    console.log(`wintest wine — Wine lean runner

Uso:
  wintest wine --version          mostra versão do wine / wintest-wine:10
  wintest wine run <exe> [opts]   executa .exe via Wine (ou Mock se Wine ausente)
    --headless                    sem X11 (Xvfb :99)
    --uia-bridge                  ativa UIA bridge (/tmp/wintest-uia.sock)

Exemplos:
  wintest wine run ./MinhaApp.exe --headless --uia-bridge
  wintest wine run notepad.exe
`);
    return;
  }
  if (sub === "--version" || sub === "-v") {
    try {
      const v = require("child_process").execSync("wine --version 2>&1 || /opt/wintest-wine/bin/wine --version 2>&1 || echo wine-not-found", { encoding: "utf-8" }).trim();
      console.log(`wine: ${v}`);
    } catch { console.log("wine: not-found (use MockEngine)"); }
    console.log("wintest-wine: lean (packages/wintest-wine/)");
    return;
  }
  if (sub === "run") {
    const exe = args[1];
    if (!exe) { console.error("Uso: wintest wine run <exe> [--headless] [--uia-bridge]"); process.exit(1); }
    const runner = require("path").join(__dirname, "../../../wintest-wine/runner/wine-runner.sh");
    const extra = args.slice(2).join(" ");
    const cmd = `bash "${runner}" ${extra} "${exe}"`;
    console.log(`$ ${cmd}`);
    try { require("child_process").execSync(cmd, { stdio: "inherit" }); }
    catch (e) { const code = (e as { status?: number }).status ?? 1; process.exit(code); }
    return;
  }
  console.error(`wintest wine: subcomando desconhecido "${sub}"`); process.exit(1);
}
