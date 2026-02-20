# Phase 6 – Gestion des secrets avec Vault

HashiCorp Vault permet de stocker et gérer les secrets (credentials MongoDB, clés API, etc.) de manière sécurisée.

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ vault-init  │────▶│    Vault     │◀────│   Backend   │
│ (init once) │     │  (KV store)  │     │ (fetch at   │
└─────────────┘     └──────────────┘     │  startup)   │
                          │               └─────────────┘
                          │
                    MONGODB_URI
                    et autres secrets
```

---

## Déploiement avec Vault

### Option 1 : Docker Compose avec Vault (recommandé pour dev/preprod)

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml up -d --build
```

### Option 2 : Sans Vault (comportement par défaut)

```bash
docker compose -f docker-compose.prod.yml up -d
```

Le backend utilise alors les variables d'environnement directement (MONGODB_URI dans le compose).

### Option 3 : CD GitHub Actions (Droplet)

Pour activer Vault sur le déploiement automatique du Droplet :

1. **Variables** → **Actions** → ajouter `ENABLE_VAULT` = `true`
2. À chaque push, le CD déploiera avec `docker-compose.vault.yml`

---

## Fonctionnement

1. **vault-init** : Au premier démarrage, active le moteur KV v2 et enregistre les secrets (MONGODB_URI).
2. **Backend** : Au démarrage, récupère les secrets depuis Vault via `vault-loader.js`, puis lance l'application.
3. **Sans VAULT_ADDR** : Le backend démarre directement sans appeler Vault.

---

## Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VAULT_ADDR` | URL de Vault | — (désactive Vault) |
| `VAULT_TOKEN` | Token d'authentification | `root` (dev uniquement) |
| `VAULT_SECRET_PATH` | Chemin du secret KV | `secret/data/repertoire` |
| `MONGODB_URI` | URI MongoDB (pour vault-init) | `mongodb://mongodb:27017/repertoire` |

---

## Ajouter un nouveau secret

1. Modifier `scripts/vault-init.sh` pour écrire le secret.
2. Ou via l'API Vault :

```bash
# Depuis le host (Vault exposé sur 127.0.0.1:8200)
curl -X POST -H "X-Vault-Token: root" \
  -H "Content-Type: application/json" \
  -d '{"data":{"MA_NOUVELLE_CLE":"ma_valeur"}}' \
  http://127.0.0.1:8200/v1/secret/data/repertoire
```

---

## Rotation des secrets

### Rotation manuelle

1. Mettre à jour le secret dans Vault (API ou UI).
2. Redémarrer le backend : `docker compose restart backend`

### Rotation automatique (avancé)

- Utiliser Vault avec des secrets dynamiques (ex. base de données).
- Ou un CronJob qui met à jour Vault et redémarre les services.

---

## Production

En production, **ne pas utiliser le mode dev** de Vault :

- Configurer Vault en mode production (stockage, unseal).
- Utiliser un token avec des politiques limitées (pas le root token).
- Activer l'audit logging.
- Consulter la [documentation officielle Vault](https://developer.hashicorp.com/vault/docs).

---

## Accès à l'interface Vault

Vault expose une API REST. Pour une UI, utiliser [Vault UI](https://developer.hashicorp.com/vault/docs/configuration/ui) ou des outils tiers.

En local avec le compose : `http://localhost:8200` (port 8200 mappé sur 127.0.0.1).
