import {
  Balance as BaseBalance,
  ExplorerProviders,
  Tx as BaseTx,
  TxParams as BaseTxParams,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset } from '@xchainjs/xchain-util'

export type BlockfrostApiKey = {
  mainnet: string
  testnet: string
  stagenet: string
}

export type APIKeys = {
  blockfrostApiKeys: BlockfrostApiKey[]
}

export type DefaultADAClientParams = XChainClientParams & {
  explorerProviders: ExplorerProviders
}

/**
 * Cardano client params
 */
export type ADAClientParams = Partial<DefaultADAClientParams> & { apiKeys: APIKeys }

export type CompatibleAsset = Asset

export type Balance = BaseBalance & { asset: CompatibleAsset }

export type Tx = BaseTx & {
  asset: Asset
}

export type TxParams = BaseTxParams & {
  asset?: Asset
}
