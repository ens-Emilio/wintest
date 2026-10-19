#!/usr/bin/env bun
const VERSION = "1.1.0-wine";

function help() {
  console.log(`WinTest CLI v${VERSION}
Uso: wintest <comando> [opções]

Comandos:
  doctor              Verifica ambiente (sessão gráfica, .NET, Python, Bun, Wine)
  run [stack] [--engine mock|wine|native]  Dispara testes (all|dotnet|python|typescript)
  init <nome>         Cria projeto com wintest.config.json
  wine run <exe> [--headless] [--uia-bridge]  Executa .exe via Wine lean
  wine --version      Mostra versão do Wine
  record --out <dir> [--engine mock|wine]  Grava interação → PageObject
  inspect [--exe <exe>] [--filter <id>] [--engine mock|wine]  Árvore UIA
  studio [--dev]      Abre App Desktop (Tauri)
  --help, -h          Ajuda
  --version, -v       Versão
`);
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

const [,, cmd, ...rest] = process.argv;
switch (cmd) {
  case "doctor": doctor(); break;
  case "run": run(rest[0] ?? "all"); break;
  case "init": init(rest[0]); break;
  case "wine": (await import("./commands/wine.ts")).wineCmd(rest); break;
  case "record": (await import("./commands/record.ts")).recordCmd(rest); break;
  case "inspect": (await import("./commands/inspect.ts")).inspectCmd(rest); break;
  case "studio": (await import("./commands/studio.ts")).studioCmd(rest); break;
  case "--version": case "-v": console.log(VERSION); break;
  case "--help": case "-h": case undefined: help(); break;
  default: console.error(`Comando desconhecido: ${cmd}`); help(); process.exit(1);
}
