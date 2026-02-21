#!/bin/bash
set -e

# Backup MongoDB vers MinIO via Restic (Phase 9)
# Env: MONGODB_URI, RESTIC_REPOSITORY, RESTIC_PASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

BACKUP_DIR="/tmp/backup"
mkdir -p "$BACKUP_DIR"

echo "=== Mongodump ==="
mongodump --uri="${MONGODB_URI}" --out="$BACKUP_DIR" --gzip

echo "=== Restic init (si nécessaire) ==="
restic snapshots 2>/dev/null || restic init

echo "=== Restic backup ==="
restic backup "$BACKUP_DIR" --tag repertoire-mongodb

echo "=== Restic forget (rétention) ==="
restic forget --tag repertoire-mongodb --keep-daily "${KEEP_DAILY:-7}" --keep-weekly "${KEEP_WEEKLY:-4}" --prune

echo "=== Backup terminé ==="
