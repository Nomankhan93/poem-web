#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo
echo "POEM production release check"
echo "============================="

bash scripts/security-check.sh

echo
echo "[1/5] Phase 4 integrity source checks"
npm run test:phase4-integrity

echo
echo "[2/5] Phase 4.0C fundraising source checks"
npm run test:phase4c

echo
echo "[3/5] TypeScript"
npx tsc --noEmit

echo
echo "[4/5] ESLint"
npm run lint

echo
echo "[5/5] Production build"
npm run build

echo
echo "Production release check passed."
