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

## Auto-merge develop → preprod → prod

Les push avec `GITHUB_TOKEN` ne déclenchent **pas** d'autres workflows. Le workflow utilise l'API `workflow_dispatch` pour déclencher les pipelines. Si ça ne fonctionne pas, utilisez un **PAT** :

**Option A (recommandée si workflow_dispatch échoue)** – Secret `GH_PAT` :
1. GitHub → Settings → Developer settings → Personal access tokens → Générer (classic, scope `repo`)
2. Repo → Settings → Secrets → Actions → New → nom : `GH_PAT`, valeur : le token
3. Modifier le workflow : remplacer le checkout de l'auto-merge par `token: ${{ secrets.GH_PAT }}`
4. Le push déclenchera alors les pipelines naturellement

---

## Vault (Phase 7)

| Variable GitHub | Valeur | Description |
|----------------|--------|-------------|
| VAULT_ENABLED | true | Active le déploiement Vault et l'injection des secrets MongoDB |

Quand activé : MONGODB_URI est stocké dans Vault et injecté dans le backend via l'Agent Injector.

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
