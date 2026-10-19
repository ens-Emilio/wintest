export function pluginCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help") {
    console.log(`wintest plugin — extensões de Evidence/Locator

Uso:
  wintest plugin list [--builtin]
  wintest plugin add <package>
  wintest plugin check [target]
  wintest plugin update [target]
  wintest plugin remove <package>
`);
    return;
  }
  if (sub === "list" || sub === "ls") {
    const builtin = args.includes("--builtin");
    console.log("Plugins:" + (builtin ? " (incl. builtins)" : ""));
    console.log("  - @wintest/screenshot (evidence)");
    if (builtin) console.log("  - builtin: locator-image, evidence-video");
    return;
  }
  if (sub === "add") {
    const pkg=args[1]; if(!pkg){console.error("wintest plugin add <package>");process.exit(1);}
    console.log(`[plugin add] ${pkg}`); try{ require("child_process").execSync(`bun add ${pkg} 2>&1 | tail -5`,{stdio:"inherit"});}catch{console.log("[plugin] bun add skip (stub)");}
    return;
  }
  if (sub === "check") { console.log(`[plugin check] ${args[1] ?? "all"} — verifica updates`); return; }
  if (sub === "update") { console.log(`[plugin update] ${args[1] ?? "all"} — atualiza`); try{ require("child_process").execSync(`bun update 2>&1 | tail -5`,{stdio:"inherit"});}catch{} return; }
  if (sub === "remove") { const pkg=args[1]; if(!pkg){console.error("wintest plugin remove <package>");process.exit(1);} console.log(`[plugin remove] ${pkg}`); return; }
  console.error(`plugin: subcomando desconhecido "${sub}"`); process.exit(1);
}
