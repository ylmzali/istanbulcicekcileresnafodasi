#!/usr/bin/env bash
# Coolify VPS bootstrap: firewall + prerequisites (Ubuntu 22.04/24.04).
# Run on the target server as root (or with sudo).
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash $0"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update -y
apt-get install -y curl wget git jq openssl ufw ca-certificates

# SSH must stay open before enabling UFW.
ufw allow OpenSSH
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp comment 'Coolify panel'
ufw --force enable
ufw status verbose

echo
echo "Firewall ready: 22, 80, 443, 8000"
echo "Next: bash deploy/coolify/02-install-coolify.sh"
