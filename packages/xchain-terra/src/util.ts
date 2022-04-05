import { FeeType, Fees, Network, singleFee } from '@xchainjs/xchain-client'
import type { RootDerivationPaths } from '@xchainjs/xchain-client'
import { Asset, assetAmount, assetToBase, assetToString } from '@xchainjs/xchain-util'
import axios from 'axios'

import {
  AssetAUT,
  AssetCAT,
  AssetCHT,
  AssetCNT,
  AssetDKT,
  AssetEUT,
  AssetGBT,
  AssetHKT,
  AssetIDT,
  AssetINT,
  AssetJPT,
  AssetKRT,
  AssetLUNA,
  AssetMNT,
  AssetMYT,
  AssetNOT,
  AssetPHT,
  AssetSDT,
  AssetSET,
  AssetSGT,
  AssetTBT,
  AssetTWT,
  AssetUST,
  TERRA_DECIMAL,
} from './const'
import type { ClientConfig, ClientConfigs, Denom, FeesResponse } from './types'
import type * as Terra from './types/terra'

const TERRA_NATIVE_ASSET_MAP: Map<Asset, Denom> = new Map([
  [AssetLUNA, 'uluna'],
  [AssetSDT, 'usdr'],
  [AssetUST, 'uusd'],
  [AssetKRT, 'ukrw'],
  [AssetMNT, 'umnt'],
  [AssetEUT, 'ueur'],
  [AssetCNT, 'ucny'],
  [AssetJPT, 'ujpy'],
  [AssetGBT, 'ugbp'],
  [AssetINT, 'uinr'],
  [AssetCAT, 'ucad'],
  [AssetCHT, 'uchf'],
  [AssetAUT, 'uaud'],
  [AssetSGT, 'usgd'],
  [AssetTBT, 'uthb'],
  [AssetSET, 'usek'],
  [AssetNOT, 'unok'],
  [AssetDKT, 'udkk'],
  [AssetIDT, 'uidr'],
  [AssetPHT, 'uphp'],
  [AssetHKT, 'uhkd'],
  [AssetMYT, 'umyr'],
  [AssetTWT, 'utwd'],
])

export const isTerraNativeAsset = (asset: Asset): boolean => TERRA_NATIVE_ASSET_MAP.has(asset) && !asset.synth

export const getTerraDenom = (asset: Asset): Denom | undefined => TERRA_NATIVE_ASSET_MAP.get(asset)

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

/**
 * Get address prefix
 *
 * @returns {string} Prefix of an address
 *
 */
export const getPrefix = () => 'terra'

/**
 * Returns default fee in LUNA.
 *
 * @returns {Fees} The default fee (in LUNA).
 */
export const getDefaultFees = (): Fees => {
  const fee = assetToBase(assetAmount(0.1133 /* LUNA */, TERRA_DECIMAL))
  return singleFee(FeeType.FlatFee, fee)
}

export const getFeesByAsset = async (url: string, asset: Asset): Promise<Fees> => {
  const denom = getTerraDenom(asset)
  if (!denom) throw Error(`Invalid Terra asset to ask fees for (asset: ${assetToString(asset)})`)

  const { data: feesArray } = await axios.get<FeesResponse>(`${url}/v1/txs/gas_prices`)
  const fee = assetToBase(assetAmount(feesArray[denom], TERRA_DECIMAL))
  return {
    type: FeeType.FlatFee,
    average: fee,
    fast: fee,
    fastest: fee,
  }
}

/**
 * Returns fees in LUNA.
 * For any other Terra asset than LUNA use `getFeesByAsset`
 *
 * @returns {Fees} The default fee (in LUNA).
 */
export const getFees = async (url: string): Promise<Fees> => getFeesByAsset(url, AssetLUNA)
