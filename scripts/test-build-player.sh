#!/usr/bin/env bash
# Test scripts/build-player.sh end to end with a fake deadbea7 (no real engine):
# transcoding (AAC, 44.1/48 kHz, 2ch), Contract A validation, Contract B
# playlist output, the skip path, analyze failure, and a missing source.
set -euo pipefail

cd "$(dirname "$0")/.."
build=scripts/build-player.sh

tmp=$(mktemp -d)
cleanup() { rm -rf "$tmp"; }
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }

# ---- fixtures -------------------------------------------------------------
mkdir -p "$tmp/src" "$tmp/bin"
ffmpeg -nostdin -y -v error -f lavfi -i "sine=frequency=440:duration=2" -ar 44100 "$tmp/src/A track (v1).wav"
ffmpeg -nostdin -y -v error -f lavfi -i "sine=frequency=440:duration=2" -ar 96000 "$tmp/src/B.wav"

cat > "$tmp/tracks.json" <<EOF
{
  "title": "TEST TITLE",
  "description": "test description",
  "soundcloud": "https://soundcloud.com/test",
  "tracks": [
    {"slug": "a-track", "title": "A TRACK", "source": "$tmp/src/A track (v1).wav"},
    {"slug": "b-track", "title": "B TRACK", "source": "$tmp/src/B.wav"}
  ]
}
EOF

cat > "$tmp/bin/deadbea7" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
[ "$1" = "analyze" ] || { echo "unexpected deadbea7 invocation: $*" >&2; exit 1; }
shift
while [ $# -gt 0 ]; do
    case "$1" in
        -tasks|-waveforms) shift 2 ;;
        -*) echo "unknown deadbea7 arg: $1" >&2; exit 1 ;;
        *) break ;;
    esac
done
i=0
for f in "$@"; do
    i=$((i + 1))
    if [ "${DEADBEA7_FAIL:-0}" = "1" ] && [ "$i" = "1" ]; then
        jq -nc --arg file "$f" '{file: $file, ok: false, errors: ["boom"]}'
    else
        jq -nc --arg file "$f" '{file: $file, ok: true, duration_ms: 2000, bpm: 124.0, beats_per_bar: 4, first_downbeat_ms: 213, key: {camelot: "9A", label: "E minor", confidence: 0.81}, waveforms: {three_band_preview: {entry_bytes: 3, entry_count: 4, b64: "AAECAwQFBgcICQoL"}}, errors: []}'
    fi
done
EOF
chmod +x "$tmp/bin/deadbea7"

# Guarantee the encoded outputs are strictly newer than the sources.
sleep 1

# ---- first build ----------------------------------------------------------
DEADBEA7="$tmp/bin/deadbea7" TRACKS="$tmp/tracks.json" OUT="$tmp/out/playlist.json" \
    STREAM_DIR="$tmp/stream" bash "$build"

[ "$(jq '.tracks | length' "$tmp/out/playlist.json")" = "2" ] || fail "expected 2 tracks in playlist"
[ "$(jq -r '.tracks[0].n' "$tmp/out/playlist.json")" = "1" ] || fail "track 0 n != 1"
[ "$(jq -r '.tracks[1].n' "$tmp/out/playlist.json")" = "2" ] || fail "track 1 n != 2"
[ "$(jq -r '.tracks[0].audio' "$tmp/out/playlist.json")" = "downloads/stream/a-track.m4a" ] || fail "a-track audio path wrong"
[ "$(jq -r '.tracks[1].audio' "$tmp/out/playlist.json")" = "downloads/stream/b-track.m4a" ] || fail "b-track audio path wrong"
[ "$(jq -r '.tracks[0].key' "$tmp/out/playlist.json")" = "9A" ] || fail "track 0 key wrong"
[ "$(jq -r '.tracks[1].key' "$tmp/out/playlist.json")" = "9A" ] || fail "track 1 key wrong"
[ "$(jq -r '.tracks[0].waveform.columns' "$tmp/out/playlist.json")" = "4" ] || fail "waveform columns wrong"

probe() { ffprobe -v error -select_streams a:0 -show_entries stream=codec_name,sample_rate,channels -of csv=p=0 "$1"; }
[ -f "$tmp/stream/a-track.m4a" ] || fail "a-track.m4a missing"
[ -f "$tmp/stream/b-track.m4a" ] || fail "b-track.m4a missing"
[ "$(probe "$tmp/stream/a-track.m4a")" = "aac,44100,2" ] || fail "a-track not aac/44100/2ch: $(probe "$tmp/stream/a-track.m4a")"
[ "$(probe "$tmp/stream/b-track.m4a")" = "aac,48000,2" ] || fail "b-track not aac/48000/2ch: $(probe "$tmp/stream/b-track.m4a")"

# ---- skip path ------------------------------------------------------------
mtime() { perl -e 'print((stat($ARGV[0]))[9])' "$1"; }
m1a=$(mtime "$tmp/stream/a-track.m4a")
m1b=$(mtime "$tmp/stream/b-track.m4a")
out2=$(DEADBEA7="$tmp/bin/deadbea7" TRACKS="$tmp/tracks.json" OUT="$tmp/out/playlist.json" \
    STREAM_DIR="$tmp/stream" bash "$build")
echo "$out2" | grep -q "skip a-track" || fail "second run missing 'skip a-track'"
echo "$out2" | grep -q "skip b-track" || fail "second run missing 'skip b-track'"
[ "$(mtime "$tmp/stream/a-track.m4a")" = "$m1a" ] || fail "a-track.m4a mtime changed on skip"
[ "$(mtime "$tmp/stream/b-track.m4a")" = "$m1b" ] || fail "b-track.m4a mtime changed on skip"

# ---- analyze reports ok:false ---------------------------------------------
rm -f "$tmp/out/playlist.json"
if DEADBEA7_FAIL=1 DEADBEA7="$tmp/bin/deadbea7" TRACKS="$tmp/tracks.json" OUT="$tmp/out/playlist.json" \
    STREAM_DIR="$tmp/stream" bash "$build"; then
    fail "build succeeded despite analyze ok:false"
fi
[ -e "$tmp/out/playlist.json" ] && fail "OUT written despite analyze ok:false"

# ---- missing source --------------------------------------------------------
cat > "$tmp/bad-tracks.json" <<EOF
{
  "title": "BAD", "description": "d", "soundcloud": "s",
  "tracks": [
    {"slug": "a-track", "title": "A", "source": "$tmp/src/A track (v1).wav"},
    {"slug": "gone", "title": "Gone", "source": "$tmp/src/nope.wav"}
  ]
}
EOF
if DEADBEA7="$tmp/bin/deadbea7" TRACKS="$tmp/bad-tracks.json" OUT="$tmp/out/playlist.json" \
    STREAM_DIR="$tmp/stream" bash "$build" > "$tmp/missing.out" 2>&1; then
    fail "build succeeded with a missing source"
fi
grep -q "missing source" "$tmp/missing.out" || fail "missing source not reported"

echo "PASS"
