export function studioCmd(args: string[]): void {
  if (args[0] === "--help") {
    console.log(`wintest studio — abre o App Desktop (Tauri)

Uso:
  wintest studio [--dev] [--port 1420]

Requer: packages/wintest-studio/ (Tauri 2 + Svelte)
`);
    return;
  }
  const dev = args.includes("--dev");
  const portIdx = args.indexOf("--port");
  const port = portIdx >= 0 ? args[portIdx + 1] : "1420";
  const pkg = require("path").join(__dirname, "../../../wintest-studio");
  if (!require("fs").existsSync(require("path").join(pkg, "src"))) {
    console.error("wintest-studio não encontrado. Rode: scaffold em packages/wintest-studio/");
    process.exit(1);
  }
  const cmd = dev ? `npm run tauri dev -- --port ${port}` : `npm run tauri build && ./src-tauri/target/release/wintest-studio`;
  console.log(`$ ${cmd} (cwd: ${pkg})`);
  try { require("child_process").execSync(cmd, { cwd: pkg, stdio: "inherit" }); }
  catch { process.exit(1); }
}
