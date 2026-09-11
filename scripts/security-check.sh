#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo
echo "POEM security check"
echo "==================="

fail=0

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  tracked_env="$(
    git ls-files \
      | grep -E '(^|/)\.env($|\.)' \
      | grep -v -E '(^|/)\.env\.example$' \
      || true
  )"

  if [[ -n "$tracked_env" ]]; then
    echo "ERROR: environment file(s) are tracked by Git:"
    echo "$tracked_env"
    fail=1
  else
    echo "✓ No private .env files are tracked"
  fi

  if git diff --check; then
    echo "✓ Git whitespace check passed"
  else
    echo "ERROR: git diff --check failed"
    fail=1
  fi
else
  echo "! Git repository check skipped"
fi

if grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude='*.md' \
  --exclude='*.txt' \
  'NEXT_PUBLIC_(SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)' \
  src .env* 2>/dev/null; then
  echo "ERROR: a Supabase secret/service key is configured with NEXT_PUBLIC_."
  fail=1
else
  echo "✓ No public-prefixed Supabase admin secret detected"
fi

if grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=.git \
  --exclude='*.md' \
  --exclude='*.txt' \
  'sb_secret_[A-Za-z0-9_-]{20,}' \
  src scripts .env.example 2>/dev/null; then
  echo "ERROR: a hard-coded Supabase secret-looking value was found."
  fail=1
else
  echo "✓ No hard-coded sb_secret_ value detected"
fi

if [[ -d ".poem-patch-backups" ]]; then
  echo "! Legacy .poem-patch-backups directory exists inside the project."
  echo "  Keep it ignored or move it outside the repository."
fi

if [[ "$fail" -ne 0 ]]; then
  echo
  echo "Security check FAILED."
  exit 1
fi

echo
echo "Security check passed."
