# Phase 4 – Configuration Harbor (guide complet)

> **Tu utilises DigitalOcean ?** → Voir le [guide pas à pas DigitalOcean](HARBOR-DIGITALOCEAN.md)

Ce guide détaille **étape par étape** l’installation et la configuration de Harbor pour que le push des images depuis la CI fonctionne.

---

## Vue d’ensemble

| Branche   | Projet Harbor | Images poussées |
|-----------|---------------|----------------|
| `develop` | `dev`         | `harbor.xxx/dev/repertoire-backend`, `.../repertoire-frontend` |
| `preprod` | `preprod`     | idem avec projet `preprod` |
| `prod`    | `prod`        | idem avec projet `prod` |

---

## Étape 1 – Installation Harbor sur le VPS

### 1.1 Prérequis

- **VPS** : 4 Go RAM minimum, 2 vCPU
- **Docker** et **Docker Compose** installés
- **Domaine** ou IP publique (ex. `harbor.mondomaine.com`)

### 1.2 Téléchargement et extraction

```bash
cd /opt
curl -sL https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz -o harbor.tgz
tar xzf harbor.tgz
cd harbor
```

### 1.3 Configuration de `harbor.yml`

```bash
cp harbor.yml.tmpl harbor.yml
nano harbor.yml   # ou vim / vi
```

**Paramètres obligatoires à modifier :**

```yaml
# Hostname : IP ou domaine de votre serveur (SANS https://)
hostname: harbor.mondomaine.com
# OU pour test local avec IP :
# hostname: 192.168.1.100

# Mot de passe admin (à changer en production)
harbor_admin_password: VotreMotDePasseSecurise123

# HTTPS (recommandé en production)
# Si vous n'avez pas de certificat, commentez la section https et utilisez http :
http:
  port: 80

# Si vous avez des certificats SSL :
# https:
#   port: 443
#   certificate: /chemin/vers/cert.pem
#   private_key: /chemin/vers/key.pem
```

**Exemple minimal pour test (HTTP uniquement) :**

```yaml
hostname: 192.168.1.100
harbor_admin_password: Harbor12345
http:
  port: 80
```

### 1.4 Lancement de l’installation

```bash
./install.sh
```

Attendre la fin de l’installation. Harbor sera accessible sur `http://hostname` (ou `https://` si configuré).

### 1.5 Vérification

```bash
docker ps
# Vous devez voir les conteneurs Harbor (core, registry, nginx, etc.)
```

Ouvrir dans un navigateur : `http://votre-hostname`  
Identifiants par défaut : `admin` / mot de passe défini dans `harbor_admin_password`.

---

## Étape 2 – Création des projets Harbor

Dans l’interface web Harbor :

1. **Projet `dev`**
   - **Projects** → **New Project**
   - Name : `dev`
   - Access Level : **Private**
   - **Create**

2. **Projet `preprod`**
   - Même procédure, name : `preprod`

3. **Projet `prod`**
   - Même procédure, name : `prod`

---

## Étape 3 – Compte pour la CI (robot account)

Deux possibilités : **robot account par projet** ou **utilisateur dédié**.

### Option A – Robot account (recommandé)

Un robot par projet, avec un token par projet. Pour simplifier, on utilise **un seul robot** dans le projet `dev` pour commencer, puis on duplique pour preprod/prod si besoin.

1. Aller dans **Projects** → **dev** → **Robot Accounts** → **New Robot Account**
2. Name : `ci`
3. Permissions : cocher **Push Artifact** et **Pull Artifact**
4. **Add**
5. **Copier le token** affiché (une seule fois). Format : longue chaîne alphanumérique.

Le username sera : `robot$dev+ci`  
Le password sera : le token copié.

**Pour preprod et prod** : créer les robots `robot$preprod+ci` et `robot$prod+ci` de la même façon.

**Problème** : la CI pousse vers un seul projet selon la branche. Il faut donc **un seul compte avec accès aux 3 projets**. → utiliser l’**Option B**.

### Option B – Utilisateur dédié (recommandé pour 3 projets)

1. **User Management** → **Create User**
2. Username : `github-actions` (ou `ci-bot`)
3. Full Name : `CI/CD`
4. Password : mot de passe fort
5. **Create**

6. Pour chaque projet (**dev**, **preprod**, **prod**) :
   - **Projects** → **dev** → **Members** → **+ New Member**
   - User : `github-actions`
   - Role : **Developer** (permet push et pull)
   - **Add**

