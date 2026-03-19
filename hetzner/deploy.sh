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
rsync -avz --delete --delete-excluded \
  --exclude='*.mov' \
  --include='*.html' \
  --include='favicon.ico' \
  --include='assets/***' \
  --include='logo/***' \
  --include='shows/***' \
  --exclude='*' \
  "$PROJECT_DIR/" "$SERVER:$REMOTE_PATH"

echo ""
echo "Building API..."
cd "$PROJECT_DIR/api" && GOOS=linux GOARCH=amd64 go build -o sayless-api .
echo "Deploying API binary..."
scp sayless-api "$SERVER:/tmp/sayless-api"
rm sayless-api
cd "$PROJECT_DIR"

echo ""
echo "Reloading Caddy and restarting API..."
ssh $SERVER 'mv /tmp/sayless-api /usr/local/bin/sayless-api && systemctl restart sayless-api && systemctl reload caddy'

echo ""
echo "=== Deploy complete ==="
echo "Site deployed to $SERVER:$REMOTE_PATH"
