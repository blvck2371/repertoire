# CI/CD - Configuration

## Pipeline CI (automatique sur push)

- **Lint** : ESLint sur backend et frontend
- **Tests unitaires** : Jest (backend) + Vitest (frontend)
- **Tests E2E** : Playwright
- **Build Docker** : Images backend et frontend
- **Scan Trivy** : Détection de vulnérabilités

## Pipeline CD (déploiement)

### Activation

Par défaut, le CD **build** les images uniquement. Pour activer Harbor et Kubernetes :

1. **Variables de dépôt** (Settings → Secrets and variables → Actions → Variables) :
   - `ENABLE_HARBOR` = `true` (pour push vers Harbor)
   - `ENABLE_KUBERNETES` = `true` (pour déploiement K8s)

2. **Secrets** (Settings → Secrets and variables → Actions → Secrets) :
   - `HARBOR_URL` : URL complète du registry
     - **DigitalOcean** : `registry.digitalocean.com/repertoire-registry`
     - **Harbor** : `harbor.example.com/repertoire`
   - `HARBOR_USERNAME` : Email (DigitalOcean) ou admin (Harbor)
   - `HARBOR_PASSWORD` : Token API (DigitalOcean) ou mot de passe (Harbor)
   - `KUBE_CONFIG` : Contenu du kubeconfig (pour déploiement K8s)

**Note :** Pour le déploiement Kubernetes, `ENABLE_HARBOR` et `ENABLE_KUBERNETES` doivent être à `true`.

Variables optionnelles K8s (Phase 5) :
- `ENABLE_K8S_INGRESS` = `true` — applique l'Ingress Traefik (nécessite Traefik installé)

### Déploiement Droplet

Variables : `ENABLE_DROPLET` = `true`

**Mode orchestré** (recommandé) : quand `ENABLE_HARBOR` et `ENABLE_DROPLET` sont tous deux `true`, le Droplet **pull** les images depuis Harbor après le push. Flux : `build` → `push-registry` → `deploy-droplet` → mêmes images que K8s.

**Mode direct** (fallback) : quand `ENABLE_HARBOR` est `false`, le Droplet **build** localement depuis le code (git pull + docker compose build).

Variables optionnelles :
- `ENABLE_VAULT` = `true` — déploie avec Vault pour la gestion des secrets
- `ENABLE_MONITORING` = `true` — déploie Prometheus, Grafana, ELK (Droplet 8 Go recommandé)

Secrets :
- `DROPLET_IP` : IP du Droplet
- `DROPLET_USER` : Utilisateur SSH (ex: root)
- `DROPLET_SSH_KEY` : Clé privée SSH pour se connecter au Droplet

### Tags par branche

| Branche | Tag image |
|---------|-----------|
| develop | `dev` |
| preprod | `preprod` |
| prod | `v1.0.0` (version du package.json) |

### Plan Harbor / Registry

Les images sont poussées dans le projet configuré (ex. `repertoire`) :
- `repertoire/backend:dev` — image backend
- `repertoire/frontend:dev` — image frontend
