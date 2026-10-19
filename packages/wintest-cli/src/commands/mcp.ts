import * as fs from "fs";
import * as path from "path";
function cfgPath() { const g=process.argv.includes("--global"); return g ? path.join(require("os").homedir(),".config","wintest","mcp.json") : path.join(process.cwd(),".wintest","mcp.json"); }
function load(): Record<string,unknown> { try { return JSON.parse(fs.readFileSync(cfgPath(),"utf-8")); } catch { return {}; } }
function save(d: Record<string,unknown>) { fs.mkdirSync(path.dirname(cfgPath()),{recursive:true}); fs.writeFileSync(cfgPath(), JSON.stringify(d,null,2)); }
export function mcpCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help") {
    console.log(`wintest mcp — gerencia servidores Model Context Protocol (Locator extensível)

Uso:
  wintest mcp list
  wintest mcp add <name> [--url <url>] [--header <k=v>] [--env <k=v>] [--global] [-- <command> [args...]]
  wintest mcp auth [name]
  wintest mcp logout [name]
`);
    return;
  }
  if (sub === "list" || sub === "ls") {
    const data = load(); Object.keys(data).length ? Object.entries(data).forEach(([k,v])=> console.log(`${k}: ${JSON.stringify(v)}`)) : console.log("Nenhum MCP configurado");
    return;
  }
  if (sub === "add") {
    const name = args[1]; if (!name) { console.error("wintest mcp add <name>"); process.exit(1); }
    const urlIdx=args.indexOf("--url"); const url=urlIdx>=0?args[urlIdx+1]:undefined;
    const data=load(); (data as Record<string,unknown>)[name]={url: url ?? `cmd:${args.slice(3).join(" ")}`, at: new Date().toISOString()}; save(data); console.log(`✓ MCP ${name} adicionado`);
    return;
  }
  if (sub === "auth") {
    const name=args[1] ?? "all"; console.log(`[mcp auth] ${name} — OAuth flow (stub, configure --header para remoto)`);
    return;
  }
  if (sub === "logout") { const name=args[1]; if(!name){console.error("wintest mcp logout <name>");process.exit(1);} const data=load(); delete (data as Record<string,unknown>)[name]; save(data); console.log(`✓ MCP ${name} logout`); return; }
  console.error(`mcp: subcomando desconhecido "${sub}"`); process.exit(1);
}
