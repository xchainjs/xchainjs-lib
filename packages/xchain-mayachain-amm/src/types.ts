import { QuoteMAYAName as BaseQuoteMAYAName } from '@xchainjs/xchain-mayachain-query'
import { Address, Asset, CryptoAmount } from '@xchainjs/xchain-util'
// Object representing a submitted transaction
export type TxSubmitted = {
  hash: string // The transaction hash
  url: string // The URL of the transaction
}

// Object representing parameters for approving a transaction
export type ApproveParams = {
  asset: Asset // The asset to approve
  amount: CryptoAmount | undefined // The amount to approve, or undefined for an infinite approval
}

// Object representing parameters for checking if a transaction is approved
export type IsApprovedParams = {
  asset: Asset // The asset to check approval for
  amount: CryptoAmount // The amount of the asset to be spent
  address: Address // The address to check approval for
}

/**
 * MAYAName quote parameters
 */
export type QuoteMAYAName = BaseQuoteMAYAName & {
  /**
   * If the action can be or not can be done
   */
  allowed: boolean
  /**
   * If any, list of errors with the reason the operation is not allowed
   */
  errors: string[]
}
