# Exemplo Calculadora — Paridade nos 3 SDKs

Mesma aplicação (Calculadora do Windows ou mock) testada nas 3 stacks.

- `dotnet/` — MSTest
- `python/` — pytest
- `typescript/` — bun:test / vitest

Cada pasta testa o mesmo cenário:

1. Abrir calculadora
2. Clicar `7 + 8 =`
3. Verificar resultado `15`
4. Screenshot em falha + JUnit

Rodar tudo: `wintest run all` na raiz.
