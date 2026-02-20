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

### Tags par branche

| Branche | Tag image |
|---------|-----------|
| develop | `dev` |
| preprod | `preprod` |
| prod | `v1.0.0` (version du package.json) |
