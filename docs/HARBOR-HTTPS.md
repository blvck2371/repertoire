# Mettre Harbor en HTTPS

Harbor en HTTPS permet à Kubernetes (et Docker) de pull les images sans erreur. Deux options selon ta situation.

---

## Option A – Avec un domaine (Let's Encrypt, recommandé)

### Prérequis

- Un **domaine** (ex. `harbor.tondomaine.com`) pointant vers l’IP de ton Droplet (46.101.199.158)
- Port 80 ouvert (pour la validation Let's Encrypt)

### 1. Obtenir un certificat Let's Encrypt

Sur le serveur Harbor (en SSH) :

```bash
# Installer certbot
apt update && apt install certbot -y

# Obtenir le certificat (remplace harbor.tondomaine.com par ton domaine)
certbot certonly --standalone -d harbor.tondomaine.com --non-interactive --agree-tos -m ton@email.com
```

Les fichiers seront dans `/etc/letsencrypt/live/harbor.tondomaine.com/` :
- `fullchain.pem` (certificat)
- `privkey.pem` (clé privée)

### 2. Configurer Harbor

```bash
cd /opt/harbor
nano harbor.yml
```

Modifier :

```yaml
hostname: harbor.tondomaine.com

# Désactiver HTTP
# http:
#   port: 80

# Activer HTTPS
https:
  port: 443
  certificate: /etc/letsencrypt/live/harbor.tondomaine.com/fullchain.pem
  private_key: /etc/letsencrypt/live/harbor.tondomaine.com/privkey.pem
```

### 3. Réinstaller Harbor

```bash
./prepare
docker compose down
docker compose up -d
```

### 4. Renouveler le certificat (cron)

```bash
crontab -e
# Ajouter : renouvellement tous les jours à 3h
0 3 * * * certbot renew --quiet && cd /opt/harbor && docker compose restart
```

### 5. Mettre à jour GitHub et Kubernetes

- **HARBOR_URL** : `harbor.tondomaine.com` (sans `https://`)
- **Variable GitHub** : `HARBOR_HTTPS` = `true` (la CI sautera la config insecure-registries)
- **Pare-feu** : ouvrir le port 443

---

## Option B – Sans domaine (certificat auto-signé)

Si tu n’as qu’une **IP** (46.101.199.158), utilise un certificat auto-signé.

### 1. Générer le certificat

Sur le serveur Harbor :

```bash
mkdir -p /opt/harbor/cert
cd /opt/harbor/cert

# Générer certificat pour l'IP (valide 365 jours)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key -out server.crt \
  -subj "/CN=46.101.199.158" \
  -addext "subjectAltName=IP:46.101.199.158"
```

### 2. Configurer Harbor

```bash
cd /opt/harbor
nano harbor.yml
```

```yaml
hostname: 46.101.199.158

# Désactiver HTTP
# http:
#   port: 80

# Activer HTTPS avec certificat auto-signé
https:
  port: 443
  certificate: /opt/harbor/cert/server.crt
  private_key: /opt/harbor/cert/server.key
```

### 3. Réinstaller Harbor

```bash
./prepare
docker compose down
docker compose up -d
```

### 4. Ouvrir le port 443

Dans DigitalOcean : **Networking** → **Firewalls** → ajouter une règle **HTTPS (443)**.

### 5. Mettre à jour les configurations

- **HARBOR_URL** : `46.101.199.158` (inchangé)
- **Variable GitHub** : ajouter `HARBOR_HTTPS` = `true` (pour désactiver la config HTTP dans la CI)
- **Kubernetes** : le secret `harbor-creds` reste valide

---

## Après passage en HTTPS

### GitHub Actions

Ajouter la variable **HARBOR_HTTPS** = `true` dans Settings → Variables. La CI sautera alors la configuration "insecure-registries".

### Accès à Harbor

- Avec domaine : `https://harbor.tondomaine.com`
- Avec IP : `https://46.101.199.158` (le navigateur affichera un avertissement de sécurité avec un certificat auto-signé ; accepter pour continuer)

### Kubernetes

Les nœuds pourront pull les images depuis Harbor en HTTPS sans configuration supplémentaire.
