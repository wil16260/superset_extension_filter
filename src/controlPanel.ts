import { t } from '@superset-ui/core';
import { ControlPanelConfig, sections } from '@superset-ui/chart-controls';

/**
 * Panneau de contrôle du plugin dans la vue Explore de Superset.
 * Permet de configurer les filtres à afficher inline.
 */
const controlPanel: ControlPanelConfig = {
  controlPanelSections: [
    // Section principale : configuration des filtres
    {
      label: t('Filtres inline'),
      expanded: true,
      controlSetRows: [
        [
          {
            name: 'filtersConfig',
            config: {
              type: 'TextAreaControl',
              label: t('Configuration des filtres (JSON)'),
              description: t(
                `Tableau JSON de filtres à afficher. Chaque filtre correspond à un filtre natif du dashboard.
Exemple :
[
  {
    "filterId": "NATIVE_FILTER-abc123",
    "label": "Région",
    "column": "region",
    "datasource": "1__table",
    "filterType": "value",
    "multiSelect": true
  }
]`,
              ),
              default: JSON.stringify(
                [
                  {
                    filterId: 'NATIVE_FILTER-abc123',
                    label: 'Filtre exemple',
                    column: 'column_name',
                    datasource: '1__table',
                    filterType: 'value',
                    multiSelect: true,
                    defaultValue: [],
                  },
                ],
                null,
                2,
              ),
              renderTrigger: true,
              language: 'json',
            },
          },
        ],
        [
          {
            name: 'layout',
            config: {
              type: 'SelectControl',
              label: t('Disposition des filtres'),
              description: t('Horizontal (côte à côte) ou Vertical (empilé)'),
              default: 'horizontal',
              choices: [
                ['horizontal', t('Horizontal')],
                ['vertical', t('Vertical')],
              ],
              renderTrigger: true,
            },
          },
          {
            name: 'showApplyButton',
            config: {
              type: 'CheckboxControl',
              label: t("Bouton 'Appliquer'"),
              description: t(
                "Affiche un bouton pour appliquer les filtres manuellement (sinon, application automatique).",
              ),
              default: false,
              renderTrigger: true,
            },
          },
        ],
      ],
    },
    // Section apparence
    {
      label: t('Apparence'),
      expanded: false,
      controlSetRows: [
        [
          {
            name: 'headerFontSize',
            config: {
              type: 'SelectControl',
              label: t('Taille des libellés'),
              default: 's',
              choices: [
                ['xs', t('Très petit')],
                ['s', t('Petit')],
                ['m', t('Moyen')],
                ['l', t('Grand')],
                ['xl', t('Très grand')],
              ],
              renderTrigger: true,
            },
          },
          {
            name: 'boldText',
            config: {
              type: 'CheckboxControl',
              label: t('Libellés en gras'),
              renderTrigger: true,
              default: false,
            },
          },
        ],
      ],
    },
  ],
};

export default controlPanel;
