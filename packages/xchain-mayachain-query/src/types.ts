import { TxHash } from '@xchainjs/xchain-client'
import { Address, Asset, Chain, CryptoAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

/**
 * Represents fees associated with a swap.
 */
export type Fees = {
  asset: Asset // The asset for which fees are calculated
  affiliateFee: CryptoAmount // The affiliate fee amount
  outboundFee: CryptoAmount // The outbound fee amount
}

/**
 * Represents a quote for a swap operation.
 */
export type QuoteSwap = {
  toAddress: Address // The destination address for the swap
  memo: string // The memo associated with the swap
  expectedAmount: CryptoAmount // The expected amount to be received after the swap
  dustThreshold: CryptoAmount // The dust threshold for the swap
  fees: Fees // The fees associated with the swap
  inboundConfirmationSeconds?: number // The inbound confirmation time in seconds
  inboundConfirmationBlocks?: number // The inbound confirmation time in blocks
  outboundDelaySeconds: number // The outbound delay time in seconds
  outboundDelayBlocks: number // The outbound delay time in blocks
  totalSwapSeconds: number // The total time for the swap operation
  slipBasisPoints: number // The slip basis points for the swap
  canSwap: boolean // Indicates whether the swap can be performed
  errors: string[] // Any errors encountered during the swap operation
  warning: string // Any warning messages associated with the swap
}

/**
 * Represents parameters for quoting a swap operation.
 */
export type QuoteSwapParams = {
  fromAsset: Asset // The asset to swap from
  destinationAsset: Asset // The asset to swap to
  amount: CryptoAmount // The amount to swap
  fromAddress?: string // The source address for the swap
  destinationAddress?: string // The destination address for the swap
  height?: number // The block height for the swap
  toleranceBps?: number // The tolerance basis points for the swap
  affiliateBps?: number // The affiliate basis points for the swap
  affiliateAddress?: string // The affiliate address for the swap
  streamingInterval?: number
  streamingQuantity?: number
}

/**
 * Represents details about an inbound address.
 */
export type InboundDetail = {
  chain: Chain // The chain associated with the inbound address
  address: Address // The inbound address
  router?: Address // The router address
  gasRate: BigNumber // The gas rate
  gasRateUnits: string // The units of the gas rate
  outboundTxSize: BigNumber // The outbound transaction size
  outboundFee: BigNumber // The outbound fee
  haltedChain: boolean // Indicates if the chain is halted
  haltedTrading: boolean // Indicates if trading is halted
  haltedLP: boolean // Indicates if LP (liquidity provision) is halted
}

export type SwapHistoryParams = {
  addresses: Address[]
}

/**
 * Transaction action
 */
export type TransactionAction = {
  hash: TxHash
  address: Address
  amount: CryptoAmount
}

/**
 * Swap resume
 */
export type Swap = {
  date: Date
  status: 'success' | 'pending'
  inboundTx: TransactionAction
  outboundTx?: TransactionAction
}

/**
 * Swap history
 */
export type SwapsHistory = {
  swaps: Swap[]
  count: number
}

/**
 * Represents an alias for a MAYAName.
 */
export type MAYANameAlias = {
  /**
   * The chain of the alias
   */
  chain: Chain
  /**
   * The address of the alias
   */
  address: Address
}

/**
 * Represents details about a MAYAName.
 */
export type MAYANameDetails = {
  /**
   * The MAYAName
   */
  name: string
  /**
   * The expiry block height
   */
  expireBlockHeight: number
  /**
   * The owner of the MAYAName
   */
  owner: string
  /**
   * List of MAYAName aliases
   */
  aliases: MAYANameAlias[]
}

/**
 * Register MAYAName parameters
 */
export type RegisterMAYAName = {
  /**
   * MAYAName to register
   */
  name: string
  /**
   * MAYAName owner
   */
  owner: Address
  /**
   * MAYAName expiry time, by default, it will be one year more or less
   */
  expiry?: Date
  /**
   * Chain on which create the alias of the MAYAName
   */
  chain: Chain
  /**
   * Address of the chain provided to create the alias of the MAYAName
   */
  chainAddress: Address
}

/**
 * Update MAYAName parameters
 */
export type UpdateMAYAName = {
  /**
   * MAYAName to update
   */
  name: string
  /**
   * MAYAName owner, if not provided, memo response will have the current owner
   */
  owner?: Address
  /**
   * MAYAName expiry
   */
  expiry?: Date
  /**
   * Chain on which update the alias of the MAYAName, if not provided, memo response will have one of the already registered chains of the MAYAName
   */
  chain?: Chain
  /**
   * Address of the chain provided to update the alias of the MAYAName, if not provided, memo response will have the address of the chain returned
   */
  chainAddress?: Address
}

export type QuoteMAYANameParams = (RegisterMAYAName & { isUpdate?: false }) | (UpdateMAYAName & { isUpdate: true })

/**
 * Estimation quote to register or update a MAYAName
 */
export type QuoteMAYAName = {
  /**
   * Memo for the deposit transaction
   */
  memo: string
  /**
   * Estimation of the update or the registration of the MAYAName
   */
  value: CryptoAmount
}
