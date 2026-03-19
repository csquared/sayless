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
echo "Building API..."
cd "$PROJECT_DIR/api" && GOOS=linux GOARCH=amd64 go build -o sayless-api .
echo "Deploying API binary..."
scp sayless-api "$SERVER:/usr/local/bin/"
rm sayless-api
cd "$PROJECT_DIR"

echo ""
echo "Reloading Caddy and restarting API..."
ssh $SERVER 'systemctl reload caddy && systemctl restart sayless-api'

echo ""
echo "=== Deploy complete ==="
echo "Site deployed to $SERVER:$REMOTE_PATH"
