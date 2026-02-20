# Phase 4 – Registry privé (Harbor)

Ce guide couvre l'installation de Harbor sur le Droplet, la configuration GitHub Actions et le scan des vulnérabilités.

---

## Vue d'ensemble

| Étape | Description |
|-------|-------------|
| 1 | Installer Harbor sur le Droplet (port 4443) |
| 2 | Créer le projet `repertoire` |
| 3 | Configurer GitHub Actions (secrets, variables) |
| 4 | Activer le scan des vulnérabilités (Trivy) |
| 5 | Vérifier le push des images |

---

## 1. Installation Harbor

Voir le guide détaillé : [HARBOR-INSTALLATION-DROPLET.md](HARBOR-INSTALLATION-DROPLET.md)

**Résumé :**
```bash
ssh root@165.22.171.147
cd /root
wget https://github.com/goharbor/harbor/releases/download/v2.11.0/harbor-offline-installer-v2.11.0.tgz
tar xzf harbor-offline-installer-v2.11.0.tgz
cd harbor
# Générer les certificats, configurer harbor.yml, puis :
./prepare && ./install.sh
```

**Accès :** https://165.22.171.147:4443 (admin / Harbor12345)

---

## 2. Créer le projet dans Harbor

1. Connecte-toi à https://165.22.171.147:4443
2. **Projects** → **New Project**
3. **Project name :** `repertoire`
4. **Access Level :** Public (ou Private si tu préfères)
5. **Vulnerability scanning :** activé (par défaut avec Trivy)
6. **Save**

---

## 3. Configuration GitHub Actions

### Variables (Settings → Actions → Variables)

| Variable | Valeur |
|----------|--------|
| `ENABLE_HARBOR` | `true` |
| `ENABLE_HARBOR_CA_CERT` | `true` *(si certificat auto-signé)* |

### Secrets (Settings → Actions → Secrets)

| Secret | Valeur |
|--------|--------|
| `HARBOR_URL` | `165.22.171.147:4443/repertoire` *(sans https://)* |
| `HARBOR_USERNAME` | `admin` |
| `HARBOR_PASSWORD` | Mot de passe Harbor |
| `HARBOR_CA_CERT` | Certificat en base64 *(voir ci-dessous)* |

### Obtenir le certificat en base64

Sur le Droplet :
```bash
base64 -w 0 /root/harbor/certs/server.crt
```

Copie le résultat et colle-le dans le secret `HARBOR_CA_CERT`.

**Alternative (depuis ta machine) :**
```bash
scp root@165.22.171.147:/root/harbor/certs/server.crt /tmp/harbor.crt
# Linux/Mac :
base64 -w 0 /tmp/harbor.crt
# Windows PowerShell :
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\tmp\harbor.crt"))
```

---

## 4. Scan des vulnérabilités

Harbor intègre **Trivy** pour le scan des images. Une fois le projet créé :

1. **Projects** → **repertoire** → **Configuration**
2. Vérifie que **Vulnerability scanning** est activé
3. **Scanner** : Trivy (par défaut)

À chaque push d'image, Harbor scanne automatiquement et affiche les vulnérabilités dans l'interface.

### Politique de prévention

Pour bloquer les déploiements si des vulnérabilités critiques sont détectées :

1. **Projects** → **repertoire** → **Configuration**
2. **Tag retention** : optionnel
3. **Vulnerability policy** : 
   - **Severity** : Critical, High
   - **Action** : Prevent deployment (optionnel)

---

## 5. Structure des images

| Branche | Backend | Frontend |
|---------|---------|----------|
| develop | `165.22.171.147:4443/repertoire/backend:dev` | `165.22.171.147:4443/repertoire/frontend:dev` |
| preprod | `.../backend:preprod` | `.../frontend:preprod` |
| prod | `.../backend:v1.0.1` | `.../frontend:v1.0.1` |

---

## 6. Vérification

Après un push sur `develop` :

1. **GitHub Actions** : le job `push-registry` doit réussir
2. **Harbor** : Projects → repertoire → tu vois les repositories `backend` et `frontend` avec leurs tags
3. Clique sur une image → **Vulnerabilities** pour voir le rapport Trivy

---

## Dépannage

### Erreur "x509: certificate signed by unknown authority"

- Vérifie que `ENABLE_HARBOR_CA_CERT=true` et que `HARBOR_CA_CERT` contient le certificat en base64
- Le certificat doit être celui de `server.crt` (pas `ca.crt` si différent)

### Erreur "unauthorized" au push

- Vérifie `HARBOR_USERNAME` et `HARBOR_PASSWORD`
- Vérifie que le projet `repertoire` existe et que l'utilisateur a les droits

### HARBOR_URL : format correct

- ✅ `165.22.171.147:4443/repertoire`
- ❌ `https://165.22.171.147:4443/repertoire` (pas de https://)

---

*Phase 4 – Registry privé Harbor*
