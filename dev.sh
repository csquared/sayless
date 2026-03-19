#!/bin/bash
# Local dev: starts API + Caddy
# Press 'r' to restart the API
cd "$(dirname "$0")"
ROOT="$PWD"
export PORT=${PORT:-8080}
API_PID=""

start_api() {
    if [ -n "$API_PID" ]; then
        kill -- -"$API_PID" 2>/dev/null || true
        wait "$API_PID" 2>/dev/null || true
    fi
    echo "Starting API on :8090..."
    set -m
    (cd api && go run . -db "$ROOT/sayless.db" -addr 127.0.0.1:8090) &
    API_PID=$!
    set +m
}

CADDY_PID=""

cleanup() {
    kill -9 -- -"$API_PID" 2>/dev/null || true
    kill -9 "$CADDY_PID" 2>/dev/null || true
    exit 0
}
trap cleanup INT TERM

start_api

echo "Starting Caddy on :$PORT..."
caddy run &
CADDY_PID=$!

echo ""
echo "Press 'r' to restart API"
echo ""

while true; do
    read -rsn1 key
    if [ "$key" = "r" ]; then
        echo "Restarting API..."
        start_api
    fi
done
