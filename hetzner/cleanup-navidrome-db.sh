#!/bin/bash

# One-time cleanup of stale Navidrome DB entries
# Backs up DB, sets PurgeMissing=always, runs full scan, then sets PurgeMissing=full
set -e

SERVER="root@37.27.252.86"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Navidrome Database Cleanup ==="
echo ""

echo "--- Checking current state ---"
BEFORE_TOTAL=$(ssh $SERVER "sqlite3 /var/lib/navidrome/navidrome.db 'SELECT COUNT(*) FROM media_file;'")
BEFORE_MISSING=$(ssh $SERVER "sqlite3 /var/lib/navidrome/navidrome.db 'SELECT COUNT(*) FROM media_file WHERE missing = 1;'")
echo "Total tracks: $BEFORE_TOTAL"
echo "Missing/stale: $BEFORE_MISSING"
echo ""

if [ "$BEFORE_MISSING" -eq 0 ]; then
    echo "No stale entries found. Nothing to clean up."
    exit 0
fi

echo "--- Step 1: Backup database ---"
BACKUP_NAME="navidrome.db.backup-$(date +%Y%m%d-%H%M%S)"
ssh $SERVER "cp /var/lib/navidrome/navidrome.db /var/lib/navidrome/$BACKUP_NAME"
echo "Backed up to /var/lib/navidrome/$BACKUP_NAME"
echo ""

echo "--- Step 2: Deploy config with PurgeMissing=always ---"
# Temporarily use 'always' so the full scan purges missing entries
TEMP_TOML=$(mktemp)
sed "s/Scanner.PurgeMissing = 'full'/Scanner.PurgeMissing = 'always'/" "$SCRIPT_DIR/navidrome.toml" > "$TEMP_TOML"
scp "$TEMP_TOML" "$SERVER:/var/lib/navidrome/navidrome.toml"
ssh $SERVER "chown navidrome:navidrome /var/lib/navidrome/navidrome.toml"
rm "$TEMP_TOML"
echo "Config deployed with PurgeMissing=always"
echo ""

echo "--- Step 3: Stop Navidrome ---"
ssh $SERVER "systemctl stop navidrome"
echo "Navidrome stopped"
echo ""

echo "--- Step 4: Run full scan with purge ---"
ssh $SERVER "sudo -u navidrome /opt/navidrome/navidrome scan --full --configfile /var/lib/navidrome/navidrome.toml 2>&1" || {
    echo "Warning: scan command returned non-zero exit code"
}
echo "Full scan completed"
echo ""

echo "--- Step 5: Deploy permanent config (PurgeMissing=full) ---"
scp "$SCRIPT_DIR/navidrome.toml" "$SERVER:/var/lib/navidrome/navidrome.toml"
ssh $SERVER "chown navidrome:navidrome /var/lib/navidrome/navidrome.toml"
echo "Config restored to PurgeMissing=full"
echo ""

echo "--- Step 6: Restart Navidrome ---"
ssh $SERVER "systemctl start navidrome"
echo "Navidrome started"
echo ""

echo "--- Verifying cleanup ---"
sleep 2
AFTER_TOTAL=$(ssh $SERVER "sqlite3 /var/lib/navidrome/navidrome.db 'SELECT COUNT(*) FROM media_file;'")
AFTER_MISSING=$(ssh $SERVER "sqlite3 /var/lib/navidrome/navidrome.db 'SELECT COUNT(*) FROM media_file WHERE missing = 1;'")
echo "Before: $BEFORE_TOTAL total, $BEFORE_MISSING missing"
echo "After:  $AFTER_TOTAL total, $AFTER_MISSING missing"
echo "Purged: $((BEFORE_TOTAL - AFTER_TOTAL)) entries"
echo ""

ssh $SERVER "systemctl status navidrome --no-pager" | head -5
echo ""
echo "=== Cleanup Complete ==="
echo "Check https://music.justsayless.xyz to verify"
