import { FeeOption, TxHash } from '@xchainjs/xchain-client'
import { LiquidityProviderSummary } from '@xchainjs/xchain-thornode'
import {
  Address,
  Asset,
  AssetCryptoAmount,
  BaseAmount,
  Chain,
  CryptoAmount,
  SecuredAsset,
  SynthAsset,
  TokenAsset,
  TradeAsset,
  TradeCryptoAmount,
} from '@xchainjs/xchain-util'
import type BigNumber from 'bignumber.js'

export type CompatibleAsset = Asset | TokenAsset | SynthAsset | TradeAsset | SecuredAsset

export type TotalFees = {
  asset: CompatibleAsset
  affiliateFee: CryptoAmount<CompatibleAsset>
  outboundFee: CryptoAmount<CompatibleAsset>
  liquidityFee: CryptoAmount<CompatibleAsset>
}

export type SwapEstimate = {
  netOutput: CryptoAmount<CompatibleAsset>
  totalFees: TotalFees
  netOutputStreaming: CryptoAmount<CompatibleAsset>
  maxStreamingQuantity: number
  inboundConfirmationSeconds?: number
  outboundDelaySeconds: number
  outboundDelayBlocks: number
  recommendedMinAmountIn?: string
  slipBasisPoints: number
  streamingSlipBasisPoints: number
  streamingSwapBlocks: number
  streamingSwapSeconds: number
  totalSwapSeconds: number
  router: string
  recommendedGasRate: string
  canSwap: boolean
  errors: string[]
  warning: string
}

export type Affiliate = {
  address: string // address or THORName
  bps: number // affiliate bps, 0-1000 on THORChain
}

export type QuoteSwapParams = {
  fromAddress?: Address
  fromAsset: CompatibleAsset
  destinationAsset: CompatibleAsset
  amount: CryptoAmount<CompatibleAsset>
  destinationAddress?: string
  streamingInterval?: number
  streamingQuantity?: number
  toleranceBps?: number
  liquidityToleranceBps?: number // pool swing tolerance
  affiliateAddress?: string // mutually exclusive with affiliates
  affiliateBps?: number // mutually exclusive with affiliates
  // Multi-affiliate form. THORChain accepts up to 5 affiliates per swap with per-affiliate bps;
  // each bps must be 0-1000. Mutually exclusive with the singular affiliateAddress / affiliateBps.
  affiliates?: Affiliate[]
  height?: number
  interfaceID?: string
  feeOption?: FeeOption
}

export type SwapOutput = {
  output: CryptoAmount<CompatibleAsset>
  swapFee: CryptoAmount<CompatibleAsset>
  slip: BigNumber
}

export type UnitData = {
  liquidityUnits: BigNumber
  totalUnits: BigNumber
}

export type LiquidityData = {
  rune: Asset
  asset: CryptoAmount
}

export type Block = {
  current: number
  lastAdded?: number
  fullProtection: number
}

export type ILProtectionData = {
  ILProtection: CryptoAmount
  totalDays: string
}

export type InboundDetail = {
  chain: Chain
  address: Address
  router?: Address
  gasRate: BigNumber
  gasRateUnits: string
  outboundTxSize: BigNumber
  outboundFee: BigNumber
  haltedChain: boolean
  haltedTrading: boolean
  haltedLP: boolean
  // Inbound dust_threshold, in 1e8. XRP's 100000000 is 1 XRP, not 100 XRP of drops.
  dustThreshold?: BigNumber
}

export type ChainAttributes = {
  blockReward: number
  avgBlockTimeInSecs: number
}

export type ConstructMemo = {
  input: CryptoAmount
  destinationAsset: Asset
  limit: BaseAmount
  destinationAddress: Address
  affiliateAddress: Address
  affiliateFeeBasisPoints: number
  feeOption?: FeeOption
  interfaceID: string
}

export type TxDetails = {
  memo: string
  dustThreshold: CryptoAmount<CompatibleAsset>
  toAddress: Address
  expiry: Date
  txEstimate: SwapEstimate
}

