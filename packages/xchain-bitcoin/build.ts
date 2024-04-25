import { dependencies } from './package.json'

const result = await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './lib',
  external: Object.keys(dependencies),
  sourcemap: 'external',
})

if (!result.success) {
  throw new AggregateError(result.logs, 'Build failed')
}

console.log('Build successful')
