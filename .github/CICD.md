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
   - `HARBOR_URL` : URL du registry (ex: `harbor.example.com`)
   - `HARBOR_USERNAME` : Utilisateur Harbor
   - `HARBOR_PASSWORD` : Mot de passe Harbor
   - `KUBE_CONFIG` : Contenu du kubeconfig (base64 ou texte)

### Tags par branche

| Branche | Tag image |
|---------|-----------|
| develop | `dev` |
| preprod | `preprod` |
| prod | `v1.0.0` (version du package.json) |
