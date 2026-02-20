# Guide d'utilisation du Monitoring (Grafana, Kibana, Prometheus)

Ce guide explique à quoi sert chaque outil, quand l'utiliser, et comment le configurer.

---

## Vue d'ensemble

| Outil | Rôle | Quand l'utiliser |
|-------|------|------------------|
| **Prometheus** | Collecte les métriques (CPU, RAM, requêtes, etc.) | Surveiller les performances, détecter les pics |
| **Grafana** | Visualise les métriques en graphiques et tableaux de bord | Voir l'état de santé de l'application en un coup d'œil |
| **Kibana** | Explore et analyse les logs des conteneurs | Déboguer des erreurs, tracer un problème |

---

## 1. Prometheus

### À quoi ça sert ?
Prometheus **collecte des données numériques** à intervalles réguliers :
- Nombre de requêtes par seconde
- Utilisation CPU/RAM
- Temps de réponse
- Erreurs

### Quand c'est utile ?
- **Performance** : L'application est-elle lente ?
- **Charge** : Combien de requêtes par minute ?
- **Stabilité** : Y a-t-il des pics de mémoire ?

### Configuration
Prometheus scrape :
- **prometheus** : lui-même (port 9090)
- **backend** : l'API Répertoire via `/api/metrics` (port 3001)

**Accès** : http://TON_IP:9090

- **Status** → **Targets** : voir les cibles surveillées (prometheus, backend)
- **Graph** : exécuter des requêtes (ex. `up`, `http_requests_total{job="backend"}`)

---

## 2. Grafana

### À quoi ça sert ?
Grafana **affiche les métriques** de Prometheus sous forme de graphiques, tableaux et alertes. C'est l'interface visuelle du monitoring.

### Quand c'est utile ?
- **Tableau de bord** : Vue d'ensemble de l'état du système
- **Tendances** : Évolution de la charge sur la journée/semaine
- **Alertes** : Recevoir une notification si un seuil est dépassé

### Configuration à faire

#### Étape 1 : Connexion à Prometheus
1. Ouvre **Grafana** : http://TON_IP:3000
2. Connexion : **admin** / **admin** (tu peux changer le mot de passe)
3. Menu **☰** → **Connections** → **Data sources**
4. **Add data source** → choisis **Prometheus**
5. **URL** : `http://prometheus:9090` (nom du conteneur dans le réseau Docker)
6. **Save & Test** → tu dois voir "Data source is working"

#### Étape 2 : Créer un tableau de bord
1. Menu **☰** → **Dashboards** → **New** → **New Dashboard**
2. **Add visualization**
3. Choisis **Prometheus** comme source
4. Dans **Metric** : tape `up` → tu vois les services actifs (1 = up, 0 = down)
5. **Apply** pour sauvegarder le panneau

#### Exemples de métriques utiles
| Métrique | Signification |
|----------|---------------|
| `up` | Service actif (1) ou arrêté (0) |
| `process_resident_memory_bytes` | Mémoire utilisée par un processus |
| `rate(http_requests_total[5m])` | Requêtes par seconde (si exposé) |

---

## 3. Kibana

### À quoi ça sert ?
Kibana **explore les logs** collectés par Filebeat et stockés dans Elasticsearch. Tu peux rechercher, filtrer et analyser chaque ligne de log.

### Quand c'est utile ?
- **Débogage** : Une erreur s'est produite → chercher dans les logs
- **Audit** : Qui a fait quoi et quand ?
- **Diagnostic** : Pourquoi le backend a planté ? Quel message d'erreur ?

### Configuration à faire

#### Étape 1 : Créer un index pattern
1. Ouvre **Kibana** : http://TON_IP:5601
2. Menu **☰** → **Stack Management** → **Index Patterns**
3. **Create index pattern**
4. **Index pattern name** : `filebeat-*`
5. **Timestamp field** : choisis `@timestamp`
6. **Create index pattern**

#### Étape 2 : Explorer les logs
1. Menu **☰** → **Discover**
2. Choisis l'index `filebeat-*` en haut à gauche
3. Tu vois les logs de tous les conteneurs (backend, frontend, mongodb, etc.)

#### Filtres utiles
| Champ | Exemple | Signification |
|-------|---------|---------------|
| `container.name` | `repertoire-backend` | Logs du backend uniquement |
| `message` | `error` | Logs contenant "error" |
| `log.level` | `error` | Niveau d'erreur |

---

## Scénarios d'utilisation

### Scénario 1 : L'application est lente
1. **Grafana** : Vérifier les graphiques CPU/mémoire
2. **Kibana** : Chercher des erreurs ou des warnings dans les logs du backend

### Scénario 2 : Une erreur s'affiche à l'utilisateur
1. **Kibana** : Filtrer par `container.name: repertoire-backend` et chercher le message d'erreur
2. Identifier la cause dans les logs

### Scénario 3 : Vérifier que tout tourne
1. **Grafana** : Tableau de bord avec la métrique `up` pour chaque service
2. Si `up=0` → le service est down

### Scénario 4 : Audit / Qui a fait quoi ?
1. **Kibana** : Rechercher dans les logs par timestamp ou par contenu

---

## Résumé

| Moment | Outil | Action |
|--------|-------|--------|
| **Quotidien** | Grafana | Jeter un œil au tableau de bord |
| **Problème de perf** | Grafana + Prometheus | Analyser les métriques |
| **Erreur / bug** | Kibana | Chercher dans les logs |
| **Vérification** | Prometheus / Grafana | Voir si les services sont up |

---

## Prochaines étapes (optionnel)

- **Alertmanager** : Recevoir un email/Slack si un service tombe
- **Exporter MongoDB** : Métriques MongoDB dans Prometheus
- **Exporter Node.js** : Métriques du backend (requêtes, durée, etc.)

---

*Pour plus de détails sur le déploiement, voir [MONITORING.md](MONITORING.md).*
