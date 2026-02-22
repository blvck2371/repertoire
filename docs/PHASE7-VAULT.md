# Phase 7 – Gestion des secrets (HashiCorp Vault)

## Vue d'ensemble

Vault stocke les credentials MongoDB de manière sécurisée et les injecte dynamiquement dans les Pods via l'Agent Injector.

## Architecture

```
Vault (namespace: vault)
    ↓ Kubernetes Auth
Backend Pod (annotations vault.hashicorp.com/agent-inject)
    → MONGODB_URI injecté dans /vault/secrets/mongodb
    → Backend lit la variable au démarrage
```

## Prérequis

- Cluster Kubernetes opérationnel
- Helm 3.6+
- Variables GitHub : `VAULT_ENABLED` (optionnel, défaut: false)

## Déploiement

Vault est déployé automatiquement par la pipeline CI si `VAULT_ENABLED=true` (variable GitHub).

### Mode dev (développement)

- Vault en mode dev (in-memory, auto-unseal)
- Données perdues au redémarrage du pod
- Idéal pour tester

### Mode standalone (preprod/prod)

- Stockage persistant (volume)
- Nécessite unseal manuel au premier démarrage
- Ou utilisation d'un script d'unseal avec clés stockées dans un secret

## Configuration manuelle (premier déploiement)

Si Vault n'est pas en mode dev, exécuter après le déploiement :

```bash
# 1. Récupérer les clés d'unseal (affichées dans les logs du pod)
kubectl logs -n vault vault-0

# 2. Unseal Vault (3 clés sur 5)
kubectl exec -n vault vault-0 -- vault operator unseal <key1>
kubectl exec -n vault vault-0 -- vault operator unseal <key2>
kubectl exec -n vault vault-0 -- vault operator unseal <key3>

# 3. Le script vault-init dans la CI configure le reste (KV, Kubernetes auth, secrets)
```

## Secrets stockés

| Chemin Vault | Clé | Description |
|--------------|-----|-------------|
| `secret/data/mongodb` | `MONGODB_URI` | URI de connexion MongoDB |

## Rotation des secrets

Pour faire tourner le secret MongoDB :

```bash
kubectl exec -n vault vault-0 -- vault kv put secret/mongodb MONGODB_URI="mongodb://nouvelle-uri"
```

Les Pods backend seront mis à jour au prochain redémarrage ou via le sidecar (renouvellement automatique).

## Audit trail

Vault enregistre les accès aux secrets. Pour activer l'audit :

```bash
kubectl exec -n vault vault-0 -- vault audit enable file file_path=/vault/logs/audit.log
```

## Désactiver Vault

Dans `values-dev.yaml` (ou preprod/prod) :

```yaml
vault:
  enabled: false
```

Le backend utilisera alors les variables d'environnement classiques (MONGODB_URI en clair dans le déploiement).
