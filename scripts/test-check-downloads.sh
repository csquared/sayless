#!/usr/bin/env bash
# Exercise the playlist-stream checks added to scripts/check-downloads.sh.
set -euo pipefail
cd "$(dirname "$0")/.."

work=$(mktemp -d)
cleanup() {
    rm -rf "$work"
    rm -f "downloads/stream/test-$$.m4a"
}
trap cleanup EXIT

mkdir -p downloads/stream
printf 'x' > "downloads/stream/test-$$.m4a"

# Run the checked script against a playlist, keeping its combined output and
# exit code for the caller to assert on.
run_check() {
    set +e
    output=$(PLAYLIST="$1" scripts/check-downloads.sh 2>&1)
    rc=$?
    set -e
}

# (a) existing stream file -> ok line; only demand exit 0 if the dl-*.html loop
# reported nothing missing/broken/bad (this machine may not have downloads/).
printf '{"tracks":[{"slug":"t","audio":"downloads/stream/test-%s.m4a"}]}' "$$" > "$work/a.json"
run_check "$work/a.json"
grep -F "ok       playlist -> downloads/stream/test-$$.m4a" <<<"$output" >/dev/null
if ! grep -qE '^(MISSING  dl-|BROKEN   dl-|BAD PATH dl-)' <<<"$output"; then
    [ "$rc" -eq 0 ]
fi

# (b) missing stream file -> non-zero and MISSING playlist line.
printf '{"tracks":[{"slug":"t","audio":"downloads/stream/nope-%s.m4a"}]}' "$$" > "$work/b.json"
run_check "$work/b.json"
[ "$rc" -ne 0 ]
grep -F "MISSING  playlist -> downloads/stream/nope-$$.m4a" <<<"$output" >/dev/null

# (c) path escaping downloads/ -> non-zero and BAD PATH.
printf '{"tracks":[{"slug":"t","audio":"../etc/passwd"}]}' > "$work/c.json"
run_check "$work/c.json"
[ "$rc" -ne 0 ]
grep -F "BAD PATH playlist -> ../etc/passwd" <<<"$output" >/dev/null

echo PASS
