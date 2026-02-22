# Phase 5 – Déploiement sur DigitalOcean Kubernetes (DOKS)

Guide pour déployer le Répertoire Téléphonique sur un cluster Kubernetes DigitalOcean, avec les images depuis Harbor.

---

## Étape 1 – Créer un cluster Kubernetes sur DigitalOcean

1. Va sur [cloud.digitalocean.com](https://cloud.digitalocean.com) → **Kubernetes**
2. **Create Cluster**
3. Configure :
   - **Datacenter** : Frankfurt (ou proche de toi)
   - **Version** : dernière stable
   - **Node pool** : 2 ou 3 nœuds, 2 vCPU / 4 Go RAM minimum
4. **Create Cluster**
5. Attendre la création (5–10 min)
6. **Download Config** pour récupérer le fichier kubeconfig

---

## Étape 2 – Configurer kubectl

```bash
# Remplacer le kubeconfig par défaut ou exporter
export KUBECONFIG=~/Downloads/repertoire-k8s-kubeconfig.yaml

# Ou copier dans ~/.kube/config
mkdir -p ~/.kube
cp ~/Downloads/repertoire-k8s-kubeconfig.yaml ~/.kube/config

# Vérifier
kubectl get nodes
```

---

## Étape 3 – Créer le namespace

```bash
kubectl create namespace repertoire-dev
```

---

## Étape 4 – Créer le secret Harbor pour le pull des images

Kubernetes doit s'authentifier auprès de Harbor pour télécharger les images.

```bash
kubectl create secret docker-registry harbor-creds \
  --docker-server=46.101.199.158 \
  --docker-username=github-actions \
  --docker-password=TON_MOT_DE_PASSE_HARBOR \
  -n repertoire-dev
```

Remplace `TON_MOT_DE_PASSE_HARBOR` par le mot de passe de l'utilisateur `github-actions`.

> **Important :** Harbor est en HTTP. Si kubectl refuse la connexion, ajoute `--docker-server=http://46.101.199.158` ou utilise l'IP seule (certaines versions acceptent l'IP pour HTTP).

---

## Étape 5 – Configurer Docker pour Harbor (insecure) sur le cluster

Les nœuds Kubernetes doivent pouvoir pull depuis Harbor en HTTP. Sur DigitalOcean, les nœuds sont gérés. Si le pull échoue avec "connection refused", il faudra peut-être configurer les nœuds ou utiliser un registry en HTTPS.

Pour l'instant, essaie le déploiement. Si ça échoue, voir la section Dépannage.

---

## Étape 6 – Installer le chart Helm

```bash
# Depuis la racine du projet
helm install repertoire ./helm/repertoire \
  -n repertoire-dev \
  -f helm/repertoire/values-dev.yaml
```

---

## Étape 7 – Vérifier le déploiement

```bash
kubectl get pods -n repertoire-dev
kubectl get svc -n repertoire-dev
```

Attendre que tous les pods soient `Running`.

---

## Étape 8 – Accéder à l'application

### Option A : Port-forward (test rapide)

```bash
kubectl port-forward svc/repertoire-frontend 8080:80 -n repertoire-dev
```

Ouvre **http://localhost:8080**

### Option B : LoadBalancer (DigitalOcean)

Modifier le service frontend en LoadBalancer pour obtenir une IP publique :

```bash
kubectl patch svc repertoire-frontend -n repertoire-dev -p '{"spec": {"type": "LoadBalancer"}}'
kubectl get svc -n repertoire-dev
```

L'IP externe apparaît après 1–2 minutes.

---

## Mise à jour après un nouveau push

Quand de nouvelles images sont poussées vers Harbor :

```bash
# Forcer le redéploiement pour pull les images latest
kubectl rollout restart deployment repertoire-backend repertoire-frontend -n repertoire-dev

# Ou via Helm
helm upgrade repertoire ./helm/repertoire -n repertoire-dev -f helm/repertoire/values-dev.yaml
```

---

## Dépannage

### Erreur : context deadline exceeded (timeout Helm)

Le déploiement dépasse le délai. Causes possibles :
- Les pods ne démarrent pas (voir ImagePullBackOff ci-dessous)
- MongoDB ou le backend mettent trop de temps à démarrer

**Vérifier :** `kubectl get pods -n repertoire-dev` et `kubectl describe pod <nom> -n repertoire-dev`

### Erreur : ImagePullBackOff / ErrImagePull

Les nœuds ne peuvent pas pull depuis Harbor (HTTP non sécurisé). **C'est souvent la cause du timeout.**

**Solution 1 :** Mettre Harbor en HTTPS (certificat Let's Encrypt ou auto-signé) – recommandé.

**Solution 2 :** Utiliser GitHub Container Registry (ghcr.io) ou Docker Hub pour les images.

**Solution 3 :** Sur DOKS, les nœuds utilisent containerd. Un registry HTTP peut nécessiter une configuration spécifique (non supportée nativement par DigitalOcean).

### Erreur : secret harbor-creds not found

Vérifier que le secret existe :

```bash
kubectl get secret harbor-creds -n repertoire-dev
```

### Les pods ne démarrent pas

```bash
kubectl describe pod <nom-du-pod> -n repertoire-dev
kubectl logs <nom-du-pod> -n repertoire-dev
```

---

## Déploiement automatique (CI/CD)

Pour que chaque push sur `develop` déploie automatiquement sur le cluster, voir [DEPLOY-AUTO.md](DEPLOY-AUTO.md).

---

## Récapitulatif des commandes

| Action | Commande |
|--------|----------|
| Créer namespace | `kubectl create namespace repertoire-dev` |
| Créer secret Harbor | `kubectl create secret docker-registry harbor-creds ...` |
| Installer | `helm install repertoire ./helm/repertoire -n repertoire-dev -f helm/repertoire/values-dev.yaml` |
| Mettre à jour | `helm upgrade repertoire ./helm/repertoire -n repertoire-dev -f helm/repertoire/values-dev.yaml` |
| Port-forward | `kubectl port-forward svc/repertoire-frontend 8080:80 -n repertoire-dev` |
| Supprimer | `helm uninstall repertoire -n repertoire-dev` |
