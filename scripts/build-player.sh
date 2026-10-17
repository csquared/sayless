#!/usr/bin/env bash
# Build the site's web-player data: transcode each master to a 44.1/48 kHz
# AAC .m4a stream, run deadbea7 analysis (grid, key, three_band_preview
# waveform), and write assets/player/playlist.json (Contract B) for the player.
#
# Usage: scripts/build-player.sh
#   TRACKS      tracks json (default scripts/player-tracks.json)
#   OUT         playlist output (default assets/player/playlist.json)
#   STREAM_DIR  directory for the transcoded .m4a files (default downloads/stream)
#   DEADBEA7    deadbea7 command (default deadbea7)
set -euo pipefail
cd "$(dirname "$0")/.."

TRACKS=${TRACKS:-scripts/player-tracks.json}
OUT=${OUT:-assets/player/playlist.json}
STREAM_DIR=${STREAM_DIR:-downloads/stream}
DEADBEA7=${DEADBEA7:-deadbea7}

cleanup() {
    rm -f "${analyze_log:-}" "${tmp_out:-}"
}
trap cleanup EXIT

require() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "required command not found: $1" >&2
        exit 1
    }
}
require jq
require ffmpeg
require ffprobe
require "$DEADBEA7"

[ -f "$TRACKS" ] || { echo "tracks file not found: $TRACKS" >&2; exit 1; }

mapfile -t slugs < <(jq -r '.tracks[].slug' "$TRACKS")
mapfile -t sources < <(jq -r '.tracks[].source' "$TRACKS")
n=${#slugs[@]}

# Resolve and check every source before encoding anything.
mkdir -p "$STREAM_DIR"
out_paths=()
for i in "${!slugs[@]}"; do
    raw=${sources[$i]}
    case "$raw" in
        /*) src=$raw ;;
        *) src="$PWD/$raw" ;;
    esac
    sources[$i]=$src
    if [ ! -f "$src" ]; then
        echo "missing source for ${slugs[$i]}: $raw" >&2
        exit 1
    fi
    out_paths+=("$STREAM_DIR/${slugs[$i]}.m4a")
done

# Transcode each master. Skip when the output already exists and is newer.
for i in "${!slugs[@]}"; do
    slug=${slugs[$i]} src=${sources[$i]} out=${out_paths[$i]}
    if [ "$out" -nt "$src" ]; then
        echo "skip $slug"
        continue
    fi
    rate=$(ffprobe -v error -select_streams a:0 -show_entries stream=sample_rate -of csv=p=0 "$src" | head -n 1)
    if [ "$rate" -le 44100 ]; then
        R=44100
    else
        R=48000
    fi
    tmp_out="$STREAM_DIR/.$slug.$$.m4a"
    ffmpeg -nostdin -y -v error -i "$src" -vn -c:a aac -b:a 160k -ac 2 -ar "$R" -movflags +faststart "$tmp_out"
    mv "$tmp_out" "$out"
    echo "encoded $slug"
done

# Analyze every stream in one call (stdout is Contract A JSON Lines, in order).
analyze_log=$(mktemp)
if ! "$DEADBEA7" analyze -tasks grid,key,waveform -waveforms three_band_preview "${out_paths[@]}" > "$analyze_log"; then
    echo "deadbea7 analyze failed" >&2
    exit 1
fi

mapfile -t lines < "$analyze_log"
if [ "${#lines[@]}" -ne "$n" ]; then
    echo "deadbea7 analyze returned ${#lines[@]} lines for $n tracks" >&2
    exit 1
fi

fails=0
for i in "${!lines[@]}"; do
    line=${lines[$i]}
    file=$(printf '%s' "$line" | jq -r '.file // empty' 2>/dev/null || true)
    ok=$(printf '%s' "$line" | jq -r '.ok // false' 2>/dev/null || true)
    if [ "$ok" != "true" ]; then
        echo "analyze failed for ${slugs[$i]} (file: $file): $(printf '%s' "$line" | jq -c '.errors // []' 2>/dev/null)" >&2
        fails=$((fails + 1))
    elif [ "$file" != "${out_paths[$i]}" ]; then
        echo "analyze out of order at ${slugs[$i]}: got $file, want ${out_paths[$i]}" >&2
        fails=$((fails + 1))
    fi
done
[ "$fails" -eq 0 ] || exit 1

# Write the playlist (Contract B) atomically.
out_dir=$(dirname "$OUT")
mkdir -p "$out_dir"
tmp_out="$out_dir/.$(basename "$OUT").tmp.$$"
jq -n \
    --slurpfile tracks "$TRACKS" \
    --slurpfile a "$analyze_log" \
    '{ title: $tracks[0].title,
       description: $tracks[0].description,
       soundcloud: $tracks[0].soundcloud,
       tracks: [ range(0; ($tracks[0].tracks | length)) as $i |
         { n: ($i + 1),
           slug: $tracks[0].tracks[$i].slug,
           title: $tracks[0].tracks[$i].title,
           audio: ("downloads/stream/" + $tracks[0].tracks[$i].slug + ".m4a"),
           duration_ms: $a[$i].duration_ms,
           bpm: $a[$i].bpm,
           key: (($a[$i].key.camelot) // ""),
           waveform: { columns: $a[$i].waveforms.three_band_preview.entry_count,
                       b64: $a[$i].waveforms.three_band_preview.b64 } } ] }' \
    > "$tmp_out"
mv "$tmp_out" "$OUT"
echo "wrote $OUT ($n tracks)"
