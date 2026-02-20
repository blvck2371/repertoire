# Guide complet – Répertoire Téléphonique DevOps

Ce guide t'accompagne de A à Z : configuration GitHub, déploiement sur le Droplet, Vault, monitoring et backup.

---

## 📋 Vue d'ensemble

| Composant | Rôle |
|-----------|------|
| **Backend** | API REST Node.js/Express + MongoDB (port 3001) |
| **Frontend** | React, interface CRUD (port 80 en prod) |
| **MongoDB** | Base de données (port 27017) |
| **Vault** | Gestion des secrets (MONGODB_URI) |
| **Prometheus** | Collecte des métriques |
| **Grafana** | Tableaux de bord (port 3000) |
| **ELK** | Logs (Elasticsearch, Kibana, Filebeat) |

---

## 1️⃣ Configuration GitHub (secrets et variables)

### Où configurer ?

**GitHub** → ton dépôt **repertoire** → **Settings** → **Secrets and variables** → **Actions**

### Variables (Variables)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `ENABLE_DROPLET` | `true` | Active le déploiement sur le Droplet |
| `ENABLE_VAULT` | `true` ou `false` | Active Vault pour les secrets |
| `ENABLE_MONITORING` | `true` ou `false` | Active Prometheus, Grafana, ELK |
| `ENABLE_HARBOR` | `false` | Registry privé (optionnel) |
| `ENABLE_KUBERNETES` | `false` | Déploiement K8s (optionnel) |

### Secrets (Secrets)

| Secret | Valeur | Description |
|--------|--------|-------------|
| `DROPLET_IP` | `165.22.171.147` | IP de ton Droplet |
| `DROPLET_USER` | `root` | Utilisateur SSH |
| `DROPLET_SSH_KEY` | Contenu de ta clé privée | `~/.ssh/id_rsa` ou `id_ed25519` |

**Pour récupérer ta clé privée :**
```bash
# Windows (PowerShell)
Get-Content $env:USERPROFILE\.ssh\id_rsa

# Ou si tu utilises ed25519
Get-Content $env:USERPROFILE\.ssh\id_ed25519
```
Copie tout le contenu (y compris `-----BEGIN...` et `-----END...`).

---

## 2️⃣ Préparer le Droplet (première fois)

### Connexion SSH

```bash
ssh root@165.22.171.147
```

### Installation Docker et Docker Compose

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y
docker --version
docker compose version
```

### Cloner le dépôt

```bash
apt install git -y
git clone https://github.com/blvck2371/repertoire.git
cd repertoire
```

### Vérifier que la branche est correcte

```bash
git branch
# Si tu es sur develop, c'est bon
```

---

## 3️⃣ Déploiement

### Option A : Déploiement manuel (sans CD)

Sur le Droplet :

```bash
cd /root/repertoire
git pull origin develop

# Base uniquement (app + MongoDB)
docker compose -f docker-compose.prod.yml up -d --build

# Avec Vault (secrets sécurisés)
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml up -d --build

# Avec Vault + Monitoring (Prometheus, Grafana, ELK)
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml -f docker-compose.monitoring.yml up -d --build
```

### Option B : Déploiement automatique (GitHub Actions)

1. Configure les secrets et variables (section 1)
2. Push sur `develop`, `preprod` ou `prod`
3. Le CD déploie automatiquement sur le Droplet

**Fichiers utilisés selon les variables :**
- `ENABLE_VAULT=true` → ajoute `docker-compose.vault.yml`
- `ENABLE_MONITORING=true` → ajoute `docker-compose.monitoring.yml`

---

## 4️⃣ Accès aux services

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Application** | http://165.22.171.147 | — |
| **Grafana** | http://165.22.171.147:3000 | admin / admin |
| **Prometheus** | http://165.22.171.147:9090 | — |
| **Kibana** | http://165.22.171.147:5601 | — |
| **Vault** | http://localhost:8200 (sur le serveur) | token: root |

---

## 5️⃣ Configuration Grafana (métriques)

1. Ouvre **http://165.22.171.147:3000**
2. Connexion : **admin** / **admin**
3. **Connections** → **Data sources** → **Add data source** → **Prometheus**
4. URL : `http://prometheus:9090` → **Save & Test**
5. Crée des panneaux avec les métriques (voir [GRAFANA-SETUP.md](GRAFANA-SETUP.md))

