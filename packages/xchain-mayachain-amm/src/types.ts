import { Address, TokenAsset, TokenCryptoAmount } from '@xchainjs/xchain-util'
// Object representing a submitted transaction
export type TxSubmitted = {
  hash: string // The transaction hash
  url: string // The URL of the transaction
}

// Object representing parameters for approving a transaction
export type ApproveParams = {
  asset: TokenAsset // The asset to approve
  amount?: TokenCryptoAmount // The amount to approve, or undefined for an infinite approval
}

// Object representing parameters for checking if a transaction is approved
export type IsApprovedParams = {
  asset: TokenAsset // The asset to check approval for
  amount: TokenCryptoAmount // The amount of the asset to be spent
  address: Address // The address to check approval for
}
