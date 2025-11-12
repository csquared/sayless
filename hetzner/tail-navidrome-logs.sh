#!/bin/bash

# Tail Navidrome logs from Hetzner server
# Usage: ./tail-navidrome-logs.sh [--errors-only]

SERVER="root@37.27.252.86"

if [ "$1" == "--errors-only" ]; then
    echo "=== Tailing Navidrome ERROR logs (Ctrl+C to exit) ==="
    ssh $SERVER "journalctl -u navidrome -f --no-pager | grep -i error"
else
    echo "=== Tailing Navidrome logs (Ctrl+C to exit) ==="
    echo "Tip: Use --errors-only flag to filter errors only"
    echo ""
    ssh $SERVER "journalctl -u navidrome -f --no-pager"
fi
