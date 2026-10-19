#!/usr/bin/env bash
set -euo pipefail
# Build wintest-wine (requer docker)
DIR="$(cd "$(dirname "$0")/.." && pwd)"
docker build -f "$DIR/Dockerfile.builder" -t wintest-wine:10 "$DIR"
echo "OK: wintest-wine:10"
docker images wintest-wine:10 | head -5
