#!/bin/bash

# Setup Radicale CalDAV/CardDAV server via Podman on Hetzner
# Safe to run multiple times (idempotent)
set -e

SERVER="root@37.27.252.86"

echo "=== Setting up Radicale (CalDAV/CardDAV) ==="
echo ""

# --- 1. Install Podman if not present ---
echo "Checking Podman installation..."
ssh $SERVER << 'ENDSSH'
set -e

if command -v podman > /dev/null 2>&1; then
    echo "Podman already installed, skipping..."
    podman --version
else
    echo "Installing Podman..."
    apt-get update -qq
    apt-get install -y -qq podman
    echo "Podman installed successfully"
    podman --version
fi
ENDSSH

# --- 2. Set password for sayless user on server ---
echo ""
echo "You will be prompted to set the password for Radicale user 'sayless' on the server."
ssh -t $SERVER "apt-get install -y -qq apache2-utils > /dev/null 2>&1; htpasswd -BC 10 /etc/radicale/users sayless"

# --- 3. Create directories and config on server ---
echo "Creating directories and config..."
ssh $SERVER << 'ENDSSH'
set -e

mkdir -p /etc/radicale
mkdir -p /var/lib/radicale/collections

# Radicale config
cat > /etc/radicale/config << 'EOF'
[server]
hosts = 0.0.0.0:5232

[auth]
type = htpasswd
htpasswd_filename = /config/users
htpasswd_encryption = bcrypt

[storage]
filesystem_folder = /data/collections

[logging]
level = info
EOF

echo "Config written to /etc/radicale/"
ENDSSH

# --- 4. Run Radicale via Podman, wrapped in systemd ---
echo "Setting up Radicale Podman container + systemd service..."
ssh $SERVER << 'ENDSSH'
set -e

podman pull docker.io/tomsquest/docker-radicale:latest

# Stop existing container if running
podman stop radicale 2>/dev/null || true
podman rm radicale 2>/dev/null || true

# Systemd service wrapping the Podman container
cat > /etc/systemd/system/radicale.service << 'EOF'
[Unit]
Description=Radicale CalDAV/CardDAV Server (Podman)
After=network-online.target
Wants=network-online.target

[Service]
Restart=always
RestartSec=5
ExecStartPre=-/usr/bin/podman stop radicale
ExecStartPre=-/usr/bin/podman rm radicale
ExecStart=/usr/bin/podman run --name radicale \
    -p 127.0.0.1:5232:5232 \
    -v /var/lib/radicale/collections:/data/collections \
    -v /etc/radicale/config:/config/config:ro \
    -v /etc/radicale/users:/config/users:ro \
    docker.io/tomsquest/docker-radicale:latest
ExecStop=/usr/bin/podman stop radicale

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable radicale
systemctl start radicale

echo ""
systemctl status radicale --no-pager
ENDSSH

# --- 5. Update Caddyfile with cal.justsayless.xyz ---
echo ""
echo "Updating Caddy config..."
ssh $SERVER << 'ENDSSH'
set -e

cat > /etc/caddy/Caddyfile << 'EOF'
justsayless.xyz {
    handle /api/* {
        reverse_proxy localhost:8090
    }

    handle {
        root * /var/www/sayless
        file_server
    }
}

music.justsayless.xyz {
    reverse_proxy localhost:4533
}

cal.justsayless.xyz {
    reverse_proxy localhost:5232
}
EOF

caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy

echo ""
systemctl status caddy --no-pager
ENDSSH

# --- 6. Summary ---
echo ""
echo "=== Radicale setup complete ==="
echo ""
echo "CalDAV/CardDAV server: https://cal.justsayless.xyz"
echo "Username: sayless"
echo ""
echo "DNS record needed (A record -> 37.27.252.86):"
echo "  cal.justsayless.xyz"
echo ""
echo "Client setup:"
echo "  URL:  https://cal.justsayless.xyz/sayless/"
echo "  User: sayless"
echo ""
echo "Useful commands:"
echo "  systemctl status radicale"
echo "  journalctl -u radicale -f"
echo "  podman logs radicale"
