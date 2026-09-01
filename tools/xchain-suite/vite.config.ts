import react from '@vitejs/plugin-react'
import nodePolyfills from 'vite-plugin-node-stdlib-browser'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import net from 'node:net'

const LOCAL_MONEROD = 'http://127.0.0.1:18081'
const LOCAL_WALLET_RPC = 'http://127.0.0.1:18088'
const ENV_DIR = fileURLToPath(new URL('.', import.meta.url))

/**
 * Skip auto-starting monero-wallet-rpc and XMR proxies.
 * Prefer `NO_MONERO=1` / `yarn dev --nomonero` (wrapper sets the env before Vite/CAC runs).
 */
function resolveNoMonero(env: Record<string, string>): boolean {
  return process.env.NO_MONERO === '1' || env.NO_MONERO === '1' || env.VITE_NO_MONERO === '1'
}

function isPortOpen(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host }, () => {
      socket.end()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
  })
}

/** Start monero-wallet-rpc against the local monerod when `yarn dev` runs. */
function moneroWalletRpcPlugin(walletRpcBin: string, walletDir: string, walletRpcLog: string): Plugin {
  let child: ChildProcess | null = null
  return {
    name: 'monero-wallet-rpc',
    async configureServer(server) {
      if (await isPortOpen(18088)) {
        console.log('[xmr] monero-wallet-rpc already listening on 127.0.0.1:18088')
        return
      }
      // Absolute/relative paths can be checked up front; bare names rely on PATH at spawn.
      if ((walletRpcBin.includes('/') || walletRpcBin.startsWith('.')) && !existsSync(walletRpcBin)) {
        console.warn(`[xmr] ${walletRpcBin} not found; XMR balances need a running monero-wallet-rpc`)
        return
      }
      mkdirSync(walletDir, { recursive: true })
      mkdirSync(dirname(walletRpcLog), { recursive: true })
      child = spawn(
        walletRpcBin,
        [
          '--daemon-address',
          '127.0.0.1:18081',
          '--trusted-daemon',
          '--rpc-bind-ip',
          '127.0.0.1',
          '--rpc-bind-port',
          '18088',
          '--disable-rpc-login',
          '--rpc-ssl',
          'disabled',
          '--wallet-dir',
          walletDir,
          '--disable-rpc-ban',
          '--no-initial-sync',
          '--log-file',
          walletRpcLog,
          '--log-level',
          '0',
        ],
        { stdio: ['ignore', 'pipe', 'pipe'] },
      )
      child.stderr?.on('data', (buf) => {
        const line = String(buf).trim()
        if (line) console.log(`[xmr-wallet-rpc] ${line}`)
      })
      child.on('exit', (code, signal) => {
        if (code || signal) {
          console.warn(`[xmr] monero-wallet-rpc exited code=${code} signal=${signal}`)
        }
        child = null
      })
      console.log(`[xmr] started monero-wallet-rpc (pid ${child.pid}) → 127.0.0.1:18088`)
      server.httpServer?.once('close', () => {
        child?.kill('SIGTERM')
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Vite does not put .env into process.env during config eval — load it explicitly.
  // Shell-exported vars still win over .env values.
  const env = loadEnv(mode, ENV_DIR, '')
  const noMonero = resolveNoMonero(env)
  if (noMonero) {
    console.log('[xmr] skipped (--nomonero / NO_MONERO=1)')
  }

  const walletRpcBin = process.env.MONERO_WALLET_RPC || env.MONERO_WALLET_RPC || 'monero-wallet-rpc'
  const walletDir =
    process.env.MONERO_WALLET_DIR || env.MONERO_WALLET_DIR || join(homedir(), '.cache/xchain-suite/monero-wallets')
  const walletRpcLog =
    process.env.MONERO_WALLET_RPC_LOG || env.MONERO_WALLET_RPC_LOG || join(walletDir, 'xchain-wallet-rpc.log')

  const plugins = [react(), nodePolyfills(), wasm(), topLevelAwait()]
  if (!noMonero) {
    plugins.push(moneroWalletRpcPlugin(walletRpcBin, walletDir, walletRpcLog))
  }

  return {
    plugins,
    define: {
      'process.env': {},
      global: 'globalThis',
      // Expose to the app so sidebar/portfolio can hide XMR without a local node.
      'import.meta.env.VITE_NO_MONERO': JSON.stringify(noMonero ? '1' : ''),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Point at package source so suite picks up local WIP without reinstall
        '@xchainjs/xchain-monero': fileURLToPath(new URL('../../packages/xchain-monero/src/index.ts', import.meta.url)),
        '@xchainjs/xchain-sui': fileURLToPath(new URL('../../packages/xchain-sui/src/index.ts', import.meta.url)),
        stream: 'stream-browserify',
        process: 'process/browser',
        buffer: 'buffer',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: { global: 'globalThis' },
      },
      include: [
        'buffer',
        '@ledgerhq/hw-transport',
        '@ledgerhq/hw-transport-webhid',
        '@ledgerhq/hw-app-btc',
        '@ledgerhq/hw-app-eth',
      ],
      // Keep monorepo packages out of the dep optimizer so local edits are live
      exclude: ['@xchainjs/xchain-monero', '@xchainjs/xchain-sui'],
    },
    server: {
      port: 3000,
      // This machine is already at the inotify cap (~65k). Don't watch the
      // monorepo lib/ trees, and poll the small leftover set instead of ENOSPC.
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          '**/.git/**',
          '**/node_modules/**',
          '**/.turbo/**',
          '**/lib/**',
          '**/dist/**',
          '**/__tests__/**',
          '**/__e2e__/**',
          '**/__mocks__/**',
          '**/stats.html',
          '../../packages/**/lib/**',
          '../../packages/**/node_modules/**',
        ],
      },
      proxy: {
        ...(noMonero
          ? {}
          : {
              '/xmr-daemon': {
                target: LOCAL_MONEROD,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/xmr-daemon/, ''),
              },
              '/xmr-wallet': {
                target: LOCAL_WALLET_RPC,
                changeOrigin: true,
                timeout: 600_000,
                proxyTimeout: 600_000,
                rewrite: (path: string) => path.replace(/^\/xmr-wallet/, ''),
              },
            }),
        // Optional browser proxies if CORS or grpc-web headers misbehave in some environments
        '/sui-grpc': {
          target: 'https://fullnode.mainnet.sui.io:443',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/sui-grpc/, ''),
        },
        '/sui-graphql': {
          target: 'https://graphql.mainnet.sui.io',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/sui-graphql/, ''),
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  }
})
