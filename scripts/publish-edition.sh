#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

export NEWSPAPER_DATA_DIR="${NEWSPAPER_DATA_DIR:-$REPO_DIR/data/editions}"

printf '[publish] repo=%s\n' "$REPO_DIR"
printf '[publish] data=%s\n' "$NEWSPAPER_DATA_DIR"

npm run fetch:force

if git diff --quiet -- data/editions; then
  echo '[publish] No edition changes to commit'
  exit 0
fi

git add data/editions

git commit -m "chore: publish daily edition"
git push origin "$(git branch --show-current)"

echo '[publish] Pushed latest edition to GitHub'
