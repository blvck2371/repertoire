# Guide Grafana – Configuration pas à pas

Ce guide te permet de configurer Grafana et de créer ton premier tableau de bord.

---

## Étape 1 : Connexion à Grafana

1. Ouvre **http://TON_IP:3000** (ex. http://165.22.171.147:3000)
2. Identifiants : **admin** / **admin**
3. Si demandé, change le mot de passe (ou clique sur "Skip")

---

## Étape 2 : Ajouter Prometheus comme source de données

1. Menu **☰** (en haut à gauche) → **Connections** → **Data sources**
2. Clique sur **Add data source**
3. Choisis **Prometheus**
4. Dans **URL**, entre : `http://prometheus:9090`
   - `prometheus` = nom du conteneur dans le réseau Docker
5. Clique sur **Save & Test**
6. Tu dois voir : **"Data source is working"** en vert

---

## Étape 3 : Créer ton premier tableau de bord

1. Menu **☰** → **Dashboards** → **New** → **New Dashboard**
2. Clique sur **Add visualization**

### Panneau 1 : Services actifs
1. En haut, choisis **Prometheus** comme source
2. Dans **Metric**, tape : `up`
3. Clique sur **Run query**
4. Tu vois une ligne par service (1 = actif, 0 = arrêté)
5. En bas à droite : **Title** → `Services actifs`
6. Clique sur **Apply**

### Panneau 2 : Mémoire Prometheus
1. Clique sur **Add** → **Visualization**
2. **Metric** : `process_resident_memory_bytes{job="prometheus"}`
3. **Title** : `Mémoire Prometheus`
4. **Apply**

### Panneau 3 : Nombre de métriques
1. **Add** → **Visualization**
2. **Metric** : `scrape_duration_seconds`
3. **Title** : `Durée des scrapes`
4. **Apply**

---

## Étape 4 : Sauvegarder le tableau de bord

1. En haut à droite : **Save dashboard**
2. **Name** : `Répertoire - Vue d'ensemble`
3. **Save**

---

## Étape 5 : Personnaliser (optionnel)

- **Time range** (en haut à droite) : Last 15 minutes, 1 hour, 24 hours...
- **Refresh** : Auto-refresh toutes les 5s, 10s, etc.
- **Variables** : Pour filtrer dynamiquement

---

## Métriques utiles à ajouter plus tard

| Métrique | Description |
|----------|-------------|
| `up` | Services up (1) ou down (0) |
| `process_resident_memory_bytes` | Mémoire utilisée |
| `process_cpu_seconds_total` | CPU utilisé |
| `scrape_duration_seconds` | Temps de collecte |

---

## Métriques du backend (API Répertoire)

Le backend expose un endpoint `/api/metrics` au format Prometheus. Prometheus scrape automatiquement ce endpoint (job `backend`).

### Panneaux recommandés pour le backend

#### Panneau 4 : Requêtes HTTP totales
1. **Add** → **Visualization**
2. **Metric** : `http_requests_total{job="backend"}`
3. **Title** : `Requêtes API totales`
4. **Apply**

#### Panneau 5 : Durée des requêtes HTTP
1. **Add** → **Visualization**
2. **Metric** : `rate(http_request_duration_seconds_sum{job="backend"}[5m]) / rate(http_request_duration_seconds_count{job="backend"}[5m])`
3. **Title** : `Durée moyenne des requêtes (5 min)`
4. **Apply**

#### Panneau 6 : Requêtes par statut
1. **Add** → **Visualization**
2. **Metric** : `sum by (status) (http_requests_total{job="backend"})`
3. **Title** : `Requêtes par code HTTP`
4. **Apply**

### Métriques backend disponibles

| Métrique | Description |
|----------|-------------|
| `http_requests_total` | Nombre total de requêtes (labels: method, route, status) — exclut `/api/metrics` et `/api/health` |
| `http_request_duration_seconds` | Histogramme des durées de requêtes |
| `process_*` | Métriques Node.js (CPU, mémoire, etc.) |
