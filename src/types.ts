import { QueryFormData } from '@superset-ui/core';

/**
 * Configuration d'un filtre à afficher inline.
 * Correspond à un filtre natif du tableau de bord Superset.
 */
export interface FilterConfig {
  /** ID du filtre natif (ex: "NATIVE_FILTER-abc123") */
  filterId: string;
  /** Libellé affiché au-dessus du sélecteur */
  label: string;
  /** Colonne ciblée dans le dataset */
  column: string;
  /** Dataset source pour récupérer les valeurs (table__id) */
  datasource?: string;
  /** Type de filtre */
  filterType: 'value' | 'range' | 'time_range' | 'custom';
  /** Valeur(s) par défaut */
  defaultValue?: string[];
  /** Permet la sélection multiple */
  multiSelect?: boolean;
  /** Inverser la sélection */
  inverseSelection?: boolean;
}

export interface InlineFilterPluginStylesProps {
  height: number;
  width: number;
  headerFontSize?: 'xs' | 's' | 'm' | 'l' | 'xl';
  boldText?: boolean;
  layout?: 'horizontal' | 'vertical';
  showApplyButton?: boolean;
  filtersConfig?: FilterConfig[];
}

export interface InlineFilterFormData extends QueryFormData {
  boldText?: boolean;
  headerFontSize?: 'xs' | 's' | 'm' | 'l' | 'xl';
  layout?: 'horizontal' | 'vertical';
  showApplyButton?: boolean;
  filtersConfig?: string; // JSON string car les contrôles Superset passent des strings
}

export interface FilterState {
  [filterId: string]: {
    value: string[] | null;
    extraFormData?: Record<string, unknown>;
  };
}
