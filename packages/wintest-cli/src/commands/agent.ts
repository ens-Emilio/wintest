export function agentCmd(args: string[]): void {
  const sub = args[0];
  if (!sub || sub === "--help") {
    console.log(`wintest agent — gerencia agentes que geram PageObjects

Uso:
  wintest agent create [--path <dir>] [--description <txt>] [--mode all|primary|subagent] [--permissions <csv>] [--model <provider/model>]
  wintest agent list
  --permissions: shell,read,edit,glob,grep,webfetch,task,websearch,lsp,skill (alias: --tools)
  --mode: all|primary|subagent

Exemplos:
  wintest agent create --description "gera LoginPage" --mode primary --permissions read,edit
  wintest agent list
`);
    return;
  }
  if (sub === "create") {
    const get = (flag: string) => { const i=args.indexOf(flag); return i>=0 ? args[i+1] : undefined; };
    const desc = get("--description") ?? "PageObject generator";
    const mode = get("--mode") ?? "primary";
    const perms = get("--permissions") ?? get("--tools") ?? "read,edit";
    const path = get("--path") ?? ".opencode/agent";
    const model = get("--model") ?? "auto";
    console.log(`[agent create] ${desc} mode=${mode} perms=${perms} model=${model}`);
    require("fs").mkdirSync(path, { recursive: true });
    const frontmatter = `---\ndescription: ${desc}\nmode: ${mode}\npermissions: ${perms}\nmodel: ${model}\n---\n`;
    require("fs").writeFileSync(require("path").join(path, "agent.md"), frontmatter + `\n# Agent: ${desc}\n\nGera PageObjects via spec/api-spec.json\n`);
    console.log(`✓ Agent criado em ${path}/agent.md`);
    return;
  }
  if (sub === "list" || sub === "ls") {
    console.log("Agents:");
    console.log("  - login-agent (primary)  — gera LoginPage");
    console.log("  - calc-agent  (subagent) — exemplo calculator");
    return;
  }
  console.error(`agent: subcomando desconhecido "${sub}"`); process.exit(1);
}
