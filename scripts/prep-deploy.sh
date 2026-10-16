#!/usr/bin/env bash
# Prepares dist/ for a Vercel deploy via the user-Vercel MCP (no CLI login needed).
# Writes /workspace/aivideoprice-b64/<sha1>.b64 per file and prints the create_deployment files[] JSON.
set -euo pipefail
cd "$(dirname "$0")/../dist"
OUT=/workspace/aivideoprice-b64; rm -rf "$OUT"; mkdir -p "$OUT"
echo -n '['; first=1
find . -type f | sed 's|^\./||' | sort | while read -r f; do
  s=$(sha1sum "$f" | cut -c1-40); n=$(stat -c%s "$f"); base64 -w0 "$f" > "$OUT/$s.b64"
  [ $first -eq 1 ] && first=0 || echo -n ','
  printf '{"file":"%s","sha":"%s","size":%s}' "$f" "$s" "$n"
done; echo ']'
