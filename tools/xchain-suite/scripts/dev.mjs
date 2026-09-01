#!/usr/bin/env node
/**
 * Dev wrapper so `--nomonero` works.
 * Vite/CAC rejects unknown flags before vite.config.ts can see them.
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const vitePkg = dirname(require.resolve('vite/package.json'))
const viteBin = join(vitePkg, 'bin', 'vite.js')

const args = process.argv.slice(2)
const noMonero = args.includes('--nomonero')
const viteArgs = args.filter((arg) => arg !== '--nomonero')

const env = { ...process.env }
if (noMonero) {
  env.NO_MONERO = '1'
}

const child = spawn(process.execPath, [viteBin, ...viteArgs], {
  stdio: 'inherit',
  env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
