# HTTPS + Domaine avec Let's Encrypt

Ce guide configure HTTPS automatique avec Traefik et Let's Encrypt pour le Répertoire Téléphonique.

---

## Prérequis

1. **Un nom de domaine** (ex: `repertoire.example.com`)
2. **DNS configuré** : enregistrement A pointant vers l'IP du Droplet (`165.22.171.147`)
3. **Ports 80 et 443** ouverts sur le firewall

---

## 1. Configurer le DNS

Chez ton registrar (OVH, Gandi, Cloudflare, etc.) :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | repertoire | 165.22.171.147 | 300 |

Ou si tu utilises un sous-domaine : `repertoire.tondomaine.com` → A → 165.22.171.147

**Vérifier** : `ping repertoire.example.com` doit retourner l'IP du Droplet.

---

## 2. Créer le fichier .env

Sur le Droplet, dans `/root/repertoire` :

```bash
# .env (ou ajouter à l'existant)
DOMAIN=repertoire.example.com
LETSENCRYPT_EMAIL=ton-email@example.com
```

**Important** : utilise une vraie adresse email pour Let's Encrypt (notifications d'expiration).

---

## 3. Démarrer avec HTTPS

```bash
cd /root/repertoire
export $(grep -v '^#' .env | xargs)

# Avec images Harbor (orchestré)
docker compose -f docker-compose.prod.registry.yml -f docker-compose.https.yml up -d

# Ou avec build local
docker compose -f docker-compose.prod.yml -f docker-compose.https.yml up -d
```

---

## 4. Vérifier

1. **Premier démarrage** : Let's Encrypt peut prendre 1-2 minutes pour émettre le certificat
2. **Accès** : https://repertoire.example.com
3. **Redirect HTTP → HTTPS** : http://repertoire.example.com redirige automatiquement

---

## 5. Renouvellement automatique

Traefik renouvelle les certificats Let's Encrypt automatiquement (avant expiration à 90 jours). Aucune action requise.

---

## 6. Intégration au CD (optionnel)

Pour activer HTTPS dans le déploiement automatique, ajouter dans le workflow ou sur le Droplet :

**Variables GitHub** (si tu veux que le CD déploie avec HTTPS) :
- `ENABLE_HTTPS` = `true`

**Sur le Droplet** : le fichier `.env` doit contenir `DOMAIN` et `LETSENCRYPT_EMAIL`.

---

## Dépannage

### Certificat non émis
- Vérifier que le DNS pointe bien vers le Droplet
- Vérifier que les ports 80 et 443 sont ouverts : `ufw status` ou `iptables -L`
- Consulter les logs : `docker logs repertoire-traefik`

### Erreur "Too many certificates"
Let's Encrypt limite à 5 certificats par domaine par semaine. Attendre ou utiliser le staging pour tester :
- Dans `traefik.yml`, ajouter `caServer: "https://acme-staging-v02.api.letsencrypt.org/directory"` dans la config ACME

### Harbor et HTTPS
Harbor reste sur le port 4443. L'accès à l'app en HTTPS n'affecte pas Harbor.
