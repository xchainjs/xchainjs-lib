import { Network } from '@xchainjs/xchain-client'

/**
 * Chain types at Terra
 */
export type ChainType = 'mainnet' | 'testnet' | 'localterra'

/**
 * Chain definition
 * Note: We are interested in `name`, `chainID`, `lcd` only
 */
export type Chain = {
  chainID: string
  lcd: string
}

/**
 * Response of `https://assets.terra.money/chains.json`
 * Code: https://github.com/terra-money/assets/blob/master/chains.json
 */
export type ChainsResponse = Record<ChainType, Chain>

export type ChainId = string
/**
 * Parsed result of `ChainsResponse`
 */
export type ChainIds = Record<Network, ChainId>

export type Denom =
  | 'uluna'
  | 'usdr'
  | 'uusd'
  | 'ukrw'
  | 'umnt'
  | 'ueur'
  | 'ucny'
  | 'ujpy'
  | 'ugbp'
  | 'uinr'
  | 'ucad'
  | 'uchf'
  | 'uaud'
  | 'usgd'
  | 'uthb'
  | 'usek'
  | 'unok'
  | 'udkk'
  | 'uidr'
  | 'uphp'
  | 'uhkd'
  | 'umyr'
  | 'utwd'

export type FeesResponse = Record<Denom, number>
