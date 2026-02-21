# Phase 9 – Backups & restauration

## Architecture

- **MongoDB** → mongodump (gzip) → **Restic** (chiffrement + incrémental) → **MinIO** (S3)

## Planification

| Environnement | Fréquence | Rétention |
|---------------|-----------|-----------|
| dev | Dimanche 2h | 7 jours, 4 semaines |
| prod | Quotidien 2h | 7 jours, 4 semaines |

## Déploiement

MinIO et le CronJob sont déployés automatiquement par le workflow (frontend-ci). Le secret `repertoire-backup-credentials` contient :

- `minio-access-key` / `minio-secret-key` : accès MinIO
- `restic-password` : mot de passe de chiffrement Restic (à conserver pour la restauration)

## Lancer un backup manuel

```bash
kubectl create job -n repertoire-dev backup-manual --from=cronjob/repertoire-mongodb-backup
```

## Restaurer

1. **Lister les snapshots** (depuis un pod avec restic) :
   ```bash
   kubectl run -it --rm restic --image=restic/restic -n repertoire-dev -- \
     restic snapshots --tag repertoire-mongodb
   ```

2. **Restauration** : utiliser le script `docker/backup/restore.sh` avec les mêmes variables d'environnement que le CronJob (MONGODB_URI, RESTIC_REPOSITORY, RESTIC_PASSWORD, AWS_*).

3. **En prod** : changer le mot de passe Restic par un secret et le conserver en lieu sûr.
