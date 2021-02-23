import axios from 'axios'
import {
  GasOracleResponse,
  TransactionHistoryParam,
  ETHTransactionInfo,
  TokenTransactionInfo,
  TokenBalanceParam,
} from './types'
import { BigNumberish } from 'ethers'
import { Txs } from '@xchainjs/xchain-client/lib'
import { filterSelfTxs, getTxFromEthTransaction, getTxFromTokenTransaction } from './utils'
import { bn } from '@xchainjs/xchain-util/lib'

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

  const ethTransactions: ETHTransactionInfo[] = await axios.get(url).then((response) => response.data.result)
  return filterSelfTxs(ethTransactions)
    .filter((tx) => !bn(tx.value).isZero())
    .map(getTxFromEthTransaction)
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

  const tokenTransactions: TokenTransactionInfo[] = await axios.get(url).then((response) => response.data.result)
  return filterSelfTxs(tokenTransactions)
    .filter((tx) => !bn(tx.value).isZero())
    .reduce((acc, cur) => {
      const tx = getTxFromTokenTransaction(cur)
      return tx ? [...acc, tx] : acc
    }, [] as Txs)
}
