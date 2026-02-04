import react from '@vitejs/plugin-react'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: { 'process.env': {}, global: 'globalThis' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      stream: 'stream-browserify',
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
    },
  },
  server: { port: 3000 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
