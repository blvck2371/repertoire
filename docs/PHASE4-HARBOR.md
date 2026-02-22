# Phase 4 – Harbor (checklist complète)

Checklist pour installer et configurer Harbor (registry Docker privé).

---

## Vue d'ensemble

| Branche | Projet Harbor | Images |
|---------|---------------|--------|
| `develop` | `dev` | repertoire-backend, repertoire-frontend, repertoire-backup, mongo |
| `preprod` | `preprod` | idem |
| `prod` | `prod` | idem |

---

## Checklist

### 1. Installation Harbor

- [ ] Créer un Droplet DigitalOcean (4 Go RAM, 2 vCPU) ou VPS
- [ ] Installer Docker + Docker Compose
- [ ] Télécharger Harbor v2.10+ : [HARBOR-SETUP.md](HARBOR-SETUP.md) ou [HARBOR-DIGITALOCEAN.md](HARBOR-DIGITALOCEAN.md)
- [ ] Configurer `harbor.yml` (hostname, mot de passe admin)
- [ ] Lancer `./install.sh` (ou `./install.sh --with-trivy` pour le scan vulnérabilités)
- [ ] Ouvrir les ports 80 et 443 dans le pare-feu

### 2. Projets Harbor

- [ ] Créer le projet **dev** (Private)
- [ ] Créer le projet **preprod** (Private)
- [ ] Créer le projet **prod** (Private)

### 3. Utilisateur CI

- [ ] **User Management** → **Create User**
  - Username : `github-actions`
  - Password : mot de passe fort
- [ ] Pour chaque projet (dev, preprod, prod) : **Members** → **+ New Member** → `github-actions` avec rôle **Developer**

### 4. GitHub

- [ ] **Variables** : `HARBOR_ENABLED` = `true`
- [ ] **Secrets** :
  - `HARBOR_URL` = hostname (sans http://) — ex. `repertoire-harbor.duckdns.org` ou IP
  - `HARBOR_USERNAME` = `github-actions`
  - `HARBOR_PASSWORD` = mot de passe de l'utilisateur

### 5. HTTPS (recommandé)

- [ ] Suivre [HARBOR-HTTPS.md](HARBOR-HTTPS.md) (Let's Encrypt ou certificat auto-signé)
- [ ] **Variables** : `HARBOR_HTTPS` = `true` (pour éviter insecure-registries)

### 6. Scan des vulnérabilités (optionnel)

- [ ] Réinstaller Harbor avec Trivy : `./install.sh --with-trivy`
- [ ] Dans Harbor : **Administration** → **Interrogation Services** → configurer Trivy
- [ ] Activer le scan automatique par projet : **Projects** → **dev** → **Configuration** → **Vulnerability Scanning** → **Scan on push**

### 7. Gestion des accès (optionnel)

- [ ] Créer des **Robot Accounts** par projet si besoin d'accès séparés
- [ ] Ou garder l'utilisateur `github-actions` avec accès aux 3 projets

---

## Vérification

```bash
# Test login local
docker login REPERTOIRE-HARBOR.duckdns.org
# Username: github-actions
# Password: ***

# Push manuel (optionnel)
docker tag repertoire-backend:test REPERTOIRE-HARBOR.duckdns.org/dev/repertoire-backend:test
docker push REPERTOIRE-HARBOR.duckdns.org/dev/repertoire-backend:test
```

Puis push sur `develop` → les images doivent apparaître dans Harbor → **dev**.

---

## Liens

| Document | Contenu |
|----------|---------|
| [HARBOR-SETUP.md](HARBOR-SETUP.md) | Guide générique |
| [HARBOR-DIGITALOCEAN.md](HARBOR-DIGITALOCEAN.md) | Guide pas à pas DigitalOcean |
| [HARBOR-HTTPS.md](HARBOR-HTTPS.md) | Mise en place HTTPS |
| [ACCESS-CREDENTIALS.md](ACCESS-CREDENTIALS.md) | Identifiants Harbor |
