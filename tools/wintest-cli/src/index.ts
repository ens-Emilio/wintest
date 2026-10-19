#!/usr/bin/env bun
const VERSION = "1.0.0";

function help() {
  console.log(`WinTest CLI v${VERSION}
Uso: wintest <comando> [opções]

Comandos:
  doctor              Verifica se a máquina Windows está pronta (sessão gráfica, dependências)
  run [stack]         Dispara testes de uma stack (dotnet|python|typescript|all)
  init <nome>         Cria projeto de exemplo com wintest.config.json
  --help, -h          Mostra esta ajuda
  --version, -v       Mostra versão
`);
}

function doctor() {
  console.log("WinTest doctor — verificando ambiente...\n");
  const checks: [string, boolean, string][] = [
    ["Sessão gráfica (DISPLAY/Wayland ou Windows)", true, process.platform === "win32" ? "Windows detectado" : "Linux — testes rodam com MockEngine; para testes reais use runner Windows"],
    ["Node/Bun", true, `Bun ${Bun.version} / Node ${process.version}`],
    ["wintest.config.json", (() => { try { require("fs").existsSync("wintest.config.json") } catch { return false } return require("fs").existsSync("wintest.config.json"); })(), "arquivo de configuração"],
    [".NET SDK", (() => { try { require("child_process").execSync("dotnet --version", {stdio:"ignore"}); return true; } catch { return false } })(), "dotnet --version"],
    ["Python 3.12+", (() => { try { const v=require("child_process").execSync("python3 --version",{encoding:"utf-8"}); const m=v.match(/(\d+)\.(\d+)/); return m ? parseInt(m[1])>3 || (parseInt(m[1])===3 && parseInt(m[2])>=12) : false; } catch { return false } })(), "python3 --version"],
  ];
  let ok = true;
  for (const [name, pass, detail] of checks) {
    const icon = pass ? "✓" : "✗";
    console.log(`  ${icon} ${name}: ${detail} — ${pass ? "OK" : "FALTA"}`);
    if (!pass) ok = false;
  }
  console.log(ok ? "\n✓ Ambiente pronto." : "\n✗ Alguns checks falharam — veja acima.");
  if (!ok) process.exitCode = 1;
}

function run(stack = "all") {
  const valid = ["dotnet","python","typescript","all"];
  if (!valid.includes(stack)) { console.error(`Stack inválida: ${stack}. Use: ${valid.join("|")}`); process.exit(1); }
  console.log(`WinTest run — stack: ${stack}\n`);
  const cmds: Record<string,string> = {
    dotnet: "dotnet run --project packages/wintest-dotnet/WinTest.Tests/WinTest.Tests.csproj",
    python: "python3 -m pytest packages/wintest-python/tests -v  ||  python3 packages/wintest-python/tests/test_wintest.py",
    typescript: "bun test packages/wintest-typescript/tests/wintest.test.ts",
  };
  const toRun = stack === "all" ? Object.entries(cmds) : [[stack, cmds[stack]] as const];
  for (const [name, cmd] of toRun) {
    console.log(`\n━━━ ${name} ━━━`);
    console.log(`$ ${cmd}`);
    try { require("child_process").execSync(cmd, {stdio:"inherit"}); console.log(`✓ ${name} passou`); }
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
  console.log("    wintest run all");
}

const [,, cmd, arg] = process.argv;
switch (cmd) {
  case "doctor": doctor(); break;
  case "run": run(arg); break;
  case "init": init(arg); break;
  case "--version": case "-v": console.log(VERSION); break;
  case "--help": case "-h": case undefined: help(); break;
  default: console.error(`Comando desconhecido: ${cmd}`); help(); process.exit(1);
}
