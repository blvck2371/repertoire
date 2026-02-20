#!/bin/sh
# Backup MongoDB - à exécuter via le conteneur backup ou manuellement
# Usage: docker compose run --rm backup

set -e
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_PATH="${BACKUP_DIR}/repertoire_${TIMESTAMP}"

echo "📦 Démarrage du backup MongoDB..."
mongodump --host=mongodb --uri="mongodb://mongodb:27017/repertoire" --out="${DUMP_PATH}"

echo "🗜️  Compression..."
cd "${BACKUP_DIR}"
tar -czf "repertoire_${TIMESTAMP}.tar.gz" "repertoire_${TIMESTAMP}"
rm -rf "repertoire_${TIMESTAMP}"

echo "✅ Backup terminé: ${DUMP_PATH}.tar.gz"

# Garder uniquement les 7 derniers backups
ls -t repertoire_*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm -f
echo "🧹 Anciens backups nettoyés (conservation des 7 derniers)"
