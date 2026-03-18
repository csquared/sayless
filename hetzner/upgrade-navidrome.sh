#!/bin/bash

# Upgrade Navidrome on Hetzner server
# Usage: ./hetzner/upgrade-navidrome.sh [version]
# Example: ./hetzner/upgrade-navidrome.sh v0.60.3
set -e

SERVER="root@37.27.252.86"
VERSION="${1:-v0.60.3}"
VERSION_NUM="${VERSION#v}"

echo "=== Upgrading Navidrome to ${VERSION} ==="
echo ""

# Stop service, download, extract, restart
ssh $SERVER << ENDSSH
set -e

echo "Stopping navidrome..."
systemctl stop navidrome

echo "Downloading Navidrome ${VERSION}..."
cd /tmp
wget https://github.com/navidrome/navidrome/releases/download/${VERSION}/navidrome_${VERSION_NUM}_linux_amd64.tar.gz -O Navidrome.tar.gz

echo "Extracting to /opt/navidrome/..."
tar -xvzf Navidrome.tar.gz -C /opt/navidrome/
rm Navidrome.tar.gz

echo "Setting permissions..."
chown -R navidrome:navidrome /opt/navidrome

echo "Starting navidrome..."
systemctl start navidrome

echo ""
echo "Service status:"
systemctl status navidrome --no-pager
ENDSSH

echo ""
echo "=== Upgrade Complete ==="
echo "Navidrome ${VERSION} should be running at https://music.justsayless.xyz"
