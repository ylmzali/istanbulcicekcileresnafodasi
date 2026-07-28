#!/usr/bin/env bash
# Install Coolify (self-hosted) on Ubuntu LTS.
# Run on the target server as root after 01-firewall.sh.
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

echo "Installing Coolify (official installer)..."
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

IP="$(curl -fsSL https://ifconfig.me || hostname -I | awk '{print $1}')"
echo
echo "Coolify installed."
echo "Open panel NOW and create the admin account:"
echo "  http://${IP}:8000"
echo
echo "Then point DNS:"
echo "  A  coolify.YOURDOMAIN  -> ${IP}"
echo "  A  YOURDOMAIN / www    -> ${IP}"
echo "Next: bash deploy/coolify/03-print-dns.sh ${IP} YOURDOMAIN"
