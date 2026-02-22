# Identifiants d'accès – Répertoire Téléphonique

Document de référence pour tous les accès et identifiants du projet.

---

## Application principale

| Environnement | URL | Identifiant | Mot de passe |
|---------------|-----|-------------|--------------|
| dev | https://repertoire-app.duckdns.org | — | — |
| preprod | https://repertoire-preprod.duckdns.org | — | — |
| prod | https://repertoire-prod.duckdns.org | — | — |

*Application CRUD publique, pas d'authentification.*

---

## Monitoring (Grafana)

| URL | Identifiant | Mot de passe |
|-----|-------------|--------------|
| https://grafana-repertoire.duckdns.org | admin | repertoire-monitoring |

---

## Stockage S3 (MinIO)

| URL | Identifiant | Mot de passe |
|-----|-------------|--------------|
| https://minio-repertoire.duckdns.org | minioadmin | minioadmin |
| https://minio-api-repertoire.duckdns.org | — | *(API uniquement, pas de login)* |

---

## Backups (Restic)

| Clé | Valeur |
|-----|--------|
| minio-access-key | minioadmin |
| minio-secret-key | minioadmin |
| restic-password | repertoire-backup-dev |

*Stocké dans le secret Kubernetes `repertoire-backup-credentials`. À conserver pour la restauration.*

---

## Harbor (registry Docker)

| URL | Identifiant | Mot de passe |
|-----|-------------|--------------|
| https://repertoire-harbor.duckdns.org | admin | *(harbor_admin_password dans harbor.yml)* |
| *(CI)* | github-actions | *(mot de passe créé dans Harbor)* |

**Secrets GitHub :** `HARBOR_URL`, `HARBOR_USERNAME`, `HARBOR_PASSWORD`  
**Variables GitHub :** `HARBOR_ENABLED`=true, `HARBOR_HTTPS`=true *(si HTTPS)*

---

## Prometheus / Alertmanager

| Service | Accès | Identifiants |
|---------|-------|--------------|
| Prometheus | `kubectl port-forward svc/kube-prometheus-stack-prometheus 9090:9090 -n monitoring` | — |
| Alertmanager | `kubectl port-forward svc/kube-prometheus-stack-alertmanager 9093:9093 -n monitoring` | — |

*Pas d'authentification par défaut.*

---

## Prérequis DuckDNS

Ajouter ces sous-domaines (même IP que le cluster) :

- `repertoire-app` (dev)
- `repertoire-preprod`
- `repertoire-prod`
- `grafana-repertoire`
- `minio-repertoire`
- `minio-api-repertoire`
- `repertoire-harbor` *(Harbor)*
