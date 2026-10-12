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
// Base energy before the dynamic energy penalty. A USDT transfer receipt at
// energy_factor 34000 used 14,650 before the penalty when the recipient already
// held the token, and 29,650 when the balance slot was empty.
export const TRC20_TRANSFER_ENERGY = 14_650
export const TRC20_TRANSFER_ENERGY_EMPTY = 29_650
export const TRC20_TRANSFER_BANDWIDTH = 345 // Bandwidth consumed by a TRC20 transfer
// java-tron DYNAMIC_ENERGY_FACTOR_DECIMAL. total = base * (DECIMAL + energy_factor) / DECIMAL
export const DYNAMIC_ENERGY_FACTOR_DECIMAL = 10_000

export const applyDynamicEnergy = (baseEnergy: number, energyFactor: number): number => {
  if (energyFactor <= 0) return baseEnergy
  return Math.ceil((baseEnergy * (DYNAMIC_ENERGY_FACTOR_DECIMAL + energyFactor)) / DYNAMIC_ENERGY_FACTOR_DECIMAL)
}

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
