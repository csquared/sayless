#!/bin/bash

# Backup music production files to external drive
# Usage: ./backup-production.sh

EXTERNAL="/Volumes/c2storage/production"
LOCAL="$HOME/production"

# Check if external drive is mounted
if [ ! -d "$EXTERNAL" ]; then
    echo "Error: External drive not mounted at $EXTERNAL"
    exit 1
fi

echo "Starting backup from $LOCAL to $EXTERNAL"
echo "Running dry-run first..."

# Dry run to show what will be synced
rsync -av --delete --exclude='.DS_Store' --exclude='._*' --dry-run "$LOCAL/" "$EXTERNAL/"

echo -e "\nProceed with actual sync? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    rsync -av --delete --exclude='.DS_Store' --exclude='._*' --progress "$LOCAL/" "$EXTERNAL/"
    echo "Backup completed!"
else
    echo "Backup cancelled"
fi