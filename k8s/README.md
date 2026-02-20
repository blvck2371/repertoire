# Déploiement Kubernetes

## Prérequis

- Cluster Kubernetes (DigitalOcean, GKE, etc.)
- Images poussées dans le registry (backend:tag, frontend:tag)

## Configuration

### 1. Créer le secret pour le registry (DigitalOcean)

```bash
kubectl create secret docker-registry registry-credentials \
  --docker-server=registry.digitalocean.com \
  --docker-username=VOTRE_EMAIL \
  --docker-password=VOTRE_TOKEN \
  --namespace=dev
```

Répéter pour les namespaces `preprod` et `prod` si nécessaire.

### 2. Déploiement manuel

```bash
# Définir le namespace et le tag
export NAMESPACE=dev
export REGISTRY=registry.digitalocean.com/repertoire-registry
export TAG=dev

# Remplacer les placeholders et appliquer
sed -e "s|REGISTRY_URL|$REGISTRY|g" -e "s|IMAGE_TAG|$TAG|g" k8s/backend-deployment.yaml | kubectl apply -n $NAMESPACE -f -
sed -e "s|REGISTRY_URL|$REGISTRY|g" -e "s|IMAGE_TAG|$TAG|g" k8s/frontend-deployment.yaml | kubectl apply -n $NAMESPACE -f -
kubectl apply -n $NAMESPACE -f k8s/mongodb-statefulset.yaml
```

### 3. Option LoadBalancer (DigitalOcean)

Pour exposer l'app via un Load Balancer DigitalOcean, modifiez le service frontend :

```yaml
spec:
  type: LoadBalancer
```

## Structure

- `namespace.yaml` - Namespaces dev, preprod, prod
- `mongodb-statefulset.yaml` - MongoDB avec stockage persistant
- `backend-deployment.yaml` - API Backend
- `frontend-deployment.yaml` - Interface React
- `ingress.yaml` - Ingress (optionnel, pour domaine personnalisé)
