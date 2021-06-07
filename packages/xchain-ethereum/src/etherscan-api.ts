import axios from 'axios'
import {
  GasOracleResponse,
  TransactionHistoryParam,
  ETHTransactionInfo,
  TokenTransactionInfo,
  TokenBalanceParam,
} from './types'
import { BigNumberish } from 'ethers'
import { Txs } from '@thorwallet/xchain-client/lib'
import { filterSelfTxs, getTxFromEthTransaction, getTxFromTokenTransaction } from './utils'
import { bnOrZero } from '@thorwallet/xchain-util/lib'

const getApiKeyQueryParameter = (apiKey?: string): string => (!!apiKey ? `&apiKey=${apiKey}` : '')

/**
 * SafeGasPrice, ProposeGasPrice And FastGasPrice returned in string-Gwei
 *
 * @see https://etherscan.io/apis#gastracker
 *
 * @param {string} baseUrl The etherscan node url.
 * @param {string} apiKey The etherscan API key. (optional)
 * @returns {GasOracleResponse} LastBlock, SafeGasPrice, ProposeGasPrice, FastGasPrice
 */
export const getGasOracle = (baseUrl: string, apiKey?: string): Promise<GasOracleResponse> => {
  const url = baseUrl + '/api?module=gastracker&action=gasoracle'

  return axios.get(url + getApiKeyQueryParameter(apiKey)).then((response) => response.data.result)
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
export const getTokenBalance = ({
  baseUrl,
  address,
  assetAddress,
  apiKey,
}: TokenBalanceParam & { baseUrl: string; apiKey?: string }): Promise<BigNumberish> => {
  const url = baseUrl + `/api?module=account&action=tokenbalance&contractaddress=${assetAddress}&address=${address}`

  return axios.get(url + getApiKeyQueryParameter(apiKey)).then((response) => response.data.result)
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
 * @returns {Array<ETHTransactionInfo>} The ETH transaction history
 */
export const getETHTransactionHistory = async ({
  baseUrl,
  address,
  page,
  offset,
  startblock,
  endblock,
  apiKey,
}: TransactionHistoryParam & { baseUrl: string; apiKey?: string }): Promise<Txs> => {
  let url = baseUrl + `/api?module=account&action=txlist&sort=desc` + getApiKeyQueryParameter(apiKey)
  if (address) url += `&address=${address}`
  if (offset) url += `&offset=${offset}`
  if (page) url += `&page=${page}`
  if (startblock) url += `&startblock=${startblock}`
  if (endblock) url += `&endblock=${endblock}`

  try {
    const result = await axios.get(url).then((response) => response.data.result)
    if (JSON.stringify(result).includes('Invalid API Key')) {
      return Promise.reject(new Error('Invalid API Key'))
    }
    if (typeof result !== typeof []) {
      throw new Error(result)
    }

    return filterSelfTxs<ETHTransactionInfo>(result)
      .filter((tx) => !bnOrZero(tx.value).isZero())
      .map(getTxFromEthTransaction)
  } catch (error) {
    return Promise.reject(error)
  }
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
 * @returns {Array<Tx>} The token transaction history
 */
export const getTokenTransactionHistory = async ({
  baseUrl,
  address,
  assetAddress,
  page,
  offset,
  startblock,
  endblock,
  apiKey,
}: TransactionHistoryParam & { baseUrl: string; apiKey?: string }): Promise<Txs> => {
  let url = baseUrl + `/api?module=account&action=tokentx&sort=desc` + getApiKeyQueryParameter(apiKey)
  if (address) url += `&address=${address}`
  if (assetAddress) url += `&contractaddress=${assetAddress}`
  if (offset) url += `&offset=${offset}`
  if (page) url += `&page=${page}`
  if (startblock) url += `&startblock=${startblock}`
  if (endblock) url += `&endblock=${endblock}`

  try {
    const result = await axios.get(url).then((response) => response.data.result)
    if (JSON.stringify(result).includes('Invalid API Key')) {
      return Promise.reject(new Error('Invalid API Key'))
    }

    return filterSelfTxs<TokenTransactionInfo>(result)
      .filter((tx) => !bnOrZero(tx.value).isZero())
      .reduce((acc, cur) => {
        const tx = getTxFromTokenTransaction(cur)
        return tx ? [...acc, tx] : acc
      }, [] as Txs)
  } catch (error) {
    return Promise.reject(error)
  }
}
