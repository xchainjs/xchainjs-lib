import { FeeOption, FeeRates, TxHistoryParams } from '@xchainjs/xchain-client'
import {
  Address,
  Asset,
  AssetType,
  BaseAmount,
  Chain,
  TokenAsset,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'
import axios from 'axios'
import { Contract, Provider } from 'ethers'
import BigNumber from 'bignumber.js'

import { Balance, CompatibleAsset, EvmOnlineDataProvider, Tx, TxsPage } from '../../types'

import erc20ABI from './erc20.json'
import * as etherscanAPI from './etherscan-api'
import { ERC20Tx, GetERC20TxsResponse } from './types'

export class EtherscanProvider implements EvmOnlineDataProvider {
  private provider: Provider
  private apiKey: string
  protected baseUrl: string
  protected chain: Chain
  protected nativeAsset: Asset
  protected nativeAssetDecimals: number

  constructor(
    provider: Provider,
    baseUrl: string,
    apiKey: string,
    chain: Chain,
    nativeAsset: Asset,
    nativeAssetDecimals: number,
  ) {
    this.provider = provider
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.chain = chain
    this.nativeAsset = nativeAsset
    this.nativeAssetDecimals = nativeAssetDecimals
    this.nativeAsset
    this.chain
  }
  async getBalance(address: Address, assets?: CompatibleAsset[]): Promise<Balance[]> {
    //validate assets are for the correct chain
    assets?.forEach((i) => {
      if (i.chain !== this.chain) throw Error(`${assetToString(i)} is not an asset of ${this.chain}`)
    })
    const balances: Balance[] = []
    balances.push(await this.getNativeAssetBalance(address))

    if (assets) {
      for (const asset of assets) {
        const splitSymbol = asset.symbol.split('-')
        const tokenSymbol = splitSymbol[0]
        const contractAddress = splitSymbol[1]
        balances.push(await this.getTokenBalance(address, contractAddress, tokenSymbol))
      }
    } else {
      // Get All Erc-20 txs
      const response = (
        await axios.get<GetERC20TxsResponse>(
          `${this.baseUrl}/api?module=account&action=tokentx&address=${address}&sort=asc&apikey=${this.apiKey}`,
        )
      ).data

      const erc20TokenTxs = this.getUniqueContractAddresses(response.result)
      for (const erc20Token of erc20TokenTxs) {
        balances.push(await this.getTokenBalance(address, erc20Token.contractAddress, erc20Token.tokenSymbol))
      }
    }

    return balances
  }
  private async getNativeAssetBalance(address: Address): Promise<{ asset: Asset; amount: BaseAmount }> {
    const balanceResponse = await this.provider.getBalance(address.toLowerCase())
    const gasAssetBalance: BigNumber = new BigNumber(balanceResponse.toString())
    const amount = baseAmount(gasAssetBalance.toString(), this.nativeAssetDecimals)
    return {
      asset: this.nativeAsset,
      amount,
    }
  }
  private async getTokenBalance(
    address: Address,
    contractAddress: string,
    tokenTicker: string,
  ): Promise<{ asset: TokenAsset; amount: BaseAmount }> {
    const asset: TokenAsset = {
      chain: this.chain,
      symbol: `${tokenTicker}-${contractAddress}`,
      ticker: tokenTicker,
      type: AssetType.TOKEN,
    }

    const contract: Contract = new Contract(contractAddress.toLowerCase(), erc20ABI, this.provider)
    const balance = (await contract.balanceOf(address.toLowerCase())).toString()

    const decimals = (await contract.decimals()).toString()
    const amount = baseAmount(balance, Number.parseInt(decimals))

    return {
      asset,
      amount,
    }
  }

  private getUniqueContractAddresses(array: ERC20Tx[]): ERC20Tx[] {
    const mySet = new Set<string>()
    return array.filter((x) => {
      const key = x.contractAddress,
        isNew = !mySet.has(key)
      if (isNew) mySet.add(key)
      return isNew
    })
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset || 0
    const limit = params?.limit || 10
    const assetAddress = params?.asset

    const maxCount = 10000

    let transactions

    if (assetAddress) {
      transactions = await etherscanAPI.getTokenTransactionHistory({
        gasDecimals: this.nativeAssetDecimals,
        baseUrl: this.baseUrl,
        address: params?.address,
        assetAddress,
        page: 0,
        offset: maxCount,
        apiKey: this.apiKey,
        chain: this.chain,
      })
    } else {
      transactions = await etherscanAPI.getGasAssetTransactionHistory({
        gasAsset: this.nativeAsset,
        gasDecimals: this.nativeAssetDecimals,
        baseUrl: this.baseUrl,
        address: params?.address,
        page: 0,
        offset: maxCount,
        apiKey: this.apiKey,
      })
    }

    return {
      total: transactions.length,
      txs: transactions.filter((_, index) => index >= offset && index < offset + limit),
    }
  }

  async getTransactionData(txHash: string, assetAddress?: Address): Promise<Tx> {
    let tx

    const txInfo = await this.provider.getTransaction(txHash)

    if (txInfo) {
      if (assetAddress) {
        tx =
          (
            await etherscanAPI.getTokenTransactionHistory({
              gasDecimals: this.nativeAssetDecimals,
              baseUrl: this.baseUrl,
              assetAddress,
              address: txInfo.from,
              startblock: txInfo.blockNumber,
              endblock: txInfo.blockNumber ? txInfo.blockNumber + 1 : undefined, // To be compatible with Routescan
              apiKey: this.apiKey,
              chain: this.chain,
            })
          ).filter((info) => info.hash === txHash)[0] ?? null
      } else {
        tx =
          (
            await etherscanAPI.getGasAssetTransactionHistory({
              gasAsset: this.nativeAsset,
              gasDecimals: this.nativeAssetDecimals,
              baseUrl: this.baseUrl,
              startblock: txInfo.blockNumber,
              endblock: txInfo.blockNumber ? txInfo.blockNumber + 1 : undefined, // To be compatible with Routescan
              apiKey: this.apiKey,
              address: txInfo.from,
            })
          ).filter((info) => info.hash === txHash)[0] ?? null
      }
    }

    if (!tx) throw new Error('Could not get transaction history')

    return tx
  }

  async getFeeRates(): Promise<FeeRates> {
    const gasOracleResponse = await etherscanAPI.getGasOracle(this.baseUrl, this.apiKey)

    return {
      [FeeOption.Average]: Number(gasOracleResponse.SafeGasPrice) * 10 ** 9,
      [FeeOption.Fast]: Number(gasOracleResponse.ProposeGasPrice) * 10 ** 9,
      [FeeOption.Fastest]: Number(gasOracleResponse.FastGasPrice) * 10 ** 9,
    }
  }
}
