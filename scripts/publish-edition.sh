#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK_DIR="$REPO_DIR/.locks"
LOG_DIR="$REPO_DIR/logs"
LOCK_FILE="$LOCK_DIR/publish-edition.lock"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
LOG_FILE="$LOG_DIR/publish-edition-$TIMESTAMP.log"
PUBLISH_BRANCH="main"

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
export NEWSPAPER_BASE_URL="${NEWSPAPER_BASE_URL:-https://ai-newspaper-web.vercel.app}"
ORIGINAL_BRANCH="$(git branch --show-current)"
CURRENT_BRANCH="$ORIGINAL_BRANCH"
STASH_CREATED=0
STASH_REF=""
RESTORE_FAILED=0

restore_workspace() {
  local exit_code=$?

  set +e

  if [[ "$CURRENT_BRANCH" != "$ORIGINAL_BRANCH" ]]; then
    echo "[publish] Restoring original branch: $ORIGINAL_BRANCH"
    git checkout "$ORIGINAL_BRANCH"
    if [[ $? -ne 0 ]]; then
      echo "[publish] WARNING: failed to switch back to original branch $ORIGINAL_BRANCH"
      RESTORE_FAILED=1
    else
      CURRENT_BRANCH="$ORIGINAL_BRANCH"
    fi
  fi

  if [[ $STASH_CREATED -eq 1 ]]; then
    echo "[publish] Restoring stashed workspace changes"
    git stash pop --index "$STASH_REF"
    if [[ $? -ne 0 ]]; then
      echo "[publish] WARNING: failed to apply stashed changes automatically"
      echo "[publish] Manual recovery may be required: git stash list"
      RESTORE_FAILED=1
    fi
  fi

  if [[ $exit_code -eq 0 && $RESTORE_FAILED -eq 0 ]]; then
    echo "[publish] Finished successfully"
  elif [[ $exit_code -eq 0 ]]; then
    echo "[publish] Publish completed, but workspace restoration needs attention"
    exit_code=1
  else
    echo "[publish] Failed with exit code $exit_code"
  fi

  exit "$exit_code"
}
trap restore_workspace EXIT

printf '[publish] repo=%s\n' "$REPO_DIR"
printf '[publish] original_branch=%s\n' "$ORIGINAL_BRANCH"
printf '[publish] publish_branch=%s\n' "$PUBLISH_BRANCH"
printf '[publish] data=%s\n' "$NEWSPAPER_DATA_DIR"
printf '[publish] base_url=%s\n' "$NEWSPAPER_BASE_URL"
printf '[publish] log=%s\n' "$LOG_FILE"

if [[ "$CURRENT_BRANCH" != "$PUBLISH_BRANCH" ]]; then
  if ! git diff --quiet || ! git diff --cached --quiet; then
    STASH_MESSAGE="publish-edition-auto-stash-$TIMESTAMP"
    echo "[publish] Dirty workspace on $CURRENT_BRANCH; stashing before switching to $PUBLISH_BRANCH"
    git stash push --include-untracked -m "$STASH_MESSAGE"
    STASH_REF="stash@{0}"
    STASH_CREATED=1
  else
    echo "[publish] No local changes on $CURRENT_BRANCH; switching directly to $PUBLISH_BRANCH"
  fi

  git checkout "$PUBLISH_BRANCH"
  CURRENT_BRANCH="$PUBLISH_BRANCH"
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo '[publish] Repository has uncommitted changes on publish branch; refusing to publish on a dirty tree'
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
