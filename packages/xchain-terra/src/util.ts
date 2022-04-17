import { Coins, CreateTxOptions, LCDClient, MsgSend } from '@terra-money/terra.js'
import { Address, Network } from '@xchainjs/xchain-client'
import type { RootDerivationPaths } from '@xchainjs/xchain-client'
import { Asset, BaseAmount, assetToString, baseAmount, bn, bnOrZero, eqAsset } from '@xchainjs/xchain-util'
import axios from 'axios'
import BigNumber from 'bignumber.js'

import { AssetUST, DEFAULT_GAS_ADJUSTMENT, TERRA_DECIMAL, getTerraNativeAssetsMap } from './const'
import type { ClientConfig, ClientConfigs, GasPrices, GasPricesResponse, TerraNativeDenom } from './types'
import * as Terra from './types/terra'

export const isAssetUST = (asset: Asset) => eqAsset(asset, AssetUST)
export const denomUST: TerraNativeDenom = 'uusd'

/**
 * Checks wether asset is a Terra Native asset
 */
export const isTerraNativeAsset = (asset: Asset): boolean => {
  for (const v of getTerraNativeAssetsMap().values()) {
    if (eqAsset(v, asset)) return true
  }
  return false
}

/**
 * Returns Terra Native asset from denom
 */
export const getTerraNativeAsset = (denom: string): Asset | null => {
  if (Terra.isTerraNativeDenom(denom)) {
    const asset = getTerraNativeAssetsMap().get(denom)
    return asset || null
  }
  return null
}

/**
 * Returns Terra Native asset from denom
 */
export const getTerraNativeDenom = (asset: Asset): TerraNativeDenom | null => {
  for (const [key, value] of getTerraNativeAssetsMap().entries()) {
    if (eqAsset(value, asset)) return key
  }
  return null
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
  cacheTime = 1000 * 60 * 60 /* one hour */,
}: {
  url: string
  network: Network
  cacheTime?: number
}): Promise<GasPrices> => {
  // Current time
  const now = new Date().getTime()
  // Check to use cache (YES if prices are requested before + still in cacheTime)
  if (!!cachedGasPrices?.size && now - cachedGasPricesTime[network] <= cacheTime) {
    return cachedGasPrices
  }
  // update cache time
  cachedGasPricesTime[network] = now

  const gasPricesUrl = `${url}/v1/txs/gas_prices`

  const { data: gasPriceNumbers } = await axios.get<GasPricesResponse>(gasPricesUrl)

  const gasPrices = Object.entries(gasPriceNumbers)
    // validate `denom`
    .filter(([denom, _]) => Terra.isTerraNativeDenom(denom))
    // transfrom prices `number` -> `BaseAmount`
    .map<[TerraNativeDenom, BigNumber]>(([denom, price]) => [denom as TerraNativeDenom, bn(price)])

  cachedGasPrices = new Map(gasPrices)
  return cachedGasPrices
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
  cacheTime = 1000 * 60 * 60 /* one hour */,
}: {
  url: string
  asset: Asset
  network: Network
  cacheTime?: number
}): Promise<Terra.GasPrice | null> => {
  const denom = getTerraNativeDenom(asset)
  if (!denom)
    throw Error(`Invalid asset ${assetToString(asset)} - Terra native asset are supported to get gas price only`)
  const gasPricesMap = await getGasPrices({ url, network, cacheTime })
  const price = gasPricesMap.get(denom)
  return price ? { denom, price } : null
}

export const gasPricesToCoins = (gasPrices: GasPrices): Coins.AminoDict /* onion type of Coins.Input */ => {
  const dict: Coins.AminoDict = {}
  gasPrices.forEach((price, denom) => (dict[denom] = price.toString()))
  return dict
}

export const gasPriceToCoins = ({ denom, price }: Terra.GasPrice): Coins.Input => ({
  [denom]: price.toString(),
})

/**
 * Calculates fee by given estimated gas and gas price
 */
export const calcFee = (estimatedGas: BigNumber, gasPrice: BigNumber): BaseAmount => {
  // ceil result - similar to terra.js
  // @see https://github.com/terra-money/terra.js/blob/0af752555245a309a4cb590e0750ee187bee1f78/src/client/lcd/api/TxAPI.ts#L313
  const fee = estimatedGas.multipliedBy(gasPrice).toFixed(0, BigNumber.ROUND_CEIL)
  return baseAmount(fee, TERRA_DECIMAL)
}

/**
 * Returns account infos
 */
export const getAccount = async (address: Address, lcd: LCDClient): Promise<Terra.Account> => {
  const account = await lcd.auth.accountInfo(address)
  return {
    publicKey: account.getPublicKey(),
    sequence: account.getSequenceNumber(),
    number: account.getAccountNumber(),
  }
}

/**
 * Estimates fee paid by given Terra native (fee) asset
 *
 * Note: LCDClient (via `terra.js`) supports already an `estimateFee` function, but it requires another request to get data of `AccountInfo`
 * However, there is a more simple way (very similar to `terra-station` - check its `src/txs/Tx.tsx` + `src/txs/send/SendForm.tsx`)
 *
 * Steps:
 * 1. Get gas prices
 * 2. Estimate gas
 * 3. Estimate fee
 *
 * @returns {BaseAmount} Fee amount
 */
export const getEstimatedFee = async ({
  chainId,
  cosmosAPIURL,
  sender,
  recipient,
  amount,
  asset,
  feeAsset,
  memo,
  network,
}: {
  chainId: string
  cosmosAPIURL: string
  sender: Address
  recipient: Address
  amount: BaseAmount
  asset: Asset
  feeAsset: Asset
  memo?: string
  network: Network
}): Promise<Terra.EstimatedFee> => {
  const denom = getTerraNativeDenom(asset)
  if (!denom)
    throw Error(`Invalid asset ${assetToString(asset)} - Terra native asset are supported to estimate fee only`)

  const feeDenom = getTerraNativeDenom(feeAsset)
  if (!feeDenom)
    throw Error(`Invalid fee asset ${assetToString(feeAsset)} - Terra native asset are supported to estimate fee only`)

  const gasPrices = await getGasPrices({ url: cosmosAPIURL, network })
  const gasPricesAsCoins = gasPricesToCoins(gasPrices)

  const gasPrice = await getGasPriceByAsset({ url: cosmosAPIURL, network, asset: feeAsset /* cacheTime: 0 */ })
  if (!gasPrice) throw Error(`Could not get gas price for ${assetToString(feeAsset)}`)

  const msgAmount: Coins.Input = { [denom]: amount.amount().toFixed() }
  const msg: MsgSend = new MsgSend(sender, recipient, msgAmount)

  const lcd = new LCDClient({
    chainID: chainId,
    URL: cosmosAPIURL,
    gasPrices: gasPricesAsCoins,
  })

  const options: CreateTxOptions = {
    msgs: [msg],
    memo,
    gasPrices: gasPricesAsCoins,
    feeDenoms: [feeDenom],
    gasAdjustment: DEFAULT_GAS_ADJUSTMENT,
  }

  // create Tx
  // https://github.com/terra-money/terra.js/blob/0af752555245a309a4cb590e0750ee187bee1f78/src/client/lcd/api/TxAPI.ts#L213
  const unsignedTx = await lcd.tx.create([{ address: sender }], options)

  const estimatedGas = bnOrZero(unsignedTx.auth_info.fee.gas_limit)

  const fee = calcFee(estimatedGas, gasPrice.price)

  return { amount: fee, asset: feeAsset, gasLimit: estimatedGas }
}