export type TransactionProgress = {
  progress: number
  seconds: number
  errors: string[]
}

export type TransactionStatus = {
  seconds: number
  error: string[]
}

export type LiquidityToAdd = {
  asset: CryptoAmount<Asset | TokenAsset>
  rune: AssetCryptoAmount
}

export type PostionDepositValue = {
  asset: BaseAmount
  rune: BaseAmount
}

export type PoolShareDetail = {
  assetShare: CryptoAmount<Asset | TokenAsset>
  runeShare: AssetCryptoAmount
}

export type EstimateAddLP = {
  assetPool: string
  slipPercent: BigNumber
  poolShare: PoolShareDetail
  lpUnits: BaseAmount
  inbound: {
    fees: LPAmounts
  }
  runeToAssetRatio: BigNumber
  estimatedWaitSeconds: number
  recommendedMinAmountIn?: string
  errors: string[]
  canAdd: boolean
}

export type EstimateWithdrawLP = {
  assetAddress?: string
  runeAddress?: string
  slipPercent: BigNumber
  inbound: {
    minToSend: LPAmounts
    fees: LPAmounts
  }
  outboundFee: LPAmounts
  assetAmount: CryptoAmount<Asset | TokenAsset>
  runeAmount: AssetCryptoAmount
  lpGrowth: string
  impermanentLossProtection: ILProtectionData
  estimatedWaitSeconds: number
  assetPool: string
}

export type LPAmounts = {
  rune: AssetCryptoAmount
  asset: CryptoAmount<Asset | TokenAsset>
  total: AssetCryptoAmount
}

export type DustValues = {
  asset: AssetCryptoAmount
  rune: AssetCryptoAmount
}

export type AddliquidityPosition = {
  asset: CryptoAmount<Asset | TokenAsset>
  rune: AssetCryptoAmount
}

export type WithdrawLiquidityPosition = {
  asset: Asset | TokenAsset
  percentage: number
  assetAddress?: string
  runeAddress?: string
}

export type LiquidityPosition = {
  poolShare: PoolShareDetail
  position: LiquidityProviderSummary
  lpGrowth: string
  impermanentLossProtection: ILProtectionData
}

export type PoolRatios = {
  assetToRune: BigNumber
  runeToAsset: BigNumber
}

export type QuoteFees = {
  asset: string
  liquidity?: string
  outbound?: string
  total_bps?: number
}

export type LoanOpenParams = {
  asset: Asset | TokenAsset
  amount: CryptoAmount<Asset | TokenAsset>
  targetAsset: Asset | TokenAsset
  destination: string
  height?: number
  minOut?: string
  affiliateBps?: number
  affiliate?: string
}

export type LoanCloseParams = {
  asset: Asset | TokenAsset
  amount: CryptoAmount<Asset | TokenAsset>
  loanAsset: Asset | TokenAsset
  loanOwner: Address
  minOut?: string
  height?: number
}

export type LoanOpenQuote = {
  inboundAddress?: string
  expectedWaitTime: BlockInformation
  fees: QuoteFees
  slippageBps?: number
  router?: string
  expiry: number
  warning: string
  notes: string
  dustThreshold?: string
  recommendedMinAmountIn?: string
  memo?: string
  expectedAmountOut: string
  expectedCollateralizationRatio: string
  expectedCollateralDeposited: string
  expectedDebtIssued: string
  errors: string[]
}

export type LoanCloseQuote = {
  inboundAddress?: string
  expectedWaitTime: BlockInformation
  fees: QuoteFees
  slippageBps?: number
  router?: string
  expiry: number
  warning: string
  notes: string
  dustThreshold?: string
  recommendedMinAmountIn?: string
  memo?: string
  expectedAmountOut: string
  expectedCollateralWithdrawn: string
  expectedDebtRepaid: string
  errors: string[]
}

export type BlockInformation = {
  inboundConfirmationBlocks?: number
  inboundConfirmationSeconds?: number
  outboundDelayBlocks?: number
  outbondDelaySeconds?: number
}

