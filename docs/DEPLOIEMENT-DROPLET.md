# Déploiement sur DigitalOcean Droplet (économique)

Alternative à Kubernetes : un **Droplet** (VPS) à partir de **4-6 $/mois** au lieu de ~30 $/mois pour K8s.

## Coûts comparés

| Option | Coût mensuel |
|--------|--------------|
| Kubernetes + Load Balancer + Registry | ~30 $ |
| **Droplet seul** | **4-6 $** |
| Registry (déjà en place) | 5 $ |

---

## 1. Créer un Droplet sur DigitalOcean

1. Va sur [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. **Create** → **Droplets**
3. Choisir :
   - **Image** : Ubuntu 22.04
   - **Plan** : Basic, 1 GB RAM (~6 $/mois) ou 512 MB (~4 $/mois)
   - **Datacenter** : le plus proche de toi
   - **Authentication** : SSH key (recommandé)

---

## 2. Préparer le serveur

Connecte-toi en SSH :
```bash
ssh root@TON_IP_DROPLET
```

Puis exécute :
```bash
# Mise à jour
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com | sh

# Installer Docker Compose
apt install docker-compose-plugin -y

# Vérifier
docker --version
docker compose version
```

---

## 3. Déployer l'application

**Option A - Cloner depuis GitHub :**
```bash
apt install git -y
git clone https://github.com/blvck2371/repertoire.git
cd repertoire
docker compose -f docker-compose.prod.yml up -d --build
```

**Option B - Copier les fichiers** (scp depuis ta machine) :
```bash
scp -r backend frontend docker-compose*.yml root@TON_IP:/root/repertoire/
ssh root@TON_IP "cd /root/repertoire && docker compose -f docker-compose.prod.yml up -d --build"
```

---

## 4. Accéder à l'application

Ouvre dans ton navigateur : **http://TON_IP_DROPLET**

Le fichier `docker-compose.prod.yml` expose le frontend sur le port 80 (standard HTTP).

---

## 5. (Optionnel) Déploiement automatique via GitHub Actions

On peut ajouter un job dans le workflow CD qui :
- Se connecte en SSH au Droplet
- Pull les dernières modifications
- Rebuild et redémarre les containers

Dis-moi si tu veux que je configure ça !
