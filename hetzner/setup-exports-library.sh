#!/bin/bash

# Set up exports and sourcing as separate Navidrome libraries
# Run once — idempotent (skips if libraries already exist)
set -e

SERVER="root@37.27.252.86"

echo "=== Setting up Navidrome Libraries ==="
echo ""

ssh $SERVER bash <<'ENDSSH'
set -e

mkdir -p /mnt/music/exports /mnt/music/sourcing
chown navidrome:navidrome /mnt/music/exports /mnt/music/sourcing

# Remove legacy symlink if present
rm -f /mnt/music/collection2/sourcing

systemctl stop navidrome

# Add libraries if they don't already exist
sqlite3 /var/lib/navidrome/navidrome.db "INSERT OR IGNORE INTO library (name, path) VALUES ('Sourcing', '/mnt/music/sourcing');"
sqlite3 /var/lib/navidrome/navidrome.db "INSERT OR IGNORE INTO library (name, path) VALUES ('Exports', '/mnt/music/exports');"

echo "Libraries:"
sqlite3 /var/lib/navidrome/navidrome.db "SELECT id, name, path FROM library;"

systemctl start navidrome
echo "Navidrome restarted"
ENDSSH

echo ""
echo "=== Done ==="
echo "Sync exports: sync-exports-to-hetzner"
echo "Source: /Volumes/c2storage/Production/Exports/"
