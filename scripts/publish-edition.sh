#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_DIR="$REPO_DIR/.locks"
LOG_DIR="$REPO_DIR/logs"
LOCK_FILE="$LOCK_DIR/publish-edition.lock"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/publish-edition-$TIMESTAMP.log"

mkdir -p "$LOCK_DIR" "$LOG_DIR"

exec > >(tee -a "$LOG_FILE") 2>&1

if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    echo "[publish] Another publish run is already in progress; exiting"
    exit 0
  fi
fi

cd "$REPO_DIR"

export NEWSPAPER_DATA_DIR="${NEWSPAPER_DATA_DIR:-$REPO_DIR/data/editions}"
CURRENT_BRANCH="$(git branch --show-current)"

cleanup() {
  local exit_code=$?
  if [[ $exit_code -eq 0 ]]; then
    echo "[publish] Finished successfully"
  else
    echo "[publish] Failed with exit code $exit_code"
  fi
}
trap cleanup EXIT

printf '[publish] repo=%s\n' "$REPO_DIR"
printf '[publish] branch=%s\n' "$CURRENT_BRANCH"
printf '[publish] data=%s\n' "$NEWSPAPER_DATA_DIR"
printf '[publish] log=%s\n' "$LOG_FILE"

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo '[publish] Repository has uncommitted changes; refusing to publish on a dirty tree'
  git status --short
  exit 1
fi

echo '[publish] Syncing branch with origin before generation'
git fetch origin "$CURRENT_BRANCH"
git pull --rebase origin "$CURRENT_BRANCH"

echo '[publish] Generating latest edition'
npm run fetch:force

if git diff --quiet -- data/editions; then
  echo '[publish] No edition changes to commit'
  exit 0
fi

echo '[publish] Committing updated edition data'
git add data/editions
git commit -m "chore: publish daily edition"

echo '[publish] Pushing to GitHub'
git push origin "$CURRENT_BRANCH"

echo '[publish] Pushed latest edition to GitHub'
