import { TxType } from '@xchainjs/xchain-client'
import { Asset, Chain, TokenAsset, assetFromString, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import axios from 'axios'
import { BigNumberish } from 'ethers'

import { Tx } from '../../types'

import {
  ETHTransactionInfo,
  GasOracleResponse,
  TokenBalanceParam,
  TokenTransactionInfo,
  TransactionHistoryParam,
} from './etherscan-api-types'
import { filterSelfTxs, validateAddress, validateSymbol } from '../utils'

const getApiKeyQueryParameter = (apiKey?: string): string => (!!apiKey ? `&apiKey=${apiKey}` : '')

export const getTxFromEthTransaction = (tx: ETHTransactionInfo, gasAsset: Asset, decimals: number): Tx => {
  return {
    asset: gasAsset,
    from: [
      {
        from: tx.from,
        amount: baseAmount(tx.value, decimals),
      },
    ],
    to: [
      {
        to: tx.to,
        amount: baseAmount(tx.value, decimals),
      },
    ],
    date: new Date(parseInt(tx.timeStamp) * 1000),
    type: TxType.Transfer,
    hash: tx.hash,
  }
}

export const getTxFromTokenTransaction = (tx: TokenTransactionInfo, chain: Chain, decimals: number): Tx | null => {
  const decimal = parseInt(tx.tokenDecimal) || decimals
  const symbol = tx.tokenSymbol
  const address = tx.contractAddress

  if (validateSymbol(symbol) && validateAddress(address)) {
    const tokenAsset = assetFromString(`${chain}.${symbol}-${address}`) as Asset | TokenAsset
    if (tokenAsset) {
      return {
        asset: tokenAsset,
        from: [
          {
            from: tx.from,
            amount: baseAmount(tx.value, decimal),
          },
        ],
        to: [
          {
            to: tx.to,
            amount: baseAmount(tx.value, decimal),
          },
        ],
        date: new Date(parseInt(tx.timeStamp) * 1000),
        type: TxType.Transfer,
        hash: tx.hash,
      }
    }
  }

  return null
}

/**
 * SafeGasPrice, ProposeGasPrice and FastGasPrice are gwei strings.
 * @see https://etherscan.io/apis#gastracker
 */
export const getGasOracle = async (baseUrl: string, apiKey?: string): Promise<GasOracleResponse> => {
  const url = baseUrl + '/api?module=gastracker&action=gasoracle'
  const result = (await axios.get(url + getApiKeyQueryParameter(apiKey))).data.result

  if (typeof result === 'string') throw new Error(`Can not retrieve gasOracle: ${result}`)

  return result
}

/** @see https://etherscan.io/apis#tokens */
export const getTokenBalance = async ({
  baseUrl,
  address,
  assetAddress,
  apiKey,
}: TokenBalanceParam & { baseUrl: string; apiKey?: string }): Promise<BigNumberish> => {
  const url = baseUrl + `/api?module=account&action=tokenbalance&contractaddress=${assetAddress}&address=${address}`

  return (await axios.get(url + getApiKeyQueryParameter(apiKey))).data.result
}

/** @see https://etherscan.io/apis#accounts */
export const getGasAssetTransactionHistory = async ({
  gasAsset,
  gasDecimals,
  baseUrl,
  address,
  page,
  offset,
  startblock,
  endblock,
  apiKey,
}: TransactionHistoryParam & { gasAsset: Asset; gasDecimals: number; baseUrl: string; apiKey?: string }): Promise<
  Tx[]
> => {
  let url = baseUrl + `/api?module=account&action=txlist&sort=desc` + getApiKeyQueryParameter(apiKey)
  if (address) url += `&address=${address}`
  if (offset) url += `&offset=${offset}`
  if (page) url += `&page=${page}`
  if (startblock) url += `&startblock=${startblock}`
  if (endblock) url += `&endblock=${endblock}`

  const result = (await axios.get(url)).data.result
  if (typeof result === 'string') throw new Error(result)

  return filterSelfTxs<ETHTransactionInfo>(result)
    .filter((tx) => !bnOrZero(tx.value).isZero())
    .map((tx) => getTxFromEthTransaction(tx, gasAsset, gasDecimals))
}

/** @see https://etherscan.io/apis#accounts */
export const getTokenTransactionHistory = async ({
  gasDecimals,
  baseUrl,
  address,
  assetAddress,
  page,
  offset,
  startblock,
  endblock,
  apiKey,
  chain,
}: TransactionHistoryParam & { gasDecimals: number; chain: Chain; baseUrl: string; apiKey?: string }): Promise<
  Tx[]
> => {
  let url = baseUrl + `/api?module=account&action=tokentx&sort=desc` + getApiKeyQueryParameter(apiKey)
  if (address) url += `&address=${address}`
  if (assetAddress) url += `&contractaddress=${assetAddress}`
  if (offset) url += `&offset=${offset}`
  if (page) url += `&page=${page}`
  if (startblock) url += `&startblock=${startblock}`
  if (endblock) url += `&endblock=${endblock}`
  const result = (await axios.get(url)).data.result
  if (typeof result === 'string') throw new Error(result)

  return filterSelfTxs<TokenTransactionInfo>(result)
    .filter((tx) => !bnOrZero(tx.value).isZero())
    .reduce((acc, cur) => {
      const tx = getTxFromTokenTransaction(cur, chain, gasDecimals)
      return tx ? [...acc, tx] : acc
    }, [] as Tx[])
}
