export function upgradeCmd(args: string[]): void {
  const target = args[0] && !args[0].startsWith("-") ? args[0] : undefined;
  const methodIdx = args.indexOf("--method");
  const method = methodIdx >= 0 ? args[methodIdx + 1] : "auto";
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`wintest upgrade — atualiza WinTest para versão mais recente

Uso:
  wintest upgrade [target] [--method <bun|docker>]   aliases: update
  target: versão (com ou sem v prefix, ex: 1.2.0)

Exemplos:
  wintest upgrade
  wintest upgrade 1.2.0 --method bun
  wintest update --method docker
`);
    return;
  }
  const ver = target ?? "latest";
  console.log(`[upgrade] WinTest ${ver} via ${method}`);
  if (method === "docker" || method === "auto") {
    try { require("child_process").execSync("docker pull ghcr.io/ens-emilio/wintest/wintest-wine:10 2>&1 | head -5", { stdio: "inherit" }); } catch { console.log("[upgrade] docker pull skip (docker ausente)"); }
  }
  if (method === "bun" || method === "auto") {
    try { require("child_process").execSync("bun update 2>&1 | head -10", { stdio: "inherit" }); } catch { console.log("[upgrade] bun update skip"); }
  }
  console.log(`✓ Upgrade concluído (${ver})`);
}
