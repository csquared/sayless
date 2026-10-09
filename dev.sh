#!/bin/bash
# Local dev: serves the static site with Caddy on $PORT (default 8080).
cd "$(dirname "$0")"
export PORT=${PORT:-8080}
echo "Serving on :$PORT ..."
caddy run
