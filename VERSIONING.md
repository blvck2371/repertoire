# Versioning Sémantique

Le projet suit le **Semantic Versioning** (SemVer) : `MAJOR.MINOR.PATCH`

## Règles

| Type | Quand l'utiliser | Exemple |
|------|------------------|---------|
| **MAJOR** (x.0.0) | Changements incompatibles, breaking changes | v1.0.0 → v2.0.0 |
| **MINOR** (x.x.0) | Nouvelles fonctionnalités, rétrocompatibles | v1.0.0 → v1.1.0 |
| **PATCH** (x.x.x) | Corrections de bugs, rétrocompatibles | v1.0.0 → v1.0.1 |

## Workflow

1. **Développement** sur `develop` → pas de tag
2. **Merge vers preprod** → validation
3. **Merge vers prod** → **créer un tag** `v1.0.0`

## Créer une nouvelle version

```bash
# Correction de bug
npm run version:patch

# Nouvelle fonctionnalité
npm run version:minor

# Breaking change
npm run version:major
```

Puis créer le tag Git et le pousser :

```bash
git add package.json backend/package.json frontend/package.json
git commit -m "chore: bump version to vX.Y.Z"
git tag vX.Y.Z
git push origin develop
git push origin vX.Y.Z
```

## Tags existants

- `v1.0.0` — Version initiale (Phase 0 complète)
