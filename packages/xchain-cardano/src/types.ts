import { Balance as BaseBalance, ExplorerProviders, XChainClientParams } from '@xchainjs/xchain-client'
import { Asset, TokenAsset } from '@xchainjs/xchain-util'

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

export type CompatibleAsset = Asset | TokenAsset

export type Balance = BaseBalance & { asset: CompatibleAsset }
