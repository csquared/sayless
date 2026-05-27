#!/bin/bash

# Set up exports library directory on Hetzner for SAYLESS productions/mixes
set -e

SERVER="root@37.27.252.86"

echo "=== Setting up Exports Library ==="
echo ""

ssh $SERVER << 'ENDSSH'
set -e
mkdir -p /mnt/music/exports
chown navidrome:navidrome /mnt/music/exports
echo "Created /mnt/music/exports"
ls -la /mnt/music/ | grep exports
ENDSSH

echo ""
echo "=== Directory created ==="
echo ""
echo "Next steps (via Navidrome admin UI):"
echo "  1. Go to https://music.justsayless.xyz"
echo "  2. Log in as admin"
echo "  3. Go to Settings > Libraries"
echo "  4. Click 'Add Library'"
echo "  5. Set name: 'Exports'"
echo "  6. Set path: '/mnt/music/exports'"
echo "  7. Save"
echo ""
echo "Then run sync-exports-to-hetzner (sources from /Volumes/c2storage/Production/Exports/)"
