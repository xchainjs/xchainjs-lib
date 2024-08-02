import { FeeOption, TxHash } from '@xchainjs/xchain-client'
import { LiquidityProviderSummary } from '@xchainjs/xchain-thornode'
import {
  Address,
  Asset,
  AssetCryptoAmount,
  BaseAmount,
  Chain,
  CryptoAmount,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  TradeCryptoAmount,
} from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

export type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset

/**
 * Represents the total fees associated with a swap.
 */
export type TotalFees = {
  asset: Asset | TokenAsset | SynthAsset | TradeAsset // The asset for which fees are calculated
  affiliateFee: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset> // The affiliate fee
  outboundFee: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset> // The outbound fee
}
/**
 * Represents an estimate for a swap transaction.
 */
export type SwapEstimate = {
  netOutput: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset> // The net output amount after fees
  totalFees: TotalFees // The total fees associated with the swap
  netOutputStreaming: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset> // The net output amount for streaming
  maxStreamingQuantity: number // The maximum streaming quantity
  inboundConfirmationSeconds?: number // The inbound confirmation time in seconds
  outboundDelaySeconds: number // The outbound delay time in seconds
  outboundDelayBlocks: number // The outbound delay in blocks
  recommendedMinAmountIn?: string // The recommended minimum amount for the swap input
  slipBasisPoints: number // The slip basis points
  streamingSlipBasisPoints: number // The slip basis points for streaming
  streamingSwapBlocks: number // The number of blocks for streaming swap
  streamingSwapSeconds: number // The time for streaming swap in seconds
  totalSwapSeconds: number // The total swap time in seconds
  canSwap: boolean // Indicates if swap can be performed
  errors: string[] // List of errors encountered during estimation
  warning: string // Any warning messages
}
/**
 * Represents parameters for requesting a swap quote.
 */
export type QuoteSwapParams = {
  fromAddress?: Address // The address to swap from
  fromAsset: Asset | TokenAsset | SynthAsset | TradeAsset // The asset to swap from
  destinationAsset: Asset | TokenAsset | SynthAsset | TradeAsset // The asset to swap to
  amount: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset> // The amount to swap
  destinationAddress?: string // The destination address (optional)
  streamingInterval?: number // The streaming interval (optional)
  streamingQuantity?: number // The streaming quantity (optional)
  toleranceBps?: number // The tolerance basis points (optional)
  affiliateAddress?: string // The affiliate address (optional)
  affiliateBps?: number // The affiliate basis points (optional)
  height?: number // The block height (optional)
  interfaceID?: string // The interface ID (optional)
  feeOption?: FeeOption // The fee option (optional)
}
/**
 * Represents the output of a swap transaction.
 */
export type SwapOutput = {
  output: CryptoAmount<Asset | TokenAsset | SynthAsset> // The output amount
  swapFee: CryptoAmount<Asset | TokenAsset | SynthAsset> // The swap fee
  slip: BigNumber // The slip
}
/**
 * Represents unit data.
 */
export type UnitData = {
  liquidityUnits: BigNumber // The liquidity units
  totalUnits: BigNumber // The total units
}

/**
 * Represents liquidity data.
 */
export type LiquidityData = {
  rune: Asset // The amount of RUNE
  asset: CryptoAmount // The amount of the asset
}
/**
 * Represents block information.
 */
export type Block = {
  current: number // The current block number
  lastAdded?: number // The last added block number
  fullProtection: number // The full protection value
}

/**
 * Represents impermanent loss protection data.
 */
export type ILProtectionData = {
  ILProtection: CryptoAmount // The impermanent loss protection amount
  totalDays: string // The total days
}

/**
 * Represents inbound detail.
 */
export type InboundDetail = {
  chain: Chain // The chain
  address: Address // The address
  router?: Address // The router address (optional)
  gasRate: BigNumber // The gas rate
  gasRateUnits: string // The gas rate units
  outboundTxSize: BigNumber // The outbound transaction size
  outboundFee: BigNumber // The outbound fee
  haltedChain: boolean // Indicates if the chain is halted
  haltedTrading: boolean // Indicates if trading is halted
  haltedLP: boolean // Indicates if LP is halted
}

