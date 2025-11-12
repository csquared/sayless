#!/bin/bash

# Comprehensive server health check for Hetzner Navidrome instance
# Diagnoses performance issues, cold starts, resource constraints

SERVER="root@37.27.252.86"

echo "==================================================================="
echo "           HETZNER SERVER HEALTH CHECK"
echo "           Server: $SERVER"
echo "==================================================================="
echo ""

ssh $SERVER << 'ENDSSH'

echo "--- 1. UPTIME & BOOT TIME (Cold Start Detection) ---"
uptime
echo ""
echo "Last boot:"
who -b
echo ""

echo "--- 2. SERVER TYPE & VIRTUALIZATION ---"
echo "Virtualization type:"
systemd-detect-virt || echo "Not virtualized / Unknown"
echo ""
echo "CPU Info:"
grep "model name" /proc/cpuinfo | head -1
echo "CPU cores:"
nproc
echo ""

echo "--- 3. MEMORY USAGE ---"
free -h
echo ""
echo "Top memory consumers:"
ps aux --sort=-%mem | head -6
echo ""

echo "--- 4. CPU LOAD ---"
echo "Load average (1min, 5min, 15min):"
cat /proc/loadavg
echo ""
echo "Top CPU consumers:"
ps aux --sort=-%cpu | head -6
echo ""

echo "--- 5. DISK USAGE & I/O ---"
echo "Disk space:"
df -h /mnt/music /var/lib/navidrome /
echo ""
echo "Mount info for /mnt/music (checking if network mount):"
mount | grep /mnt/music || echo "/mnt/music not a separate mount - using root FS"
echo ""
echo "Disk I/O stats (10 second sample):"
iostat -x 1 3 | tail -n +4
echo ""

echo "--- 6. SERVICE STATUS ---"
echo "Navidrome:"
systemctl status navidrome --no-pager -l | head -15
echo ""
echo "Caddy:"
systemctl status caddy --no-pager -l | head -15
echo ""

echo "--- 7. RECENT NAVIDROME LOGS (Last 20 lines) ---"
journalctl -u navidrome -n 20 --no-pager
echo ""

echo "--- 8. NETWORK CONNECTIVITY ---"
echo "Active connections to Navidrome (port 4533):"
netstat -an | grep :4533 | wc -l
echo "Total established connections:"
netstat -an | grep ESTABLISHED | wc -l
echo ""

echo "--- 9. SYSTEM RESOURCE LIMITS ---"
echo "File descriptor limits:"
ulimit -n
echo "Max processes:"
ulimit -u
echo ""

echo "==================================================================="
echo "                    HEALTH CHECK COMPLETE"
echo "==================================================================="

ENDSSH
