#!/usr/bin/env bash
# MossCart Jenkins impact testing: apply or revert semantic edits locally (no commit/push).
# Usage: impact-mutate.sh apply|revert payment|mixed|profile|checkout
# Optional: IMPACT_TARGET_DIR=absolute/path copies scenario files into a second clone after apply/revert.
# With jenkins-demo, the job workspace is already /workspace/mosscart (host mount); leave IMPACT_TARGET_DIR empty unless you mirror elsewhere.

set -euo pipefail

usage() {
  echo "Usage: $0 apply|revert payment|mixed|profile|checkout" >&2
  exit 2
}

[[ $# -eq 2 ]] || usage
ACTION=$1
SCENARIO=$2

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || {
  echo "Not inside a git repository." >&2
  exit 1
}
cd "$ROOT"

sync_files() {
  local dest="${IMPACT_TARGET_DIR:-}"
  [[ -n "$dest" ]] || return 0
  if [[ ! -d "$dest" ]]; then
    echo "IMPACT_TARGET_DIR is not a directory: $dest" >&2
    exit 1
  fi
  local p target
  for p in "$@"; do
    target="$dest/$p"
    mkdir -p "$(dirname "$target")"
    cp -f "$ROOT/$p" "$target"
    echo "Synced $p -> $target"
  done
}

restore_paths() {
  git restore --source=HEAD --worktree -- "$@"
}

# --- payment: API uses "declined" instead of "failed" for mock decline (clients expecting "failed" break) ---
paths_payment() {
  echo "backend/src/routes/checkout.js"
}

apply_payment() {
  local f="backend/src/routes/checkout.js"
  if grep -q 'fail ? "declined"' "$f"; then
    echo "Impact payment already applied."
    return 0
  fi
  perl -0pi -e 's/const paymentStatus = fail \? "failed" : "succeeded";/const paymentStatus = fail ? "declined" : "succeeded";/' "$f"
  echo "Applied impact: payment ($f)"
}

revert_payment() {
  restore_paths backend/src/routes/checkout.js
  echo "Reverted impact: payment"
}

# --- mixed: cart API error text + cart CTA label ---
paths_mixed() {
  echo "backend/src/routes/cart.js"
  echo "frontend/src/pages/Cart.jsx"
}

apply_mixed() {
  local fb="backend/src/routes/cart.js"
  local fu="frontend/src/pages/Cart.jsx"
  if grep -q 'Unknown product SKU \(impact\)' "$fb"; then
    echo "Impact mixed already applied."
    return 0
  fi
  perl -0pi -e 's/return res\.status\(404\)\.json\(\{ error: "Product not found" \}\);/return res.status(404).json({ error: "Unknown product SKU (impact)" });/' "$fb"
  perl -0pi -e 's/>Proceed to checkout</>Go to checkout \(impact\)</' "$fu"
  echo "Applied impact: mixed"
}

revert_mixed() {
  restore_paths backend/src/routes/cart.js frontend/src/pages/Cart.jsx
  echo "Reverted impact: mixed"
}

# --- profile: email conflict message + page title ---
paths_profile() {
  echo "backend/src/routes/users.js"
  echo "frontend/src/pages/Profile.jsx"
}

apply_profile() {
  local fb="backend/src/routes/users.js"
  local fu="frontend/src/pages/Profile.jsx"
  if grep -q 'Email already registered \(impact\)' "$fb"; then
    echo "Impact profile already applied."
    return 0
  fi
  perl -0pi -e 's/if \(taken\) return res\.status\(409\)\.json\(\{ error: "Email in use" \}\);/if (taken) return res.status(409).json({ error: "Email already registered (impact)" });/' "$fb"
  perl -0pi -e 's/(data-testid="profile-title">\s+)Profile/\1Account (impact)/' "$fu"
  echo "Applied impact: profile"
}

revert_profile() {
  restore_paths backend/src/routes/users.js frontend/src/pages/Profile.jsx
  echo "Reverted impact: profile"
}

# --- checkout: shipping validation copy + checkout page subtitle ---
paths_checkout() {
  echo "backend/src/routes/checkout.js"
  echo "frontend/src/pages/Checkout.jsx"
}

apply_checkout() {
  local fb="backend/src/routes/checkout.js"
  local fu="frontend/src/pages/Checkout.jsx"
  if grep -q 'All shipping fields \(impact test\)' "$fb"; then
    echo "Impact checkout already applied."
    return 0
  fi
  perl -0pi -e 's/error: "shippingName, shippingLine1, shippingCity, shippingPostal required"/error: "All shipping fields (impact test): name, street, city, postal required"/' "$fb"
  perl -0pi -e 's/Mock payment — no real card is charged\./Mock payment — impact test subtitle (no card charged)./' "$fu"
  echo "Applied impact: checkout"
}

revert_checkout() {
  restore_paths backend/src/routes/checkout.js frontend/src/pages/Checkout.jsx
  echo "Reverted impact: checkout"
}

case "$SCENARIO" in
  payment|mixed|profile|checkout) ;;
  *) echo "Unknown scenario: $SCENARIO" >&2; usage ;;
esac

mapfile -t SCENARIO_PATHS < <(
  case "$SCENARIO" in
    payment) paths_payment ;;
    mixed) paths_mixed ;;
    profile) paths_profile ;;
    checkout) paths_checkout ;;
  esac
)

case "$ACTION" in
  apply)
    case "$SCENARIO" in
      payment) apply_payment ;;
      mixed) apply_mixed ;;
      profile) apply_profile ;;
      checkout) apply_checkout ;;
    esac
    sync_files "${SCENARIO_PATHS[@]}"
    ;;
  revert)
    case "$SCENARIO" in
      payment) revert_payment ;;
      mixed) revert_mixed ;;
      profile) revert_profile ;;
      checkout) revert_checkout ;;
    esac
    sync_files "${SCENARIO_PATHS[@]}"
    ;;
  *) echo "Unknown action: $ACTION" >&2; usage ;;
esac
