# Domaines pour prod et preprod (Kubernetes)

Ce guide configure des noms de domaine avec HTTPS (Let's Encrypt) pour les environnements preprod et prod sur Kubernetes.

---

## Vue d'ensemble

| Environnement | Domaine exemple | Exemple URL |
|--------------|-----------------|-------------|
| preprod | preprod.tondomaine.com | https://preprod.tondomaine.com |
| prod | prod.tondomaine.com ou tondomaine.com | https://prod.tondomaine.com |

---

## Étape 1 : Obtenir un nom de domaine

**Options :**
- **DigitalOcean** : Domains (à partir de ~10 €/an)
- **OVH, Gandi, Namecheap** : bon marché
- **Cloudflare** : prix coûtant + DNS gratuit

Tu peux utiliser un domaine que tu possèdes déjà ou en acheter un nouveau.

---

## Étape 2 : Configurer le DNS (DigitalOcean ou autre)

Une fois le cluster K8s déployé, récupère **l’IP du LoadBalancer Traefik** :

```bash
kubectl get svc -n traefik
```

L’IP externe (EXTERNAL-IP) est celle à utiliser pour les enregistrements DNS.

### Enregistrements A à créer

| Type | Nom (sous-domaine) | Valeur (IP) | TTL |
|------|--------------------|-------------|-----|
| A | preprod | IP_DU_LOADBALANCER_TRAEFIK | 300 |
| A | prod | IP_DU_LOADBALANCER_TRAEFIK | 300 |

**Exemples :**
- `preprod.tondomaine.com` → enregistrement A : nom = `preprod`, valeur = IP
- `prod.tondomaine.com` → enregistrement A : nom = `prod`, valeur = IP

**Sur DigitalOcean :**
1. Networking → Domains → Add Domain (ou ton domaine existant)
2. Add Record → Type A
3. Hostname : `preprod` (ou `prod`)
4. Value : IP du LoadBalancer Traefik
5. TTL : 300

**Vérification :**
```bash
ping preprod.tondomaine.com
ping prod.tondomaine.com
```
Les deux doivent renvoyer la même IP (celle du LoadBalancer Traefik).

---

## Étape 3 : Variables GitHub

**Settings → Actions → Variables**

| Variable | Valeur | Description |
|----------|--------|-------------|
| `ENABLE_K8S_INGRESS` | `true` | Active l’Ingress Traefik |
| `DOMAIN_PREPROD` | `preprod.tondomaine.com` | Domaine preprod |
| `DOMAIN_PROD` | `prod.tondomaine.com` | Domaine prod |
| `LETSENCRYPT_EMAIL` | `ton@email.com` | Email pour Let's Encrypt (notifications) |

> **Important** : utilise une vraie adresse email pour Let's Encrypt.

---

## Étape 4 : Prérequis sur le cluster Kubernetes

### 1. Traefik (Ingress Controller)

```bash
helm repo add traefik https://traefik.github.io/charts
helm install traefik traefik/traefik -n traefik --create-namespace
```

### 2. cert-manager (certificats Let's Encrypt)

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace \
  --set installCRDs=true
```

Vérifier :
```bash
kubectl get pods -n cert-manager
kubectl get clusterissuer
```

---

## Étape 5 : Flux de déploiement

Lors d’un push sur `preprod` ou `prod` :

1. **build** → **push-registry** → **deploy-k8s**
2. Le workflow applique l’Ingress avec le domaine configuré
3. cert-manager demande un certificat Let's Encrypt (HTTP-01)
4. Après 1–2 minutes : accès en HTTPS

---

## Dépannage

### Le certificat n’est pas émis
- Vérifier que le DNS pointe vers l’IP du LoadBalancer Traefik
- Vérifier que les ports 80 et 443 sont ouverts (LoadBalancer les expose)
- Consulter les logs : `kubectl logs -n cert-manager -l app=cert-manager`

### Erreur "Too many certificates"
Let's Encrypt limite à 5 certificats par domaine par semaine. Pour tester, utiliser le ClusterIssuer `letsencrypt-staging` dans `k8s/ingress-traefik-tls.yaml` (annotation `letsencrypt-staging` au lieu de `letsencrypt-prod`).

### Le domaine ne répond pas
- Vérifier que Traefik tourne : `kubectl get svc -n traefik`
- Vérifier l’Ingress : `kubectl get ingress -n preprod` (ou `-n prod`)

---

*Domaines Kubernetes – prod et preprod*
