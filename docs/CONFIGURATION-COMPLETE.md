# Configuration complète – Répertoire DevOps (Furious Ducks)

Guide étape par étape pour configurer l'infrastructure selon le plan de travail.

---

## Vue d'ensemble

| Phase | Composant | Où |
|-------|-----------|-----|
| 1 | Pipeline CI/CD | GitHub Actions |
| 2 | Registry Docker (Harbor) | Droplet |
| 3 | Orchestration Kubernetes | DigitalOcean (DOKS) |
| 4 | Environnements (dev, preprod, prod) | Droplet + K8s |
| 5 | Monitoring (optionnel) | Prometheus, Grafana |
| 6 | Sauvegarde (optionnel) | Restic, MinIO |
| 7 | Secrets (optionnel) | Vault |

---

# ÉTAPE 1 : DigitalOcean – Cluster Kubernetes

## À faire sur DigitalOcean

1. **digitalocean.com** → **Kubernetes** → **Create Cluster**
2. **Region** : Frankfurt ou Amsterdam
3. **Node plan** : Basic – 2 vCPU, 4 Go RAM (1 nœud)
4. **Cluster name** : `repertoire-cluster`
5. **Create Cluster** → attendre 5–10 min
6. **Download Config** → sauvegarder le fichier (tu en auras besoin à l'étape 3)

---

# ÉTAPE 2 : DigitalOcean – Traefik (optionnel pour l'instant)

Avec `ENABLE_K8S_INGRESS=false`, le frontend utilise un LoadBalancer direct. **Tu peux sauter cette étape** pour commencer.

Si tu veux installer Traefik (pour plus tard, avec domaines) :

```bash
# Depuis ta machine Windows (kubectl configuré) ou DigitalOcean Cloud Shell
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm install traefik traefik/traefik -n traefik --create-namespace
```

---

# ÉTAPE 3 : GitHub – Secrets

## À faire sur GitHub

**Repo** → **Settings** → **Secrets and variables** → **Actions** → **Secrets** → **New repository secret**

| Secret | Valeur |
|--------|--------|
| `HARBOR_URL` | `46.101.199.158:4443/repertoire` |
| `HARBOR_USERNAME` | `admin` |
| `HARBOR_PASSWORD` | *ton mot de passe Harbor* |
| `HARBOR_CA_CERT` | *base64 du certificat* (voir ci-dessous) |
| `KUBE_CONFIG` | *contenu complet du fichier kubeconfig téléchargé* |
| `DROPLET_IP` | `46.101.199.158` |
| `DROPLET_USER` | `root` |
| `DROPLET_SSH_KEY` | *ta clé SSH privée* |

### Obtenir HARBOR_CA_CERT

Sur le Droplet :
```bash
base64 -w 0 /root/harbor/certs/server.crt
```
Copier la sortie et la coller dans le secret.

---

# ÉTAPE 4 : GitHub – Variables

## À faire sur GitHub

**Repo** → **Settings** → **Secrets and variables** → **Actions** → **Variables** → **New repository variable**

| Variable | Valeur |
|----------|--------|
| `ENABLE_HARBOR` | `true` |
| `ENABLE_KUBERNETES` | `true` |
| `ENABLE_HARBOR_CA_CERT` | `true` |
| `ENABLE_K8S_INGRESS` | `false` *(pour commencer, accès par IP)* |
| `ENABLE_DROPLET` | `true` *(déploiement develop sur Droplet)* |

> Les variables `DOMAIN_*` et `LETSENCRYPT_EMAIL` peuvent rester vides pour l'instant.

---

# ÉTAPE 5 : Vérifier Harbor sur le Droplet

## À faire

Harbor doit tourner sur le Droplet (port 4443). Vérifier :

```bash
ssh root@46.101.199.158
docker ps | grep harbor
```

Si Harbor n'est pas installé, suivre `docs/HARBOR-INSTALLATION-DROPLET.md`.

---

# ÉTAPE 6 : Tester le déploiement

## À faire

1. **Push sur `develop`** → build + push-registry + deploy-k8s (namespace dev) + deploy-droplet
2. **Push sur `preprod`** → build + push-registry + deploy-k8s (namespace preprod)
3. **Push sur `prod`** → build + push-registry + deploy-k8s (namespace prod)

## Récupérer l'IP d'accès

Sur ta machine Windows (avec kubectl configuré) :

```bash
kubectl get svc -n prod
```

L'**EXTERNAL-IP** du service `frontend` est l'URL d'accès : `http://IP`

---

# Récapitulatif des étapes

| # | Où | Action |
|---|-----|--------|
| 1 | DigitalOcean | Créer cluster DOKS, télécharger kubeconfig |
| 2 | DigitalOcean / kubectl | *(Optionnel)* Installer Traefik |
| 3 | GitHub | Ajouter les secrets |
| 4 | GitHub | Ajouter les variables |
| 5 | Droplet | Vérifier Harbor |
| 6 | Git | Push sur develop/preprod/prod pour tester |

---

*Configuration complète – Furious Ducks*
