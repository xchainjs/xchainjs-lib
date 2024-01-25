// Plugins
import inject from '@rollup/plugin-inject'
import vue from '@vitejs/plugin-vue'
import ViteFonts from 'unplugin-fonts/vite'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// Utilities
import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue({
        template: { transformAssetUrls },
      }),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
        styles: {
          configFile: 'src/styles/settings.scss',
        },
      }),
      ViteFonts({
        google: {
          families: [
            {
              name: 'Roboto',
              styles: 'wght@100;300;400;500;700;900',
            },
          ],
        },
      }),
      nodePolyfills(),
    ],
    define: { 'process.env': {} },
    build: {
      sourcemap: false, // with true the app doesn't build
      minify: 'terser',
      rollupOptions: {
        cache: false,
        plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
        maxParallelFileOps: 2,
        output: {
          sourcemap: false,
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
      commonjsOptions: {
        transformMixedEsModules: false,
      },
    },
    resolve: {
      alias: {
        stream: 'stream-browserify',
        process: 'process/browser',
        Buffer: 'buffer',
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    optimizeDeps: {
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
    // worker: {
    //   plugins: [
    //     comlink()
    //   ]
    // },
    server: {
      port: 3000,
    },
  }
})
