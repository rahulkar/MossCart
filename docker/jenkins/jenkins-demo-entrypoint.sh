#!/bin/bash
set -e
# Seeded jobs use file:///workspace/mosscart — Git must see a repo with at least one commit.
# Jenkins checks out commits, not the working tree: if you edit files on the host, either
# `git commit` there or restart jenkins-demo so we run sync_mount_to_git below.
REPO="/workspace/mosscart"
ensure_git_commit() {
  git -C "$REPO" config user.email "jenkins-demo@local"
  git -C "$REPO" config user.name "Jenkins Demo"
  git -C "$REPO" branch -M main 2>/dev/null || true
  git -C "$REPO" add -A
  if ! git -C "$REPO" diff --cached --quiet 2>/dev/null; then
    git -C "$REPO" commit -m "chore: jenkins-demo auto-seed"
  else
    git -C "$REPO" commit --allow-empty -m "chore: jenkins-demo auto-seed (no tracked files yet)"
  fi
}

# Commit any host-mount changes so SCM pipelines see them without manual git on the host.
sync_mount_to_git() {
  [ -d "$REPO/.git" ] || return 0
  git -C "$REPO" rev-parse HEAD >/dev/null 2>&1 || return 0
  git -C "$REPO" config user.email "jenkins-demo@local"
  git -C "$REPO" config user.name "Jenkins Demo"
  git -C "$REPO" branch -M main 2>/dev/null || true
  git -C "$REPO" add -A
  if ! git -C "$REPO" diff --cached --quiet 2>/dev/null; then
    echo "[jenkins-demo] Staged changes on mount — committing so file:// SCM jobs pick them up"
    git -C "$REPO" commit -m "chore: jenkins-demo sync from host mount" || {
      echo "[jenkins-demo] warn: sync commit failed (read-only mount or git error?); SCM may stay stale"
    }
  fi
}

if [ -d "$REPO" ] && [ ! -d "$REPO/.git" ]; then
  echo "[jenkins-demo] No .git under $REPO — git init for file:// SCM"
  git -C "$REPO" init
  ensure_git_commit
elif [ -d "$REPO/.git" ] && ! git -C "$REPO" rev-parse HEAD >/dev/null 2>&1; then
  echo "[jenkins-demo] Git repo has no commits — creating initial commit"
  ensure_git_commit
fi

sync_mount_to_git

exec /usr/bin/tini -- /usr/local/bin/jenkins.sh "$@"
