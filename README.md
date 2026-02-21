# Répertoire Téléphonique – CRUD DevOps

**Objectif :** Projet CRUD Répertoire Téléphonique conforme au Cahier des Spécifications Techniques, avec stratégie CI/CD multi-branches : **develop**, **preprod**, **prod**.

---

## Plan de travail

### PHASE 1 – Gestion du code source (GitHub)
- [ ] Branches principales : `develop`, `preprod`, `prod` *(à créer sur GitHub si absentes)*
- [x] Workflow : develop → preprod → prod
- [x] Versioning sémantique (v1.0.0, v1.1.0…)
- [ ] Pull Requests et revues de code via GitHub

### PHASE 2 – Intégration continue (GitHub Actions)
- [x] Pipeline CI à chaque push/PR
- [x] Installation dépendances avec cache
- [x] Lint du code
- [x] Tests unitaires (Jest backend)
- [x] Tests composants (React Testing Library)
- [x] Tests E2E multi-navigateurs (Playwright : Chromium, Firefox, WebKit)
- [x] Vérification couverture (seuil 70 %, objectif 80 %)
- [x] Build applicatif
- [x] Build Docker multi-stage
- [x] Scan sécurité des images (Trivy)
- [x] Notifications résultats (Slack / Discord)

### PHASE 3 – Conteneurisation (Docker & Docker Compose)
- [x] Dockerfile backend multi-stage optimisé
- [x] Dockerfile frontend optimisé
- [x] Images légères et immuables
- [x] Docker Compose pour environnement local (dev)
- [ ] Versionnement des images selon branche *(Phase 4 – CD)*

### PHASE 4 – Registry privé (Harbor)
- [ ] Installation serveur Harbor *(manuel sur VPS – voir [docs/HARBOR-SETUP.md](docs/HARBOR-SETUP.md))*
- [x] Projets distincts (dev, preprod, prod) – mapping branche → projet
- [x] Push automatique des images vers Harbor (si secrets configurés)
- [ ] Scan automatique des vulnérabilités *(configurer dans Harbor)*
- [ ] Gestion des accès par projet *(configurer dans Harbor)*
- [x] Stockage sécurisé des images *(Harbor + secrets GitHub)*

### PHASE 5 – Orchestration (Kubernetes + Helm)
- [ ] Cluster Kubernetes (3 nœuds minimum) – [Guide DigitalOcean](docs/KUBERNETES-DIGITALOCEAN.md)
- [ ] Namespaces : dev / preprod / prod
- [x] Backend et Frontend en Deployment
- [x] Base MongoDB en StatefulSet
- [x] Helm Charts pour packaging et déploiement – voir [docs/KUBERNETES.md](docs/KUBERNETES.md)
- [x] Autoscaling HPA
- [x] Rolling Update + Rollback automatique (Helm)

### PHASE 6 – Reverse proxy & sécurité (Traefik + TLS)
- [x] Déploiement Traefik (Ingress controller)
- [x] Routage automatique via Ingress
- [x] Certificats TLS via Let's Encrypt (cert-manager)
- [x] Middlewares de sécurité (headers, HSTS, redirect HTTPS)
- [ ] Haute disponibilité en production

### PHASE 7 – Gestion des secrets (HashiCorp Vault)
- [ ] Déploiement cluster Vault haute disponibilité
- [ ] Stockage sécurisé des credentials MongoDB
- [ ] Injection dynamique des secrets dans les Pods
- [ ] Rotation automatique des secrets
- [ ] Audit trail des accès

### PHASE 8 – Monitoring & logging (Prometheus, Grafana, ELK)
- [x] Collecte des métriques via Prometheus (kube-prometheus-stack)
- [x] Dashboards par service via Grafana
- [x] Alerting proactif (Alertmanager + Slack)
- [ ] Centralisation des logs avec ELK Stack
- [ ] Analyse des performances et détection anomalies

### PHASE 9 – Backups & restauration (Restic + MinIO)
- [x] Backups quotidiens des données production
- [x] Backups hebdomadaires dev/preprod
- [x] Stockage chiffré via MinIO (compatible S3)
- [x] Sauvegardes incrémentales versionnées (Restic)
- [ ] Tests de restauration mensuels en sandbox
- [x] Automatisation via CronJob Kubernetes

