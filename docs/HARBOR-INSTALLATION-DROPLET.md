# Installation Harbor sur le Droplet (port 4443)

Ce guide permet d'installer Harbor sur le **même Droplet** que l'application, sans conflit de ports :
- **Port 80** : Frontend (répertoire)
- **Port 4443** : Harbor (registry privé)

---

## Prérequis

- Droplet avec 4 Go RAM minimum (2 vCPU, 40 Go disque)
- Docker et Docker Compose déjà installés
- L'application répertoire déjà déployée sur le port 80

---

## 1. Télécharger Harbor

**Option A – Installation automatique (recommandé) :**

```bash
cd /root/repertoire
wget https://github.com/goharbor/harbor/releases/download/v2.11.0/harbor-offline-installer-v2.11.0.tgz
mkdir -p harbor && tar xzf harbor-offline-installer-v2.11.0.tgz -C harbor --strip-components=1
chmod +x scripts/harbor-install.sh
./scripts/harbor-install.sh 165.22.171.147
```

Le script génère les certificats, configure `harbor.yml` et lance l’installation.

**Option B – Installation manuelle :**

```bash
cd /root
wget https://github.com/goharbor/harbor/releases/download/v2.11.0/harbor-offline-installer-v2.11.0.tgz
tar xzf harbor-offline-installer-v2.11.0.tgz
cd harbor
```

---

## 2. Générer les certificats SSL (auto-signés pour IP)

Harbor utilise HTTPS. Pour une IP sans domaine, on peut utiliser des certificats auto-signés :

```bash
cd /root/harbor   # ou cd /root/repertoire/harbor selon où tu as extrait
mkdir -p certs
cd certs

# Remplacer 165.22.171.147 par ton IP
IP=165.22.171.147

# Générer un certificat auto-signé
openssl req -x509 -nodes -days 3650 -newkey rsa:4096 \
  -keyout server.key -out server.crt \
  -subj "/CN=$IP" \
  -addext "subjectAltName=IP:$IP,DNS:localhost"
```

---

## 3. Configurer harbor.yml

```bash
cd /root/harbor   # ou cd /root/repertoire/harbor
cp harbor.yml.tmpl harbor.yml
nano harbor.yml
```

Modifier les sections suivantes (remplace `165.22.171.147` par ton IP) :

```yaml
# hostname - IP du Droplet
hostname: 165.22.171.147

# Désactiver HTTP (port 80) - le lier à localhost uniquement pour libérer le port 80
http:
  port: 127.0.0.1:5080

# HTTPS sur le port 4443
# Si Harbor est dans /root/repertoire/harbor, utilise /root/repertoire/harbor/certs/...
https:
  port: 4443
  certificate: /root/harbor/certs/server.crt
  private_key: /root/harbor/certs/server.key

# Mot de passe admin (à changer)
harbor_admin_password: Harbor12345
```

---

## 4. Préparer et installer

```bash
cd /root/harbor   # ou cd /root/repertoire/harbor
./prepare
./install.sh
```

---
 
## 5. Vérifier les ports

```bash
docker ps
```

Tu dois voir les conteneurs Harbor. Le port 80 du host reste libre pour le frontend.

---

## 6. Accéder à Harbor

- **URL :** `https://165.22.171.147:4443`
- **Utilisateur :** `admin`
- **Mot de passe :** `Harbor12345` (ou celui défini dans harbor.yml)

Le navigateur affichera un avertissement de sécurité (certificat auto-signé). Clique sur « Avancé » ou « Paramètres avancés » puis « Accepter le risque et continuer ».

---

## 7. Configurer GitHub Actions pour Harbor

Voir le guide complet : [PHASE-4-HARBOR.md](PHASE-4-HARBOR.md)

**Secrets :**
```text
HARBOR_URL = 165.22.171.147:4443/repertoire
HARBOR_USERNAME = admin
HARBOR_PASSWORD = ton_mot_de_passe
HARBOR_CA_CERT = (contenu base64 de server.crt)
```

**Variables :**
```text
ENABLE_HARBOR = true
ENABLE_HARBOR_CA_CERT = true
```

**Obtenir le certificat en base64 :**
```bash
# Si Harbor est dans /root/repertoire/harbor :
base64 -w 0 /root/repertoire/harbor/certs/server.crt

# Si Harbor est dans /root/harbor :
base64 -w 0 /root/harbor/certs/server.crt
```

---

## 8. Faire confiance au certificat sur ta machine

Pour `docker login` depuis ta machine :

```bash
# Linux/Mac
mkdir -p ~/.docker/certs.d/165.22.171.147:4443
scp root@165.22.171.147:/root/harbor/certs/server.crt ~/.docker/certs.d/165.22.171.147:4443/ca.crt

# Puis
docker login 165.22.171.147:4443
```

---

## 9. Créer un projet dans Harbor

1. Connecte-toi à https://165.22.171.147:4443
2. **Projects** → **New Project**
3. Nom : `repertoire`
4. Access Level : **Public** (ou Private si tu préfères)
5. **Vulnerability scanning** : activé (Trivy)

---

## Dépannage

### Le frontend ne répond plus sur le port 80
Vérifie que les conteneurs répertoire tournent :

```bash
docker ps | grep repertoire
```

### Harbor ne démarre pas
Vérifier les logs :

```bash
cd /root/repertoire/harbor   # ou cd /root/harbor
docker compose logs
```

### Arrêter Harbor

```bash
cd /root/repertoire/harbor   # ou cd /root/harbor
docker compose down
```

### Redémarrer Harbor

```bash
cd /root/repertoire/harbor   # ou cd /root/harbor
docker compose up -d
```
