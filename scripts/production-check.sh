#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo
echo "POEM production release check"
echo "============================="

bash scripts/security-check.sh

echo
echo "[1/4] Phase 4 integrity source checks"
npm run test:phase4-integrity

echo
echo "[2/4] TypeScript"
npx tsc --noEmit

echo
echo "[3/4] ESLint"
npm run lint

echo
echo "[4/4] Production build"
npm run build

echo
echo "Production release check passed."