**Métriques backend disponibles :**
- `http_requests_total{job="backend"}` — nombre de requêtes
- `http_request_duration_seconds{job="backend"}` — durée des requêtes

---

## 6️⃣ Backup MongoDB

### Backup manuel

```bash
cd /root/repertoire
docker compose -f docker-compose.prod.yml -f docker-compose.backup.yml --profile backup run --rm backup
```

### Backup automatique (cron)

```bash
crontab -e
# Ajouter (tous les jours à 2h) :
0 2 * * * cd /root/repertoire && docker compose -f docker-compose.prod.yml -f docker-compose.backup.yml --profile backup run --rm backup
```

Voir [BACKUP.md](BACKUP.md) pour la restauration.

---

## 7️⃣ Vault (secrets)

Vault stocke `MONGODB_URI` de façon sécurisée. Le backend le récupère au démarrage.

**Activation :** `ENABLE_VAULT=true` dans les variables GitHub.

**Initialisation manuelle (si besoin) :**
```bash
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml up -d vault
# Attendre 5 secondes
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml run --rm vault-init
```

Voir [VAULT.md](VAULT.md) pour plus de détails.

---

## 8️⃣ Dépannage

### L'application ne répond pas

```bash
# Vérifier les conteneurs
docker ps -a

# Logs du backend
docker logs repertoire-backend

# Logs du frontend
docker logs repertoire-frontend

# Redémarrer
docker compose -f docker-compose.prod.yml restart
```

### Erreur MongoDB

```bash
docker logs repertoire-mongodb
# Vérifier que MongoDB est bien démarré
docker exec repertoire-mongodb mongosh --eval "db.adminCommand('ping')"
```

### Prometheus ne scrape pas le backend

```bash
# Vérifier que backend et prometheus sont sur le même réseau
docker network ls
docker network inspect repertoire_default

# Tester l'endpoint métriques
curl http://localhost:3001/api/metrics
```

### Port déjà utilisé

```bash
# Voir qui utilise le port 80
netstat -tlnp | grep 80

# Arrêter tous les conteneurs
docker compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml down
```

### Nettoyer les images inutilisées

```bash
docker image prune -f
docker system prune -f
```

---

## 9️⃣ Checklist avant mise en production

- [ ] Secrets GitHub configurés (DROPLET_IP, DROPLET_USER, DROPLET_SSH_KEY)
- [ ] Variables GitHub configurées (ENABLE_DROPLET, ENABLE_VAULT, ENABLE_MONITORING)
- [ ] Droplet préparé (Docker, dépôt cloné)
- [ ] Clé SSH ajoutée au compte DigitalOcean (pour créer le Droplet)
- [ ] Backup cron configuré (optionnel)
- [ ] Mot de passe Grafana changé (recommandé)

---

## 📚 Documentation détaillée

| Document | Contenu |
|----------|---------|
| [DEPLOIEMENT-DROPLET.md](DEPLOIEMENT-DROPLET.md) | Création et configuration du Droplet |
| [PHASE-4-HARBOR.md](PHASE-4-HARBOR.md) | Registry Harbor, certificat CA, scan vulnérabilités |
| [PHASE-5-KUBERNETES.md](PHASE-5-KUBERNETES.md) | Traefik Ingress, HPA, Helm Charts |
| [VAULT.md](VAULT.md) | Gestion des secrets avec Vault |
| [MONITORING-GUIDE.md](MONITORING-GUIDE.md) | Prometheus, Grafana, Kibana |
| [GRAFANA-SETUP.md](GRAFANA-SETUP.md) | Configuration des tableaux de bord |
| [BACKUP.md](BACKUP.md) | Backup et restauration MongoDB |

---

*Dernière mise à jour : février 2025*
