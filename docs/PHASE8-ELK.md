# Phase 8 – Centralisation des logs (ELK Stack)

## Architecture

```
Pods (backend, frontend, mongodb)
    ↓ logs stdout/stderr
Filebeat (DaemonSet, chaque nœud)
    ↓ collecte /var/log/containers/*.log
Elasticsearch (single node, namespace: logging)
    ↓ stockage et indexation
Kibana (dashboard)
    → https://kibana-repertoire.duckdns.org
```

## Composants

| Service | Rôle | Namespace |
|---------|------|-----------|
| Elasticsearch | Stockage et indexation des logs | logging |
| Kibana | Interface web de visualisation | logging |
| Filebeat | Collecte des logs (DaemonSet) | logging |

## Prérequis

1. **Variable GitHub** : `ELK_ENABLED` = `true`
2. **DuckDNS** : ajouter `kibana-repertoire` (même IP que repertoire-app)

## Déploiement

ELK est déployé automatiquement par la pipeline CI/CD quand `ELK_ENABLED=true`.

## Accès Kibana

| Service | URL | Identifiants |
|---------|-----|--------------|
| Kibana | https://kibana-repertoire.duckdns.org | Aucun (pas d'auth par défaut) |

## Voir les logs

1. Ouvrir Kibana
2. Aller dans **Discover**
3. Créer un index pattern : `filebeat-*`
4. Sélectionner le champ `@timestamp`
5. Les logs de tous les pods apparaissent

## Filtrer les logs par service

Dans Kibana Discover, utiliser les filtres :

```
kubernetes.container.name: "backend"
kubernetes.container.name: "mongodb"
kubernetes.container.name: "frontend"
kubernetes.namespace: "repertoire-dev"
```

## Ressources

Configuration minimale pour cluster limité :

| Composant | CPU request | Mémoire request |
|-----------|-------------|-----------------|
| Elasticsearch | 100m | 512Mi |
| Kibana | 50m | 256Mi |
| Filebeat | 25m | 64Mi |

## Fichiers de configuration

| Fichier | Description |
|---------|-------------|
| `helm/repertoire/elk/elasticsearch-values.yaml` | Config Elasticsearch |
| `helm/repertoire/elk/kibana-values.yaml` | Config Kibana |
| `helm/repertoire/elk/filebeat-values.yaml` | Config Filebeat + collecte |
