#!/bin/bash

# Start analytics server in background
echo "Starting analytics server..."
node analytics.js &
ANALYTICS_PID=$!

# Give analytics server time to start
sleep 2

# Start Caddy
echo "Starting Caddy..."
caddy run --config /app/Caddyfile --adapter caddyfile &
CADDY_PID=$!

# Handle shutdown gracefully
trap "kill $ANALYTICS_PID $CADDY_PID" EXIT

# Wait for both processes
wait $ANALYTICS_PID $CADDY_PID