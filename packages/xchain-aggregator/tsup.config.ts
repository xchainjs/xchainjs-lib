import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    outDir: 'lib',
    format: ['cjs', 'esm'],
    bundle: true,
    skipNodeModulesBundle: true,
    outExtension: ({ format }) => {
      if (format === 'cjs') return { js: '.js' }
      if (format === 'esm') return { js: '.esm.js' }
      return { js: `.${format}.js` }
    },
    minify: options.env?.ENV === 'pro',
    dts: true,
    sourcemap: options.env?.ENV === 'dev',
    clean: true,
  }
})
