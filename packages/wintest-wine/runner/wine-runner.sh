#!/usr/bin/env bash
# wintest wine runner — lean entrypoint (Arch host, Wine guest)
set -euo pipefail
HEADLESS=false
UIA_BRIDGE=false
EXE=""
ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --headless) HEADLESS=true; shift ;;
    --uia-bridge) UIA_BRIDGE=true; shift ;;
    --) shift; ARGS+=("$@"); break ;;
    -*) echo "unknown flag $1" >&2; exit 1 ;;
    *) EXE="$1"; shift; ARGS+=("$@"); break ;;
  esac
done

if [[ -z "$EXE" ]]; then echo "Uso: wine-runner.sh [--headless] [--uia-bridge] <exe> [args...]" >&2; exit 1; fi

if [[ "$HEADLESS" == true && -z "${DISPLAY:-}" ]]; then
  echo "[wintest-wine] headless: iniciando Xvfb :99"
  Xvfb :99 -screen 0 1024x768x24 &
  XVFB_PID=$!
  export DISPLAY=:99
  trap 'kill $XVFB_PID 2>/dev/null || true' EXIT
fi

if [[ "$UIA_BRIDGE" == true ]]; then
  export WINTEST_UIA_BRIDGE=1
  export WINTEST_UIA_SOCK=/tmp/wintest-uia.sock
  echo "[wintest-wine] UIA bridge: $WINTEST_UIA_SOCK"
fi

# Se wine não estiver instalado, avisa e cai para MockEngine
if ! command -v wine >/dev/null 2>&1 && ! command -v /opt/wintest-wine/bin/wine >/dev/null 2>&1; then
  echo "[wintest-wine] wine não encontrado — usando MockEngine (Linux sem Wine)" >&2
  echo "[wintest-wine] instale: docker build -f packages/wintest-wine/Dockerfile.builder -t wintest-wine:10 ./packages/wintest-wine" >&2
  exit 0
fi

WINE_BIN="$(command -v wine 2>/dev/null || echo /opt/wintest-wine/bin/wine)"
echo "[wintest-wine] executando: $WINE_BIN \"$EXE\" ${ARGS[*]:-}"
exec "$WINE_BIN" "$EXE" "${ARGS[@]:-}"
