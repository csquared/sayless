#!/bin/bash

# Blackify - Convert colored images to black versions
# Usage: ./blackify.sh input.jpg [output.jpg]

if [ $# -lt 1 ]; then
    echo "Usage: $0 <input_image> [output_image]"
    echo "Example: $0 icon.jpg icon-black.jpg"
    echo "If no output is specified, adds '-black' before the extension"
    exit 1
fi

INPUT="$1"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file '$INPUT' does not exist"
    exit 1
fi

# Generate output filename if not provided
if [ $# -eq 2 ]; then
    OUTPUT="$2"
else
    # Insert '-black' before the file extension
    BASENAME="${INPUT%.*}"
    EXTENSION="${INPUT##*.}"
    OUTPUT="${BASENAME}-black.${EXTENSION}"
fi

# Convert blue (and other colors) to black using ImageMagick
echo "Converting '$INPUT' to '$OUTPUT'..."
magick "$INPUT" -fuzz 40% -fill black -opaque blue "$OUTPUT"

if [ $? -eq 0 ]; then
    echo "Successfully created: $OUTPUT"
else
    echo "Error: Failed to convert image"
    exit 1
fi