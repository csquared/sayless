# Production Sync Checklist

## Pre-Sync Verification
- [x] External drive mounted at `/Volumes/c2storage/production`
- [x] Local space available: 594GB (need 103GB)
- [x] Target directory: `~/production`
- [x] Exclusions configured: `.DS_Store` and `._*` files

## Directory Structure (what will be synced)
- 343labs/
- Ableton Sessions 2023/2024/2025
- Bitwig Sessions 2025
- Devices/ (VST/AU plugins)
- Edits 2025/
- Exports/
- Presets/
- References/
- Releases/
- Samples/
- SET-PROMOTIONAL-COPY/
- Temp/
- UVR-out/
- Large tutorial zips (Groove3, Scaler, Madcore)
- Video files (.mp4)

## Scripts Ready
1. `initial-production-sync.sh` - One-time copy from external to local
2. `backup-production.sh` - Regular sync from local back to external

## Additional Considerations
- Consider `.gitignore` for the production folder if using git
- Maybe exclude Temp/ folder from backups?
- Large .zip files could be moved elsewhere after extraction
- Consider setting up Time Machine exclusion for ~/production (to avoid double backup)

## Commands
Initial sync: `./scripts/initial-production-sync.sh`
Regular backup: `./scripts/backup-production.sh`