export type ThornameDetails = {
  name: string
  expireBlockHeight: number
  owner: string
  preferredAsset: string
  affiliateCollectorRune: string
  aliases: ThornameAlias[]
  error?: string[]
}

export type ThornameAlias = {
  chain: Chain
  address: Address
}

export type SwapHistoryParams = {
  addresses: Address[]
}

export type TransactionAction = {
  hash: TxHash
  address: Address
  amount: CryptoAmount
}

export type SuccessSwap = {
  date: Date
  fromAsset: CompatibleAsset
  toAsset: CompatibleAsset
  status: 'success'
  inboundTx: TransactionAction
  outboundTx: TransactionAction
}

export type PendingSwap = {
  date: Date
  fromAsset: CompatibleAsset
  toAsset: CompatibleAsset
  status: 'pending'
  inboundTx: TransactionAction
}

export type Swap = SuccessSwap | PendingSwap

export type SwapsHistory = {
  swaps: Swap[]
  count: number
}

export type RegisterTHORName = {
  name: string
  owner: Address
  expiry?: Date // defaults to about one year
  chain: Chain
  chainAddress: Address
  preferredAsset?: Asset // asset to be paid
}

export type UpdateTHORName = {
  name: string
  owner?: Address // omitted: memo uses the current owner
  expiry?: Date
  chain?: Chain // omitted: memo uses a registered chain
  chainAddress?: Address // omitted: memo uses the returned chain's address
  preferredAsset?: Asset // asset to be paid; if omitted, memo uses the current one
}

export type QuoteTHORNameParams = (RegisterTHORName & { isUpdate?: false }) | (UpdateTHORName & { isUpdate: true })

export type QuoteTHORName = {
  memo: string
  value: AssetCryptoAmount
}

export type TradeAssetUnitsParams = {
  asset: TradeAsset
  height?: number
}

export type TradeAssetUnits = {
  asset: TradeAsset
  units: TradeCryptoAmount
  depth: TradeCryptoAmount
}

export type TradeAssetsUnitsParams = {
  height?: number
}

export type AddressTradeAccountsParams = {
  address: Address
  height?: number
}

export type AddressTradeAccounts = {
  asset: TradeAsset
  address: Address
  balance: TradeCryptoAmount
  lastAddHeight?: number // THORChain height of last add
  lastWithdrawHeight?: number // THORChain height of last withdraw
}

export type TradeAssetAccountsParams = {
  asset: TradeAsset
  height?: number
}

export type TradeAssetAccounts = {
  asset: TradeAsset
  address: Address
  balance: TradeCryptoAmount
  lastAddHeight?: number // THORChain height of last add
  lastWithdrawHeight?: number // THORChain height of last withdraw
}

export type RunePoolParams = {
  height?: number
}

type POL = {
  runeDeposited: AssetCryptoAmount // total RUNE deposited into pools
  runeWithdrawn: AssetCryptoAmount // total RUNE withdrawn from pools
  value: AssetCryptoAmount // protocol LP value in RUNE
  pnl: AssetCryptoAmount
  currentRuneDeposited: AssetCryptoAmount
}

type Providers = {
  units: string // includes pending
  pendingUnits: string
  pendingRune: AssetCryptoAmount
  value: AssetCryptoAmount // includes pending RUNE
  pnl: AssetCryptoAmount
  currentRuneDeposited: AssetCryptoAmount
}

type Reserve = {
  units: string
  value: AssetCryptoAmount
  pnl: AssetCryptoAmount
  currentRuneDeposited: AssetCryptoAmount
}

export type RunePool = {
  pol: POL
  providers: Providers
  reserve: Reserve
}

export type RunePoolProviderParams = {
  address: Address
  height?: number
}

export type RunePoolProvider = {
  address: Address
  units: string
  value: AssetCryptoAmount
  pnl: AssetCryptoAmount
  depositAmount: AssetCryptoAmount
  withdrawAmount: AssetCryptoAmount
  lastDepositHeight: number
  lastWithdrawHeight: number
}

export type RunePoolProvidersParams = {
  height?: number
}
