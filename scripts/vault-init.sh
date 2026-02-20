#!/bin/sh
# Initialise Vault : active le moteur KV v2 et enregistre les secrets
# Usage : exécuté par le conteneur vault-init au démarrage

set -e
VAULT_ADDR="${VAULT_ADDR:-http://vault:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-root}"
SECRET_PATH="${VAULT_SECRET_PATH:-secret/data/repertoire}"

echo "⏳ Attente de Vault..."
for i in $(seq 1 30); do
  if wget -q -O- "$VAULT_ADDR/v1/sys/health" 2>/dev/null; then
    break
  fi
  [ $i -eq 30 ] && { echo "❌ Vault inaccessible"; exit 1; }
  sleep 2
done
echo "✅ Vault prêt"

# Activer le moteur KV v2 au path 'secret' (ignore si déjà activé)
echo "📦 Activation du moteur KV v2..."
wget -q -O- --header "X-Vault-Token: $VAULT_TOKEN" \
  --header "Content-Type: application/json" \
  --post-data '{"type":"kv","options":{"version":"2"}}' \
  "$VAULT_ADDR/v1/sys/mounts/secret" 2>/dev/null || true

# Écrire les secrets (MONGODB_URI)
echo "🔐 Enregistrement des secrets..."
wget -q -O- --header "X-Vault-Token: $VAULT_TOKEN" \
  --header "Content-Type: application/json" \
  --post-data "{\"data\":{\"MONGODB_URI\":\"${MONGODB_URI:-mongodb://mongodb:27017/repertoire}\"}}" \
  "$VAULT_ADDR/v1/$SECRET_PATH" > /dev/null

echo "✅ Vault initialisé"
