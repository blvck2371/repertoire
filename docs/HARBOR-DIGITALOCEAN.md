# Harbor sur DigitalOcean – Guide pas à pas

Ce guide détaille **chaque étape** pour installer Harbor sur un Droplet DigitalOcean et connecter la CI GitHub.

---

## Étape 1 – Créer un Droplet DigitalOcean

1. Connecte-toi sur [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Clique sur **Create** → **Droplets**
3. Configure :
   - **Image** : Ubuntu 22.04 (LTS)
   - **Plan** : Basic → **Regular** → 4 Go RAM / 2 vCPU (~24 $/mois)
   - **Datacenter** : celui le plus proche de toi (ex. Frankfurt)
   - **Authentication** : SSH Key (recommandé) ou Password
4. Clique sur **Create Droplet**
5. Note l’**IP publique** du Droplet (ex. `164.92.xxx.xxx`)

---

## Étape 2 – Se connecter au serveur

Depuis ton PC (PowerShell ou terminal) :

```bash
ssh root@164.92.xxx.xxx
```

Remplace `164.92.xxx.xxx` par l’IP de ton Droplet.

---

## Étape 3 – Installer Docker

Sur le serveur (en SSH) :

```bash
# Mise à jour
apt update && apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com | sh

# Démarrer Docker
systemctl enable docker
systemctl start docker

# Vérifier
docker --version
```

---

## Étape 4 – Installer Docker Compose

```bash
apt install docker-compose-plugin -y
docker compose version
```

---

## Étape 5 – Télécharger et installer Harbor

```bash
cd /opt
curl -sL https://github.com/goharbor/harbor/releases/download/v2.10.0/harbor-offline-installer-v2.10.0.tgz -o harbor.tgz
tar xzf harbor.tgz
cd harbor
```

---

## Étape 6 – Configurer Harbor

```bash
cp harbor.yml.tmpl harbor.yml
nano harbor.yml
```

Modifie ces lignes (remplace `164.92.xxx.xxx` par ton IP) :

```yaml
# Ligne ~7 : hostname = IP de ton Droplet
hostname: 164.92.xxx.xxx

# Ligne ~59 : mot de passe admin (à changer)
harbor_admin_password: TonMotDePasseAdmin123

# Lignes ~13-17 : garder HTTP pour commencer (plus simple)
http:
  port: 80

# Si une section https existe, commente-la avec #
# https:
#   port: 443
#   ...
```

Sauvegarde : `Ctrl+O`, `Entrée`, puis `Ctrl+X`.

---

## Étape 7 – Lancer Harbor

```bash
./install.sh
```

Attendre 2 à 5 minutes. À la fin, tu dois voir un message de succès.

---

## Étape 8 – Ouvrir le port 80 dans le pare-feu DigitalOcean

1. Dans DigitalOcean : **Networking** → **Firewalls**
2. Clique sur **Create Firewall**
3. **Inbound Rules** :
   - HTTP (port 80) – Allow
   - HTTPS (port 443) – Allow (pour plus tard)
   - SSH (port 22) – Allow
4. **Apply to Droplets** : sélectionne ton Droplet
5. **Create Firewall**

---

## Étape 9 – Accéder à Harbor dans le navigateur

Ouvre : `http://164.92.xxx.xxx` (ton IP)

- **Username** : `admin`
- **Password** : celui défini dans `harbor_admin_password`

---

## Étape 10 – Créer les projets dans Harbor

1. **Projects** → **New Project**
2. **dev** :
   - Name : `dev`
   - Access Level : Private
   - **Create**
3. Répète pour **preprod** et **prod**

---

## Étape 11 – Créer l’utilisateur pour la CI

1. **Administration** (icône engrenage en bas à gauche) → **User Management**
2. **Create User**
   - Username : `github-actions`
   - Full Name : `CI GitHub`
   - Password : choisis un mot de passe fort (ex. `MaCI2024!Secret`)
   - **Create**

3. Donner les droits à cet utilisateur sur chaque projet :
   - **Projects** → **dev** → **Members** → **+ New Member**
   - User : `github-actions`
   - Role : **Developer**
   - **Add**
   - Répète pour **preprod** et **prod**

---

## Étape 12 – Configurer GitHub

1. Va sur ton dépôt GitHub → **Settings** → **Secrets and variables** → **Actions**

2. **Variables** (onglet Variables) :
   - **New repository variable**
   - Name : `HARBOR_ENABLED`
   - Value : `true`
   - **Add variable**

3. **Secrets** (onglet Secrets) :
   - **New repository secret**
   - Name : `HARBOR_URL`  
     Value : `164.92.xxx.xxx` (ton IP, **sans** http://)
   - **Add secret**

   - **New repository secret**
   - Name : `HARBOR_USERNAME`  
     Value : `github-actions`
   - **Add secret**

   - **New repository secret**
   - Name : `HARBOR_PASSWORD`  
     Value : le mot de passe de l’utilisateur `github-actions`
   - **Add secret**

---

## Étape 13 – Tester

1. Fais un push sur la branche `develop` :

```bash
git add .
git commit -m "test: push Harbor"
git push origin develop
```

2. Va dans **Actions** sur GitHub et vérifie que le workflow se termine avec succès.

3. Dans Harbor : **Projects** → **dev** → tu dois voir les images `repertoire-backend` et `repertoire-frontend`.

---

## Récapitulatif des valeurs

| Où | Quoi | Valeur |
|----|------|--------|
| DigitalOcean | IP du Droplet | `164.92.xxx.xxx` |
| Harbor | URL | `http://164.92.xxx.xxx` |
| GitHub Secret | HARBOR_URL | `164.92.xxx.xxx` |
| GitHub Secret | HARBOR_USERNAME | `github-actions` |
| GitHub Secret | HARBOR_PASSWORD | mot de passe de l’utilisateur |
| GitHub Variable | HARBOR_ENABLED | `true` |

---

## Dépannage

### Impossible d’accéder à Harbor dans le navigateur

- Vérifie que le pare-feu DigitalOcean autorise le port 80
- Vérifie que Harbor tourne : `docker ps` sur le serveur

### Erreur "unauthorized" dans la CI

- Vérifie que `github-actions` a le rôle **Developer** sur les projets dev, preprod, prod
- Vérifie que les secrets GitHub sont corrects (pas d’espace, pas de http:// dans HARBOR_URL)

### Utiliser un domaine au lieu de l’IP (optionnel)

1. Achète un domaine ou utilise un sous-domaine
2. Crée un enregistrement A pointant vers l’IP du Droplet
3. Dans Harbor : modifie `hostname` dans `harbor.yml`, puis relance `./install.sh --with-trivy`
4. Dans GitHub : mets le domaine dans `HARBOR_URL` (ex. `harbor.tondomaine.com`)
