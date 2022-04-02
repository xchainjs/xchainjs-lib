import { Network } from '@xchainjs/xchain-client'
import type { RootDerivationPaths } from '@xchainjs/xchain-client'
import type { Asset } from '@xchainjs/xchain-util/lib'
import { Chain } from '@xchainjs/xchain-util/lib'
import axios from 'axios'

import type { ClientConfig, ClientConfigs } from './types'
import type * as Terra from './types/terra'

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

export const getDefaultRootDerivationPaths = (): RootDerivationPaths => ({
  [Network.Mainnet]: "44'/330'/0'/0/",
  [Network.Stagenet]: "44'/330'/0'/0/",
  [Network.Testnet]: "44'/330'/0'/0/",
})

export const getDefaultClientConfig = (): Record<Network, ClientConfig> => ({
  [Network.Mainnet]: {
    explorerURL: 'https://finder.terra.money/mainnet',
    explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
    explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
    cosmosAPIURL: 'https://fcd.terra.dev',
    chainID: 'columbus-5',
  },
  [Network.Stagenet]: {
    explorerURL: 'https://finder.terra.money/mainnet',
    explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
    explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
    cosmosAPIURL: 'https://fcd.terra.dev',
    chainID: 'columbus-5',
  },
  [Network.Testnet]: {
    explorerURL: 'https://finder.terra.money/testnet',
    explorerAddressURL: 'https://finder.terra.money/testnet/address/',
    explorerTxURL: 'https://finder.terra.money/testnet/tx/',
    cosmosAPIURL: 'https://bombay-fcd.terra.dev',
    chainID: 'bombay-12',
  },
})

/**
 * Helper to get chain definitions (chainId + lcd)
 * @param {string} url API url (optional - default: https://assets.terra.money)
 */
export const getTerraChains = async (url = 'https://assets.terra.money'): Promise<Terra.ChainIds> => {
  const endpoint = `${url}/chains.json`
  try {
    const { data } = await axios.get<Terra.ChainsResponse>(endpoint)
    const mainnet: Terra.ChainId = data['mainnet'].chainID

    const testnet: Terra.ChainId = data['testnet'].chainID
    return {
      testnet,
      mainnet,
      stagenet: mainnet,
    }
  } catch (error: unknown) {
    return Promise.reject(`Could not parse Terra's chain definitions from ${endpoint} (Error: ${error}) `)
  }
}

/**
 * Helper to merge `ChainIds` into given `ClientConfigs`
 */
export const mergeChainIds = (chains: Terra.ChainIds, config: ClientConfigs): Record<Network, ClientConfig> => {
  const mainnet: ClientConfig = { ...config.mainnet, chainID: chains.mainnet }
  return {
    [Network.Mainnet]: mainnet,
    [Network.Stagenet]: mainnet,
    [Network.Testnet]: {
      ...config.mainnet,
      chainID: chains.testnet,
    },
  }
}
