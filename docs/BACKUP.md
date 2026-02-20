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

# Copier le backup dans le conteneur (remplacer backup.tar.gz par ton fichier)
docker cp backup.tar.gz repertoire-mongodb:/tmp/

# Extraire et restaurer
docker compose -f docker-compose.prod.yml exec mongodb sh -c "cd /tmp && tar -xzf backup.tar.gz && mongorestore --uri='mongodb://localhost:27017' --drop /tmp/dump_*"

# Redémarrer toute l'application
docker compose -f docker-compose.prod.yml up -d
```

### 3. Vérifier

Ouvrir http://IP_DROPLET et vérifier que les contacts sont bien présents.

---

## Rétention

Par défaut, **7 backups** sont conservés. Les plus anciens sont supprimés automatiquement.

---

## Stockage externe (S3/MinIO) – optionnel

Pour envoyer les backups vers S3 ou MinIO, ajouter une étape après le backup :

```bash
# Exemple avec AWS CLI
aws s3 cp /chemin/backup.tar.gz s3://ton-bucket/backups/
```

Ou utiliser un script personnalisé dans le conteneur backup.
