import { Asset, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset

/**
 * Live Chainflip deposit channel opened via `openDepositChannel` /
 * `Aggregator.requestChainflipDepositAddress`.
 *
 * Do not cache across `expiresAt`. Open immediately before broadcast.
 */
export type ChainflipDepositChannel = {
  depositAddress: string
  depositChannelId: string
  /** From SDK `estimatedDepositChannelExpiryTime` (unix seconds). */
  expiresAt: Date
  depositChannelExpiryBlock?: bigint
}
