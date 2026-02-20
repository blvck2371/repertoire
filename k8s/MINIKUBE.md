# Déploiement avec Minikube (gratuit, local)

Minikube permet d'exécuter Kubernetes localement sans coût cloud.

## 1. Installer Minikube

### Windows (PowerShell en admin)
```powershell
winget install minikube
# Ou avec Chocolatey : choco install minikube
```

### Vérifier l'installation
```bash
minikube version
```

## 2. Démarrer le cluster

```bash
minikube start
```

## 3. Builder les images dans Minikube

```bash
# Activer le Docker de Minikube (utilise le Docker interne de Minikube)
minikube docker-env
# Sur Windows PowerShell : minikube -p minikube docker-env | Invoke-Expression
# Sur Linux/Mac : eval $(minikube docker-env)

# Builder les images localement (depuis la racine du projet)
docker build -t backend:dev ./backend
docker build -t frontend:dev ./frontend
```

## 4. Déployer avec les manifests Minikube

```bash
# Créer le namespace
kubectl apply -f k8s/namespace.yaml

# MongoDB
kubectl apply -n dev -f k8s/mongodb-statefulset.yaml

# Backend et Frontend (manifests adaptés pour images locales)
kubectl apply -n dev -f k8s/minikube/backend-deployment.yaml
kubectl apply -n dev -f k8s/minikube/frontend-deployment.yaml
```

## 5. Accéder à l'application

```bash
# Obtenir l'URL du LoadBalancer (Minikube simule un LB)
minikube service frontend -n dev --url
```

Ou ouvrir dans le navigateur :
```bash
minikube service frontend -n dev
```

## 6. Arrêter Minikube

```bash
minikube stop
```

## 7. GitHub Actions

Avec Minikube, garde **ENABLE_KUBERNETES=false** dans GitHub. Le déploiement K8s ne s'exécutera pas (c'est normal). Les images continueront d'être poussées vers DigitalOcean si tu veux les garder.