Répéter pour `preprod` et `prod`.

**Identifiants pour GitHub :**
- Username : `github-actions`
- Password : le mot de passe défini

---

## Étape 4 – Configuration GitHub

### 4.1 Secrets (Settings → Secrets and variables → Actions)

Créer les secrets suivants :

| Nom | Valeur | Exemple |
|-----|--------|---------|
| `HARBOR_URL` | Hostname Harbor **sans** `http://` ni `https://` | `harbor.mondomaine.com` ou `192.168.1.100` |
| `HARBOR_USERNAME` | Username du robot ou de l’utilisateur | `robot$dev+ci` ou `github-actions` |
| `HARBOR_PASSWORD` | Token (robot) ou mot de passe (utilisateur) | `***` |

**Important :**
- Pas de `http://` ni `https://` dans `HARBOR_URL`
- Si vous utilisez un robot par projet, il faudra des secrets différents par environnement (avancé)

### 4.2 Variable pour activer le push

1. **Settings** → **Secrets and variables** → **Actions**
2. Onglet **Variables** → **New repository variable**
3. Name : `HARBOR_ENABLED`
4. Value : `true`
5. **Add variable**

Sans cette variable, le job `push-to-harbor` ne s’exécute pas (les autres jobs continuent).

---

## Étape 5 – Vérification locale (optionnel)

Tester le login Docker depuis votre machine :

```bash
# Remplacer par vos valeurs
docker login harbor.mondomaine.com
# Username: github-actions (ou robot$dev+ci)
# Password: ***
```

Puis tester un push manuel :

```bash
docker tag repertoire-backend:test harbor.mondomaine.com/dev/repertoire-backend:test
docker push harbor.mondomaine.com/dev/repertoire-backend:test
```

---

## Étape 6 – Déclencher la CI

1. Pousser un commit sur `develop` :
   ```bash
   git add .
   git commit -m "feat: config Harbor"
   git push origin develop
   ```

2. Aller dans **Actions** sur GitHub et suivre l’exécution du workflow.

3. Si le job `push-to-harbor` échoue, consulter les logs pour le message d’erreur.

---

## Dépannage

### Erreur : `unauthorized: authentication required`

- Vérifier `HARBOR_USERNAME` et `HARBOR_PASSWORD`
- Pour un robot : username = `robot$dev+ci` (avec le `$` et le `+`)
- Vérifier que le projet (`dev`, `preprod`, `prod`) existe et que le compte a les droits **Developer** ou **Push**

### Erreur : `connection refused` ou `no such host`

- Vérifier que `HARBOR_URL` est correct (sans `http://`)
- Vérifier que le serveur Harbor est joignable depuis Internet (ou depuis les runners GitHub)
- Si Harbor est en local/VPN : les runners GitHub ne pourront pas s’y connecter

### Erreur : `x509: certificate signed by unknown authority`

- Harbor utilise un certificat auto-signé
- Option 1 : utiliser un certificat Let’s Encrypt
- Option 2 : ajouter `insecure: true` dans la config du registry (non recommandé en prod)

### Le job `push-to-harbor` ne s’exécute pas

- Vérifier que la variable `HARBOR_ENABLED` existe et vaut `true`
- Vérifier que le workflow est déclenché par un **push** (pas une PR)
- Vérifier que la branche est `develop`, `preprod` ou `prod`

### Erreur : `no matching manifest for linux/amd64`

- Les runners GitHub sont en `linux/amd64`
- Vérifier que les images sont buildées pour cette plateforme (c’est le cas par défaut avec Docker Buildx)

---

## Récapitulatif des configurations

| Élément | Où | Valeur |
|---------|-----|--------|
| Harbor hostname | `harbor.yml` | `harbor.mondomaine.com` ou IP |
| Projets | Harbor UI | `dev`, `preprod`, `prod` |
| Compte CI | Harbor UI | User `github-actions` ou robot `robot$dev+ci` |
| `HARBOR_URL` | GitHub Secrets | Hostname sans `http://` |
| `HARBOR_USERNAME` | GitHub Secrets | `github-actions` ou `robot$dev+ci` |
| `HARBOR_PASSWORD` | GitHub Secrets | Mot de passe ou token |
| `HARBOR_ENABLED` | GitHub Variables | `true` |

---

## Références

- [Documentation Harbor](https://goharbor.io/docs/)
- [Robot Accounts Harbor](https://goharbor.io/docs/latest/working-with-projects/project-configuration/create-robot-accounts/)
