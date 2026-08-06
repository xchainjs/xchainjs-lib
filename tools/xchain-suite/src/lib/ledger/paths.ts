import { Network, type RootDerivationPaths } from '@xchainjs/xchain-client'

/**
 * Rewrite the BIP account slot (3rd hardened component).
 * e.g. m/84'/0'/0'/0/ + account 5 → m/84'/0'/5'/0/
 *
 * Paths that use an `{index}` placeholder (Ledger Live ETH) are left unchanged —
 * the wallet index already fills the account position.
 */
export function withAccountIndex(rootPath: string, accountIndex: number): string {
  if (rootPath.includes('{index}')) return rootPath
  const match = rootPath.match(/^(m\/\d+'\/\d+')\/\d+'(\/.*)$/)
  if (!match) return rootPath
  return `${match[1]}/${accountIndex}'${match[2]}`
}

/** BTC clients append walletIndex to the root — ensure a trailing slash. */
export function normalizeBtcRootPath(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return trimmed
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`
}

/**
 * ETH signer strips a trailing slash then appends `/${walletIndex}`, or substitutes `{index}`.
 * Keep user input as-is aside from trim.
 */
export function normalizeEthRootPath(path: string): string {
  return path.trim()
}

export type DerivationPathOverrides = {
  /** BIP account index (default 0). Ignored when path uses `{index}`. */
  accountIndex?: number
  /**
   * Optional full root path override applied to every network.
   * BTC examples: m/84'/0'/5'/0/  ·  ETH default: m/44'/60'/2'/0/  ·  ETH Live: m/44'/60'/{index}'/0/0
   */
  customRootPath?: string
}

/**
 * Apply account-index rewrite and/or a custom root path to a RootDerivationPaths map.
 */
export function applyDerivationOverrides(
  roots: RootDerivationPaths | undefined,
  overrides: DerivationPathOverrides,
  kind: 'btc' | 'eth',
): RootDerivationPaths | undefined {
  if (!roots) return roots

  const accountIndex = overrides.accountIndex ?? 0
  const custom = overrides.customRootPath?.trim()

  if (custom) {
    const normalized = kind === 'btc' ? normalizeBtcRootPath(custom) : normalizeEthRootPath(custom)
    return {
      [Network.Mainnet]: normalized,
      [Network.Testnet]: normalized,
      [Network.Stagenet]: normalized,
    }
  }

  if (accountIndex === 0) return roots

  const next = {} as RootDerivationPaths
  for (const network of [Network.Mainnet, Network.Testnet, Network.Stagenet] as const) {
    next[network] = withAccountIndex(roots[network], accountIndex)
  }
  return next
}

/** Preview the effective root path (mainnet) for UI labels. */
export function previewRootPath(
  baseRoot: string,
  overrides: DerivationPathOverrides,
  kind: 'btc' | 'eth',
): string {
  const custom = overrides.customRootPath?.trim()
  if (custom) {
    return kind === 'btc' ? normalizeBtcRootPath(custom) : normalizeEthRootPath(custom)
  }
  return withAccountIndex(baseRoot, overrides.accountIndex ?? 0)
}
