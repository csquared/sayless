#!/usr/bin/env bash
# Make a download-gate page: dl-<slug>.html at the site root.
# Visitors tap "follow" on Instagram and SoundCloud (opens the app when
# installed), then the download unlocks. Nothing is verified.
#
# Usage: scripts/new-dl.sh <slug> "<TITLE>" <cover> <file> [description]
#   cover  path under the repo (e.g. assets/photos/x.jpg)
#   file   downloads/<name> (gitignored; scripts/check-downloads.sh checks it
#          exists before each deploy) or a full URL
#
# Example:
#   scripts/new-dl.sh monster-mash "MONSTER MASH (SAYLESS EDIT)" \
#       assets/photos/monster-mash-vinyl.jpg downloads/monster-mash.mp3
set -euo pipefail
cd "$(dirname "$0")/.."

if [ $# -lt 4 ]; then
    sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'
    exit 1
fi

slug=$1 title=$2 cover=$3 file=$4
desc=${5:-"Free download: $title by SAYLESS."}
out="dl-$slug.html"
site="https://justsayless.xyz"

case $slug in *[!a-z0-9-]*) echo "slug must be lowercase letters, digits, dashes" >&2; exit 1;; esac
[ -f "$cover" ] || { echo "cover not found: $cover" >&2; exit 1; }
case $file in
    http://*|https://*) ;;
    downloads/*) [ -s "$file" ] || echo "warning: $file isn't here yet; the deploy stops until it is" >&2 ;;
    *) echo "file must be downloads/<name> or a full URL" >&2; exit 1 ;;
esac

ext=${file##*.}; ext=${ext%%\?*}
filename="SAYLESS - $(printf '%s' "$title" | tr -d '/:')"
[ "$ext" != "$file" ] && filename="$filename.$ext"

esc() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' -e 's/"/\&quot;/g'; }
json() { printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's#</#<\\/#g'; }

t=$(esc "$title") d=$(esc "$desc")
cat > "$out" <<EOF
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <title>SAYLESS - $t (FREE DOWNLOAD)</title>
        <meta name="description" content="$d" />
        <meta property="og:title" content="SAYLESS - $t (FREE DOWNLOAD)" />
        <meta property="og:description" content="$d" />
        <meta property="og:image" content="$site/$(esc "$cover")" />
        <meta property="og:url" content="$site/$out" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="stylesheet" href="assets/gate/gate.css" />
    </head>
    <body>
        <main class="gate-page">
            <a class="gate-artist" href="/">SAYLESS</a>
            <h1 class="gate-title">$t</h1>
            <img class="gate-cover" src="$(esc "$cover")" alt="$t cover art" />
            <div id="gate"></div>
            <noscript>
                <p class="gate-hint">
                    <a href="https://www.instagram.com/just.sayless/" style="color:#999">INSTAGRAM</a> &middot;
                    <a href="https://soundcloud.com/just-say-less" style="color:#999">SOUNDCLOUD</a>
                </p>
            </noscript>
        </main>
        <script type="application/json" id="gate-config">
            {"slug": "$slug", "file": "$(json "$file")", "filename": "$(json "$filename")"}
        </script>
        <script src="assets/gate/gate.js"></script>
    </body>
</html>
EOF
echo "wrote $out -> $site/$out"
