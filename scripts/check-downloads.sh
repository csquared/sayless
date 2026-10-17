#!/usr/bin/env bash
# Check that every download-gate page (dl-*.html) has its file before deploying,
# and that every player stream named by the playlist exists.
# Audio lives in downloads/, which is gitignored: it only exists on the machine
# it was dropped on, and the deploy's rsync --delete would take a live file off
# the server if it's missing here. Full URLs (Dropbox, Drive) get fetched instead.
# The player streams live in downloads/stream/; their list comes from
# assets/player/playlist.json (or $PLAYLIST) and is built by scripts/build-player.sh.
# Exits non-zero if anything is missing.
set -uo pipefail
cd "$(dirname "$0")/.."

fail=0 n=0
for page in dl-*.html; do
    [ -e "$page" ] || continue
    n=$((n + 1))
    file=$(sed -n 's/.*"file": *"\([^"]*\)".*/\1/p' "$page" | head -1)
    if [ -z "$file" ]; then
        echo "MISSING  $page: no gate-config file" >&2; fail=1; continue
    fi
    case $file in
        http://*|https://*)
            code=$(curl -sL -o /dev/null -r 0-0 --max-time 20 -w '%{http_code}' "$file")
            case $code in
                2*) echo "ok       $page -> $file" ;;
                *) echo "BROKEN   $page -> $file (HTTP $code)" >&2; fail=1 ;;
            esac ;;
        downloads/*)
            if [ -s "$file" ]; then
                echo "ok       $page -> $file ($(du -h "$file" | cut -f1 | tr -d ' '))"
            else
                echo "MISSING  $page -> $file (drop it in downloads/ on this machine)" >&2; fail=1
            fi ;;
        *)
            echo "BAD PATH $page -> $file (must be under downloads/ or a full URL)" >&2; fail=1 ;;
    esac
done

[ $n -eq 0 ] && echo "no dl-*.html pages"

playlist=${PLAYLIST:-assets/player/playlist.json}
if [ -e "$playlist" ]; then
    if ! command -v jq >/dev/null 2>&1; then
        echo "ERROR    playlist -> $playlist: jq is required to check player streams" >&2
        fail=1
    else
        while IFS= read -r audio; do
            case $audio in
                downloads/*)
                    case $audio in
                        *..*)
                            echo "BAD PATH playlist -> $audio" >&2; fail=1 ;;
                        *)
                            if [ -s "$audio" ]; then
                                echo "ok       playlist -> $audio ($(du -h "$audio" | cut -f1 | tr -d ' '))"
                            else
                                echo "MISSING  playlist -> $audio (run scripts/build-player.sh on this machine)" >&2; fail=1
                            fi ;;
                    esac ;;
                *)
                    echo "BAD PATH playlist -> $audio" >&2; fail=1 ;;
            esac
        done < <(jq -r '.tracks[].audio // empty' "$playlist")
    fi
fi

exit $fail
