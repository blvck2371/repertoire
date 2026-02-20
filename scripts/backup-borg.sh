#!/bin/sh
# Backup BorgBackup : mongodump -> borg (chiffré) -> rclone vers DigitalOcean Spaces
# Usage: docker compose -f docker-compose.prod.yml -f docker-compose.backup-borg.yml run --rm backup-borg
# Variables: BORG_PASSPHRASE, SPACES_KEY, SPACES_SECRET, SPACES_BUCKET, SPACES_REGION, BACKUP_ENV (prod|dev)

set -e
BACKUP_DIR="${BACKUP_DIR:-/backups}"
BORG_REPO="${BACKUP_DIR}/repo"
DUMP_DIR="${BACKUP_DIR}/dump"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 [1/4] Dump MongoDB..."
mongodump --host=mongodb --uri="mongodb://mongodb:27017/repertoire" --out="${DUMP_DIR}"

echo "🔐 [2/4] Backup Borg (chiffré, dédupliqué)..."
# Init repo si premier run
if [ ! -d "${BORG_REPO}" ]; then
  borg init --encryption=repokey "${BORG_REPO}"
fi
borg create --stats "${BORG_REPO}::repertoire-${TIMESTAMP}" "${DUMP_DIR}"
rm -rf "${DUMP_DIR}"

echo "☁️  [3/4] Sync vers DigitalOcean Spaces..."
# Rclone config via env (pas de fichier)
mkdir -p /root/.config/rclone
cat > /root/.config/rclone/rclone.conf << EOF
[spaces]
type = s3
provider = DigitalOcean
env_auth = false
access_key_id = ${SPACES_KEY}
secret_access_key = ${SPACES_SECRET}
region = ${SPACES_REGION:-nyc3}
endpoint = ${SPACES_REGION:-nyc3}.digitaloceanspaces.com
acl = private
EOF

rclone sync "${BORG_REPO}" "spaces:${SPACES_BUCKET}/repertoire-borg" -v

echo "🧹 [4/4] Pruning local (garder 7 derniers)..."
borg prune --keep-within 7d --keep-weekly 4 --keep-monthly 6 "${BORG_REPO}"

echo "✅ Backup Borg terminé: repertoire-${TIMESTAMP}"
