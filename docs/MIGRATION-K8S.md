# Migration vers Kubernetes (préprod + prod)

Ce guide décrit la migration du déploiement du Droplet (Docker Compose) vers Kubernetes (DOKS) pour les environnements **preprod** et **prod**.

---

## Vue d'ensemble

| Avant | Après |
|-------|-------|
| Droplet + Docker Compose (preprod, prod) | Kubernetes (DOKS) pour preprod et prod |
| Harbor sur Droplet | Harbor (inchangé) – images poussées puis déployées sur K8s |
| deploy-droplet pour toutes les branches | deploy-droplet uniquement pour **develop** (optionnel) |

---

## Étape 1 : Configurer les variables et secrets GitHub

### Variables (Settings → Actions → Variables)

| Variable | Valeur | Description |
|----------|--------|-------------|
| `ENABLE_HARBOR` | `true` | Active le push des images vers Harbor |
| `ENABLE_KUBERNETES` | `true` | Active le déploiement sur Kubernetes |
| `ENABLE_HARBOR_CA_CERT` | `true` | Si Harbor utilise un certificat auto-signé |
| `ENABLE_K8S_INGRESS` | `true` | Active l'Ingress Traefik |
| `DOMAIN_PREPROD` | `preprod.tondomaine.com` | Domaine preprod (HTTPS Let's Encrypt) |
| `DOMAIN_PROD` | `prod.tondomaine.com` | Domaine prod (HTTPS Let's Encrypt) |
| `LETSENCRYPT_EMAIL` | `ton@email.com` | Email pour Let's Encrypt |
| `ENABLE_DROPLET` | `true` ou `false` | Si `true`, déploie sur Droplet **uniquement pour develop** (preprod/prod → K8s) |

### Secrets (Settings → Actions → Secrets)

| Secret | Valeur |
|--------|--------|
| `HARBOR_URL` | `165.22.171.147:4443/repertoire` *(sans https://)* |
| `HARBOR_USERNAME` | `admin` |
| `HARBOR_PASSWORD` | Mot de passe Harbor |
| `HARBOR_CA_CERT` | Certificat Harbor en base64 |
| **`KUBE_CONFIG`** | Contenu du fichier kubeconfig du cluster DOKS |

### Obtenir le kubeconfig DOKS

1. DigitalOcean → Kubernetes → ton cluster → **Download Config**
2. Copie le contenu complet du fichier
3. Colle-le dans le secret `KUBE_CONFIG` (Settings → Secrets)

---

## Étape 2 : Prérequis cluster Kubernetes

- **Cluster DOKS** créé sur DigitalOcean
- **Traefik** installé (si `ENABLE_K8S_INGRESS=true`) :
  ```bash
  helm repo add traefik https://traefik.github.io/charts
  helm install traefik traefik/traefik -n traefik --create-namespace
  ```

> **Note Ingress** : Si `ENABLE_K8S_INGRESS=false`, le frontend utilise un Service LoadBalancer (IP externe directe). Si `true`, Traefik Ingress route le trafic. Pour éviter deux LoadBalancers (coût), tu peux passer le Service frontend en ClusterIP dans `k8s/frontend-deployment.yaml` quand Ingress est activé.

---

## Étape 3 : Flux de déploiement

| Branche | build | push-registry | deploy-k8s | deploy-droplet |
|---------|-------|---------------|------------|----------------|
| develop | ✅ | ✅ | ✅ (namespace dev) | ✅ *(si ENABLE_DROPLET=true)* |
| preprod | ✅ | ✅ | ✅ (namespace preprod) | ❌ |
| prod | ✅ | ✅ | ✅ (namespace prod) | ❌ |

---

## Étape 4 : Vérification après migration

1. Push sur `preprod` ou `prod`
2. Vérifier les jobs GitHub Actions : `build` → `push-registry` → `deploy-k8s`
3. Récupérer l'IP d'accès :
   ```bash
   kubectl get svc -n preprod   # ou -n prod
   # Si LoadBalancer frontend : IP externe
   # Si Ingress : kubectl get svc -n traefik
   ```

---

## Nettoyage (à la fin)

Une fois la migration validée sur preprod et prod, tu pourras supprimer ou simplifier :

| Élément | Action |
|---------|--------|
| Job `deploy-droplet` | Supprimer entièrement si plus de déploiement Droplet, ou garder pour develop |
| `docker-compose.prod.yml` | Garder pour référence locale ou supprimer si tout est sur K8s |
| `docker-compose.https.yml` | Supprimer si HTTPS géré par Ingress/K8s |
| `docker-compose.prod.registry.yml` | Supprimer si plus utilisé |
| `docs/DEPLOIEMENT-DROPLET.md` | Mettre à jour ou archiver |
| Variable `ENABLE_DROPLET` | Passer à `false` ou supprimer si deploy-droplet retiré |

---

*Migration Kubernetes – préprod et prod*
