# WinTest Roadmap — Monorepo Único

> **Decisão:** tudo no mesmo repo `ens-Emilio/wintest`. Sem separação de repos. `wintest-wine` é `packages/wintest-wine/` lean (LGPL-2.1 isolado), `wintest-studio` é `packages/wintest-studio/` (Apache-2.0).

## Fases Concluídas (F1–F5) ✅

| Fase | Duração | Entregável |
|------|---------|------------|
| F1 Fundação | 1-2 sem | `spec/api-spec.json` + `spec/evidence-schema.json` + `spec/config-schema.json` + `docs/automation-ids.md` |
| F2 MVP Stack A | 3-4 sem | `WinTest.Core` (.NET) + `WinTest.Tests` 21 passed + `MockEngine` |
| F3 Porte B/C | 4-5 sem | Python 18 passed + TypeScript 19 passed — paridade total |
| F4 Estabilidade | 3 sem | Sync `exists→visible→enabled→stable`, PageObject, Evidence `junit+html+jsonl+png`, Input history |
| F5 Produto | contínuo | CLI `doctor/run/init`, CI 3 jobs `windows-latest`, exemplos `calculator` tri-stack, docs trilíngue, Apache-2.0, `v1.0.1-linux` |

## Fases Novas (F6–F10) — Este Plano

| Fase | Duração | Objetivo | Entregável Verificável |
|------|---------|----------|------------------------|
| **F6 Wine Lean** | 1 sem | Testar Windows local no Linux via Wine minimal | `packages/wintest-wine/` builda; `wintest wine run notepad.exe --headless` passa; `Dockerfile.builder` em `ghcr.io` |
| **F7 CLI v2** | 5 dias | CLI inspirada em `opencode` (anomalyco/opencode) | `wintest run --engine wine` + `record` + `inspect` usam `spec/api-spec.json` |
| **F8 Studio MVP** | 2 sem | App desktop `Tauri 2 + Svelte` (não Electron) | `packages/wintest-studio/` abre Inspector/Runner/Evidence; mostra `AutomationId` ao vivo |
| **F9 Pack** | 3 dias | Distribuição mono-repo | `AUR wintest-bin` + `gh release` com `wine-runner` + `AppImage` |
| **F10 Docs v2** | 2 dias | Docs PT/EN/ES final + vídeo | `docs/` trilingue completo + `README` com badges |

### Decisão Arquitetural: Fork Wine

- **Forjar só `packages/wintest-wine/`** — não clonar 2GB `winehq/wine` dentro de `wintest`. Usar `Dockerfile.builder` que baixa `wine-staging` e aplica `patches/*.patch` (LGPL-2.1).
- Patches: `001-uia-bridge.patch` (expõe `UIAutomationCore.dll` fake), `002-headless.patch`, `003-automation-id.patch`.
- `wintest-wine/` é `LGPL-2.1`, resto `Apache-2.0` — isolamento via `LICENSE.wine` + `COPYING`.

### Decisão CLI/Studio

- `packages/wintest-cli/` já existe — expandir para `wine/record/inspect/studio` no mesmo `Bun` CLI (não criar repo separado).
- `packages/wintest-studio/` novo — `Tauri 2 + SvelteKit` (8MB binário vs 180MB Electron), 3 rotas: `inspector/runner/evidence`.
- `spec/` continua fonte da verdade — nenhum SDK diverge.

## Estrutura Final Monorepo

```
wintest/ (Apache-2.0, exceto packages/wintest-wine/ LGPL-2.1)
├── spec/ + docs/                    # já existem
├── packages/
│   ├── wintest-dotnet/              # ✅
│   ├── wintest-python/              # ✅
│   ├── wintest-typescript/          # ✅
│   ├── wintest-wine/                # F6 (novo, lean)
│   ├── wintest-cli/                 # F7 (expandir)
│   └── wintest-studio/              # F8 (novo, Tauri)
├── tools/                           # wintest-cli atual → packages/wintest-cli
├── examples/calculator/             # ✅ tri-stack
└── .github/workflows/               # CI existente + novo wine/studio CI
```

## Custo

- **VM local:** 8GB RAM permanente, 30GB disco, boot lento.
- **Wine Lean:** 400MB Docker, 0 RAM idle, `run` em 2s.
- **Matriz Wine UIA:** `Win32 95% / Electron 90% / WPF 60%` — documentar, fallback VM para WPF crítico.

## Governança

- `ROADMAP.md` (este arquivo) é o plano anotado.
- `spec/` é imutável sem RFC.
- Versionamento sincronizado: `1.0.1-linux` → `1.1.0-wine` → `1.2.0-studio`.