/**
 * Represents chain attributes.
 */
export type ChainAttributes = {
  blockReward: number // The block reward
  avgBlockTimeInSecs: number // The average block time in seconds
}
/**
 * Represents parameters used to construct a memo for a transaction.
 */
export type ConstructMemo = {
  input: CryptoAmount // The input amount for the transaction
  destinationAsset: Asset // The destination asset for the transaction
  limit: BaseAmount // The limit for the transaction
  destinationAddress: Address // The destination address for the transaction
  affiliateAddress: Address // The affiliate address for the transaction
  affiliateFeeBasisPoints: number // The affiliate fee basis points
  feeOption?: FeeOption // The fee option for the transaction (optional)
  interfaceID: string // The interface ID for the transaction
}

/**
 * Represents details of a transaction.
 */
export type TxDetails = {
  memo: string // The memo for the transaction
  dustThreshold: CryptoAmount<Asset | TokenAsset | SynthAsset | TradeAsset> // The dust threshold for the transaction
  toAddress: Address // The recipient address for the transaction
  expiry: Date // The expiry date for the transaction
  txEstimate: SwapEstimate // The swap estimate for the transaction
}

/**
 * Represents the progress of a transaction.
 */
export type TransactionProgress = {
  progress: number // The progress of the transaction
  seconds: number // The time in seconds for the transaction
  errors: string[] // Any errors encountered during the transaction
}

/**
 * Represents the status of a transaction.
 */
export type TransactionStatus = {
  seconds: number // The time in seconds for the transaction
  error: string[] // Any errors encountered during the transaction
}

/**
 * Represents liquidity to add to a pool.
 */
export type LiquidityToAdd = {
  asset: CryptoAmount<Asset | TokenAsset> // The amount of asset to add
  rune: AssetCryptoAmount // The amount of RUNE to add
}

/**
 * Represents the deposit value of a position.
 */
export type PostionDepositValue = {
  asset: BaseAmount // The deposit value of the asset
  rune: BaseAmount // The deposit value of RUNE
}

/**
 * Represents the share detail of a pool.
 */
export type PoolShareDetail = {
  assetShare: CryptoAmount<Asset | TokenAsset> // The share of asset in the pool
  runeShare: AssetCryptoAmount // The share of RUNE in the pool
}

/**
 * Represents an estimate to add liquidity to a pool.
 */
export type EstimateAddLP = {
  assetPool: string // The pool for the asset
  slipPercent: BigNumber // The slip percentage
  poolShare: PoolShareDetail // The pool share detail
  lpUnits: BaseAmount // The liquidity pool units
  inbound: {
    // Details of inbound liquidity
    fees: LPAmounts // The fees associated with inbound liquidity
  }
  runeToAssetRatio: BigNumber // The ratio of RUNE to asset
  estimatedWaitSeconds: number // The estimated wait time in seconds
  recommendedMinAmountIn?: string // The recommended minimum amount to add to the pool
  errors: string[] // Any errors encountered during estimation
  canAdd: boolean // Indicates if liquidity can be added to the pool
}

/**
 * Represents an estimate to withdraw liquidity from a pool.
 */
export type EstimateWithdrawLP = {
  assetAddress?: string // The asset address (optional)
  runeAddress?: string // The RUNE address (optional)
  slipPercent: BigNumber // The slip percentage
  inbound: {
    // Details of inbound liquidity
    minToSend: LPAmounts // The minimum amount to send
    fees: LPAmounts // The fees associated with inbound liquidity
  }
  outboundFee: LPAmounts // The outbound fees
  assetAmount: CryptoAmount<Asset | TokenAsset> // The amount of asset
  runeAmount: AssetCryptoAmount // The amount of RUNE
  lpGrowth: string // The LP growth
  impermanentLossProtection: ILProtectionData // The impermanent loss protection data
  estimatedWaitSeconds: number // The estimated wait time in seconds
  assetPool: string // The asset pool
}

