import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'

import { XMRClientParams } from './types'

/**
 * Monero chain symbol
 */
export const XMRChain = 'XMR' as const

/**
 * Monero native asset decimals (piconero = 10^-12 XMR)
 */
export const XMR_DECIMALS = 12

/**
 * Approximate serialized weight of a 2-in/2-out RingCT tx, used to turn daemon
 * fee-per-byte into a displayable total. Wallet-rpc transfer computes the real fee.
 */
export const TYPICAL_TX_WEIGHT = 3000

/**
 * Max HD walletIndex scanned when resolving getBalance/getTransactions address
 * to a derived account (gap-limit style).
 */
export const MAX_WALLET_INDEX = 20

/**
 * Monero native asset
 */
export const AssetXMR: Asset = {
  chain: 'XMR',
  ticker: 'XMR',
  symbol: 'XMR',
  type: AssetType.NATIVE,
}

const mainnetExplorer = new ExplorerProvider(
  'https://xmrchain.net/',
  'https://xmrchain.net/search?value=%%ADDRESS%%',
  'https://xmrchain.net/tx/%%TX_ID%%',
)

const stagenetExplorer = new ExplorerProvider(
  'https://stagenet.xmrchain.net/',
  'https://stagenet.xmrchain.net/search?value=%%ADDRESS%%',
  'https://stagenet.xmrchain.net/tx/%%TX_ID%%',
)

export const defaultXMRParams: XMRClientParams = {
  network: Network.Mainnet,
  rootDerivationPaths: {
    [Network.Mainnet]: "m/44'/128'/",
    [Network.Testnet]: "m/44'/128'/",
    [Network.Stagenet]: "m/44'/128'/",
  },
  explorerProviders: {
    [Network.Mainnet]: mainnetExplorer,
    [Network.Testnet]: stagenetExplorer,
    [Network.Stagenet]: stagenetExplorer,
  },
  daemonUrls: {
    [Network.Mainnet]: ['https://xmr-node.cakewallet.com:18081', 'https://node.sethforprivacy.com'],
    [Network.Testnet]: ['http://stagenet.xmr-tw.org:38081'],
    [Network.Stagenet]: ['http://stagenet.xmr-tw.org:38081'],
  },
  lwsUrls: {
    [Network.Mainnet]: [],
    [Network.Testnet]: [],
    [Network.Stagenet]: [],
  },
  walletRpcUrls: {
    [Network.Mainnet]: [],
    [Network.Testnet]: [],
    [Network.Stagenet]: [],
  },
}
