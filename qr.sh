#!/bin/bash

# SAYLESS QR Code Generator
# Generates branded QR codes with logo overlay
# Usage: ./qr.sh <url> [output_name]

if [ $# -lt 1 ]; then
    echo "Usage: $0 <url> [output_name]"
    echo "Example: $0 https://justsayless.xyz/flyers/2026-03-06/main.html flyers/2026-03-06/qr"
    echo ""
    echo "Generates 3 outputs:"
    echo "  - Terminal text QR (printed to stdout)"
    echo "  - <output_name>.png (1024x1024 branded PNG)"
    echo "  - <output_name>.svg (scalable branded SVG)"
    echo ""
    echo "If no output_name is specified, defaults to 'qr-output'"
    exit 1
fi

URL="$1"
OUTPUT_NAME="${2:-qr-output}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
QR_DIR="$SCRIPT_DIR/qr"

# Auto-install deps on first run
if [ ! -d "$QR_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    (cd "$QR_DIR" && npm install)
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
    echo ""
fi

node "$QR_DIR/generate.js" "$URL" "$OUTPUT_NAME"

if [ $? -eq 0 ]; then
    echo "Done!"
else
    echo "Error: QR code generation failed"
    exit 1
fi
