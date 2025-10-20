import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AnyAsset, AssetType } from '@xchainjs/xchain-util'

export const TRX_DECIMAL = 6

export const TRON_DERIVATION_PATH = "m/44'/195'/0'/0/"

/**
 * Chain identifier for Tron mainnet
 */
export const TRONChain = 'TRON' as const

export const AssetTRX: Asset = {
  chain: TRONChain,
  symbol: 'TRX',
  ticker: 'TRX',
  type: AssetType.NATIVE,
}

export const AssetTRONUSDT: AnyAsset = {
  chain: TRONChain,
  symbol: 'USDT-TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  ticker: 'USDT',
  type: AssetType.TOKEN,
}
// Explorer providers for Tron
const TRON_MAINNET_EXPLORER = new ExplorerProvider(
  'https://tronscan.org/',
  'https://tronscan.org/#/address/%%ADDRESS%%',
  'https://tronscan.org/#/transaction/%%TX_ID%%',
)

const TRON_TESTNET_EXPLORER = new ExplorerProvider(
  'https://nile.tronscan.org/',
  'https://nile.tronscan.org/accounts/%%ADDRESS%%',
  'https://nile.tronscan.org/transactions/%%TX_ID%%',
)

export const TRON_DEFAULT_RPC = 'https://tron-rpc.publicnode.com'

export const tronExplorerProviders = {
  [Network.Mainnet]: TRON_MAINNET_EXPLORER,
  [Network.Stagenet]: TRON_MAINNET_EXPLORER,
  [Network.Testnet]: TRON_TESTNET_EXPLORER,
}

export const TRX_TRANSFER_BANDWIDTH = 268 // Bandwidth consumed by a TRX transfer
export const TRC20_TRANSFER_ENERGY = 13000 // Average energy consumed by TRC20 transfer
export const TRC20_TRANSFER_BANDWIDTH = 345 // Bandwidth consumed by TRC20 transfer

export const TRON_USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'

export const MAX_APPROVAL = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
export const TRX_FEE_LIMIT = 100_000_000

export interface TokenMetadata {
  symbol: string
  decimals: number
}

export const TRON_TOKEN_WHITELIST: Record<string, TokenMetadata> = {
  [TRON_USDT_CONTRACT]: {
    symbol: 'USDT',
    decimals: 6,
  },
}
