# Répertoire Téléphonique - CRUD DevOps

**Objectif :** Réaliser un projet CRUD Répertoire Téléphonique respectant intégralement le Cahier des Spécifications Techniques avec une stratégie CI/CD multi-branches : **develop**, **preprod** et **prod**.
 
---

## 📋 Plan de travail

### PHASE 0 – Application CRUD Répertoire Téléphonique
- [x] Backend API REST (Node.js/Express + MongoDB)
- [x] Frontend React avec interface CRUD
- [x] Modèle de données Contact (nom, prénom, téléphone, email)
- [x] Docker Compose pour développement local

### PHASE 1 – Stratégie Git & Branching
- [x] Configurer les branches principales : `develop`, `preprod`, `prod`
- [x] Définir le workflow : develop → preprod → prod
- [x] Mettre en place le versioning sémantique (v1.0.0, v1.1.0…)

### PHASE 2 – CI/CD avec GitHub Actions (Multi-branches)
- [x] Pipeline CI (sur chaque push) : Lint, Tests unitaires, Tests E2E, Build Docker, Scan Trivy
- [x] Pipeline CD **develop** : Image tag `dev`, Push Harbor, Déploiement namespace `dev`
- [x] Pipeline CD **preprod** : Image tag `preprod`, Push Harbor, Déploiement namespace `preprod`
- [x] Pipeline CD **prod** : Image version sémantique, Push Harbor, Déploiement namespace `prod`

### PHASE 3 – Conteneurisation (Docker)
- [x] Dockerfile backend multi-stage
- [x] Dockerfile frontend optimisé
- [x] Docker Compose pour environnement local
- [x] Images versionnées selon branche

### PHASE 4 – Registry privé (Harbor)
- [x] Installation Harbor
- [x] Création projet privé
- [x] Scan automatique vulnérabilités (Trivy)
- [x] Stockage images dev/preprod/prod séparées

### PHASE 5 – Orchestration Kubernetes
- [x] Namespaces : dev / preprod / prod
- [x] MongoDB en StatefulSet
- [x] Backend & Frontend en Deployment
- [x] Service LoadBalancer pour accès externe
- [x] Traefik Ingress Controller (optionnel)
- [x] Autoscaling HPA
- [x] Helm Charts pour packaging

### PHASE 6 – Gestion des secrets (Vault)
- [x] Installation Vault (mode dev, Docker Compose)
- [x] Stockage sécurisé credentials MongoDB
- [x] Injection dynamique secrets au démarrage du backend
- [x] Rotation manuelle des secrets (documentée)

### PHASE 7 – Monitoring & Logging
- [x] Prometheus pour métriques
- [x] Grafana pour dashboards
- [x] ELK Stack (Elasticsearch, Kibana, Filebeat) pour logs
- [ ] Alertmanager pour alertes — optionnel

### PHASE 8 – Backup & Haute disponibilité
- [x] Backup MongoDB (script + docker-compose)
- [x] Rétention 7 jours, nettoyage automatique
- [x] Plan de restauration documenté
- [ ] Sauvegarde stockage externe (S3/MinIO) — optionnel

---

## 📖 Guide complet

**Besoin d'aide pour tout configurer ?** → [docs/GUIDE-COMPLET.md](docs/GUIDE-COMPLET.md) — GitHub, Droplet, Vault, Monitoring, Backup, dépannage.

---

## 🏃 Lancer l'application

### Développement local
```bash
# 1. Démarrer MongoDB
docker compose -f docker-compose.dev.yml up -d

# 2. Backend
cd backend && npm install && npm run dev

# 3. Frontend (autre terminal)
cd frontend && npm install && npm run dev
```
→ Frontend : http://localhost:5173 | Backend : http://localhost:3001

### Avec Docker Compose (full stack)
```bash
docker compose up -d
```
→ Application : http://localhost:5173

### Avec Vault (secrets sécurisés)
```bash
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml up -d --build
```
→ Voir [docs/VAULT.md](docs/VAULT.md)

### Registry Harbor (Phase 4)
Voir [docs/PHASE-4-HARBOR.md](docs/PHASE-4-HARBOR.md) — installation, configuration GitHub, scan vulnérabilités.

### Sur Kubernetes
**Option gratuite (Minikube local) :** voir [k8s/MINIKUBE.md](k8s/MINIKUBE.md)

**Option cloud (DigitalOcean) :** avec `ENABLE_HARBOR=true` et `ENABLE_KUBERNETES=true`, le CD déploie automatiquement. Récupérer l'IP : `kubectl get svc frontend -n dev`

**Phase 5 (Traefik, HPA, Helm) :** voir [docs/PHASE-5-KUBERNETES.md](docs/PHASE-5-KUBERNETES.md)

### Sur DigitalOcean Droplet (économique, ~6 $/mois)
Voir [docs/DEPLOIEMENT-DROPLET.md](docs/DEPLOIEMENT-DROPLET.md)

### Backup MongoDB
Voir [docs/BACKUP.md](docs/BACKUP.md) — backup manuel ou automatique (cron)

### Monitoring (Prometheus, Grafana, ELK)
Voir [docs/MONITORING.md](docs/MONITORING.md) — [Guide d'utilisation](docs/MONITORING-GUIDE.md) — Droplet 8 Go recommandé

---

## 📌 Versioning

Le projet utilise le **versioning sémantique** (SemVer). Voir [VERSIONING.md](VERSIONING.md) pour les détails.

```bash
npm run version:patch   # 1.0.0 → 1.0.1 (correctifs)
npm run version:minor   # 1.0.0 → 1.1.0 (nouvelles features)
npm run version:major   # 1.0.0 → 2.0.0 (breaking changes)
```

---

## 🚀 État actuel

- **Branche active :** develop
- **Version :** v1.0.1
- **Dernière étape réalisée :** Phase 5 (Kubernetes : Traefik, HPA, Helm)

---

## 🔧 CI/CD

Voir [.github/CICD.md](.github/CICD.md) pour la configuration Harbor et Kubernetes.

---

*Ce plan respecte 100% du Cahier des Spécifications Techniques.*
