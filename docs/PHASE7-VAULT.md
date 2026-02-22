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

## Comment tester Vault

### 1. Activer Vault

Dans **GitHub** : Settings → Variables and secrets → Variables → ajouter ou modifier :
- `VAULT_ENABLED` = `true`

Puis faire un push sur `develop` pour déclencher le déploiement.

### 2. Vérifier le déploiement

```bash
# Vault est-il déployé ?
kubectl get pods -n vault

# Le job d'init a-t-il réussi ?
kubectl get job vault-init -n vault
kubectl logs job/vault-init -n vault

# Le backend a-t-il le sidecar Vault (2 init + 2 containers) ?
kubectl get pod -l app.kubernetes.io/component=backend -n repertoire-dev -o jsonpath='{.items[0].spec.containers[*].name}'
# Devrait afficher : vault-agent backend (ou vault-agent-init vault-agent backend)
```

### 3. Vérifier l'injection du secret

```bash
# Le secret MongoDB est-il injecté dans le pod ?
kubectl exec -n repertoire-dev deployment/repertoire-backend -c backend -- cat /vault/secrets/mongodb 2>/dev/null
# Devrait afficher : mongodb://repertoire-mongodb:27017/repertoire
```

### 4. Tester l'application

1. Ouvrir https://repertoire-app.duckdns.org (dev)
2. Ajouter un contact
3. Si l'ajout fonctionne → le backend lit bien MONGODB_URI depuis Vault

### 5. Vérifier dans Vault (optionnel)

```bash
# Se connecter au pod Vault
kubectl exec -it -n vault vault-0 -- sh

# Lister les secrets (token root en mode dev)
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'
vault kv get secret/mongodb
# Devrait afficher MONGODB_URI
```

### 6. Désactiver Vault

Mettre `VAULT_ENABLED` = `false` dans les variables GitHub. Le backend reviendra aux variables d'environnement classiques.

---

## Désactiver Vault (via Helm)

Dans `values-dev.yaml` (ou preprod/prod) :

```yaml
vault:
  enabled: false
```

Le backend utilisera alors les variables d'environnement classiques (MONGODB_URI en clair dans le déploiement).