/**
 * Represents liquidity pool amounts.
 */
export type LPAmounts = {
  rune: AssetCryptoAmount // The amount of RUNE
  asset: CryptoAmount<Asset | TokenAsset> // The amount of asset
  total: AssetCryptoAmount // The total amount
}

/**
 * Represents dust values for assets and RUNE.
 */
export type DustValues = {
  asset: AssetCryptoAmount // The dust value for assets
  rune: AssetCryptoAmount // The dust value for RUNE
}

/**
 * Represents liquidity to be added to a position.
 */
export type AddliquidityPosition = {
  asset: CryptoAmount<Asset | TokenAsset> // The amount of asset to add to the position
  rune: AssetCryptoAmount // The amount of RUNE to add to the position
}

/**
 * Represents a position for withdrawing liquidity.
 */
export type WithdrawLiquidityPosition = {
  asset: Asset | TokenAsset // The asset of the position
  percentage: number // The percentage of liquidity to withdraw
  assetAddress?: string // The asset address (optional)
  runeAddress?: string // The RUNE address (optional)
}

/**
 * Represents a liquidity position.
 */
export type LiquidityPosition = {
  poolShare: PoolShareDetail // The pool share detail
  position: LiquidityProviderSummary // The liquidity provider summary
  lpGrowth: string // The LP growth
  impermanentLossProtection: ILProtectionData // The impermanent loss protection data
}

/**
 * Represents pool ratios for assets and RUNE.
 */
export type PoolRatios = {
  assetToRune: BigNumber // The ratio of assets to RUNE
  runeToAsset: BigNumber // The ratio of RUNE to assets
}

/**
 * Represents parameters for getting a saver.
 */
export type getSaver = {
  asset: Asset | TokenAsset // The asset of the saver
  address: Address // The address of the saver
  height?: number // The height (optional)
}

/**
 * Represents an estimate for adding a saver.
 */
export type EstimateAddSaver = {
  assetAmount: CryptoAmount<Asset | TokenAsset> // The amount of asset to add
  estimatedDepositValue: CryptoAmount<Asset | TokenAsset> // The estimated deposit value
  slipBasisPoints: number // The slip basis points
  fee: SaverFees // The saver fees
  expiry: Date // The expiry date
  toAddress: Address // The recipient address
  memo: string // The memo
  saverCapFilledPercent: number // The percentage of saver cap filled
  estimatedWaitTime: number // The estimated wait time
  recommendedMinAmountIn?: string // The recommended minimum amount to add (optional)
  canAddSaver: boolean // Indicates if the saver can be added
  errors: string[] // Any errors encountered
}

/**
 * Represents an estimate for withdrawing a saver.
 */
export type EstimateWithdrawSaver = {
  dustAmount: AssetCryptoAmount // The dust amount
  dustThreshold: AssetCryptoAmount // The dust threshold
  expectedAssetAmount: CryptoAmount<Asset | TokenAsset> // The expected asset amount
  fee: SaverFees // The saver fees
  expiry: Date // The expiry date
  toAddress: Address // The recipient address
  memo: string // The memo
  inboundDelayBlocks: number // The inbound delay blocks
  inboundDelaySeconds: number // The inbound delay seconds
  outBoundDelayBlocks: number // The outbound delay blocks
  outBoundDelaySeconds: number // The outbound delay seconds
  slipBasisPoints: number // The slip basis points
  errors: string[] // Any errors encountered
}

/**
 * Represents fees for a saver.
 */
export type SaverFees = {
  affiliate: CryptoAmount<Asset | TokenAsset> // The affiliate fee
  asset: Asset | TokenAsset // The asset
  liquidity: CryptoAmount<Asset | TokenAsset> // The liquidity fee
  outbound: CryptoAmount<Asset | TokenAsset> // The outbound fee
  totalBps: number // The total basis points
}

/**
 * Represents fees for a quote.
 */
