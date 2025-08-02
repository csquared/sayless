#!/bin/bash

# Initial sync of music production files from external drive to local
# Usage: ./initial-production-sync.sh

EXTERNAL="/Volumes/c2storage/production"
LOCAL="$HOME/production"

# Check if external drive is mounted
if [ ! -d "$EXTERNAL" ]; then
    echo "Error: External drive not mounted at $EXTERNAL"
    exit 1
fi

# Check if local directory exists
if [ ! -d "$LOCAL" ]; then
    echo "Creating local production directory at $LOCAL"
    mkdir -p "$LOCAL"
fi

echo "This will sync 103GB from $EXTERNAL to $LOCAL"
echo "Excluding .DS_Store and ._ files"
echo ""
echo "Proceed with initial sync? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    rsync -av --exclude='.DS_Store' --exclude='._*' --progress "$EXTERNAL/" "$LOCAL/"
    echo "Initial sync completed!"
else
    echo "Sync cancelled"
fi