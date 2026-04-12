#!/usr/bin/env bash
# MossCart Jenkins impact testing: apply or revert semantic edits locally (no commit/push).
# Usage: impact-mutate.sh apply|revert payment|mixed|profile|checkout
# Scenarios touch multiple backend + frontend files for broader impact-analysis signal.
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

# --- payment: mock-decline semantics, order 404, checkout UX, profile receipt link, server 500 copy ---
paths_payment() {
  echo "backend/src/routes/checkout.js"
  echo "backend/src/routes/orders.js"
  echo "frontend/src/pages/Checkout.jsx"
  echo "frontend/src/pages/Profile.jsx"
}

apply_payment() {
  local fc=backend/src/routes/checkout.js
  local fo=backend/src/routes/orders.js
  local fcx=frontend/src/pages/Checkout.jsx
  local fp=frontend/src/pages/Profile.jsx
  if grep -q 'Checkout service error (impact)' "$fc"; then
    echo "Impact payment already applied."
    return 0
  fi
  perl -0pi -e 's/const paymentStatus = fail \? "failed" : "succeeded";/const paymentStatus = fail ? "declined" : "succeeded";/' "$fc"
  perl -0pi -e 's/res\.status\(500\)\.json\(\{ error: "Checkout failed" \}\)/res.status(500).json({ error: "Checkout service error (impact) — retry later" })/' "$fc"
  perl -0pi -e 's/if \(!order\) return res\.status\(404\)\.json\(\{ error: "Not found" \}\);/if (!order) return res.status(404).json({ error: "Order unavailable (impact)" });/' "$fo"
  perl -0pi -e 's/if \(order\?\.paymentStatus === "failed"\)/if (order?.paymentStatus === "failed" || order?.paymentStatus === "declined")/' "$fcx"
  perl -0pi -e 's/\{checkout\.isPending \? "Processing…" : "Pay now \(mock\)"\}/{checkout.isPending ? "Processing…" : "Submit payment (impact)"}/' "$fcx"
  perl -0pi -e 's/>View receipt</>Open order (impact)</' "$fp"
  echo "Applied impact: payment (checkout, orders, Checkout.jsx, Profile.jsx)"
}

revert_payment() {
  restore_paths \
    backend/src/routes/checkout.js \
    backend/src/routes/orders.js \
    frontend/src/pages/Checkout.jsx \
    frontend/src/pages/Profile.jsx
  echo "Reverted impact: payment"
}

# --- mixed: cart + catalog APIs, cart/products UI, API client error fallback ---
paths_mixed() {
  echo "backend/src/routes/cart.js"
  echo "backend/src/routes/products.js"
  echo "frontend/src/pages/Cart.jsx"
  echo "frontend/src/pages/Products.jsx"
  echo "frontend/src/api/client.js"
}

apply_mixed() {
  local fb=backend/src/routes/cart.js
  local fpr=backend/src/routes/products.js
  local fcart=frontend/src/pages/Cart.jsx
  local fprod=frontend/src/pages/Products.jsx
  local fapi=frontend/src/api/client.js
  if grep -q 'Catalog \(impact\)' "$fprod"; then
    echo "Impact mixed already applied."
    return 0
  fi
  perl -0pi -e 's/return res\.status\(404\)\.json\(\{ error: "Product not found" \}\);/return res.status(404).json({ error: "Unknown product SKU (impact)" });/' "$fb"
  perl -0pi -e 's/if \(!item\) return res\.status\(404\)\.json\(\{ error: "Not found" \}\);/if (!item) return res.status(404).json({ error: "Cart line not found (impact)" });/g' "$fb"
  perl -0pi -e 's/if \(!product\) return res\.status\(404\)\.json\(\{ error: "Not found" \}\);/if (!product) return res.status(404).json({ error: "Product detail missing (impact)" });/' "$fpr"
  perl -0pi -e 's/>Your cart</>Shopping bag (impact)</' "$fcart"
  perl -0pi -e 's/Sign in to view your cart\./Sign in to view your shopping bag (impact)./' "$fcart"
  perl -0pi -e 's/Your cart is empty\./No line items in bag (impact)./' "$fcart"
  perl -0pi -e 's/>Browse products</>Browse catalog (impact)</' "$fcart"
  perl -0pi -e 's/>Proceed to checkout</>Continue to payment (impact)</' "$fcart"
  perl -0pi -e 's/>Go to checkout \(impact\)</>Continue to payment (impact)</' "$fcart"
  perl -0pi -e 's/>All products</>Catalog (impact)</' "$fprod"
  perl -0pi -e 's/Browse moss, aquascaping stone, and maintenance supplies/Browse moss, stone, and supplies (impact catalog copy)/' "$fprod"
  perl -0pi -e 's/throw new Error\(data\?\.error \|\| res\.statusText \|\| "Request failed"\)/throw new Error(data?.error || res.statusText || "Request failed (impact)")/' "$fapi"
  echo "Applied impact: mixed (cart, products APIs + Cart, Products, client)"
}

