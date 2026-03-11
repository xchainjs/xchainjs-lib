import react from '@vitejs/plugin-react'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), nodePolyfills(), wasm(), topLevelAwait()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream: 'stream-browserify',
      process: 'process/browser',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
    include: ['buffer'],
    exclude: ['@xchainjs/xchain-monero'],
  },
  server: {
    port: 3000,
    proxy: {
      '/xmr-daemon': {
        target: 'https://xmr-node.cakewallet.com:18081',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/xmr-daemon/, ''),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
