import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';

export default defineConfig({
  lib: [
    {
      format: 'mf',
      syntax: 'es2020',
      output: {
        distPath: {
          root: './dist/mf',
        },
        filename: {},
        cleanDistPath: true,
      },
      dev: {
        hmr: true,
      },
      plugins: [
        // ...
        pluginModuleFederation({
          name: 'react_provider',
          exposes: {
            './App': './src/App.tsx',
          },
          filename: 'remoteEntry.mjs',
          async: false,
          shared: {
            react: {
              singleton: true,
            },
            'react-dom': {
              singleton: true,
            },
          },
        }),
      ],
    },
  ],

  server: {
    port: 3000,
    cors: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
});
