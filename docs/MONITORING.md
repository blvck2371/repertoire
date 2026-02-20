# Phase 7 – Monitoring & Logging (Prometheus, Grafana, ELK)

Stack de monitoring : **Prometheus** (métriques), **Grafana** (dashboards), **ELK** (Elasticsearch, Kibana, Filebeat) pour les logs.

---

## ⚠️ Ressources requises

ELK consomme **~2-3 Go RAM**. Un **Droplet 8 Go** est recommandé. Sur 4 Go, l'application peut manquer de mémoire.

---

## Démarrage

```bash
# Avec Vault
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml -f docker-compose.monitoring.yml up -d

# Sans Vault
docker compose -f docker-compose.prod.yml -f docker-compose.monitoring.yml up -d
```

---

## Accès

| Service | URL | Identifiants |
|---------|-----|--------------|
| **Grafana** | http://IP:3000 | admin / admin |
| **Kibana** | http://IP:5601 | — |
| **Prometheus** | http://IP:9090 | — |

Les ports sont exposés sur toutes les interfaces. Accès direct :

- **Grafana** : http://TON_IP:3000
- **Kibana** : http://TON_IP:5601
- **Prometheus** : http://TON_IP:9090

---

## Kibana – Premier démarrage

1. Aller sur http://IP:5601
2. **Stack Management** → **Index Patterns**
3. Créer un index pattern : `filebeat-*`
4. Choisir le champ timestamp : `@timestamp`
5. **Discover** pour consulter les logs

---

## Grafana – Prometheus

1. **Configuration** → **Data sources** → **Add data source**
2. Choisir **Prometheus**
3. URL : `http://prometheus:9090` (depuis Grafana dans le même réseau Docker)
4. **Save & Test**

---

## Filebeat

Collecte les logs de tous les conteneurs Docker et les envoie vers Elasticsearch. Les logs sont indexés avec le préfixe `filebeat-*`.

---

## Désactiver le monitoring

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml -f docker-compose.monitoring.yml down
```

Puis redémarrer sans le fichier monitoring :

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.vault.yml up -d
```
