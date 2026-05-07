import {
  ChartMetadata,
  ChartPlugin,
  ChartProps,
} from '@superset-ui/core';
import buildQuery from './buildQuery';
import controlPanel from './controlPanel';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

/**
 * InlineFilterPlugin
 *
 * Enregistre le plugin dans le registre ChartPlugin de Superset.
 * Ce plugin se comporte comme un graphique classique côté Superset
 * mais rend une barre de filtres interactive plutôt qu'une visualisation.
 *
 * ─── Intégration sans serveur ──────────────────────────────────────────
 * Pour déployer ce plugin sans modifier le code source de Superset :
 *
 * Option A – Webpack Module Federation (recommandée) :
 *   Exposer le plugin via un remote Webpack MF, puis le charger via
 *   SUPERSET_EXTENSIONS dans superset_config.py (Superset ≥ 2.x) :
 *
 *     FEATURE_FLAGS = { "DYNAMIC_PLUGINS": True }
 *
 *   Puis dans l'UI Admin → Plugins → ajouter l'URL du bundle.
 *
 * Option B – Script tag injection :
 *   Injecter un <script> dans le template Jinja de Superset via
 *   superset_config.py :
 *     HTML_SANITIZATION_SCHEMA_EXTENSIONS = {...}
 *   Le script charge le bundle UMD et appelle register() ci-dessous.
 *
 * Option C – Build custom Docker image :
 *   Copier le bundle dans superset-frontend/src et importer dans
 *   MainPreset.ts — rebuild de l'image Docker.
 * ───────────────────────────────────────────────────────────────────────
 */
export default class InlineFilterPlugin extends ChartPlugin<InlineFilterFormData> {
  constructor() {
    super({
      metadata: new ChartMetadata({
        category: 'Advanced Analytics',
        credits: [],
        description:
          'Affiche des filtres natifs du tableau de bord directement dans la grille, au-dessus d\'un graphique. Évite de cacher les filtres dans le panneau latéral.',
        exampleGallery: [],
        name: 'Inline Filter Bar',
        tags: ['filter', 'dashboard', 'inline', 'interactive'],
        thumbnail,
        useLegacyApi: false,
      }),
      buildQuery,
      controlPanel,
      loadChart: () =>
        import(/* webpackChunkName: "InlineFilterChart" */ './InlineFilterChart'),
      transformProps,
    });
  }
}

// ── Export pour registration manuelle (Option B / script tag) ──────────
export function register() {
  const plugin = new InlineFilterPlugin();
  plugin.configure({ key: 'inline_filter_bar' }).register();
  console.info('[InlineFilterPlugin] registered as "inline_filter_bar"');
}

// Auto-register si chargé en tant que script UMD standalone
if (typeof window !== 'undefined') {
  (window as any).InlineFilterPlugin = { register };
}
