# Phase 5 – Orchestration Kubernetes

Ce guide couvre Traefik Ingress, HPA (autoscaling) et Helm pour le déploiement Kubernetes.

---

## Vue d'ensemble

| Composant | Description |
|-----------|-------------|
| **Traefik Ingress** | Route le trafic HTTP vers le frontend |
| **HPA** | Scale automatiquement les pods selon la charge CPU |
| **Helm** | Packaging et déploiement via chart |

---

## 1. Traefik Ingress Controller

### Installation (Helm)

```bash
# Ajouter le repo Helm Traefik
helm repo add traefik https://traefik.github.io/charts
helm repo update

# Installer Traefik dans le namespace traefik
kubectl create namespace traefik
helm install traefik traefik/traefik -n traefik

# Vérifier
kubectl get svc -n traefik
```

### Déployer l'Ingress du projet

```bash
# Avec LoadBalancer : le frontend a déjà un Service LoadBalancer
# Avec Ingress : passer le frontend en ClusterIP et utiliser l'Ingress

# Option A : Manifests bruts (sans Ingress)
kubectl apply -n dev -f k8s/frontend-deployment.yaml
# Le Service LoadBalancer expose déjà le frontend

# Option B : Avec Traefik Ingress
# 1. Modifier frontend service en ClusterIP
# 2. Appliquer l'Ingress
kubectl apply -n dev -f k8s/ingress-traefik.yaml
```

### Récupérer l'IP d'accès

```bash
# Si LoadBalancer :
kubectl get svc frontend -n dev

# Si Ingress Traefik :
kubectl get svc -n traefik
# L'IP du LoadBalancer Traefik donne accès à l'app
```

---

## 2. HPA (Horizontal Pod Autoscaler)

### Appliquer les HPA

```bash
kubectl apply -n dev -f k8s/hpa.yaml
```

### Vérifier le scaling

```bash
kubectl get hpa -n dev
kubectl describe hpa backend-hpa -n dev
```

Les HPA scale automatiquement entre 1 et 5 replicas quand la CPU dépasse 70 %.

---

## 3. Helm Chart

### Structure

```
helm/repertoire/
├── Chart.yaml
├── values.yaml
├── values-dev.yaml
├── values-prod.yaml
└── templates/
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── mongodb-statefulset.yaml
    ├── mongodb-services.yaml
    ├── ingress.yaml
    └── hpa.yaml
```

### Installation

```bash
# Créer le secret registry (Harbor)
kubectl create secret docker-registry registry-credentials \
  --docker-server=165.22.171.147:4443 \
  --docker-username=admin \
  --docker-password=TON_MOT_DE_PASSE \
  -n dev

# Installer avec Helm
helm install repertoire ./helm/repertoire -n dev \
  --set registry=165.22.171.147:4443/repertoire \
  --set imageTag=dev

# Avec HPA et Ingress
helm install repertoire ./helm/repertoire -n dev \
  -f helm/repertoire/values-dev.yaml \
  --set registry=165.22.171.147:4443/repertoire \
  --set hpa.enabled=true \
  --set ingress.enabled=true
```

### Mise à jour

```bash
helm upgrade repertoire ./helm/repertoire -n dev \
  --set registry=165.22.171.147:4443/repertoire \
  --set imageTag=dev
```

### Désinstallation

```bash
helm uninstall repertoire -n dev
```

---

## 4. Intégration CD (GitHub Actions)

Le CD déploie automatiquement avec les manifests bruts quand `ENABLE_KUBERNETES=true` et `ENABLE_HARBOR=true`.

Pour utiliser Helm à la place, modifie le job `deploy-k8s` dans `.github/workflows/cd.yml` : remplace les `kubectl apply` par `helm upgrade --install`.

---

## 5. Résumé des commandes

| Action | Commande |
|--------|----------|
| Déployer (manifests) | `kubectl apply -n dev -f k8s/` |
| Déployer (Helm) | `helm install repertoire ./helm/repertoire -n dev --set registry=...` |
| HPA | `kubectl apply -n dev -f k8s/hpa.yaml` |
| Ingress Traefik | `kubectl apply -n dev -f k8s/ingress-traefik.yaml` |
| Status | `kubectl get svc,pods,hpa -n dev` |

---

*Phase 5 – Orchestration Kubernetes*
