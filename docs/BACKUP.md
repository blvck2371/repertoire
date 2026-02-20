# Phase 8 – Backup MongoDB

Sauvegarde automatique ou manuelle de la base MongoDB du répertoire.

---

## Backup manuel

### Avec Docker Compose (prod seul)

```bash
docker compose --profile backup -f docker-compose.prod.yml -f docker-compose.backup.yml run --rm backup
```

### Avec Vault activé

```bash
docker compose --profile backup -f docker-compose.prod.yml -f docker-compose.vault.yml -f docker-compose.backup.yml run --rm backup
```

Les backups sont stockés dans le volume `backup_data` (répertoire interne Docker).

---

## Backup automatique (cron)

Sur le Droplet, ajouter une tâche cron pour un backup quotidien à 2h du matin :

```bash
crontab -e
```

Ajouter la ligne (adapter le chemin si besoin) :

```
0 2 * * * cd /root/repertoire && docker compose --profile backup -f docker-compose.prod.yml -f docker-compose.vault.yml -f docker-compose.backup.yml run --rm backup
```

---

## Localiser les backups

Les backups sont dans le volume Docker `backup_data`. Pour les copier sur l'hôte :

```bash
# Créer un conteneur temporaire pour accéder au volume
docker run --rm -v repertoire_backup_data:/backups -v $(pwd):/out alpine sh -c "cp -r /backups/* /out/"

# Les fichiers seront dans le répertoire courant
ls -la *.tar.gz
```

---

## Restauration

### 1. Arrêter l'application

```bash
docker compose -f docker-compose.prod.yml down
# ou avec vault :
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml down
```

### 2. Restaurer les données MongoDB

```bash
# Démarrer uniquement MongoDB
docker compose -f docker-compose.prod.yml up -d mongodb

# Copier le backup dans le conteneur (remplacer par ton fichier .tar.gz)
docker cp repertoire_20250101_120000.tar.gz repertoire-mongodb:/tmp/backup.tar.gz

# Extraire et restaurer
docker compose -f docker-compose.prod.yml exec mongodb sh -c "cd /tmp && tar -xzf backup.tar.gz && mongorestore --uri='mongodb://localhost:27017' --drop /tmp/repertoire_*"

# Redémarrer toute l'application
docker compose -f docker-compose.prod.yml up -d
```

### 3. Vérifier

Ouvrir http://IP_DROPLET et vérifier que les contacts sont bien présents.

---

## Rétention

Par défaut, **7 backups** sont conservés localement. Les plus anciens sont supprimés automatiquement. Les backups envoyés sur S3/MinIO sont conservés selon la politique du bucket (cycle de vie, etc.).

---

## Stockage externe (S3/MinIO)

Le backup peut envoyer automatiquement les archives vers **AWS S3** ou **MinIO** (S3-compatible).

### Configuration

Créer un fichier `.env` à la racine du projet (ou exporter les variables) :

```bash
# Activer l'upload S3
S3_ENABLED=true
S3_BUCKET=mon-bucket-backups
S3_PREFIX=repertoire

# Credentials AWS (ou MinIO)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1

# Pour MinIO uniquement (endpoint personnalisé)
AWS_ENDPOINT_URL=http://minio:9000
# Ou si MinIO est sur le même serveur : http://localhost:9000
```

### Lancer le backup avec S3

```bash
# Charger les variables depuis .env
export $(grep -v '^#' .env | xargs)

docker compose --profile backup -f docker-compose.prod.yml -f docker-compose.backup.yml run --rm backup
```

### MinIO (self-hosted, S3-compatible)

1. Installer MinIO sur le serveur ou utiliser MinIO Cloud
2. Créer un bucket (ex: `repertoire-backups`)
3. Créer un Access Key et Secret Key
4. Configurer :
   ```bash
   S3_ENABLED=true
   S3_BUCKET=repertoire-backups
   AWS_ACCESS_KEY_ID=minio-access-key
   AWS_SECRET_ACCESS_KEY=minio-secret-key
   AWS_ENDPOINT_URL=http://localhost:9000
   ```

### AWS S3

1. Créer un bucket S3 sur AWS
2. Créer un utilisateur IAM avec la politique `AmazonS3FullAccess` (ou une politique restreinte au bucket)
3. Récupérer Access Key ID et Secret Access Key
4. Configurer sans `AWS_ENDPOINT_URL` (AWS utilise l'endpoint par défaut)

---

## Backup BorgBackup (chiffré, DigitalOcean Spaces)

Pour une stratégie complète avec **BorgBackup** (chiffré, dédupliqué) et **DigitalOcean Spaces** :

Voir [BACKUP-STRATEGY.md](BACKUP-STRATEGY.md) — fréquence quotidienne prod, hebdo dev, restauration sandbox mensuelle.
