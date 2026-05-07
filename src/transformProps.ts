import { ChartProps } from '@superset-ui/core';
import { InlineFilterPluginStylesProps, FilterConfig } from './types';

/**
 * transformProps
 *
 * Transforme les ChartProps bruts reçus de Superset en props
 * exploitables par le composant React InlineFilterChart.
 */
export default function transformProps(
  chartProps: ChartProps,
): InlineFilterPluginStylesProps & {
  setDataMask: Function;
  filterState: Record<string, any>;
  datasource: string;
  hooks: Record<string, Function>;
} {
  const { width, height, formData, hooks, filterState } = chartProps;

  const {
    boldText = false,
    headerFontSize = 's',
    layout = 'horizontal',
    showApplyButton = false,
    filtersConfig,
  } = formData as any;

  // Parser la configuration JSON des filtres
  let parsedFiltersConfig: FilterConfig[] = [];
  if (filtersConfig) {
    try {
      parsedFiltersConfig =
        typeof filtersConfig === 'string'
          ? JSON.parse(filtersConfig)
          : filtersConfig;
    } catch (e) {
      console.error('[InlineFilterPlugin] Erreur de parsing filtersConfig:', e);
      parsedFiltersConfig = [];
    }
  }

  return {
    width,
    height,
    boldText,
    headerFontSize,
    layout,
    showApplyButton,
    filtersConfig: parsedFiltersConfig,
    // Hooks Superset pour émettre des changements de filtre
    setDataMask: hooks?.setDataMask ?? (() => {}),
    filterState: filterState ?? {},
    datasource: formData.datasource ?? '',
    hooks: hooks ?? {},
  };
}
