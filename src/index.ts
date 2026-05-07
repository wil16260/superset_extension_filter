/**
 * superset-plugin-chart-inline-filter
 *
 * Plugin Superset qui affiche une barre de filtres natifs directement
 * dans la grille du tableau de bord, au-dessus d'un graphique.
 *
 * Intégration sans accès serveur : fonctionne via le système de
 * viz-plugin standard de Superset (registre ChartPlugin).
 */

export { default } from './InlineFilterPlugin';
export { default as InlineFilterChart } from './InlineFilterChart';
export type { InlineFilterPluginStylesProps, FilterConfig } from './types';
