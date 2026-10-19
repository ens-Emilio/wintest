# WinTest — Unified API Specification v1.0

> **Contract.** Every SDK (.NET, Python, TypeScript) implements exactly this behavior. No SDK may diverge.

## 1. Conventions

| Rule | Value |
|------|-------|
| API language | English |
| Report language | Portuguese (configurable) |
| Default timeout | 10,000 ms |
| Polling interval | 500 ms |
| Naming | Same conceptual name; language casing (PascalCase / snake_case / camelCase) |
| Evidence | Every failure auto-generates screenshot + log |

## 2. Global Config
Same as `wintest.config.json` — see `spec/config-schema.json`.

## 3. Modules A–G
Application / Window / Element / Locator / Keyboard&Mouse / Assert / Evidence — identical behavior across SDKs. See `spec/api-spec.md` (PT-BR reference) or `spec/api-spec.json` (machine-readable).

## 4. Errors
LocatorError / AssertionError / InfraError — same categories and messages in all SDKs.

## 5. Parity
No feature ships in only one SDK. Synchronized SemVer (1.2.0 means all three at 1.2.0).