revert_mixed() {
  restore_paths \
    backend/src/routes/cart.js \
    backend/src/routes/products.js \
    frontend/src/pages/Cart.jsx \
    frontend/src/pages/Products.jsx \
    frontend/src/api/client.js
  echo "Reverted impact: mixed"
}

# --- profile: users API messages, profile + login UI ---
paths_profile() {
  echo "backend/src/routes/users.js"
  echo "frontend/src/pages/Profile.jsx"
  echo "frontend/src/pages/Login.jsx"
}

apply_profile() {
  local fu=backend/src/routes/users.js
  local fprof=frontend/src/pages/Profile.jsx
  local flog=frontend/src/pages/Login.jsx
  if grep -q 'User record missing \(impact\)' "$fu"; then
    echo "Impact profile already applied."
    return 0
  fi
  perl -0pi -e 's/if \(!user\) return res\.status\(404\)\.json\(\{ error: "Not found" \}\);/if (!user) return res.status(404).json({ error: "User record missing (impact)" });/' "$fu"
  perl -0pi -e 's/return res\.status\(400\)\.json\(\{ error: "No fields to update" \}\);/return res.status(400).json({ error: "No profile fields supplied (impact)" });/' "$fu"
  perl -0pi -e 's/if \(taken\) return res\.status\(409\)\.json\(\{ error: "Email in use" \}\);/if (taken) return res.status(409).json({ error: "Email already registered (impact)" });/' "$fu"
  perl -0pi -e 's/(data-testid="profile-title">\s+)Profile/\1Account (impact)/' "$fprof"
  perl -0pi -e 's/(data-testid="profile-orders-heading">\s+)Orders/\1Purchase history (impact)/' "$fprof"
  perl -0pi -e 's/>Edit profile</>Edit account details (impact)</' "$fprof"
  perl -0pi -e 's/No orders yet\./No purchases on file (impact)./' "$fprof"
  perl -0pi -e 's/(data-testid="login-title">\s+)Log in/\1Sign in (impact)/' "$flog"
  perl -0pi -e 's/setError\(err\.message \|\| "Login failed"\)/setError(err.message || "Authentication failed (impact)")/' "$flog"
  echo "Applied impact: profile (users API, Profile, Login)"
}

revert_profile() {
  restore_paths \
    backend/src/routes/users.js \
    frontend/src/pages/Profile.jsx \
    frontend/src/pages/Login.jsx
  echo "Reverted impact: profile"
}

# --- checkout: shipping/stock/empty-basket server rules + checkout page copy ---
paths_checkout() {
  echo "backend/src/routes/checkout.js"
  echo "frontend/src/pages/Checkout.jsx"
}

apply_checkout() {
  local fb=backend/src/routes/checkout.js
  local fu=frontend/src/pages/Checkout.jsx
  if grep -q 'All shipping fields \(impact test\)' "$fb"; then
    echo "Impact checkout already applied."
    return 0
  fi
  perl -0pi -e 's/error: "shippingName, shippingLine1, shippingCity, shippingPostal required"/error: "All shipping fields (impact test): name, street, city, postal required"/' "$fb"
  perl -0pi -e 's/return res\.status\(400\)\.json\(\{ error: "Cart is empty" \}\);/return res.status(400).json({ error: "Basket has no items (impact)" });/' "$fb"
  perl -0pi -e 's/Insufficient stock for \$\{line\.product\.name\}/Inventory shortfall for \$\{line.product.name\} (impact)/' "$fb"
  perl -0pi -e 's/Mock payment — no real card is charged\./Mock payment — impact checkout copy (no card charged)./' "$fu"
  perl -0pi -e 's/Your cart is empty\./Cannot checkout — empty basket (impact)./' "$fu"
  perl -0pi -e 's/>Order summary</>Order breakdown (impact)</' "$fu"
  perl -0pi -e 's/\{checkout\.isPending \? "Processing…"/{checkout.isPending ? "Finalizing… (impact)"/' "$fu"
  perl -0pi -e 's/checkout\.error\?\.message \|\| "Checkout failed"/checkout.error?.message || "Settlement error (impact)"/' "$fu"
  echo "Applied impact: checkout (checkout route + Checkout.jsx)"
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
