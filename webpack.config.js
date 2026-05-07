/**
 * webpack.config.js
 *
 * Compile le plugin en 2 formats :
 *  - UMD  → dist/inline-filter-plugin.umd.js  (injection via <script>)
 *  - ESM  → dist/inline-filter-plugin.esm.js  (import ES module)
 *
 * Pour un déploiement sans accès serveur, utiliser le bundle UMD :
 * placez le fichier sur un CDN ou serveur statique, puis injectez-le
 * dans Superset via superset_config.py ou une extension navigateur.
 */

const path = require('path');

const baseConfig = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        type: 'asset/inline', // Encode thumbnail en base64
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  externals: {
    // Ne pas bundler React et @superset-ui/core : fournis par Superset
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'React',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'ReactDOM',
      root: 'ReactDOM',
    },
    '@superset-ui/core': {
      commonjs: '@superset-ui/core',
      commonjs2: '@superset-ui/core',
      root: 'SupersetUICore',
    },
    '@superset-ui/chart-controls': {
      commonjs: '@superset-ui/chart-controls',
      commonjs2: '@superset-ui/chart-controls',
      root: 'SupersetUIChartControls',
    },
  },
};

module.exports = [
  // ── Bundle UMD (script tag) ──────────────────────────────────────────
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'inline-filter-plugin.umd.js',
      library: {
        name: 'InlineFilterPlugin',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
    },
    mode: 'production',
  },
  // ── Bundle dev non minifié (debug) ──────────────────────────────────
  {
    ...baseConfig,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'inline-filter-plugin.dev.js',
      library: {
        name: 'InlineFilterPlugin',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
    },
    mode: 'development',
    devtool: 'source-map',
  },
];
