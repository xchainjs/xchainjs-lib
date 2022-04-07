import { Coins, CreateTxOptions, LCDClient } from '@terra-money/terra.js'
import { Address, Network } from '@xchainjs/xchain-client'
import type { RootDerivationPaths } from '@xchainjs/xchain-client'
import {
  Asset,
  BaseAmount,
  TerraChain,
  assetAmount,
  assetToBase,
  assetToString,
  baseAmount,
  bnOrZero,
  eqAsset,
} from '@xchainjs/xchain-util'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { AssetLUNA, AssetUST, TERRA_DECIMAL } from './const'
import type { ClientConfig, ClientConfigs, GasPrices, GasPricesResponse, TerraNativeDenom } from './types'
import * as Terra from './types/terra'

/**
 * Special case UST
 */
// const isDenomUST = (string = '') => string === 'uusd'

export const isAssetUST = (asset: Asset) => eqAsset(asset, AssetUST)
export const denomUST: TerraNativeDenom = 'uusd'

export const isTerraNativeAsset = (asset: Asset): boolean => {
  // Special case UST ()
  if (isAssetUST(asset)) return true
  // TerraChain only
  if (asset.chain !== TerraChain) return false
  // No synth only
  if (asset.synth) return false

  return Terra.isTerraNativeDenom(`u${asset.symbol.toLowerCase()}`)
}

export const getTerraNativeAsset = (denom: string): Asset => {
  if (denom.toLowerCase().includes('luna')) return AssetLUNA

  if (denom === denomUST) return AssetUST

  const symbol = denom.toUpperCase().slice(1)
  return {
    chain: TerraChain,
    symbol,
    ticker: symbol,
    synth: false,
  }
}

export const getTerraNativeDenom = (asset: Asset): TerraNativeDenom | null => {
  const denom = isAssetUST(asset) ? denomUST : `u${asset.symbol.toLowerCase()}`
  return Terra.isTerraNativeDenom(denom) ? denom : null
}

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
 */
export const getPrefix = () => 'terra'

let cachedGasPrices: GasPrices | null = null
const cachedGasPricesTime: Record<Network, number> = {
  mainnet: 0,
  stagenet: 0,
  testnet: 0,
}

/**
 * Returns gas prices
 *
 * @param {string} url API enpdoint
 * @param {number} cacheTime (optional) Time in milliseconds to get gas prices from cache
 * to avoid extra requests for same data. Use `0` to disable cache. Default value: One hour.
 *
 * @returns {GasPrices} Gas prices of all Terra native assets
 */
export const getGasPrices = async ({
  url,
  network,
  cacheTime = 1000 * 60 * 60 * 60 /* one hour */,
}: {
  url: string
  network: Network
  cacheTime: number
}): Promise<GasPrices> => {
  // Current time
  const now = new Date().getTime()
  // Use cache
  if (cachedGasPrices && now - cachedGasPricesTime[network] <= cacheTime) {
    cachedGasPricesTime[network] = now
    return cachedGasPrices
  }

  const { data: gasPriceNumbers } = await axios.get<GasPricesResponse>(`${url}/v1/txs/gas_prices`)

  const gasPrices = Object.entries(gasPriceNumbers)
    // validate `denom`
    .filter(([denom, _]) => Terra.isTerraNativeDenom(denom))
    // transfrom prices `number` -> `BaseAmount`
    .map<[TerraNativeDenom, BaseAmount]>(([denom, price]) => [
      denom as TerraNativeDenom,
      assetToBase(assetAmount(price, TERRA_DECIMAL)),
    ])

  const gasPricesMap = new Map(gasPrices)
  cachedGasPrices = gasPricesMap
  return gasPricesMap
}

/**
 * Returns gas price for given asset
 *
 * @param {string} url API enpdoint
 * @param {Asset} asset Asset to get gas price for
 * @param {Network} network
 * @param {number} cacheTime (optional) Time in milliseconds to get gas prices from cache
 * to avoid extra requests for same data. Use `0` to disable cache. Default value: One hour.
 *
 * @returns {GasPrices} Gas prices of all Terra native assets
 */
export const getGasPriceByAsset = async ({
  url,
  asset,
  network,
  cacheTime = 1000 * 60 * 60 * 60 /* one hour */,
}: {
  url: string
  asset: Asset
  network: Network
  cacheTime?: number
}): Promise<BaseAmount | undefined> => {
  const denom = getTerraNativeDenom(asset)
  if (!denom) throw Error(`Invalid asset ${assetToString(asset)} - Terra native asset are supported only`)
  const gasPricesMap = await getGasPrices({ url, network, cacheTime })
  return gasPricesMap.get(denom)
}

export const gasPricesToCoins = (gasPrices: GasPrices): Coins.AminoDict => {
  const dict: Coins.AminoDict = {}
  gasPrices.forEach((price, denom) => (dict[denom] = price.amount().toNumber()))
  return dict
}

export const getEstimatedGas = async ({
  lcd,
  address,
  options,
}: {
  lcd: LCDClient
  address: Address
  options: CreateTxOptions
}): Promise<BigNumber> => {
  const unsignedTx = await lcd.tx.create([{ address }], options)
  return bnOrZero(unsignedTx.auth_info.fee.gas_limit)
}

export const getEstimatedFee = (estimatedGas: BigNumber, gasPrice: BaseAmount): BaseAmount =>
  baseAmount(estimatedGas.toString(), TERRA_DECIMAL).times(gasPrice)
