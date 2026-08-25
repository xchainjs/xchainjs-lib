import { Asset, CryptoAmount, TokenAsset } from '@xchainjs/xchain-util'

export type CompatibleAsset = Asset | TokenAsset

/**
 * Live Chainflip deposit channel opened via `openDepositChannel` /
 * `Aggregator.requestChainflipDepositAddress`.
 *
 * Do not cache across `expiresAt`. Open immediately before broadcast.
 * `expectedAmount` / `slipBasisPoints` are from the quote used to open the
 * channel (may differ from a prior `estimateSwap` if markets moved).
 */
export type ChainflipDepositChannel = {
  depositAddress: string
  depositChannelId: string
  /**
   * Channel expiry. Prefer SDK `estimatedDepositChannelExpiryTime` (unix seconds).
   * Broker-mode SDK responses omit that field — then a ~24h fallback is used
   * (Chainflip deposit-channel lifetime).
   */
  expiresAt: Date
  depositChannelExpiryBlock?: bigint
  /** Egress amount from the quote bound to this channel. */
  expectedAmount: CryptoAmount
  slipBasisPoints: number
}
