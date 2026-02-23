# Répertoire Téléphonique – CRUD DevOps

**Objectif :** Projet CRUD Répertoire Téléphonique conforme au Cahier des Spécifications Techniques, avec stratégie CI/CD multi-branches : **develop**, **preprod**, **prod**.

---

## Plan de travail

### PHASE 1 – Gestion du code source (GitHub)
- [x] Branches principales : `develop`, `preprod`, `prod`
- [x] Workflow CI/CD sur develop
- [x] Versioning sémantique (v1.0.0, v1.1.0…)
- [x] Workflow sur preprod/prod *(déploiement multi-env)*
- [x] Pull Requests et revues de code via GitHub

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
- [x] Versionnement des images selon branche (Harbor dev/preprod/prod)

### PHASE 4 – Registry privé (Harbor)
- [x] Installation serveur Harbor (HTTPS + domaine)
- [x] Projets distincts (dev, preprod, prod) – mapping branche → projet
- [x] Push automatique des images vers Harbor
- [x] Scan vulnérabilités (Trivy)
- [x] Gestion des accès (utilisateur github-actions)
- [x] Stockage sécurisé des images

### PHASE 5 – Orchestration (Kubernetes + Helm)
- [x] Cluster Kubernetes (déploiement auto sur develop)
- [x] Namespaces repertoire-dev, repertoire-preprod, repertoire-prod
- [x] Backend et Frontend en Deployment
- [x] Base MongoDB en StatefulSet
- [x] Helm Charts – voir [docs/KUBERNETES.md](docs/KUBERNETES.md)
- [x] Autoscaling HPA
- [x] Rolling Update + Rollback automatique (Helm)

### PHASE 6 – Reverse proxy & sécurité (Traefik + TLS)
- [x] Déploiement Traefik (Ingress controller)
- [x] Routage automatique via Ingress
- [x] Certificats TLS via Let's Encrypt (cert-manager)
- [x] Middlewares de sécurité (headers, HSTS, redirect HTTPS)
- [ ] Haute disponibilité en production

### PHASE 7 – Gestion des secrets (HashiCorp Vault)
- [x] Déploiement Vault (mode dev) + Agent Injector
- [x] Stockage sécurisé des credentials MongoDB dans Vault
- [x] Injection dynamique des secrets dans les Pods (backend)
- [ ] Rotation automatique des secrets
- [ ] Audit trail des accès

### PHASE 8 – Monitoring & logging (Prometheus, Grafana, ELK)
- [x] Collecte des métriques via Prometheus (kube-prometheus-stack)
- [x] Dashboards par service via Grafana
- [x] Alerting proactif (Alertmanager + Slack)
- [x] Centralisation des logs avec ELK Stack (Elasticsearch, Kibana, Filebeat)
- [x] Analyse des performances et détection anomalies (Kibana Discover + filtres)

### PHASE 9 – Backups & restauration (Restic + MinIO)
- [x] Backups quotidiens des données production
- [x] Backups hebdomadaires dev/preprod
- [x] Stockage chiffré via MinIO (compatible S3)
- [x] Sauvegardes incrémentales versionnées (Restic)
- [x] Persistance MongoDB en prod (PVC)
- [x] Tests de restauration mensuels en sandbox
- [x] Automatisation via CronJob Kubernetes

### PHASE 10 – Infrastructure & hébergement (DigitalOcean)
- [x] Infrastructure Cloud (DigitalOcean Kubernetes)
- [ ] Minimum 8 vCores / 32 Go RAM / 1 To SSD *(optionnel)*
- [ ] Bande passante > 500 Mbps
- [ ] SLA > 99,9%
- [ ] Snapshots automatiques des Droplets
- [ ] Block Storage + réplication multi-régions

---

## Prochaines étapes

| Priorité | Tâche | Fichier / Action |
|----------|-------|------------------|
| 1 | **Rotation des secrets Vault** (Phase 7) | Automatiser la rotation de MONGODB_URI |
| 2 | **Audit trail Vault** (Phase 7) | `vault audit enable file` |
| 3 | **Haute disponibilité** (Phase 6) | Multi-région, load balancing avancé |

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

## À faire (optionnel)

- **Phase 1 :** Créer les branches `preprod` et `prod` sur GitHub si elles n’existent pas
- **Phase 4 :** *(fait)* Harbor HTTPS + domaine configuré
- **Phase 5 :** *(fait)* Cluster + deploy auto. Optionnel : preprod/prod
- **Phase 7 :** Tester Vault → voir [docs/PHASE7-VAULT.md](docs/PHASE7-VAULT.md). **Phase 8 :** ELK (logs). **Phase 9 :** Tests restauration
- **Phase 2 :** Configurer les notifications CI : ajouter le secret `SLACK_WEBHOOK_URL` ou `DISCORD_WEBHOOK_URL` dans GitHub (Settings → Secrets)
- **Phase 10 :** Créer les Droplets DigitalOcean (8 vCores, 32 Go RAM, 1 To SSD)

---

## Branches et push

Sur **develop**, **preprod** ou **prod**, tout est automatisé à chaque push :

| Étape | Action |
|-------|--------|
| CI | Lint, tests, build, scan, E2E |
| CD | Push des images vers Harbor (dev / preprod / prod) |
| Deploy | Mise à jour Kubernetes (namespace selon branche) |

| Branche | Namespace | URL |
|---------|-----------|-----|
| develop | repertoire-dev | https://repertoire-app.duckdns.org |
| preprod | repertoire-preprod | https://repertoire-preprod.duckdns.org |
| prod | repertoire-prod | https://repertoire-prod.duckdns.org |

```bash
git add .
git commit -m "ton message"
git push origin develop
```

**Activer le déploiement auto sur K8s :** voir [docs/DEPLOY-AUTO.md](docs/DEPLOY-AUTO.md)

**Identifiants :** voir [docs/ACCESS-CREDENTIALS.md](docs/ACCESS-CREDENTIALS.md) pour tous les accès et mots de passe.

## Monitoring & Logs (Phase 8)

| Service | URL | Identifiants |
|---------|-----|--------------|
| Grafana | https://grafana-repertoire.duckdns.org | admin / repertoire-monitoring |
| Kibana (logs) | https://kibana-repertoire.duckdns.org | — |
| Prometheus | port-forward `svc/kube-prometheus-stack-prometheus 9090:9090` | — |
| Alertmanager | port-forward `svc/kube-prometheus-stack-alertmanager 9093:9093` | — |

**Prérequis :** ajouter le sous-domaine `grafana-repertoire` dans DuckDNS (même IP que repertoire-app).

**Alertes Slack :** ajouter le secret `ALERTMANAGER_SLACK_WEBHOOK` pour recevoir les alertes (Backend/Frontend/MongoDB down, mémoire élevée, crash loop).

## Backups (Phase 9)

| Service | URL | Identifiants |
|---------|-----|--------------|
| MinIO (console) | https://minio-repertoire.duckdns.org | minioadmin / minioadmin |
| MinIO (API S3) | https://minio-api-repertoire.duckdns.org | — |

**Prérequis :** ajouter `minio-repertoire` et `minio-api-repertoire` dans DuckDNS (même IP que repertoire-app). La console appelle l'API – la console se connecte à l’API depuis le navigateur.
