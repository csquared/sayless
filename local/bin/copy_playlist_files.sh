#!/bin/bash

# Check if both arguments are provided
if [ $# -ne 2 ]; then
    echo "Usage: $0 <playlist.m3u8> <destination_directory>"
    exit 1
fi

PLAYLIST="$1"
DEST_DIR="$2"

# Check if playlist file exists
if [ ! -f "$PLAYLIST" ]; then
    echo "Error: Playlist file '$PLAYLIST' not found"
    exit 1
fi

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Counter for statistics
copied=0
skipped=0
not_found=0

# Process each line in the playlist
while IFS= read -r line; do
    # Remove carriage returns and leading/trailing whitespace
    line=$(echo "$line" | tr -d '\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    # Skip comments and empty lines
    if [[ "$line" =~ ^#.*$ ]] || [ -z "$line" ]; then
        continue
    fi
    
    # Check if file exists (using test with quotes to handle spaces)
    if [ -f "$line" ]; then
        echo "Copying: $line"
        # Use quotes to handle spaces in filenames
        if cp "$line" "$DEST_DIR/"; then
            ((copied++))
        else
            echo "Error copying: $line"
            ((skipped++))
        fi
    else
        echo "Warning: File not found: $line"
        ((not_found++))
    fi
done < "$PLAYLIST"

echo ""
echo "Done copying files to $DEST_DIR"
echo "Files copied: $copied"
echo "Files not found: $not_found"
echo "Files skipped due to errors: $skipped"