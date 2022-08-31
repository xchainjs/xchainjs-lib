import { FeeOption } from '@xchainjs/xchain-client'
import { CryptoAmount } from '@xchainjs/xchain-thorchain-query'
import { Address, Asset, BaseAmount } from '@xchainjs/xchain-util'
import { BigNumber } from 'bignumber.js'

// export type PoolCache = {
//   lastRefreshed: number
//   pools: Record<string, LiquidityPool>
// }

// export type AsgardCache = {
//   lastRefreshed: number
//   inboundAddressesItems: Record<string, InboundAddressesItem>
// }
// export type InboundDetailCache = {
//   lastRefreshed: number
//   inboundDetails: Record<string, InboundDetail>
// }
// export type NetworkValuesCache = {
//   lastRefreshed: number
//   networkValues: Record<string, number>
// }

export type MidgardConfig = {
  apiRetries: number
  midgardBaseUrls: string[]
}

export type ExecuteSwap = {
  input: CryptoAmount
  destinationAsset: Asset
  limit: BaseAmount
  destinationAddress: Address
  affiliateAddress: Address
  affiliateFee: BaseAmount
  feeOption?: FeeOption
  interfaceID: number
  waitTimeSeconds: number
}

export type SwapSubmitted = {
  hash: string
  url: string
  waitTimeSeconds: number
}

export type DepositParams = {
  walletIndex?: number // send from this HD index
  asset: Asset
  amount: BaseAmount
  feeOption: FeeOption
  memo: string
}

export type SwapOutput = {
  output: CryptoAmount
  swapFee: CryptoAmount
  slip: BigNumber
}

export type UnitData = {
  liquidityUnits: BaseAmount
  totalUnits: BaseAmount
}

export type LiquidityData = {
  // assetDeposit: BaseAmount
  rune: BaseAmount
  asset: BaseAmount
}

// export type Block = {
//   current: number
//   lastAdded: number
//   fullProtection: number
// }

// export type Coverage = {
//   poolRatio: BaseAmount
// }

// export type InboundDetail = {
//   vault: string
//   router?: string
//   haltedChain: boolean
//   haltedTrading: boolean
//   haltedLP: boolean
//   gas_rate: BigNumber
// }

// export type ChainAttributes = {
//   blockReward: number
//   avgBlockTimeInSecs: number
// }
