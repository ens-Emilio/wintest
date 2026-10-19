export function debugCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help") {
    console.log(`wintest debug — ferramentas de diagnóstico

Uso:
  wintest debug agents          lista todos os agents (PageObject generators)
  wintest debug config          mostra fontes de configuração
  wintest debug paths [name]    mostra caminhos globais (data, config, cache, evidence, bin)
    name: db|home|data|config|cache|state|tmp|bin|log|repos
`);
    return;
  }
  if (sub === "agents") {
    console.log("Agents disponíveis (geradores de PageObject):");
    console.log("  - login-agent   (gera LoginPage via spec/api-spec.json)");
    console.log("  - calc-agent    (exemplo calculator)");
    console.log("  Docs: spec/api-spec.json é a fonte da verdade");
    return;
  }
  if (sub === "config") {
    const cfg = (() => { try { return JSON.parse(require("fs").readFileSync("wintest.config.json","utf-8")); } catch { return null; } })();
    console.log("Config sources:");
    console.log("  - wintest.config.json:", cfg ? JSON.stringify(cfg, null, 2) : "não encontrado (defaults em uso)");
    console.log("  - spec/api-spec.json: contrato unificado");
    console.log("  - wintest.config.json defaultTimeoutMs: 10000, retryIntervalMs: 500");
    return;
  }
  if (sub === "paths") {
    const name = args[1];
    const home = require("os").homedir();
    const paths: Record<string,string> = {
      home, data: `${home}/.local/share/wintest`, config: `${home}/.config/wintest`,
      cache: `${home}/.cache/wintest`, state: `${home}/.local/state/wintest`,
      tmp: "/tmp/wintest", bin: `${home}/.local/bin/wintest`, log: `${home}/.local/state/wintest/logs`,
      repos: `${home}/.local/share/wintest/repos`, db: `${home}/.local/share/wintest/wintest.db`,
    };
    if (name) console.log(paths[name] ?? `unknown path: ${name}`);
    else Object.entries(paths).forEach(([k,v]) => console.log(`${k.padEnd(8)} ${v}`));
    return;
  }
  console.error(`debug: subcomando desconhecido "${sub}"`); process.exit(1);
}
