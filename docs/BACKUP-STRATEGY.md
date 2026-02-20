# Stratégie de backup – BorgBackup + DigitalOcean Spaces

Backup chiffré, versionné et dédupliqué vers DigitalOcean Spaces.

---

## Spécifications

| Critère | Valeur |
|---------|--------|
| **Fréquence prod** | Quotidienne (2h du matin) |
| **Fréquence dev/staging** | Hebdomadaire (dimanche 2h) |
| **Outils** | BorgBackup + Rclone + DigitalOcean Spaces |
| **Chiffrement** | Borg repokey (chiffrement à la source) |
| **Versionnement** | Oui (borg prune avec rétention) |
| **Vérification** | `borg check` mensuel recommandé |
| **Test restauration** | Sandbox mensuel |

---

## 1. Prérequis

### DigitalOcean Spaces

1. Créer un Space : **Spaces** → **Create Space**
2. Région : nyc3 (ou la plus proche)
3. Créer une clé API : **API** → **Spaces Keys** → **Generate New Key**
4. Noter : **Access Key** et **Secret Key**

### Variables d'environnement

Créer `.env` à la racine :

```bash
# Borg (phrase secrète pour déchiffrer - À CONSERVER EN SÉCURITÉ)
BORG_PASSPHRASE=ta_phrase_secrete_longue

# DigitalOcean Spaces (API → Spaces Keys → Generate New Key)
SPACES_KEY=DO00XXXXXXXXXXXXXX
SPACES_SECRET=dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SPACES_BUCKET=repertoire-backup
SPACES_REGION=sfo3

# Environnement (prod=quotidien, dev=hebdo)
BACKUP_ENV=prod
```

---

## 2. Backup manuel

```bash
cd /root/repertoire
export $(grep -v '^#' .env | xargs)

docker compose -f docker-compose.prod.yml -f docker-compose.backup-borg.yml run --rm backup-borg
```

---

## 3. Automatisation (cron + Docker)

### Prod – quotidien

```bash
crontab -e
```

Ajouter :

```
0 2 * * * cd /root/repertoire && export $(grep -v '^#' .env | xargs) && docker compose -f docker-compose.prod.yml -f docker-compose.backup-borg.yml run --rm backup-borg >> /var/log/repertoire-backup.log 2>&1
```

### Dev/Staging – hebdomadaire (dimanche 2h)

```
0 2 * * 0 cd /root/repertoire && export $(grep -v '^#' .env | xargs) && docker compose -f docker-compose.prod.yml -f docker-compose.backup-borg.yml run --rm backup-borg >> /var/log/repertoire-backup.log 2>&1
```

---

## 4. Vérification des backups

### Lister les archives

```bash
docker run --rm -v repertoire_backup_borg_data:/backups -e BORG_PASSPHRASE=ta_phrase borgbackup/borg:latest list /backups/repo
```

### Vérifier l'intégrité (mensuel)

```bash
docker run --rm -v repertoire_backup_borg_data:/backups -e BORG_PASSPHRASE=ta_phrase borgbackup/borg:latest check /backups/repo
```

---

## 5. Restauration (test sandbox mensuel)

### Depuis le volume local

```bash
# 1. Créer un dossier de restauration
mkdir -p /tmp/restore-test

# 2. Extraire une archive (remplacer repertoire-YYYYMMDD_HHMMSS)
docker run --rm -v repertoire_backup_borg_data:/backups -v /tmp/restore-test:/restore \
  -e BORG_PASSPHRASE=ta_phrase borgbackup/borg:latest \
  extract /backups/repo::repertoire-20250101_020000 /restore

# 3. Restaurer dans MongoDB (le dump contient dump/repertoire/)
docker compose -f docker-compose.prod.yml up -d mongodb
docker cp /tmp/restore-test/dump repertoire-mongodb:/tmp/restore-dump
docker compose -f docker-compose.prod.yml exec mongodb mongorestore --uri='mongodb://localhost:27017' --drop /tmp/restore-dump

# 4. Vérifier et nettoyer
rm -rf /tmp/restore-test
```

### Depuis DigitalOcean Spaces (disaster recovery)

```bash
# 1. Récupérer le repo depuis Spaces
mkdir -p /tmp/borg-restore
# Configurer rclone puis :
rclone copy spaces:ton-bucket/repertoire-borg /tmp/borg-restore

# 2. Extraire avec borg (BORG_PASSPHRASE requis)
borg extract /tmp/borg-restore::repertoire-20250101_020000 /tmp/restore-out

# 3. Restaurer MongoDB comme ci-dessus
```

---

## 6. Rétention (borg prune)

Configurée dans le script :
- **7 derniers jours** : conservés
- **4 dernières semaines** : 1 backup/semaine
- **6 derniers mois** : 1 backup/mois

---

## 7. Checklist mensuelle

- [ ] Exécuter `borg check` sur le repo
- [ ] Tester une restauration en sandbox
- [ ] Vérifier les logs cron
- [ ] Confirmer la présence des backups sur Spaces
