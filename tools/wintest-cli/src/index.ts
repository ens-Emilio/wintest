#!/usr/bin/env bun
// Shim: delega para packages/wintest-cli (monorepo único)
// TODO: remover tools/ quando CI migrado para packages/wintest-cli
await import("../../packages/wintest-cli/src/index.ts");
