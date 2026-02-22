# Phase 9 – Backups & restauration

## Architecture

- **MongoDB** → mongodump (gzip) → **Restic** (chiffrement + incrémental) → **MinIO** (S3)

## Planification

| Environnement | Fréquence | Rétention |
|---------------|-----------|-----------|
| dev | Dimanche 2h | 7 jours, 4 semaines |
| prod | Quotidien 2h | 7 jours, 4 semaines |

## Accès MinIO (HTTPS)

- **Console** : https://minio-repertoire.duckdns.org (minioadmin / minioadmin)
- **API S3** : https://minio-api-repertoire.duckdns.org (requise pour que la console fonctionne depuis le navigateur)
- **Prérequis** : ajouter `minio-repertoire` et `minio-api-repertoire` dans DuckDNS (même IP que repertoire-app)
- **Note** : L'API doit être exposée – la console se connecte à l’API S3 en interne (pas besoin d’exposer l’API)

## Déploiement

MinIO et le CronJob sont déployés automatiquement par le workflow (frontend-ci). Le secret `repertoire-backup-credentials` contient :

- `minio-access-key` / `minio-secret-key` : accès MinIO
- `restic-password` : mot de passe de chiffrement Restic (à conserver pour la restauration)

## Lancer un backup manuel

```bash
kubectl create job -n repertoire-dev backup-manual --from=cronjob/repertoire-mongodb-backup
```

## Restaurer

### Méthode 1 : Job Kubernetes (recommandé)

1. **Lister les snapshots** disponibles :
   ```bash
   kubectl run -it --rm restic --image=restic/restic -n repertoire-dev \
     --env="RESTIC_REPOSITORY=s3:http://repertoire-minio:9000/repertoire-backups" \
     --env="RESTIC_PASSWORD=repertoire-backup-dev" \
     --env="AWS_ACCESS_KEY_ID=minioadmin" \
     --env="AWS_SECRET_ACCESS_KEY=minioadmin" \
     --restart=Never -- restic snapshots --tag repertoire-mongodb
   ```
   *(Remplacer le mot de passe si différent – voir secret `repertoire-backup-credentials`)*

2. **Appliquer le job de restauration** (remplacer `repertoire-dev` par le namespace cible) :
   ```bash
   kubectl apply -f docs/restore-job-example.yaml -n repertoire-dev
   ```

3. **Suivre l'exécution** :
   ```bash
   kubectl logs -f job/repertoire-restore-test -n repertoire-dev
   ```

4. **Vérifier** : ouvrir l'app (ex. https://repertoire-app.duckdns.org) et confirmer que les données restaurées sont présentes.

### Méthode 2 : Script manuel (depuis un pod)

Utiliser le script `docker/backup/restore.sh` avec les mêmes variables d'environnement que le CronJob (MONGODB_URI, RESTIC_REPOSITORY, RESTIC_PASSWORD, AWS_*).

### Test de restauration mensuel (sandbox)

Pour valider la procédure sans impacter la prod :

1. **Sur dev** : lancer un backup, puis un restore. Vérifier que les données réapparaissent.
2. **Sur preprod** : idem, en dehors des heures de pointe.
3. **Sur prod** : prévoir une fenêtre de maintenance ; le restore écrase les données actuelles.

### En prod

Changer le mot de passe Restic par un secret fort et le conserver en lieu sûr (coffre-fort, gestionnaire de mots de passe).
