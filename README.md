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
- [ ] Notifications résultats

### PHASE 3 – Conteneurisation (Docker & Docker Compose)
- [x] Dockerfile backend multi-stage optimisé
- [x] Dockerfile frontend optimisé
- [x] Images légères et immuables
- [x] Docker Compose pour environnement local (dev)
- [ ] Versionnement des images selon branche *(Phase 4 – CD)*

### PHASE 4 – Registry privé (Harbor)
- [ ] Installation serveur Harbor
- [ ] Projets distincts (dev, preprod, prod)
- [ ] Scan automatique des vulnérabilités
- [ ] Gestion des accès par projet
- [ ] Stockage sécurisé des images

### PHASE 5 – Orchestration (Kubernetes + Helm)
- [ ] Cluster Kubernetes (3 nœuds minimum)
- [ ] Namespaces : dev / preprod / prod
- [ ] Backend et Frontend en Deployment
- [ ] Base MongoDB en StatefulSet
- [ ] Helm Charts pour packaging et déploiement
- [ ] Autoscaling HPA
- [ ] Rolling Update + Rollback automatique

### PHASE 6 – Reverse proxy & sécurité (Traefik + TLS)
- [ ] Déploiement Traefik sur chaque environnement
- [ ] Routage automatique des services
- [ ] Certificats TLS via Let's Encrypt
- [ ] Middlewares de sécurité
- [ ] Haute disponibilité en production

### PHASE 7 – Gestion des secrets (HashiCorp Vault)
- [ ] Déploiement cluster Vault haute disponibilité
- [ ] Stockage sécurisé des credentials MongoDB
- [ ] Injection dynamique des secrets dans les Pods
- [ ] Rotation automatique des secrets
- [ ] Audit trail des accès

### PHASE 8 – Monitoring & logging (Prometheus, Grafana, ELK)
- [ ] Collecte des métriques via Prometheus
- [ ] Dashboards par service via Grafana
- [ ] Alerting proactif (Alertmanager)
- [ ] Centralisation des logs avec ELK Stack
- [ ] Analyse des performances et détection anomalies

### PHASE 9 – Backups & restauration (Restic + MinIO)
- [ ] Backups quotidiens des données production
- [ ] Backups hebdomadaires dev/preprod
- [ ] Stockage chiffré via MinIO (compatible S3)
- [ ] Sauvegardes incrémentales versionnées
- [ ] Tests de restauration mensuels en sandbox
- [ ] Automatisation via conteneurs planifiés (cron + Docker)

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
docker compose up -d   # Démarrer la stack
npm run test:e2e       # Lancer les tests E2E
```

## À faire manuellement (Digital Ocean, GitHub, VPS)

- **Phase 1 :** Créer les branches `preprod` et `prod` sur GitHub si elles n’existent pas
- **Phase 4 :** Installer Harbor sur le VPS
- **Phase 5 :** Provisionner le cluster Kubernetes (3 nœuds min.)
- **Phase 10 :** Créer les Droplets DigitalOcean (8 vCores, 32 Go RAM, 1 To SSD)
