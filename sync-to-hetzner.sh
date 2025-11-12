#!/bin/bash

# Script to sync music collection to Hetzner Navidrome server
# One-off sync for initial migration from local Navidrome to Hetzner

set -e  # Exit on error

SOURCE="$HOME/DJ/collection2/"
DEST="root@37.27.252.86:/mnt/music/collection2/"

# Check if source exists
if [ ! -d "$SOURCE" ]; then
    echo "Error: Source directory not found at $SOURCE"
    exit 1
fi

# Display what will be synced
echo "=== RSYNC Music to Hetzner ==="
echo "Source: $SOURCE"
echo "Destination: $DEST"
echo ""
echo "Excluding system files..."
echo ""

# Check for dry-run flag
DRY_RUN=""
if [ "$1" == "--dry-run" ] || [ "$1" == "-n" ]; then
    DRY_RUN="--dry-run"
    echo "*** DRY RUN MODE - No files will be copied ***"
    echo ""
fi

# Run rsync
echo "Starting sync..."
echo ""

rsync -av \
    --progress \
    --exclude='.TemporaryItems/' \
    --exclude='.Spotlight-V100/' \
    --exclude='.Trashes/' \
    --exclude='.fseventsd/' \
    --exclude='.bzvol/' \
    --exclude='.DS_Store' \
    --exclude='._*' \
    $DRY_RUN \
    "$SOURCE" "$DEST"

echo ""
echo "=== Sync Complete ==="
