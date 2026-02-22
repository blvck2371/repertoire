#!/bin/bash
# Restauration MongoDB depuis Restic/MinIO (Phase 9)
# Usage: ./restore.sh [snapshot_id]
# Env: MONGODB_URI, RESTIC_REPOSITORY, RESTIC_PASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY

set -e

RESTORE_DIR="/tmp/restore"
mkdir -p "$RESTORE_DIR"

SNAPSHOT="${1:-latest}"
echo "=== Restic restore (snapshot: $SNAPSHOT) ==="
restic restore "$SNAPSHOT" --tag repertoire-mongodb --target "$RESTORE_DIR"

echo "=== Mongorestore ==="
# mongodump crée backup/<db>/ ; restic restore recrée cette structure
for db_dir in "$RESTORE_DIR"/*/; do
  if [ -d "$db_dir" ] && [ -n "$(ls -A "$db_dir" 2>/dev/null)" ]; then
    mongorestore --uri="${MONGODB_URI}" --drop "$db_dir" --gzip
  fi
done

echo "=== Restauration terminée ==="
