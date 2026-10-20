import { TxType } from '@xchainjs/xchain-client'
import { Asset, Chain, TokenAsset, assetFromString, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import axios from 'axios'
import { BigNumberish } from 'ethers'

import { Tx } from '../../types'

import {
  ETHTransactionInfoV2,
  GasOracleResponseV2,
  TokenBalanceParamV2,
  TokenTransactionInfoV2,
  TransactionHistoryParamV2,
} from './etherscan-api-types-v2'
import { filterSelfTxs, validateAddress, validateSymbol } from '../utils'

const getApiKeyQueryParameter = (apiKey?: string): string => (!!apiKey ? `&apiKey=${apiKey}` : '')

export const getTxFromEthTransaction = (tx: ETHTransactionInfoV2, gasAsset: Asset, decimals: number): Tx => {
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

export const getTxFromTokenTransaction = (tx: TokenTransactionInfoV2, chain: Chain, decimals: number): Tx | null => {
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
 * chainId values: https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains
 */
export const getGasOracle = async (baseUrl: string, chainId: number, apiKey?: string): Promise<GasOracleResponseV2> => {
  const url = baseUrl + `/api?chainid=${chainId}&module=gastracker&action=gasoracle`
  const result = (await axios.get(url + getApiKeyQueryParameter(apiKey))).data.result

  if (typeof result === 'string') throw new Error(`Can not retrieve gasOracle: ${result}`)

  return result
}

/**
 * @see https://etherscan.io/apis#tokens
 * chainId values: https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains
 */
export const getTokenBalance = async ({
  baseUrl,
  address,
  assetAddress,
  chainId,
  apiKey,
}: TokenBalanceParamV2 & { baseUrl: string; apiKey?: string }): Promise<BigNumberish> => {
  const url =
    baseUrl +
    `/api?chainid=${chainId}&module=account&action=tokenbalance&contractaddress=${assetAddress}&address=${address}`

  return (await axios.get(url + getApiKeyQueryParameter(apiKey))).data.result
}

/**
 * @see https://etherscan.io/apis#accounts
 * chainId values: https://docs.etherscan.io/etherscan-v2/getting-started/supported-chains
 */
export const getGasAssetTransactionHistory = async ({
  gasAsset,
  gasDecimals,
  baseUrl,
  address,
  page,
  offset,
  startblock,
  endblock,
  chainId,
  apiKey,
}: TransactionHistoryParamV2 & { gasAsset: Asset; gasDecimals: number; baseUrl: string; apiKey?: string }): Promise<
  Tx[]
> => {
  let url = baseUrl + `/api?chainid=${chainId}&module=account&action=txlist&sort=desc` + getApiKeyQueryParameter(apiKey)
  if (address) url += `&address=${address}`
  if (offset) url += `&offset=${offset}`
  if (page) url += `&page=${page}`
  if (startblock) url += `&startblock=${startblock}`
  if (endblock) url += `&endblock=${endblock}`

  const result = (await axios.get(url)).data.result
  if (typeof result === 'string') throw new Error(result)

  return filterSelfTxs<ETHTransactionInfoV2>(result)
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
  chainId,
  apiKey,
  chain,
}: TransactionHistoryParamV2 & { gasDecimals: number; chain: Chain; baseUrl: string; apiKey?: string }): Promise<
  Tx[]
> => {
  let url =
    baseUrl + `/api?chainid=${chainId}&module=account&action=tokentx&sort=desc` + getApiKeyQueryParameter(apiKey)
  if (address) url += `&address=${address}`
  if (assetAddress) url += `&contractaddress=${assetAddress}`
  if (offset) url += `&offset=${offset}`
  if (page) url += `&page=${page}`
  if (startblock) url += `&startblock=${startblock}`
  if (endblock) url += `&endblock=${endblock}`
  const result = (await axios.get(url)).data.result
  if (typeof result === 'string') throw new Error(result)

  return filterSelfTxs<TokenTransactionInfoV2>(result)
    .filter((tx) => !bnOrZero(tx.value).isZero())
    .reduce((acc, cur) => {
      const tx = getTxFromTokenTransaction(cur, chain, gasDecimals)
      return tx ? [...acc, tx] : acc
    }, [] as Tx[])
}
