#!/bin/bash

# Setup script for Navidrome on Hetzner Ubuntu server
set -e

SERVER="root@37.27.252.86"

echo "=== Setting up Navidrome on Hetzner ==="
echo ""

# Create user and directories
echo "Creating navidrome user and directories..."
ssh $SERVER << 'ENDSSH'
useradd -r -s /bin/false navidrome || true
mkdir -p /opt/navidrome
mkdir -p /var/lib/navidrome
mkdir -p /var/lib/navidrome/cache
ENDSSH

# Download Navidrome
echo "Downloading Navidrome..."
ssh $SERVER << 'ENDSSH'
cd /tmp
wget https://github.com/navidrome/navidrome/releases/download/v0.53.3/navidrome_0.53.3_linux_amd64.tar.gz -O Navidrome.tar.gz
tar -xvzf Navidrome.tar.gz -C /opt/navidrome/
rm Navidrome.tar.gz
ENDSSH

# Copy config file
echo "Copying config file..."
scp hetzner/navidrome.toml $SERVER:/var/lib/navidrome/navidrome.toml

# Copy database if it exists
if [ -f "/Volumes/c2storage/navidrome/navidrome.db" ]; then
    echo "Copying existing database..."
    scp /Volumes/c2storage/navidrome/navidrome.db $SERVER:/var/lib/navidrome/
fi

# Copy systemd service
echo "Installing systemd service..."
scp hetzner/navidrome.service $SERVER:/etc/systemd/system/navidrome.service

# Set permissions
echo "Setting permissions..."
ssh $SERVER << 'ENDSSH'
chown -R navidrome:navidrome /opt/navidrome
chown -R navidrome:navidrome /var/lib/navidrome
chown -R navidrome:navidrome /mnt/music
ENDSSH

# Enable and start service
echo "Starting Navidrome service..."
ssh $SERVER << 'ENDSSH'
systemctl daemon-reload
systemctl enable navidrome
systemctl start navidrome
systemctl status navidrome
ENDSSH

echo ""
echo "=== Setup Complete ==="
echo "Navidrome should be running at http://37.27.252.86:4533"
