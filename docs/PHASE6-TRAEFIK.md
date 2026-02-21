# Phase 6 – Traefik + Ingress + TLS

## Ce qui est déployé

- **Traefik** : Ingress controller (namespace `traefik`)
- **cert-manager** : Gestion des certificats Let's Encrypt
- **Ingress** : Exposition du frontend avec TLS

## Configuration requise

### 1. Domaine DuckDNS

1. Va sur **duckdns.org**
2. Ajoute un domaine : `repertoire-app` → `repertoire-app.duckdns.org`
3. Mets à jour l'IP avec l'IP du **Load Balancer Traefik** (voir ci-dessous)

### 2. Obtenir l'IP du Load Balancer

Après le premier déploiement :

```bash
kubectl get svc -n traefik
```

La colonne **EXTERNAL-IP** du service `traefik` donne l'IP à configurer dans DuckDNS.

### 3. Variable GitHub (optionnel)

- **LETSENCRYPT_EMAIL** : ton email pour Let's Encrypt (défaut : thetiptopprojectgroup@gmail.com)

## Accès

Une fois le domaine configuré et le certificat émis (~2 min) :

- **https://repertoire-app.duckdns.org**

## Ordre de déploiement

1. Premier push → Traefik + cert-manager installés
2. Récupère l'IP Traefik → configure DuckDNS
3. Push suivant (ou attendre) → Ingress créé, cert-manager obtient le certificat
4. Accès via HTTPS
