#!/bin/sh
# Backup MongoDB + upload S3/MinIO (optionnel)
# Usage: docker compose run --rm backup
# Variables S3: S3_ENABLED, S3_BUCKET, S3_PREFIX, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# Pour MinIO: AWS_ENDPOINT_URL=http://minio:9000

set -e
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_NAME="repertoire_${TIMESTAMP}"
DUMP_PATH="${BACKUP_DIR}/${DUMP_NAME}"
ARCHIVE="${DUMP_PATH}.tar.gz"

echo "📦 Démarrage du backup MongoDB..."
mongodump --host=mongodb --uri="mongodb://mongodb:27017/repertoire" --out="${DUMP_PATH}"

echo "🗜️  Compression..."
cd "${BACKUP_DIR}"
tar -czf "${ARCHIVE}" "${DUMP_NAME}"
rm -rf "${DUMP_NAME}"

echo "✅ Backup local: ${ARCHIVE}"

# Upload S3/MinIO si configuré
if [ "${S3_ENABLED}" = "true" ] && [ -n "${S3_BUCKET}" ]; then
  if [ -z "${AWS_ACCESS_KEY_ID}" ] || [ -z "${AWS_SECRET_ACCESS_KEY}" ]; then
    echo "⚠️  S3 activé mais AWS_ACCESS_KEY_ID ou AWS_SECRET_ACCESS_KEY manquant"
  else
    echo "☁️  Upload vers S3/MinIO..."
    S3_PREFIX="${S3_PREFIX:-backups}"
    S3_PATH="s3://${S3_BUCKET}/${S3_PREFIX}/$(basename ${ARCHIVE})"
    
    if [ -n "${AWS_ENDPOINT_URL}" ]; then
      aws s3 cp "${ARCHIVE}" "${S3_PATH}" --endpoint-url "${AWS_ENDPOINT_URL}"
    else
      aws s3 cp "${ARCHIVE}" "${S3_PATH}"
    fi
    echo "✅ Upload terminé: ${S3_PATH}"
  fi
fi

# Garder uniquement les 7 derniers backups locaux
ls -t repertoire_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
echo "🧹 Anciens backups locaux nettoyés (conservation des 7 derniers)"
