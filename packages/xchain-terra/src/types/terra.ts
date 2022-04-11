import { PublicKey } from '@terra-money/terra.js'
import { Network } from '@xchainjs/xchain-client'
import BigNumber from 'bignumber.js'

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

/**
 * Denominatioins of all Terra native assets
 * Based on https://github.com/terra-kitchen/utils/blob/main/src/currencies.json
 */
const TERRA_NATIVE_DENOMS = [
  'uluna',
  'usdr',
  'uaed',
  'uafn',
  'uall',
  'uamd',
  'uang',
  'uaoa',
  'uars',
  'uaud',
  'uawg',
  'uazn',
  'ubam',
  'ubbd',
  'ubdt',
  'ubgn',
  'ubhd',
  'ubif',
  'ubmd',
  'ubnd',
  'ubob',
  'ubrl',
  'ubsd',
  'ubtn',
  'ubwp',
  'ubyn',
  'ubzd',
  'ucad',
  'ucdf',
  'uchf',
  'uclp',
  'ucny',
  'ucop',
  'ucrc',
  'ucup',
  'ucve',
  'uczk',
  'udjf',
  'udkk',
  'udop',
  'udzd',
  'uegp',
  'uern',
  'uetb',
  'ueur',
  'ufjd',
  'ufkp',
  'ugbp',
  'ugel',
  'uggp',
  'ughs',
  'ugip',
  'ugmd',
  'ugnf',
  'ugtq',
  'ugyd',
  'uhkd',
  'uhnl',
  'uhrk',
  'uhtg',
  'uhuf',
  'uidr',
  'uils',
  'uimp',
  'uinr',
  'uiqd',
  'uirr',
  'uisk',
  'ujep',
  'ujmd',
  'ujod',
  'ujpy',
  'ukes',
  'ukgs',
  'ukhr',
  'ukmf',
  'ukpw',
  'ukrw',
  'ukwd',
  'ukyd',
  'ukzt',
  'ulak',
  'ulbp',
  'ulkr',
  'ulrd',
  'ulsl',
  'ulyd',
  'umad',
  'umdl',
  'umga',
  'umkd',
  'ummk',
  'umnt',
  'umop',
  'umru',
  'umur',
  'umvr',
  'umwk',
  'umxn',
  'umyr',
  'umzn',
  'unad',
  'ungn',
  'unio',
  'unok',
  'unpr',
  'unzd',
  'uomr',
  'upen',
  'upgk',
  'uphp',
  'upkr',
  'upln',
  'upyg',
  'uqar',
  'uron',
  'ursd',
  'urub',
  'urwf',
  'usar',
  'usbd',
  'uscr',
  'usdg',
  'usek',
  'usgd',
  'ushp',
  'usll',
  'usos',
  'usrd',
  'ussp',
  'ustn',
  'usyp',
  'uszl',
  'uthb',
  'utjs',
  'utmt',
  'utnd',
  'utop',
  'utry',
  'uttd',
  'utwd',
  'utzs',
  'uuah',
  'uugx',
  'uusd',
  'uuyu',
  'uuzs',
  'uves',
  'uvnd',
  'uvuv',
  'uwst',
  'uxaf',
  'uxcd',
  'uxdr',
  'uxof',
  'uxpf',
  'uyer',
  'uzar',
  'uzmw',
] as const

export type TerraNativeDenom = typeof TERRA_NATIVE_DENOMS[number]

/**
 * Type guard to check a given string is a `Denom`
 */
export const isTerraNativeDenom = (value: string): value is TerraNativeDenom =>
  TERRA_NATIVE_DENOMS.includes(value as TerraNativeDenom)

export type GasPricesResponse = Record<TerraNativeDenom, number>
export type GasPrice = { denom: TerraNativeDenom; price: BigNumber }
export type GasPrices = Map<TerraNativeDenom, BigNumber>

/**
 * Account
 * Includes sequence, account number and public key
 */
export type Account = { sequence: number; number: number; publicKey: PublicKey | null }
