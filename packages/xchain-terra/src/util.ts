import { Asset, Chain } from '@xchainjs/xchain-util/lib'

export enum TerraNativeAsset {
  LUNA = 'LUNA',
  SDT = 'SDT',
  UST = 'UST',
  KRT = 'KRT',
  MNT = 'MNT',
  EUT = 'EUT',
  CNT = 'CNT',
  JPT = 'JPT',
  GBT = 'GBT',
  INT = 'INT',
  CAT = 'CAT',
  CHT = 'CHT',
  AUT = 'AUT',
  SGT = 'SGT',
  TBT = 'TBT',
  SET = 'SET',
  NOT = 'NOT',
  DKT = 'DKT',
  IDT = 'IDT',
  PHT = 'PHT',
  HKT = 'HKT',
  MYT = 'MYT',
  TWT = 'TWT',
}

/**
 * Type guard to check whether string is a valid `TerraNativeAsset`
 *
 * @param {string} denom Denomination.
 * @returns {boolean} `true` or `false`
 */
const isTerraNativeAsset = (denom: string): denom is TerraNativeAsset =>
  (Object.values(TerraNativeAsset) as string[]).includes(denom)

const DENOM_MAP: Record<TerraNativeAsset, string> = {
  LUNA: 'uluna',
  SDT: 'usdr',
  UST: 'uusd',
  KRT: 'ukrw',
  MNT: 'umnt',
  EUT: 'ueur',
  CNT: 'ucny',
  JPT: 'ujpy',
  GBT: 'ugbp',
  INT: 'uinr',
  CAT: 'ucad',
  CHT: 'uchf',
  AUT: 'uaud',
  SGT: 'usgd',
  TBT: 'uthb',
  SET: 'usek',
  NOT: 'unok',
  DKT: 'udkk',
  IDT: 'uidr',
  PHT: 'uphp',
  HKT: 'uhkd',
  MYT: 'umyr',
  TWT: 'utwd',
}

export const isTerraAsset = ({ chain, symbol, ticker, synth }: Asset): boolean =>
  chain === Chain.Terra && isTerraNativeAsset(symbol) && isTerraNativeAsset(ticker as TerraNativeAsset) && !synth

export const getTerraMicroDenom = (assetDenom: string): string | null =>
  isTerraNativeAsset(assetDenom) ? DENOM_MAP[assetDenom] : null
