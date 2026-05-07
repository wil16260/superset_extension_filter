/**
 * inject.js — Extension navigateur
 *
 * Injecte le plugin InlineFilterBar dans Superset sans accès serveur.
 * Ce script s'exécute dans le contexte de la page Superset (world: MAIN).
 *
 * Instructions :
 * 1. Copier inline-filter-plugin.umd.js dans ce dossier
 * 2. Modifier manifest.json → remplacer VOTRE-SUPERSET.example.com par votre URL
 * 3. Charger l'extension en mode développeur (chrome://extensions → "Charger l'extension non empaquetée")
 */

(function () {
  'use strict';

  const PLUGIN_KEY = 'inline_filter_bar';
  const MAX_RETRIES = 30;
  const RETRY_DELAY_MS = 500;

  let retries = 0;

  /**
   * Attend que @superset-ui/core soit disponible dans le contexte global,
   * puis enregistre le plugin.
   */
  function tryRegister() {
    retries++;

    // Superset expose ChartPlugin via window lors du chargement de l'app
    const coreModule =
      window.__superset_ui_core__ ||
      window['@superset-ui/core'] ||
      (window.superset && window.superset.core);

    if (!coreModule || !coreModule.ChartPlugin) {
      if (retries < MAX_RETRIES) {
        setTimeout(tryRegister, RETRY_DELAY_MS);
      } else {
        console.warn(
          '[InlineFilterPlugin] Timeout : @superset-ui/core non trouvé après',
          retries,
          'tentatives.',
        );
      }
      return;
    }

    if (!window.InlineFilterPlugin) {
      console.warn(
        '[InlineFilterPlugin] Bundle UMD non chargé. Vérifiez web_accessible_resources.',
      );
      return;
    }

    try {
      window.InlineFilterPlugin.register();
      console.info(
        `[InlineFilterPlugin] ✅ Plugin "${PLUGIN_KEY}" enregistré avec succès.`,
      );
    } catch (err) {
      console.error('[InlineFilterPlugin] Erreur lors de l\'enregistrement:', err);
    }
  }

  // Charger le bundle UMD puis tenter l'enregistrement
  function loadBundle() {
    // En extension, la ressource est accessible via chrome.runtime.getURL
    // En injection directe (bookmarklet/userscript), utiliser une URL absolue
    const bundleUrl =
      typeof chrome !== 'undefined' && chrome.runtime
        ? chrome.runtime.getURL('inline-filter-plugin.umd.js')
        : 'https://VOTRE-CDN.example.com/inline-filter-plugin.umd.js';

    const script = document.createElement('script');
    script.src = bundleUrl;
    script.type = 'text/javascript';
    script.onload = () => {
      console.info('[InlineFilterPlugin] Bundle chargé, enregistrement en cours…');
      tryRegister();
    };
    script.onerror = () => {
      console.error(
        '[InlineFilterPlugin] Impossible de charger le bundle depuis :',
        bundleUrl,
      );
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Démarrer le chargement une fois le DOM prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBundle);
  } else {
    loadBundle();
  }
})();
