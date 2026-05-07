# superset-plugin-chart-inline-filter

> Plugin de visualisation Apache Superset qui affiche une **barre de filtres natifs directement dans la grille du tableau de bord**, au-dessus d'un graphique — sans accès au serveur.

---

## 🎯 Pourquoi ce plugin ?

Par défaut, Superset place tous les filtres natifs dans un **panneau latéral gauche** qui peut être masqué. Ce plugin permet de :

- Afficher un ou plusieurs filtres **inline dans la grille du dashboard**, juste au-dessus d'un graphique
- Piloter les mêmes filtres natifs que le panneau latéral (via `setDataMask`)
- Configurer l'affichage sans toucher au code source de Superset

```
┌─────────────────────────────────────────────────────────┐
│  [Région ▾]  [Année ▾]  [Statut ▾]         [Reset]    │  ← ce plugin
├─────────────────────────────────────────────────────────┤
│                                                         │
│              votre graphique en-dessous                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Méthode A — `DYNAMIC_PLUGINS` (recommandée, Superset ≥ 2.1)

1. **Construire le bundle**
   ```bash
   npm install
   npm run bundle
   # → dist/inline-filter-plugin.umd.js
   ```

2. **Héberger le bundle** sur un CDN ou serveur statique accessible par Superset.

3. **Activer le feature flag** dans `superset_config.py` :
   ```python
   FEATURE_FLAGS = {
       "DYNAMIC_PLUGINS": True,
   }
   ```

4. **Enregistrer le plugin** dans l'interface Superset :
   - Menu **Admin → Plugins**
   - Cliquer **+ Plugin**
   - Renseigner l'URL du bundle UMD et la clé `inline_filter_bar`

---

### Méthode B — Injection via `superset_config.py` (sans rebuild)

Cette méthode fonctionne si vous pouvez modifier `superset_config.py` mais pas reconstruire le frontend.

```python
# superset_config.py

# Ajouter une balise <script> dans chaque page Superset
HTML_SANITIZATION_SCHEMA_EXTENSIONS = {}

# Modifier le template Jinja (nécessite accès au filesystem)
# Alternativement, utiliser un reverse-proxy (nginx/caddy) pour injecter le script
```

Créer un fichier `custom_inject.js` :
```javascript
// Attend que Superset soit chargé puis enregistre le plugin
window.addEventListener('load', () => {
  const script = document.createElement('script');
  script.src = 'https://votre-cdn.com/inline-filter-plugin.umd.js';
  script.onload = () => {
    if (window.InlineFilterPlugin?.register) {
      window.InlineFilterPlugin.register();
    }
  };
  document.head.appendChild(script);
});
```

---

### Méthode C — Extension navigateur (zéro accès serveur)

Si vous n'avez **aucun** accès serveur, créez une extension Chrome/Firefox :

```json
// manifest.json
{
  "manifest_version": 3,
  "name": "Superset Inline Filter",
  "version": "1.0",
  "content_scripts": [
    {
      "matches": ["https://votre-superset.company.com/*"],
      "js": ["inject.js"],
      "run_at": "document_idle"
    }
  ],
  "web_accessible_resources": [
    {
      "resources": ["inline-filter-plugin.umd.js"],
      "matches": ["https://votre-superset.company.com/*"]
    }
  ]
}
```

```javascript
// inject.js
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inline-filter-plugin.umd.js');
script.onload = () => {
  window.InlineFilterPlugin?.register?.();
};
document.head.appendChild(script);
```

---

### Méthode D — Image Docker personnalisée

Si vous contrôlez le déploiement Docker :

```dockerfile
FROM apache/superset:latest

# Copier le plugin dans le build frontend
COPY ./superset-plugin-chart-inline-filter /app/superset-frontend/plugins/inline-filter

# Reconstruire le frontend (nécessite Node.js dans l'image de build)
RUN cd /app/superset-frontend && \
    echo "import InlineFilterPlugin from '../plugins/inline-filter';" >> src/visualizations/presets/MainPreset.ts && \
    echo "new InlineFilterPlugin().configure({ key: 'inline_filter_bar' }).register();" >> src/visualizations/presets/MainPreset.ts && \
    npm run build
