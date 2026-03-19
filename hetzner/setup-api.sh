#!/bin/bash
# Setup SAYLESS API service on Hetzner (run once)
set -e

SERVER="root@37.27.252.86"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Setting up SAYLESS API ==="
echo ""

# Build for Linux
echo "Building API binary..."
cd "$PROJECT_DIR/api"
GOOS=linux GOARCH=amd64 go build -o sayless-api .

# Copy binary to server
echo "Deploying binary..."
scp sayless-api "$SERVER:/usr/local/bin/"
rm sayless-api

# Setup systemd service and data directory
ssh "$SERVER" << 'ENDSSH'
set -e

# Create data directory
mkdir -p /var/lib/sayless
chown www-data:www-data /var/lib/sayless

# Install systemd unit
cat > /etc/systemd/system/sayless-api.service << 'EOF'
[Unit]
Description=SAYLESS API
After=network.target

[Service]
ExecStart=/usr/local/bin/sayless-api -db /var/lib/sayless/sayless.db -addr 127.0.0.1:8090
Restart=always
RestartSec=5
User=www-data

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable sayless-api
systemctl start sayless-api

echo ""
systemctl status sayless-api --no-pager
ENDSSH

echo ""
echo "=== API setup complete ==="
echo "Listening on 127.0.0.1:8090"