export type QuoteFees = {
  asset: string // The asset
  liquidity?: string // The liquidity fee (optional)
  outbound?: string // The outbound fee (optional)
  total_bps?: number // The total basis points (optional)
}

/**
 * Represents a saver's position.
 */
export type SaversPosition = {
  depositValue: CryptoAmount<Asset | TokenAsset> // The deposit value
  redeemableValue: CryptoAmount<Asset | TokenAsset> // The redeemable value
  lastAddHeight: number // The last add height
  percentageGrowth: number // The percentage growth
  ageInYears: number // The age in years
  ageInDays: number // The age in days
  asset: Asset | TokenAsset // The asset
  errors: string[] // Any errors encountered
}

/**
 * Represents parameters for withdrawing a saver.
 */
export type SaversWithdraw = {
  height?: number // The height (optional)
  asset: Asset | TokenAsset // The asset
  address: Address // The address
  withdrawBps: number // The withdrawal basis points
}

/**
 * Represents parameters for opening a loan.
 */
export type LoanOpenParams = {
  asset: Asset | TokenAsset // The asset
  amount: CryptoAmount<Asset | TokenAsset> // The amount
  targetAsset: Asset | TokenAsset // The target asset
  destination: string // The destination
  height?: number // The height (optional)
  minOut?: string // The minimum output (optional)
  affiliateBps?: number // The affiliate basis points (optional)
  affiliate?: string // The affiliate (optional)
}
/**
 * Represents parameters for closing a loan.
 */
export type LoanCloseParams = {
  asset: Asset | TokenAsset // The asset
  amount: CryptoAmount<Asset | TokenAsset> // The amount
  loanAsset: Asset | TokenAsset // The loan asset
  loanOwner: Address // The loan owner
  minOut?: string // The minimum output (optional)
  height?: number // The height (optional)
}

/**
 * Represents the quote for opening a loan.
 */
export type LoanOpenQuote = {
  inboundAddress?: string // The inbound address
  expectedWaitTime: BlockInformation // Information about expected wait time
  fees: QuoteFees // Fees associated with the loan
  slippageBps?: number // Slippage basis points
  router?: string // The router
  expiry: number // The expiry time
  warning: string // Any warning messages
  notes: string // Additional notes
  dustThreshold?: string // Dust threshold
  recommendedMinAmountIn?: string // Recommended minimum amount to deposit
  memo?: string // Memo
  expectedAmountOut: string // Expected amount out
  expectedCollateralizationRatio: string // Expected collateralization ratio
  expectedCollateralDeposited: string // Expected collateral deposited
  expectedDebtIssued: string // Expected debt issued
  errors: string[] // Any errors encountered
}

/**
 * Represents the quote for closing a loan.
 */
export type LoanCloseQuote = {
  inboundAddress?: string // The inbound address
  expectedWaitTime: BlockInformation // Information about expected wait time
  fees: QuoteFees // Fees associated with the loan
  slippageBps?: number // Slippage basis points
  router?: string // The router
  expiry: number // The expiry time
  warning: string // Any warning messages
  notes: string // Additional notes
  dustThreshold?: string // Dust threshold
  recommendedMinAmountIn?: string // Recommended minimum amount to withdraw
  memo?: string // Memo
  expectedAmountOut: string // Expected amount out
  expectedCollateralWithdrawn: string // Expected collateral withdrawn
  expectedDebtRepaid: string // Expected debt repaid
  errors: string[] // Any errors encountered
}

/**
 * Represents block information.
 */
export type BlockInformation = {
  inboundConfirmationBlocks?: number // Number of inbound confirmation blocks
  inboundConfirmationSeconds?: number // Number of inbound confirmation seconds
  outboundDelayBlocks?: number // Number of outbound delay blocks
  outbondDelaySeconds?: number // Number of outbound delay seconds
}

/**
 * Represents details about a THORName.
 */
