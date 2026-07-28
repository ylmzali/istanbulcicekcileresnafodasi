#!/usr/bin/env bash
# Print DNS A records to set at your registrar / Cloudflare.
set -euo pipefail

IP="${1:-}"
DOMAIN="${2:-}"

if [[ -z "${IP}" || -z "${DOMAIN}" ]]; then
  echo "Usage: $0 <VPS_IP> <domain>"
  echo "Example: $0 203.0.113.10 istanbulcicekcilerodasi.org.tr"
  exit 1
fi

cat <<EOF
Set these DNS A records (TTL 300 or Auto):

  ${DOMAIN}                 A  ${IP}
  www.${DOMAIN}             A  ${IP}
  coolify.${DOMAIN}         A  ${IP}

Optional app subdomain (if not using apex):

  app.${DOMAIN}             A  ${IP}

After DNS propagates:
  1. Coolify → Settings → set instance domain: coolify.${DOMAIN}
  2. App resource → Domains: ${DOMAIN} (and www if needed)
  3. Enable Let's Encrypt SSL on both

Check propagation:
  dig +short ${DOMAIN}
  dig +short coolify.${DOMAIN}
EOF
