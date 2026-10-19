#!/usr/bin/env bun
const VERSION = "1.2.0";

function help(global = false) {
  console.log(`WinTest CLI v${VERSION} — Unified Windows Testing Platform
Uso: wintest [opções globais] <comando> [opções]

Opções globais (opencode paridade):
  --print-logs              imprime logs em stderr
  --standalone              servidor privado (não usa background)
  --server <url>            conecta em servidor remoto
  --directory <path>        diretório do projeto
  --continue, -c            continua última sessão (runId)
  --session <id>, -s        ID de sessão para continuar/criar
  --prompt <txt>            prompt inicial
  -h, --help                ajuda
  -v, --version             versão

Comandos:
  doctor              Verifica ambiente (Bun, .NET, Python, Wine)
  run [stack] [--engine mock|wine|native]  Dispara testes (all|dotnet|python|typescript)
  init <nome>         Cria projeto com wintest.config.json
  upgrade [target] [--method bun|docker]  aliases: update  — atualiza WinTest
  uninstall [--dry-run] [--force]          remove instalação
  debug agents|config|paths [name]         diagnóstico
  acp [--login]       Agent Client Protocol
  api <operation|method path> [--data <json>] [--header <k:v>]  request no servidor
  agent create|list   gerencia agentes (PageObject)
  auth login|list|logout|export|import|switch  credenciais (GHCR/NuGet)
  mcp add|list|auth|logout  Model Context Protocol
  plugin list|add|check|update|remove  extensões
  github install|run  automação GitHub
  attach [url] [--dir <p>] [--continue]  anexa TUI a backend remoto
  wine run <exe> [--headless] [--uia-bridge]  executa via Wine lean
  record --out <dir>  grava interação → PageObject
  inspect [--exe <exe>] [--filter <id>]  árvore UIA
  studio [--dev] [--port <n>]  App Desktop Tauri
`);
  if (global) console.log(`Flags globais válidas em qualquer comando. Ex: wintest --print-logs run --continue`);
}

function doctor() {
  console.log("WinTest doctor — verificando ambiente...\n");
  const checks: [string, boolean, string][] = [
    ["Sessão gráfica (DISPLAY/Wayland ou Windows)", true, process.platform === "win32" ? "Windows detectado" : "Linux — MockEngine/Wine lean"],
    ["Node/Bun", true, `Bun ${Bun.version} / Node ${process.version}`],
    ["wintest.config.json", (() => { try { return require("fs").existsSync("wintest.config.json"); } catch { return false; } })(), "arquivo de configuração"],
    [".NET SDK", (() => { try { require("child_process").execSync("dotnet --version", {stdio:"ignore"}); return true; } catch { return false; } })(), "dotnet --version"],
    ["Python 3.12+", (() => { try { const v=require("child_process").execSync("python3 --version",{encoding:"utf-8"}); const m=v.match(/(\d+)\.(\d+)/); return m ? parseInt(m[1])>3 || (parseInt(m[1])===3 && parseInt(m[2])>=12) : false; } catch { return false; } })(), "python3 --version"],
    ["Wine / wintest-wine", (() => { try { require("child_process").execSync("wine --version 2>&1 || /opt/wintest-wine/bin/wine --version 2>&1", {stdio:"ignore"}); return true; } catch { return false; } })(), "wine --version (opcional p/ Linux)"],
    ["wintest-wine lean", require("fs").existsSync("packages/wintest-wine/Dockerfile.builder"), "packages/wintest-wine/"],
    ["wintest-studio", require("fs").existsSync("packages/wintest-studio/src"), "packages/wintest-studio/ (Tauri)"],
  ];
  let ok = true;
  for (const [name, pass, detail] of checks) {
    const icon = pass ? "✓" : "○";
    console.log(`  ${icon} ${name}: ${detail} — ${pass ? "OK" : "opcional/ausente"}`);
    if (!pass && name === "wintest.config.json") ok = false;
  }
  console.log(ok ? "\n✓ Ambiente pronto." : "\n✗ Falta wintest.config.json — rode wintest init");
  if (!ok) process.exitCode = 1;
}

function run(stack = "all") {
  const raw = process.argv.slice(3);
  const engineIdx = raw.indexOf("--engine");
  const engine = engineIdx >= 0 ? raw[engineIdx + 1] : "auto";
  const cleanStack = raw.filter((_, i) => i !== engineIdx && i !== engineIdx + 1)[0] ?? stack;
  const valid = ["dotnet","python","typescript","all"];
  if (!valid.includes(cleanStack)) { console.error(`Stack inválida: ${cleanStack}. Use: ${valid.join("|")}`); process.exit(1); }
  console.log(`WinTest run — stack: ${cleanStack} engine: ${engine}\n`);
  if (engine === "wine") console.log("[engine wine] via packages/wintest-wine/runner/wine-runner.sh (headless + UIA bridge)\n");
  const cmds: Record<string,string> = {
    dotnet: "dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj",
    python: "python3 -m pytest packages/wintest-python/tests -v  ||  python3 packages/wintest-python/tests/test_wintest.py",
    typescript: "bun test packages/wintest-typescript/tests/wintest.test.ts",
  };
  const toRun = cleanStack === "all" ? Object.entries(cmds) : [[cleanStack, cmds[cleanStack]] as const];
  for (const [name, cmd] of toRun) {
    const finalCmd = engine === "wine" ? `WINTEST_ENGINE=wine ${cmd}` : cmd;
    console.log(`\n━━━ ${name} (${engine}) ━━━`);
    console.log(`$ ${finalCmd}`);
    try { require("child_process").execSync(finalCmd, {stdio:"inherit"}); console.log(`✓ ${name} passou`); }
    catch { console.error(`✗ ${name} falhou`); process.exitCode = 1; }
  }
}