export type ThornameDetails = {
  name: string // The THORName
  expireBlockHeight: number // The expiry block height
  owner: string // The owner of the THORName
  preferredAsset: string // The preferred asset
  affiliateCollectorRune: string // The affiliate collector RUNE
  aliases: ThornameAlias[] // List of THORName aliases
  error?: string[] // Any errors encountered
}

/**
 * Represents an alias for a THORName.
 */
export type ThornameAlias = {
  chain: Chain // The chain of the alias
  address: Address // The address of the alias
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

export type RegisterTHORName = {
  /**
   * THORName to register
   */
  name: string
  /**
   * THORName owner
   */
  owner: Address
  /**
   * THORName expiry time, by default, it will be one year more or less
   */
  expiry?: Date
  /**
   * Chain on which create the alias of the THORName
   */
  chain: Chain
  /**
   * Address of the chain provided to create the alias of the THORName
   */
  chainAddress: Address
  /**
   * Preferred asset to be paid
   */
  preferredAsset?: Asset
}

export type UpdateTHORName = {
  /**
   * THORName to update
   */
  name: string
  /**
   * THORName owner, if not provided, memo response will have the current owner
   */
  owner?: Address
  /**
   * THORName expiry
   */
  expiry?: Date
  /**
   * Chain on which update the alias of the THORName, if not provided, memo response will have one of the already registered chains of the THORName
   */
  chain?: Chain
  /**
   * Address of the chain provided to update the alias of the THORName, if not provided, memo response will have the address of the chain returned
   */
  chainAddress?: Address
  /**
   * Preferred asset to be paid, if not provided, memo response will have the current preferred asset
   */
  preferredAsset?: Asset
}

export type QuoteTHORNameParams = (RegisterTHORName & { isUpdate?: false }) | (UpdateTHORName & { isUpdate: true })

/**
 * Estimation quote to register or update a THORName
 */
export type QuoteTHORName = {
  /**
   * Memo for the deposit transaction
   */
  memo: string
  /**
   * Estimation of the update or the registration of the THORName
   */
  value: AssetCryptoAmount
}

/**
 * Get trade asset unit params
 */
export type TradeAssetUnitsParams = {
  /**
   * Trade asset
   */
  asset: TradeAsset
  /**
   * Height
   */
  height?: number
}

/**
 * Get trade asset unit params
 */
export type TradeAssetUnits = {
  /**
   * Trade asset
   */
  asset: TradeAsset
  /**
   * Total units of trade asset
   */
  units: TradeCryptoAmount
  /**
   * Total depth of trade asset
   */
  depth: TradeCryptoAmount
}

/**
 * Get trade asset unit params
 */
export type TradeAssetsUnitsParams = {
  /**
   * Height
   */
  height?: number
}

/**
 * Get trade asset information from address
 */
export type AddressTradeAccountsParams = {
  /**
   * Thorchain address
   */
  address: Address
  /**
   * Height
   */
  height?: number
}

/**
 * Trade asset account information
 */
export type AddressTradeAccounts = {
  /**
   * Trade asset
   */
  asset: TradeAsset
  /**
   * Address
   */
  address: Address
  /**
   * Trade asset balance
   */
  balance: TradeCryptoAmount
  /**
   * Last thorchain height trade assets were added to trade account
   */
  lastAddHeight?: number
  /**
   * Last thorchain height trade assets were withdrawn from trade account
   */
  lastWithdrawHeight?: number
}

/**
 * Get trade asset accounts
 */
export type TradeAssetAccountsParams = {
  /**
   * Trade asset
   */
  asset: TradeAsset
  /**
   * Height
   */
  height?: number
}

/**
 * Trade asset account information
 */
export type TradeAssetAccounts = {
  /**
   * Trade asset balance
   */
  asset: TradeAsset
  /**
   * Last thorchain height trade assets were added to trade account
   */
  address: Address
  /**
   * Trade asset balance
   */
  balance: TradeCryptoAmount
  /**
   * Last thorchain height trade assets were added to trade account
   */
  lastAddHeight?: number
  /**
   * Last thorchain height trade assets were withdrawn from trade account
   */
  lastWithdrawHeight?: number
}
