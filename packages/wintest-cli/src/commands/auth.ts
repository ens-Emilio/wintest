import * as fs from "fs";
import * as path from "path";
import * as os from "os";

function authFile() { return path.join(os.homedir(), ".config", "wintest", "auth.json"); }
function load(): Record<string, unknown> { try { return JSON.parse(fs.readFileSync(authFile(),"utf-8")); } catch { return {}; } }
function save(d: Record<string,unknown>) { fs.mkdirSync(path.dirname(authFile()),{recursive:true}); fs.writeFileSync(authFile(), JSON.stringify(d,null,2)); }

export function authCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help") {
    console.log(`wintest auth — gerencia credenciais (GHCR/NuGet/NPM)

Uso:
  wintest auth login [--provider <ghcr|nuget|npm>] [--method <token|oauth>]
  wintest auth list [--format default|json]
  wintest auth logout [target] [credential]
  wintest auth export [target]
  wintest auth import [file]
  wintest auth switch [target] [credential]
`);
    return;
  }
  if (sub === "list" || sub === "ls") {
    const fmt = args.includes("--format") ? args[args.indexOf("--format")+1] : "default";
    const data = load();
    if (fmt === "json") console.log(JSON.stringify(data,null,2));
    else Object.keys(data).length ? Object.entries(data).forEach(([k,v]) => console.log(`${k}: ${JSON.stringify(v)}`)) : console.log("Nenhuma credencial salva");
    return;
  }
  if (sub === "login") {
    const pIdx = args.indexOf("--provider"); const provider = pIdx>=0 ? args[pIdx+1] : (args[1] && !args[1].startsWith("-") ? args[1] : "ghcr");
    const mIdx = args.indexOf("--method"); const method = mIdx>=0 ? args[mIdx+1] : "token";
    console.log(`[auth login] provider=${provider} method=${method}`);
    const data = load(); (data as Record<string,unknown>)[provider] = { method, at: new Date().toISOString() };
    save(data); console.log(`✓ Credencial salva em ${authFile()}`);
    return;
  }
  if (sub === "logout") {
    const target = args[1];
    const data = load(); if (target) delete (data as Record<string,unknown>)[target]; else Object.keys(data).forEach(k=>delete (data as Record<string,unknown>)[k]);
    save(data); console.log(`✓ Logout ${target ?? "all"}`);
    return;
  }
  if (sub === "export") {
    const target = args[1];
    const data = load() as Record<string,unknown>;
    console.log(JSON.stringify(target ? { [target]: data[target] } : data, null, 2));
    return;
  }
  if (sub === "import") {
    const file = args[1];
    const raw = file ? fs.readFileSync(file,"utf-8") : fs.readFileSync(0,"utf-8");
    const imported = JSON.parse(raw); const data = load(); Object.assign(data, imported); save(data);
    console.log(`✓ Credenciais importadas`);
    return;
  }
  if (sub === "switch") {
    const target = args[1]; const cred = args[2];
    console.log(`[auth switch] ${target} -> ${cred ?? "default"}`);
    return;
  }
  console.error(`auth: subcomando desconhecido "${sub}"`); process.exit(1);
}
