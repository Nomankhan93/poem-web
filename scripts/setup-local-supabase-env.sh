#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is required."
  exit 1
fi

echo "Reading local Supabase status..."
STATUS="$(npx supabase status -o env)"

API_URL="$(printf '%s\n' "$STATUS" | sed -n 's/^API_URL="\([^"]*\)".*/\1/p' | head -n1)"
ANON_KEY="$(printf '%s\n' "$STATUS" | sed -n 's/^ANON_KEY="\([^"]*\)".*/\1/p' | head -n1)"

if [[ -z "$API_URL" || -z "$ANON_KEY" ]]; then
  echo "ERROR: Could not read API_URL or ANON_KEY from 'npx supabase status -o env'."
  echo "Make sure local Supabase is running with: npx supabase start"
  exit 1
fi

ENV_FILE="$PROJECT_DIR/.env.local"
touch "$ENV_FILE"

python3 - "$ENV_FILE" "$API_URL" "$ANON_KEY" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
url = sys.argv[2]
anon = sys.argv[3]

values = {
    "NEXT_PUBLIC_SUPABASE_URL": url,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": anon,
}

lines = path.read_text().splitlines() if path.exists() else []
out = []
seen = set()

for line in lines:
    key = line.split("=", 1)[0].strip() if "=" in line else ""
    if key in values:
        out.append(f"{key}={values[key]}")
        seen.add(key)
    else:
        out.append(line)

if out and out[-1].strip():
    out.append("")

out.append("# POEM local Supabase")
for key, value in values.items():
    if key not in seen:
        out.append(f"{key}={value}")

path.write_text("\n".join(out).rstrip() + "\n")
PY

echo "Updated $ENV_FILE"
echo "NEXT_PUBLIC_SUPABASE_URL=$API_URL"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key written>"
