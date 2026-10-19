# wintest-studio — Tauri 2 + Svelte

App Desktop 8MB (vs 180MB Electron). 3 rotas: `inspector/runner/evidence`.

```bash
cd packages/wintest-studio
npm install
npm run dev          # Vite em :1420
npm run tauri dev    # Tauri window
npm run tauri build  # AppImage/bundle
```

Via CLI: `wintest studio` / `wintest studio --dev`
Inspector usa MockTree no Linux, UIA bridge (/tmp/wintest-uia.sock) com Wine.
