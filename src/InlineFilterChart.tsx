/**
 * InlineFilterChart.tsx
 *
 * Composant principal du plugin.
 * Affiche une barre de filtres horizontale (ou verticale) dans la grille
 * du tableau de bord Superset, qui pilote les filtres natifs via setDataMask.
 *
 * Architecture :
 *  ┌─────────────────────────────────────────────────────┐
 *  │  [Région ▾]  [Année ▾]  [Statut ▾]   [Appliquer]  │  ← ce plugin
 *  ├─────────────────────────────────────────────────────┤
 *  │                                                     │
 *  │              graphique en-dessous                   │
 *  │                                                     │
 *  └─────────────────────────────────────────────────────┘
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FilterConfig } from './types';

// ─── Styles CSS-in-JS (pas de dépendance externe requise) ─────────────

const fontSizeMap: Record<string, string> = {
  xs: '10px',
  s: '12px',
  m: '14px',
  l: '16px',
  xl: '20px',
};

// ─── Composant de filtre individuel ───────────────────────────────────

interface SingleFilterProps {
  config: FilterConfig;
  value: string[];
  onChange: (filterId: string, value: string[]) => void;
  labelFontSize: string;
  bold: boolean;
}

function FilterDropdown({
  config,
  value,
  onChange,
  labelFontSize,
  bold,
}: SingleFilterProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Récupère les valeurs distinctes via l'API Superset
  useEffect(() => {
    if (!config.datasource || !config.column) return;
    setLoading(true);

    const [datasourceId, datasourceType] = config.datasource.split('__');
    const endpoint =
      `/api/v1/datasource/${datasourceType ?? 'table'}/${datasourceId}/column/${config.column}/values/`;

    fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      credentials: 'same-origin',
    })
      .then(r => r.json())
      .then(data => {
        // Superset retourne { result: [...] }
        const values: string[] = (data.result ?? data.values ?? []).map(
          (v: any) => String(v),
        );
        setOptions(values);
      })
      .catch(() => {
        // Fallback : options vides
        setOptions([]);
      })
      .finally(() => setLoading(false));
  }, [config.datasource, config.column]);

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = useCallback(
    (opt: string) => {
      if (config.multiSelect) {
        const next = value.includes(opt)
          ? value.filter(v => v !== opt)
          : [...value, opt];
        onChange(config.filterId, next);
      } else {
        onChange(config.filterId, value[0] === opt ? [] : [opt]);
        setIsOpen(false);
      }
    },
    [value, config.multiSelect, config.filterId, onChange],
  );

  const displayLabel =
    value.length === 0
      ? `${config.label}…`
      : value.length === 1
      ? value[0]
      : `${value.length} sélectionnés`;

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative', display: 'inline-block', minWidth: 140 }}
    >
      {/* Libellé */}
      <div
        style={{
          fontSize: labelFontSize,
          fontWeight: bold ? 700 : 400,
          color: '#666',
          marginBottom: 2,
          whiteSpace: 'nowrap',
        }}
      >
        {config.label}
      </div>

      {/* Bouton trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 10px',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
          background: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          minWidth: 130,
          justifyContent: 'space-between',
          color: value.length === 0 ? '#aaa' : '#333',
          fontFamily: 'inherit',
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>
          {loading ? 'Chargement…' : displayLabel}
        </span>
        <span style={{ fontSize: 10, color: '#999' }}>▾</span>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 9999,
            background: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            maxHeight: 220,
            overflowY: 'auto',
            minWidth: 160,
            marginTop: 2,
          }}
        >
          {/* Option "Effacer" */}
          {value.length > 0 && (
            <div
              role="option"
              aria-selected={false}
              onClick={() => { onChange(config.filterId, []); setIsOpen(false); }}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 12,
                color: '#1677ff',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              ✕ Effacer la sélection
            </div>
          )}
          {options.length === 0 && !loading && (
            <div style={{ padding: '8px 12px', color: '#aaa', fontSize: 12 }}>
              Aucune valeur disponible
            </div>
          )}
          {options.map(opt => (
            <div
              key={opt}
              role="option"
              aria-selected={value.includes(opt)}
              onClick={() => toggleOption(opt)}
              style={{
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: 13,
                background: value.includes(opt) ? '#e6f4ff' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={e =>
                !value.includes(opt) &&
                ((e.currentTarget as HTMLDivElement).style.background = '#f5f5f5')
              }
              onMouseLeave={e =>
                !value.includes(opt) &&
                ((e.currentTarget as HTMLDivElement).style.background = 'transparent')
              }
            >
              {config.multiSelect && (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: `1px solid ${value.includes(opt) ? '#1677ff' : '#d9d9d9'}`,
                    borderRadius: 2,
                    background: value.includes(opt) ? '#1677ff' : '#fff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {value.includes(opt) && (
                    <span style={{ color: '#fff', fontSize: 9, lineHeight: 1 }}>✓</span>
                  )}
                </span>
              )}
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Utilitaire : récupérer le token CSRF depuis les cookies ──────────

function getCsrfToken(): string {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
}

// ─── Composant principal ───────────────────────────────────────────────

interface InlineFilterChartProps {
  width: number;
  height: number;
  filtersConfig: FilterConfig[];
  layout: 'horizontal' | 'vertical';
  showApplyButton: boolean;
  headerFontSize: string;
  boldText: boolean;
  setDataMask: (filterId: string, dataMask: object) => void;
  filterState: Record<string, any>;
}

export default function InlineFilterChart({
  width,
  height,
  filtersConfig = [],
  layout = 'horizontal',
  showApplyButton = false,
  headerFontSize = 's',
  boldText = false,
  setDataMask,
}: InlineFilterChartProps) {
  // État local des valeurs sélectionnées par filterId
  const [localValues, setLocalValues] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      filtersConfig.map(f => [f.filterId, f.defaultValue ?? []]),
    ),
  );

  // Quand les filtres sont reconfigurés, réinitialiser l'état
  useEffect(() => {
    setLocalValues(
      Object.fromEntries(
        filtersConfig.map(f => [f.filterId, f.defaultValue ?? []]),
      ),
    );
  }, [filtersConfig]);

  /**
   * Émet un changement vers le système de filtres natifs de Superset.
   * setDataMask est le hook officiel pour piloter les filtres natifs.
   */
  const emitFilter = useCallback(
    (filterId: string, values: string[]) => {
      setDataMask(filterId, {
        extraFormData: {
          filters:
            values.length === 0
              ? []
              : [
                  {
                    col: filtersConfig.find(f => f.filterId === filterId)
                      ?.column,
                    op: 'IN',
                    val: values,
                  },
                ],
        },
        filterState: {
          value: values.length === 0 ? null : values,
        },
      });
    },
    [filtersConfig, setDataMask],
  );

  const handleChange = useCallback(
    (filterId: string, values: string[]) => {
      setLocalValues(prev => ({ ...prev, [filterId]: values }));
      if (!showApplyButton) {
        // Application immédiate
        emitFilter(filterId, values);
      }
    },
    [showApplyButton, emitFilter],
  );

  const handleApply = useCallback(() => {
    filtersConfig.forEach(f => {
      emitFilter(f.filterId, localValues[f.filterId] ?? []);
    });
  }, [filtersConfig, localValues, emitFilter]);

  const handleReset = useCallback(() => {
    const empty: Record<string, string[]> = Object.fromEntries(
      filtersConfig.map(f => [f.filterId, []]),
    );
    setLocalValues(empty);
    filtersConfig.forEach(f => emitFilter(f.filterId, []));
  }, [filtersConfig, emitFilter]);

  const fontSize = fontSizeMap[headerFontSize] ?? '12px';

  if (filtersConfig.length === 0) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#aaa',
          fontSize: 13,
          border: '1px dashed #d9d9d9',
          borderRadius: 6,
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 24 }}>🔧</span>
        <span>
          Aucun filtre configuré — éditez le graphique pour ajouter des filtres
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        minHeight: height,
        display: 'flex',
        flexDirection: layout === 'vertical' ? 'column' : 'row',
        flexWrap: 'wrap',
        alignItems: layout === 'vertical' ? 'flex-start' : 'flex-end',
        gap: 16,
        padding: '8px 12px',
        background: '#fafafa',
        borderRadius: 6,
        border: '1px solid #f0f0f0',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
    >
      {/* Filtres */}
      {filtersConfig.map(filterCfg => (
        <FilterDropdown
          key={filterCfg.filterId}
          config={filterCfg}
          value={localValues[filterCfg.filterId] ?? []}
          onChange={handleChange}
          labelFontSize={fontSize}
          bold={boldText}
        />
      ))}

      {/* Boutons d'action */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'flex-end',
          marginLeft: layout === 'horizontal' ? 'auto' : 0,
        }}
      >
        {showApplyButton && (
          <button
            type="button"
            onClick={handleApply}
            style={{
              padding: '5px 16px',
              background: '#1677ff',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: 'inherit',
              height: 30,
            }}
          >
            Appliquer
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '5px 12px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'inherit',
            height: 30,
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
