import { ExplorerProvider, Network } from '@xchainjs/xchain-client'
import { Asset, AssetType } from '@xchainjs/xchain-util'
import { NownodesProvider, UtxoOnlineDataProviders } from '@xchainjs/xchain-utxo-providers'

export const MIN_TX_FEE = 10000

export const ZEC_DECIMAL = 8

export const LOWER_FEE_BOUND = 10000
export const UPPER_FEE_BOUND = 100000

export const ZECChain = 'ZEC' as const

export const AssetZEC: Asset = { chain: ZECChain, symbol: 'ZEC', ticker: 'ZEC', type: AssetType.NATIVE }

const ZEC_MAINNET_EXPLORER = new ExplorerProvider(
  'https://blockchair.com/zcash/',
  'https://blockchair.com/zcash/address/%%ADDRESS%%',
  'https://blockchair.com/zcash/transaction/%%TX_ID%%',
)
const ZEC_TESTNET_EXPLORER = new ExplorerProvider(
  'https://testnet.zcashexplorer.app/',
  'https://testnet.zcashexplorer.app/address/%%ADDRESS%%',
  'https://testnet.zcashexplorer.app/transactions/%%TX_ID%%',
)
export const zcashExplorerProviders = {
  [Network.Testnet]: ZEC_TESTNET_EXPLORER,
  [Network.Stagenet]: ZEC_MAINNET_EXPLORER,
  [Network.Mainnet]: ZEC_MAINNET_EXPLORER,
}

const mainnetNownodesProvider = new NownodesProvider(
  'https://zecbook.nownodes.io/api/v2',
  ZECChain,
  AssetZEC,
  ZEC_DECIMAL,
  process.env.NOWNODES_API_KEY || '',
)

export const NownodesProviders: UtxoOnlineDataProviders = {
  [Network.Testnet]: undefined,
  [Network.Stagenet]: mainnetNownodesProvider,
  [Network.Mainnet]: mainnetNownodesProvider,
}

/**
 * Optional fallback Blockbook backend so a single-provider outage (e.g. a nownodes 502)
 * cannot block ZEC broadcasts. It reuses the Blockbook-based {@link NownodesProvider}, so any
 * Blockbook-compatible Zcash endpoint works — GetBlock is the intended target.
 *
 * Configured entirely via env and disabled when unset:
 * - `ZEC_FALLBACK_BLOCKBOOK_URL` — Blockbook `/api/v2` base URL. GetBlock embeds its access
 *   token in the path (e.g. `https://go.getblock.io/<TOKEN>/api/v2`).
 * - `ZEC_FALLBACK_BLOCKBOOK_API_KEY` — sent as the `api-key` header; leave empty for GetBlock
 *   since its token lives in the URL.
 */
const fallbackBlockbookUrl = process.env.ZEC_FALLBACK_BLOCKBOOK_URL
const fallbackBlockbookProvider = fallbackBlockbookUrl
  ? new NownodesProvider(
      fallbackBlockbookUrl,
      ZECChain,
      AssetZEC,
      ZEC_DECIMAL,
      process.env.ZEC_FALLBACK_BLOCKBOOK_API_KEY || '',
    )
  : undefined

export const FallbackBlockbookProviders: UtxoOnlineDataProviders | undefined = fallbackBlockbookProvider
  ? {
      [Network.Testnet]: undefined,
      [Network.Stagenet]: fallbackBlockbookProvider,
      [Network.Mainnet]: fallbackBlockbookProvider,
    }
  : undefined

/** Primary nownodes, then the optional fallback. Round-robin uses the fallback only if nownodes fails. */
export const zcashDataProviders: UtxoOnlineDataProviders[] = FallbackBlockbookProviders
  ? [NownodesProviders, FallbackBlockbookProviders]
  : [NownodesProviders]
