#!/bin/bash
# Installation Harbor sur le Droplet (port 4443)
# Usage : ./scripts/harbor-install.sh [IP_DROPLET]
# Exemple : ./scripts/harbor-install.sh 165.22.171.147

set -e

IP="${1:-165.22.171.147}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARBOR_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/harbor"

echo "=== Installation Harbor ==="
echo "IP: $IP"
echo "Dossier Harbor: $HARBOR_DIR"
echo ""

# Vérifier que le dossier Harbor existe
if [ ! -f "$HARBOR_DIR/install.sh" ]; then
  echo "❌ Harbor non trouvé dans $HARBOR_DIR"
  echo ""
  echo "Télécharge et extrais d'abord :"
  echo "  cd /root/repertoire"
  echo "  wget https://github.com/goharbor/harbor/releases/download/v2.11.0/harbor-offline-installer-v2.11.0.tgz"
  echo "  mkdir -p harbor && tar xzf harbor-offline-installer-v2.11.0.tgz -C harbor --strip-components=1"
  echo ""
  echo "Puis relance : ./scripts/harbor-install.sh $IP"
  exit 1
fi

cd "$HARBOR_DIR"

# 1. Générer les certificats si absents
if [ ! -f certs/server.crt ]; then
  echo "📜 Génération des certificats SSL..."
  mkdir -p certs
  openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
    -keyout certs/server.key -out certs/server.crt \
    -subj "/CN=$IP" \
    -addext "subjectAltName=IP:$IP,DNS:localhost"
  echo "✅ Certificats générés"
else
  echo "✅ Certificats déjà présents"
fi

# 2. Configurer harbor.yml
echo "⚙️  Configuration de harbor.yml..."
CERT_PATH="$HARBOR_DIR/certs/server.crt"
KEY_PATH="$HARBOR_DIR/certs/server.key"

if [ ! -f harbor.yml ]; then
  cp harbor.yml.tmpl harbor.yml
fi

# Remplacer hostname
sed -i.bak "s|^hostname:.*|hostname: $IP|" harbor.yml

# HTTP : port 80 -> 127.0.0.1:5080 (libère le port 80 pour le frontend)
sed -i.bak 's| port: 80| port: 127.0.0.1:5080|' harbor.yml

# HTTPS : port 443 -> 4443, chemins certificats
sed -i.bak 's| port: 443| port: 4443|' harbor.yml
sed -i.bak "s|certificate: /your/certificate/path|certificate: $CERT_PATH|" harbor.yml
sed -i.bak "s|private_key: /your/private/key/path|private_key: $KEY_PATH|" harbor.yml

echo "✅ harbor.yml configuré"

# 3. Préparer et installer
echo ""
echo "🚀 Lancement de ./prepare..."
./prepare

echo ""
echo "🚀 Lancement de ./install.sh..."
./install.sh

echo ""
echo "=== ✅ Harbor installé ==="
echo ""
echo "Accès : https://$IP:4443"
echo "Identifiants : admin / Harbor12345"
echo ""
echo "Prochaines étapes :"
echo "1. Créer le projet 'repertoire' dans Harbor (Projects → New Project)"
echo "2. Obtenir le certificat base64 pour GitHub :"
echo "   base64 -w 0 $HARBOR_DIR/certs/server.crt"
echo "3. Configurer les secrets GitHub (voir docs/PHASE-4-HARBOR.md)"
echo ""
