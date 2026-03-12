#!/bin/bash

# Deploy SAYLESS static site to Hetzner
set -e

SERVER="root@37.27.252.86"
REMOTE_PATH="/var/www/sayless/"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Deploying SAYLESS to Hetzner ==="
echo ""

# Rsync site files, excluding dev/large/irrelevant files
echo "Syncing files to $SERVER:$REMOTE_PATH ..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='content/' \
  --exclude='node_modules/' \
  --exclude='hetzner/' \
  --exclude='.playwright-mcp*' \
  --exclude='*.AVI' \
  --exclude='*.mov' \
  "$PROJECT_DIR/" "$SERVER:$REMOTE_PATH"

echo ""
echo "Reloading Caddy..."
ssh $SERVER 'systemctl reload caddy'

echo ""
echo "=== Deploy complete ==="
echo "Site deployed to $SERVER:$REMOTE_PATH"
