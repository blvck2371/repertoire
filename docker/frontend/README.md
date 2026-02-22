# Docker Frontend

Le frontend nécessite le backend (proxy /api). Utiliser les deux compose :

## Lancer la stack complète (backend + frontend)

```bash
docker compose -f docker/backend/docker-compose.yml -f docker/frontend/docker-compose.yml up -d
```

- App : http://localhost
- API : http://localhost/api
