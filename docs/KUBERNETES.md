# Déploiement Kubernetes avec Helm

Ce document décrit le déploiement du Répertoire Téléphonique sur Kubernetes via Helm.

> **Tu utilises DigitalOcean ?** → Voir le [guide DOKS pas à pas](KUBERNETES-DIGITALOCEAN.md)

## Prérequis

- Cluster Kubernetes (3 nœuds minimum recommandé)
- `kubectl` configuré
- Helm 3.x
- Images Docker disponibles (localement ou dans un registry Harbor)

## Structure du Helm Chart

```
helm/repertoire/
├── Chart.yaml
├── values.yaml          # Valeurs par défaut
├── values-dev.yaml      # Environnement dev (develop)
├── values-preprod.yaml  # Environnement preprod
├── values-prod.yaml     # Environnement production
└── templates/
    ├── _helpers.tpl
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── backend-hpa.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── frontend-hpa.yaml
    ├── mongodb-statefulset.yaml
    ├── mongodb-service.yaml
    └── NOTES.txt
```

## Composants déployés

| Composant | Type | Description |
|-----------|------|-------------|
| Backend | Deployment + Service + HPA | API Node.js/Express |
| Frontend | Deployment + Service + HPA | Nginx + SPA React |
| MongoDB | StatefulSet + Service | Base de données |

## Déploiement

### 1. Créer les namespaces

```bash
kubectl create namespace repertoire-dev
kubectl create namespace repertoire-preprod
kubectl create namespace repertoire-prod
```

### 2. Charger les images depuis Harbor

Les images sont sur Harbor (`46.101.199.158/dev`). Configurez le secret :

```bash
kubectl create secret docker-registry harbor-creds \
  --docker-server=46.101.199.158 \
  --docker-username=github-actions \
  --docker-password=<mot_de_passe> \
  -n repertoire-dev
```

Le fichier `values-dev.yaml` est déjà configuré avec `imageRegistry: "46.101.199.158/dev"` et `imagePullSecrets: [harbor-creds]`.

### 3. Installer le chart

**Environnement dev :**
```bash
helm install repertoire ./helm/repertoire \
  -n repertoire-dev \
  -f helm/repertoire/values-dev.yaml
```

**Environnement preprod :**
```bash
helm install repertoire ./helm/repertoire \
  -n repertoire-preprod \
  -f helm/repertoire/values-preprod.yaml
```

**Environnement prod :**
```bash
helm install repertoire ./helm/repertoire \
  -n repertoire-prod \
  -f helm/repertoire/values-prod.yaml
```

### 4. Vérifier le déploiement

```bash
kubectl get pods -n repertoire-dev
kubectl get svc -n repertoire-dev
```

### 5. Accéder à l'application (sans Ingress)

```bash
# Port-forward du frontend
kubectl port-forward svc/repertoire-frontend 8080:80 -n repertoire-dev

# Ouvrir http://localhost:8080
```

## Mise à jour et rollback

```bash
# Mise à jour
helm upgrade repertoire ./helm/repertoire -n repertoire-dev -f helm/repertoire/values-dev.yaml

# Rollback
helm rollback repertoire -n repertoire-dev

# Historique
helm history repertoire -n repertoire-dev
```

## Configuration par environnement

| Paramètre | Dev | Preprod | Prod |
|-----------|-----|---------|------|
| Backend replicas | 1 | 2 | 2 |
| Frontend replicas | 1 | 2 | 2 |
| HPA | Désactivé | Activé | Activé |
| MongoDB persistence | emptyDir | 10Gi PVC | 20Gi PVC |

## Prochaines étapes (Phase 6)

- Déployer Traefik pour le reverse proxy
- Configurer les Ingress et certificats TLS
- Exposer le frontend via un domaine public
