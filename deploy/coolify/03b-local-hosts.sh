#!/usr/bin/env bash
# Local DNS helper for Coolify practice (Colima / localhost).
# On a real VPS, use deploy/coolify/03-print-dns.sh with public IP instead.
set -euo pipefail

IP="${1:-127.0.0.1}"
DOMAIN="${2:-iceo.local}"

ENTRIES=(
  "${IP} ${DOMAIN}"
  "${IP} www.${DOMAIN}"
  "${IP} coolify.${DOMAIN}"
  "${IP} app.${DOMAIN}"
)

echo "Add these lines to /etc/hosts (requires sudo):"
echo
for e in "${ENTRIES[@]}"; do
  echo "  $e"
done
echo
echo "Apply automatically:"
echo "  sudo bash -c '$(printf "%s\\n" "${ENTRIES[@]}" | sed "s/.*/grep -qF \"&\" \\/etc\\/hosts || echo \"&\" >> \\/etc\\/hosts/")'"
echo
echo "Then in Coolify Settings set instance domain to coolify.${DOMAIN}"
echo "App domain: ${DOMAIN} or app.${DOMAIN}"
