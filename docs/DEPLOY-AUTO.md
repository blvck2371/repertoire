# Déploiement automatique (push → production)

Quand tu fais un **push sur develop**, tout est automatisé :

1. **CI** : Lint, tests, build, scan, E2E
2. **CD** : Push des images vers Harbor
3. **Deploy** : Mise à jour du cluster Kubernetes (si activé)

---

## Activer le déploiement automatique

### 1. Créer un cluster Kubernetes

Voir [KUBERNETES-DIGITALOCEAN.md](KUBERNETES-DIGITALOCEAN.md) pour créer un cluster DOKS.

### 2. Récupérer le kubeconfig

Sur DigitalOcean : **Kubernetes** → ton cluster → **Download Config**

### 3. Ajouter le secret GitHub

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

- **Name** : `KUBE_CONFIG`
- **Value** : **Option A** – Copier-coller le contenu complet du fichier kubeconfig (recommandé)

  Ou **Option B** – Encoder en base64 :
  ```powershell
  # Windows PowerShell
  [Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\Downloads\ton-cluster.yaml"))
  ```

### 5. Activer la variable

**Settings** → **Variables** → **New repository variable**

- **Name** : `KUBERNETES_DEPLOY_ENABLED`
- **Value** : `true`

---

## Flux complet

```
git push origin develop
        ↓
┌─────────────────────────────────────────────────────────┐
│  Backend CI                    │  Frontend CI            │
│  Lint → Test → Build → Scan    │  Lint → Test → Build   │
│  → CD (Push Harbor)            │  → Docker → Scan → E2E  │
│                                │  → CD (Push Harbor)     │
└─────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────┐
│  Deploy K8s                                              │
│  helm upgrade --install → rollout restart                │
│  (met à jour le cluster avec les nouvelles images)        │
└─────────────────────────────────────────────────────────┘
```

---

## Désactiver le déploiement auto

Mets la variable `KUBERNETES_DEPLOY_ENABLED` à `false` ou supprime-la. Le push continuera à faire CI + CD (Harbor), mais pas le deploy K8s.
