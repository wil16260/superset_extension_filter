import { buildQueryContext, QueryFormData } from '@superset-ui/core';

/**
 * Ce plugin n'interroge pas lui-même la base de données.
 * Les données des dropdowns sont récupérées via l'API Superset
 * directement depuis le composant React.
 *
 * On retourne néanmoins un QueryContext valide pour satisfaire
 * le framework Superset (colonne timestamp factice).
 */
export default function buildQuery(formData: QueryFormData) {
  return buildQueryContext(formData, baseQueryObject => [
    {
      ...baseQueryObject,
      // Pas de métriques ni de dimensions : le plugin gère ses propres données
      metrics: [],
      columns: [],
      row_limit: 0,
    },
  ]);
}