### PHASE 10 – Infrastructure & hébergement (DigitalOcean)
- [ ] Infrastructure Cloud (DigitalOcean Optimized Droplets)
- [ ] Minimum 8 vCores / 32 Go RAM / 1 To SSD
- [ ] Bande passante > 500 Mbps
- [ ] SLA > 99,9%
- [ ] Snapshots automatiques des Droplets
- [ ] Block Storage + réplication multi-régions

---

## Démarrage local

```bash
# Backend (MongoDB requis sur localhost:27017)
cd backend && npm install && npm start

# Frontend (autre terminal)
cd frontend && npm install && npm run dev
```

Ou avec Docker Compose :
```bash
docker compose up -d
# App : http://localhost
```

## Tests E2E (Playwright)

```bash
docker compose up -d   # Démarrer la stack (ou docker compose -f docker/backend/docker-compose.yml -f docker/frontend/docker-compose.yml up -d)
npm run test:e2e       # Lancer les tests E2E
```

## Structure Docker

| Dossier | Contenu |
|--------|---------|
| `docker/backend/` | MongoDB + API (docker-compose.yml) |
| `docker/frontend/` | Frontend (à combiner avec backend) |

## À faire manuellement (Digital Ocean, GitHub, VPS)

- **Phase 1 :** Créer les branches `preprod` et `prod` sur GitHub si elles n’existent pas
- **Phase 4 :** Installer Harbor + configurer GitHub – [Guide DigitalOcean](docs/HARBOR-DIGITALOCEAN.md) | [HTTPS](docs/HARBOR-HTTPS.md) | [Référence](docs/HARBOR-SETUP.md)
- **Phase 5 :** Créer un cluster DOKS + déployer – voir [docs/KUBERNETES-DIGITALOCEAN.md](docs/KUBERNETES-DIGITALOCEAN.md)
- **Phase 8 :** Ajouter `grafana-repertoire` dans DuckDNS (même IP que repertoire-app) pour accéder à Grafana en HTTPS
- **Phase 9 :** Backups : MinIO (Bitnami) + CronJob déployés automatiquement. Ajouter `minio-repertoire` et `minio-api-repertoire` dans DuckDNS pour accès HTTPS. Voir [docs/BACKUP-RESTORE.md](docs/BACKUP-RESTORE.md)
- **Phase 2 :** Configurer les notifications CI : ajouter le secret `SLACK_WEBHOOK_URL` ou `DISCORD_WEBHOOK_URL` dans GitHub (Settings → Secrets)
- **Phase 10 :** Créer les Droplets DigitalOcean (8 vCores, 32 Go RAM, 1 To SSD)

---

## Branches et push

Sur **develop**, tout est automatisé à chaque push :

| Étape | Action |
|-------|--------|
| CI | Lint, tests, build, scan, E2E |
| CD | Push des images vers Harbor |
| Deploy | Mise à jour Kubernetes (si activé) |

```bash
git add .
git commit -m "ton message"
git push origin develop
```

**Activer le déploiement auto sur K8s :** voir [docs/DEPLOY-AUTO.md](docs/DEPLOY-AUTO.md)

## Monitoring (Phase 8)

| Service | URL | Identifiants |
|---------|-----|--------------|
| Grafana | https://grafana-repertoire.duckdns.org | admin / repertoire-monitoring |
| Prometheus | port-forward `svc/kube-prometheus-stack-prometheus 9090:9090` | — |
| Alertmanager | port-forward `svc/kube-prometheus-stack-alertmanager 9093:9093` | — |

**Prérequis :** ajouter le sous-domaine `grafana-repertoire` dans DuckDNS (même IP que repertoire-app).

**Alertes Slack :** ajouter le secret `ALERTMANAGER_SLACK_WEBHOOK` pour recevoir les alertes (Backend/Frontend/MongoDB down, mémoire élevée, crash loop).

## Backups (Phase 9)

| Service | URL | Identifiants |
|---------|-----|--------------|
| MinIO (console) | https://minio-repertoire.duckdns.org | minioadmin / minioadmin |
| MinIO (API S3) | https://minio-api-repertoire.duckdns.org | — |

**Prérequis :** ajouter `minio-repertoire` et `minio-api-repertoire` dans DuckDNS (même IP que repertoire-app). Chart Bitnami – la console se connecte à l’API en interne.
