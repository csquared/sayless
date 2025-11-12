#!/bin/bash

# Setup Caddy reverse proxy for Navidrome on Hetzner
set -e

SERVER="root@37.27.252.86"

echo "=== Setting up Caddy reverse proxy ==="
echo ""

# Install Caddy and configure
echo "Installing Caddy..."
ssh $SERVER << 'ENDSSH'
# Install Caddy
apt update
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

# Create Caddyfile
cat > /etc/caddy/Caddyfile << 'EOF'
:80 {
    reverse_proxy localhost:4533
}
EOF

# Restart Caddy
systemctl restart caddy
systemctl enable caddy
systemctl status caddy
ENDSSH

echo ""
echo "=== Caddy setup complete ==="
echo "Add port 80 to your Hetzner firewall, then access via http://37.27.252.86"
