# Phase 4 – Configuration Harbor (Registry privé)

## Vue d'ensemble

Harbor est un registry Docker privé qui permet de stocker et distribuer les images de manière sécurisée. Ce projet utilise Harbor avec **3 projets distincts** selon l'environnement :

| Branche   | Projet Harbor |
|-----------|----------------|
| `develop` | `dev`          |
| `preprod` | `preprod`      |
| `prod`    | `prod`         |

---

## 1. Installation Harbor sur le VPS

### Prérequis

- Docker et Docker Compose installés
- Domaine ou IP avec accès HTTPS (recommandé)
- Minimum 4 Go RAM, 2 vCPU

### Installation via Docker Compose (officiel)

```bash
# Télécharger l'installateur Harbor
curl -sL https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz -o harbor.tgz
tar xzf harbor.tgz
cd harbor

# Configurer (éditer harbor.yml)
cp harbor.yml.tmpl harbor.yml
# Modifier : hostname, port, certificats SSL, mot de passe admin

# Installer
./install.sh
```

### Installation via Helm (Kubernetes)

Si vous avez déjà un cluster K8s (Phase 5) :

```bash
helm repo add harbor https://helm.goharbor.io
helm install harbor harbor/harbor -f harbor-values.yaml
```

---

## 2. Création des projets Harbor

Dans l'interface Harbor (https://votre-harbor.com) :

1. **Créer le projet `dev`**
   - Access Level : Private
   - Activer "Vulnerability scanning"
   - Quotas : selon vos besoins

2. **Créer le projet `preprod`**
   - Même configuration que dev

3. **Créer le projet `prod`**
   - Access Level : Private
   - Vulnerability scanning : obligatoire
   - Quotas stricts recommandés

4. **Créer un utilisateur robot** (pour la CI) :
   - Robot Account → New Robot Account
   - Permissions : Push & Pull sur chaque projet
   - Copier le token généré (à mettre dans les secrets GitHub)

---

## 3. Configuration des secrets GitHub

Dans **Settings → Secrets and variables → Actions** du dépôt :

| Secret          | Description                    | Exemple                    |
|-----------------|--------------------------------|----------------------------|
| `HARBOR_URL`    | URL du registry (sans https://)| `harbor.mondomaine.com`    |
| `HARBOR_USERNAME` | Username ou robot account   | `robot$repertoire-ci`      |
| `HARBOR_PASSWORD` | Mot de passe / token         | `***`                      |

> **Important :** Ne commitez jamais ces valeurs. Utilisez uniquement les secrets GitHub.

---

## 4. Comportement de la CI

Quand les secrets Harbor sont configurés, le workflow CI :

- **Sur push vers `develop`** : build + push vers `harbor.xxx/dev/repertoire-backend:develop-<sha>` et `.../repertoire-frontend:develop-<sha>`
- **Sur push vers `preprod`** : push vers le projet `preprod`
- **Sur push vers `prod`** : push vers le projet `prod`

Si les secrets ne sont pas configurés, le job `push-to-harbor` est ignoré (les autres jobs continuent).

---

## 5. Scan des vulnérabilités

Harbor intègre Trivy/Clair pour scanner les images. Configurer dans :

- **Administration → Interrogation Services** : activer le scanner
- **Projet → Configuration** : définir "Prevent vulnerable images from being pulled" (recommandé pour prod)

---

## 6. Gestion des accès

- **Dev** : équipe dev + CI
- **Preprod** : équipe dev + ops
- **Prod** : ops uniquement, accès restreint

---

## Références

- [Documentation Harbor](https://goharbor.io/docs/)
- [Harbor GitHub](https://github.com/goharbor/harbor)
