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
export function isTerraAsset(asset: Asset) {
  return (
    asset.chain === Chain.Terra &&
    DENOM_MAP[asset.symbol as TerraNativeAsset] &&
    DENOM_MAP[asset.ticker as TerraNativeAsset]
  )
}
export function getTerraMicroDenom(assetDenom: TerraNativeAsset): string {
  return DENOM_MAP[assetDenom]
}