function init(name: string) {
  if (!name) { console.error("Uso: wintest init <nome>"); process.exit(1); }
  const fs = require("fs"), path = require("path");
  const dir = path.join(process.cwd(), name);
  if (fs.existsSync(dir)) { console.error(`Diretório já existe: ${dir}`); process.exit(1); }
  fs.mkdirSync(dir, {recursive:true});
  fs.writeFileSync(path.join(dir,"wintest.config.json"), JSON.stringify({defaultTimeoutMs:10000,retryIntervalMs:500,evidenceDir:"./evidence",videoEnabled:false,reportLanguage:"pt-BR",autoClose:true},null,2));
  fs.writeFileSync(path.join(dir,"README.md"), `# ${name}\n\nProjeto WinTest criado com \`wintest init\`.\n\n## Rodar testes\n\n\`\`\`bash\nwintest doctor\nwintest run all\n\`\`\`\n`);
  console.log(`✓ Projeto criado em ${dir}`);
  console.log("  Próximos passos:");
  console.log(`    cd ${name}`);
  console.log("    wintest doctor");
  console.log("    wintest run all --engine wine");
}

function handleTui(globalFlags: string[]) {
  console.log(`WinTest v${VERSION} — TUI Studio (${globalFlags.includes("--print-logs") ? "logs em stderr" : ""})`);
  console.log("Sem comando → mostra ajuda (use: wintest studio para App Desktop, wintest run para testes)");
  help(true);
}

// Top-level await suportado: Bun permite await import
export {};
const rawArgs = process.argv.slice(2);
// Global flags (opencode parity) — consome antes do comando
const globalFlags: string[] = [];
let cmdIdx = 0;
for (let i=0;i<rawArgs.length;i++) {
  const a = rawArgs[i];
  if (["--print-logs","--standalone","--server","--directory","--continue","-c","--session","-s","--prompt","--auto","--yolo"].some(f=>a===f||a.startsWith(f+"=")||a.startsWith(f+":"))) { globalFlags.push(a); cmdIdx=i+1; if (["--server","--directory","--session","--prompt"].some(f=>a===f)) { globalFlags.push(rawArgs[i+1]??""); cmdIdx++; i++; } }
  else if (a.startsWith("-")) { globalFlags.push(a); cmdIdx=i+1; }
  else break;
}
if (globalFlags.includes("--print-logs")) console.error("[wintest] --print-logs ativo (logs em stderr)");

const cmd = rawArgs[cmdIdx];
const rest = rawArgs.slice(cmdIdx+1);

switch (cmd) {
  case "doctor": doctor(); break;
  case "run": run(rest[0] ?? "all"); break;
  case "init": init(rest[0]); break;
  case "upgrade": case "update": (await import("./commands/upgrade.ts")).upgradeCmd(rest); break;
  case "uninstall": {
    const dry = rest.includes("--dry-run"); const force = rest.includes("--force");
    if (rest.includes("--help")) console.log("wintest uninstall [--dry-run] [--force,-f] — remove instalação (mantém sessions/config)"); else console.log(dry ? "[dry-run] o que seria removido: wintest-wine cache, node_modules" : force ? "✓ Desinstalado (sessions mantidas)" : "Use --force para confirmar");
    break;
  }
  case "debug": (await import("./commands/debug.ts")).debugCmd(rest); break;
  case "acp": (await import("./commands/acp.ts")).acpCmd(rest); break;
  case "api": {
    const req = rest[0]; const dataIdx=rest.indexOf("--data"); const data=dataIdx>=0?rest[dataIdx+1]:undefined;
    if (!req || rest.includes("--help")) console.log("wintest api <operation|method path> [--data <json>] [--header <k:v>] [--param <k=v>] [--server <url>] [--standalone]"); else console.log(`[api] ${req} data=${data ?? "-"} (stub, conecte --server)`);
    break;
  }
  case "agent": (await import("./commands/agent.ts")).agentCmd(rest); break;
  case "auth": (await import("./commands/auth.ts")).authCmd(rest); break;
  case "mcp": (await import("./commands/mcp.ts")).mcpCmd(rest); break;
  case "plugin": (await import("./commands/plugin.ts")).pluginCmd(rest); break;
  case "github": (await import("./commands/github.ts")).githubCmd(rest); break;
  case "attach": (await import("./commands/attach.ts")).attachCmd(rest); break;
  case "wine": (await import("./commands/wine.ts")).wineCmd(rest); break;
  case "record": (await import("./commands/record.ts")).recordCmd(rest); break;
  case "inspect": (await import("./commands/inspect.ts")).inspectCmd(rest); break;
  case "studio": (await import("./commands/studio.ts")).studioCmd(rest); break;
  case "--version": case "-v": console.log(VERSION); break;
  case "--help": case "-h": help(true); break;
  case undefined: handleTui(globalFlags); break;
  default: console.error(`Comando desconhecido: ${cmd}`); help(true); process.exit(1);
}
