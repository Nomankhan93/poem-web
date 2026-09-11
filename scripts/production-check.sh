#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo
echo "POEM production release check"
echo "============================="

bash scripts/security-check.sh

echo
echo "[1/3] TypeScript"
npx tsc --noEmit

echo
echo "[2/3] ESLint"
npm run lint

echo
echo "[3/3] Production build"
npm run build

echo
echo "Production release check passed."
