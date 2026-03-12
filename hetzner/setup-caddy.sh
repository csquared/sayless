#!/bin/bash

# Setup Caddy with multi-site config: SAYLESS static site + Navidrome
# Safe to run multiple times (idempotent)
set -e

SERVER="root@37.27.252.86"

echo "=== Setting up Caddy (multi-site) ==="
echo ""

echo "Installing Caddy and configuring..."
ssh $SERVER << 'ENDSSH'
set -e

# Install Caddy (idempotent)
apt-get update -qq
apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https curl

# --yes overwrites existing keyring file without prompting
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
apt-get update -qq
apt-get install -y -qq caddy

# Open ports 80 + 443 for Caddy (Let's Encrypt needs both)
if command -v ufw > /dev/null 2>&1; then
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

# Create web root for static site
mkdir -p /var/www/sayless

# Write multi-site Caddyfile
cat > /etc/caddy/Caddyfile << 'EOF'
justsayless.xyz {
    root * /var/www/sayless
    file_server
}

music.justsayless.xyz {
    reverse_proxy localhost:4533
}
EOF

# Validate config before restarting
caddy validate --config /etc/caddy/Caddyfile

# Restart Caddy
systemctl restart caddy
systemctl enable caddy
echo ""
systemctl status caddy --no-pager
ENDSSH

echo ""
echo "=== Caddy setup complete ==="
echo "justsayless.xyz        -> static site (auto-HTTPS)"
echo "music.justsayless.xyz  -> Navidrome (auto-HTTPS)"
echo ""
echo "DNS records needed (A records -> 37.27.252.86):"
echo "  justsayless.xyz"
echo "  music.justsayless.xyz"
