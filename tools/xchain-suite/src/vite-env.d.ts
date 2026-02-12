/// <reference types="vite/client" />

declare module 'vite-plugin-node-stdlib-browser' {
  import type { Plugin } from 'vite'
  export default function nodePolyfills(): Plugin
}

interface ImportMetaEnv {
  readonly VITE_ANKR_API_KEY?: string
  readonly VITE_INFURA_API_KEY?: string
  readonly VITE_ALCHEMY_API_KEY?: string
  readonly VITE_ETHERSCAN_API_KEY?: string
  readonly VITE_BSCSCAN_API_KEY?: string
  readonly VITE_SNOWTRACE_API_KEY?: string
  readonly VITE_ARBISCAN_API_KEY?: string
  readonly VITE_BLOCKCYPHER_API_KEY?: string
  readonly VITE_SOCHAIN_API_KEY?: string
  readonly VITE_COVALENT_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
