#!/bin/bash

# Script to sync music files from c2storage to SAYLESS-2TB
# Excludes AI model directories

set -e  # Exit on error

SOURCE="/Volumes/c2storage/"
DEST="/Volumes/SAYLESS-2TB/"

# Check if volumes are mounted
if [ ! -d "$SOURCE" ]; then
    echo "Error: Source volume not found at $SOURCE"
    echo "Please mount c2storage and try again."
    exit 1
fi

if [ ! -d "$DEST" ]; then
    echo "Error: Destination volume not found at $DEST"
    echo "Please mount SAYLESS-2TB and try again."
    exit 1
fi

# Display what will be synced
echo "=== RSYNC Music Sync ==="
echo "Source: $SOURCE"
echo "Destination: $DEST"
echo ""
echo "Excluding:"
echo "  - lm-studio-models/"
echo "  - ollama-models/"
echo "  - PIONEER/"
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
    --exclude='lm-studio-models/' \
    --exclude='ollama-models/' \
    --exclude='PIONEER/' \
    --exclude='.TemporaryItems/' \
    --exclude='.Spotlight-V100/' \
    --exclude='.Trashes/' \
    --exclude='.fseventsd/' \
    --exclude='.bzvol/' \
    $DRY_RUN \
    "$SOURCE" "$DEST"

echo ""
echo "=== Sync Complete ==="