```

---

## ⚙️ Configuration du plugin dans Superset

Une fois installé, le plugin apparaît dans la galerie de graphiques sous le nom **"Inline Filter Bar"**.

### 1. Créer un graphique de type "Inline Filter Bar"

Dans **Charts → + Chart**, sélectionner **Inline Filter Bar**.

### 2. Configurer les filtres via le panneau de contrôle

Dans le champ **"Configuration des filtres (JSON)"**, définir les filtres à afficher :

```json
[
  {
    "filterId": "NATIVE_FILTER-abc123",
    "label": "Région",
    "column": "region",
    "datasource": "42__table",
    "filterType": "value",
    "multiSelect": true,
    "defaultValue": []
  },
  {
    "filterId": "NATIVE_FILTER-def456",
    "label": "Année",
    "column": "year",
    "datasource": "42__table",
    "filterType": "value",
    "multiSelect": false
  }
]
```

**Comment trouver le `filterId` ?**
1. Ouvrir le tableau de bord en mode édition
2. Ouvrir les DevTools → Network → chercher les appels `/api/v1/dashboard/`
3. Dans la réponse, chercher `native_filter_configuration`
4. Copier l'`id` du filtre souhaité (format `NATIVE_FILTER-xxxxxxx`)

**Comment trouver le `datasource` ?**
- Format : `{id}__{type}` (ex: `42__table`)
- Visible dans l'URL de la vue Explore : `?datasource_type=table&datasource_id=42`

### 3. Ajouter au tableau de bord

- Ajouter le graphique "Inline Filter Bar" au dashboard
- Le placer **au-dessus** du graphique qu'il doit piloter
- Réduire sa hauteur (2-3 lignes dans la grille suffisent)

### 4. Configurer le scope du filtre natif

Dans les paramètres du filtre natif correspondant :
- S'assurer que le filtre **inclut** le graphique cible dans son scope
- Le filtre native et le plugin doivent pointer vers la **même colonne/dataset**

---

## 🛠️ Développement

```bash
# Installer les dépendances
npm install

# Build TypeScript → lib/
npm run build

# Build webpack → dist/
npm run bundle

# Mode watch (développement)
npm run dev
```

### Structure du projet

```
superset-plugin-chart-inline-filter/
├── src/
│   ├── index.ts              # Export principal
│   ├── InlineFilterPlugin.ts # Enregistrement du plugin
│   ├── InlineFilterChart.tsx # Composant React principal
│   ├── controlPanel.ts       # Contrôles Explore view
│   ├── buildQuery.ts         # Requête (vide)
│   ├── transformProps.ts     # Mapping des props
│   └── types.ts              # Types TypeScript
├── dist/                     # Bundle webpack (généré)
├── lib/                      # Compilation TypeScript CJS (généré)
├── package.json
├── tsconfig.json
└── webpack.config.js
```

---

## 🔌 API : Communication avec les filtres natifs

Le plugin utilise le hook **`setDataMask`** de Superset pour piloter les filtres natifs :

```typescript
// Émettre une sélection de filtre
setDataMask(filterId, {
  extraFormData: {
    filters: [
      { col: 'region', op: 'IN', val: ['Île-de-France', 'Bretagne'] }
    ]
  },
  filterState: {
    value: ['Île-de-France', 'Bretagne']
  }
});
```

Ce mécanisme est identique à celui utilisé par le panneau de filtres natif de Superset.

---

## ❓ FAQ

**Q : Le plugin ne pilote pas les graphiques du dashboard.**
→ Vérifiez que le `filterId` dans la config JSON correspond **exactement** à l'ID du filtre natif dans le dashboard.

**Q : Les options du dropdown ne s'affichent pas.**
→ Vérifiez le format du `datasource` (`{id}__table`) et que l'API `/api/v1/datasource/` est accessible (CORS si nécessaire).

**Q : Le plugin apparaît comme un graphique vide.**
→ La configuration JSON des filtres est probablement vide ou invalide. Editez le graphique en mode Explore.

---

## 📄 Licence

Apache 2.0 — Compatible avec Apache Superset.
