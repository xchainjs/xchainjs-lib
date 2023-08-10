import { Provider } from '@ethersproject/abstract-provider'
import { Balance, OnlineDataProvider, Tx, TxHistoryParams, TxsPage } from '@xchainjs/xchain-client'
import { Address, Asset, Chain, assetToString, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'
import { BigNumber, ethers } from 'ethers'

import erc20ABI from './erc20.json'
import * as etherscanAPI from './etherscan-api'
import { ERC20Tx, GetERC20TxsResponse } from './types'

export class EtherscanProvider implements OnlineDataProvider {
  private provider: Provider
  private baseUrl: string
  private apiKey: string
  private chain: Chain
  private nativeAsset: Asset
  private nativeAssetDecimals: number

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

  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    //validate assets are for the correct chain
    assets?.forEach((i) => {
      if (i.chain !== this.chain) throw Error(`${assetToString(i)} is not an asset of ${this.chain}`)
    })
    const balances: Balance[] = []

    if (assets) {
      for (const asset of assets) {
        if (asset.symbol === this.nativeAsset.symbol) {
          balances.push(await this.getNativeAssetBalance(address))
        } else {
          const splitSymbol = asset.symbol.split('-')
          const tokenSymbol = splitSymbol[0]
          const contractAddress = splitSymbol[1]
          balances.push(await this.getTokenBalance(address, contractAddress, tokenSymbol))
        }
      }
    } else {
      //get nativeAsset
      balances.push(await this.getNativeAssetBalance(address))
      // Get All Erc-20 txs
      const response = (
        await axios.get<GetERC20TxsResponse>(
          `${this.baseUrl}/api?module=account&action=tokentx&address=${address}&startblock=0&sort=asc&apikey=${this.apiKey}`,
        )
      ).data

      const erc20TokenTxs = this.getUniqueContractAddresses(response.result)
      for (const erc20Token of erc20TokenTxs) {
        balances.push(await this.getTokenBalance(address, erc20Token.contractAddress, erc20Token.tokenSymbol))
      }
    }

    return balances
  }
  private async getNativeAssetBalance(address: Address): Promise<Balance> {
    const gasAssetBalance: BigNumber = await this.provider.getBalance(address)
    const amount = baseAmount(gasAssetBalance.toString(), this.nativeAssetDecimals)
    return {
      asset: this.nativeAsset,
      amount,
    }
  }
  private async getTokenBalance(address: Address, contractAddress: string, tokenTicker: string): Promise<Balance> {
    const asset: Asset = {
      chain: this.chain,
      symbol: `${tokenTicker}-${contractAddress}`,
      ticker: tokenTicker,
      synth: false,
    }

    const contract: ethers.Contract = new ethers.Contract(contractAddress, erc20ABI, this.provider)
    const balance = (await contract.balanceOf(address)).toString()

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
              startblock: txInfo.blockNumber,
              endblock: txInfo.blockNumber,
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
              endblock: txInfo.blockNumber,
              apiKey: this.apiKey,
              address: txInfo.from,
            })
          ).filter((info) => info.hash === txHash)[0] ?? null
      }
    }

    if (!tx) throw new Error('Could not get transaction history')

    return tx
  }
}
