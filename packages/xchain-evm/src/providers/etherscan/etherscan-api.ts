import { Tx, TxType } from '@xchainjs/xchain-client'
import { Asset, Chain, assetFromString, baseAmount, bnOrZero } from '@xchainjs/xchain-util'
import axios from 'axios'
import { BigNumberish } from 'ethers'

import { validateAddress } from '../../utils'

import {
  ETHTransactionInfo,
  GasOracleResponse,
  TokenBalanceParam,
  TokenTransactionInfo,
  TransactionHistoryParam,
} from './etherscan-api-types'

const getApiKeyQueryParameter = (apiKey?: string): string => (!!apiKey ? `&apiKey=${apiKey}` : '')

/**
 * Filter self txs
 *
 * @returns {T[]}
 *
 **/
export const filterSelfTxs = <T extends { from: string; to: string; hash: string }>(txs: T[]): T[] => {
  const filterTxs = txs.filter((tx) => tx.from !== tx.to)
  let selfTxs = txs.filter((tx) => tx.from === tx.to)
  while (selfTxs.length) {
    const selfTx = selfTxs[0]
    filterTxs.push(selfTx)
    selfTxs = selfTxs.filter((tx) => tx.hash !== selfTx.hash)
  }

  return filterTxs
}

/**
 * Check if the symbol is valid.
 *
 * @param {string|null|undefined} symbol
 * @returns {boolean} `true` or `false`.
 */
export const validateSymbol = (symbol?: string | null): boolean => (symbol ? symbol.length >= 3 : false)

/**
 * Get transactions from ETH transaction
 *
 * @param {ETHTransactionInfo} tx
 * @returns {Tx} The parsed transaction.
 */
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

/**
 * Get transactions from token tx
 *
 * @param {TokenTransactionInfo} tx
 * @returns {Tx|null} The parsed transaction.
 */
export const getTxFromTokenTransaction = (tx: TokenTransactionInfo, chain: Chain, decimals: number): Tx | null => {
  const decimal = parseInt(tx.tokenDecimal) || decimals
  const symbol = tx.tokenSymbol
  const address = tx.contractAddress

  if (validateSymbol(symbol) && validateAddress(address)) {
    const tokenAsset = assetFromString(`${chain}.${symbol}-${address}`)
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
 * SafeGasPrice, ProposeGasPrice And FastGasPrice returned in string-Gwei
 *
 * @see https://etherscan.io/apis#gastracker
 *
 * @param {string} baseUrl The etherscan node url.
 * @param {string} apiKey The etherscan API key. (optional)
 * @returns {GasOracleResponse} LastBlock, SafeGasPrice, ProposeGasPrice, FastGasPrice
 */
export const getGasOracle = async (baseUrl: string, apiKey?: string): Promise<GasOracleResponse> => {
  const url = baseUrl + '/api?module=gastracker&action=gasoracle'

  return (await axios.get(url + getApiKeyQueryParameter(apiKey))).data.result
}

/**
 * Get token balance
 *
 * @see https://etherscan.io/apis#tokens
 *
 * @param {string} baseUrl The etherscan node url.
 * @param {string} address The address.
 * @param {string} assetAddress The token contract address.
 * @param {string} apiKey The etherscan API key. (optional)
 * @returns {BigNumberish} The token balance
 */
export const getTokenBalance = async ({
  baseUrl,
  address,
  assetAddress,
  apiKey,
}: TokenBalanceParam & { baseUrl: string; apiKey?: string }): Promise<BigNumberish> => {
  const url = baseUrl + `/api?module=account&action=tokenbalance&contractaddress=${assetAddress}&address=${address}`

  return (await axios.get(url + getApiKeyQueryParameter(apiKey))).data.result
}

/**
 * Get ETH transaction history
 *
 * @see https://etherscan.io/apis#accounts
 *
 * @param {string} baseUrl The etherscan node url.
 * @param {string} address The address.
 * @param {TransactionHistoryParam} params The search options.
 * @param {string} apiKey The etherscan API key. (optional)
 * @returns {ETHTransactionInfo[]} The ETH transaction history
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
  if (JSON.stringify(result).includes('Invalid API Key')) throw new Error('Invalid API Key')
  if (typeof result !== 'object') throw new Error(result)

  return filterSelfTxs<ETHTransactionInfo>(result)
    .filter((tx) => !bnOrZero(tx.value).isZero())
    .map((tx) => getTxFromEthTransaction(tx, gasAsset, gasDecimals))
}

/**
 * Get token transaction history
 *
 * @see https://etherscan.io/apis#accounts
 *
 * @param {string} baseUrl The etherscan node url.
 * @param {string} address The address.
 * @param {TransactionHistoryParam} params The search options.
 * @param {string} apiKey The etherscan API key. (optional)
 * @returns {Tx[]} The token transaction history
 */
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
  if (JSON.stringify(result).includes('Invalid API Key')) throw new Error('Invalid API Key')

  return filterSelfTxs<TokenTransactionInfo>(result)
    .filter((tx) => !bnOrZero(tx.value).isZero())
    .reduce((acc, cur) => {
      const tx = getTxFromTokenTransaction(cur, chain, gasDecimals)
      return tx ? [...acc, tx] : acc
    }, [] as Tx[])
}
