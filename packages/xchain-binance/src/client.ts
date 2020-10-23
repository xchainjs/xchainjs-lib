import axios from 'axios'
import {
  Balances as BinanceBalances,
  Fees as BinanceFees,
  Prefix,
  TransferFee as BinanceTransferFee,
  Fee as BinanceFee,
  TxPage as BinanceTxPage,
} from './types/binance'

import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import {
  Address,
  XChainClient,
  XChainClientParams,
  Balances,
  Fees,
  Network,
  Txs,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
} from '@xchainjs/xchain-client'
import {
  Asset,
  AssetBNB,
  BaseAmount,
  assetFromString,
  assetAmount,
  assetToBase,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { isTransferFee, getTxType, isFreezeFee } from './util'

type PrivKey = string

export type FreezeParams = {
  asset: Asset
  amount: BaseAmount
  recipient?: Address
}

export type Coin = {
  asset: Asset
  amount: BaseAmount
}

export type MultiTransfer = {
  to: Address
  coins: Coin[]
}

export type MultiSendParams = {
  address?: Address
  transactions: MultiTransfer[]
  memo?: string
}

/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
  purgeClient(): void
  getBncClient(): BncClient

  getAddress(): string

  validateAddress(address: string): boolean

  getMultiSendFees(): Promise<Fees>
  getFreezeFees(): Promise<Fees>

  freeze(params: FreezeParams): Promise<TxHash>
  unfreeze(params: FreezeParams): Promise<TxHash>

  multiSend(params: MultiSendParams): Promise<TxHash>
}

/**
 * Custom Binance client
 *
 * @class Binance
 * @implements {BinanceClient}
 */
class Client implements BinanceClient, XChainClient {
  private network: Network
  private bncClient: BncClient
  private phrase = ''
  private address: Address = '' // default address at index 0
  private privateKey: PrivKey | null = null // default private key at index 0

  /**
   * Client has to be initialised with network type and phrase
   * It will throw an error if an invalid phrase has been passed
   **/

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    // Invalid phrase will throw an error!
    this.network = network
    if (phrase) this.setPhrase(phrase)

    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(network)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  getBncClient(): BncClient {
    return this.bncClient
  }

  // update network
  setNetwork(network: Network): XChainClient {
    this.network = network
    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(network)
    this.address = ''

    return this
  }

  // Will return the desired network
  getNetwork(): Network {
    return this.network
  }

  private getClientUrl = (): string => {
    return this.network === 'testnet' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'
  }

  private getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  private getPrefix = (): Prefix => {
    return this.network === 'testnet' ? 'tbnb' : 'bnb'
  }

  static generatePhrase = (): string => {
    return xchainCrypto.generatePhrase()
  }

  setPhrase = (phrase: string): Address => {
    if (!this.phrase || this.phrase !== phrase) {
      if (!xchainCrypto.validatePhrase(phrase)) {
        throw new Error('Invalid BIP39 phrase')
      }

      this.phrase = phrase
      this.privateKey = null
      this.address = ''
    }

    return this.getAddress()
  }

  /**
   * @private
   * Returns private key
   * Throws an error if phrase has not been set before
   * */
  private getPrivateKey = (): PrivKey => {
    if (!this.privateKey) {
      if (!this.phrase) throw new Error('Phrase not set')

      this.privateKey = crypto.getPrivateKeyFromMnemonic(this.phrase)
    }

    return this.privateKey
  }

  getAddress = (): string => {
    if (!this.address) {
      const address = crypto.getAddressFromPrivateKey(this.getPrivateKey(), this.getPrefix())
      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }
    return this.address
  }

  validateAddress = (address: Address): boolean => {
    return this.bncClient.checkAddress(address, this.getPrefix())
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      if (!address) {
        address = this.getAddress()
      }

      const balances: BinanceBalances = await this.bncClient.getBalance(address)

      return balances
        .map((balance) => {
          return {
            asset: assetFromString(balance.symbol) || AssetBNB,
            amount: assetToBase(assetAmount(balance.free, 8)),
            frozenAmount: assetToBase(assetAmount(balance.frozen, 8)),
          }
        })
        .filter((balance) => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const clientUrl = `${this.getClientUrl()}/api/v1/transactions`
    const url = new URL(clientUrl)

    url.searchParams.set('address', params ? params.address : this.getAddress())
    if (params && params.limit) {
      url.searchParams.set('limit', params.limit.toString())
    }
    if (params && params.offset) {
      url.searchParams.set('offset', params.offset.toString())
    }
    if (params && params.startTime) {
      url.searchParams.set('startTime', params.startTime.toString())
    }

    try {
      const txHistory = await axios.get<BinanceTxPage>(url.toString()).then((response) => response.data)

      return {
        total: txHistory.total,
        txs: txHistory.tx.reduce((acc, tx) => {
          const asset = assetFromString(`${AssetBNB.chain}.${tx.txAsset}`)

          if (!asset) return acc

          return [
            ...acc,
            {
              asset,
              from: [
                {
                  from: tx.fromAddr,
                  amount: assetToBase(assetAmount(tx.value, 8)),
                },
              ],
              to: [
                {
                  to: tx.toAddr,
                  amount: assetToBase(assetAmount(tx.value, 8)),
                },
              ],
              date: new Date(tx.timeStamp),
              type: getTxType(tx.txType),
              hash: tx.txHash,
            },
          ]
        }, [] as Txs),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  multiSend = async ({ address, transactions, memo = '' }: MultiSendParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

    const transferResult = await this.bncClient.multiSend(
      address || this.getAddress(),
      transactions.map((transaction) => {
        return {
          to: transaction.to,
          coins: transaction.coins.map((coin) => {
            return {
              denom: coin.asset.symbol,
              amount: baseToAsset(coin.amount).amount().toString(),
            }
          }),
        }
      }),
      memo,
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  transfer = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error: Error) => Promise.reject(error))

    const transferResult = await this.bncClient.transfer(
      this.getAddress(),
      recipient,
      baseToAsset(amount).amount().toString(),
      asset ? asset.symbol : AssetBNB.symbol,
      memo,
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  freeze = async ({ recipient, asset, amount }: FreezeParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error: Error) => Promise.reject(error))

    const address = recipient || this.getAddress()
    if (!address)
      return Promise.reject(
        new Error(
          'Address has to be set. Or set a phrase by calling `setPhrase` before to use an address of an imported key.',
        ),
      )

    const transferResult = await this.bncClient.tokens.freeze(
      address,
      asset.symbol,
      baseToAsset(amount).amount().toString(),
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  unfreeze = async ({ recipient, asset, amount }: FreezeParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error: Error) => Promise.reject(error))

    const address = recipient || this.getAddress()
    if (!address)
      return Promise.reject(
        new Error(
          'Address has to be set. Or set a phrase by calling `setPhrase` before to use an address of an imported key.',
        ),
      )

    const transferResult = await this.bncClient.tokens.unfreeze(
      address,
      asset.symbol,
      baseToAsset(amount).amount().toString(),
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  getFees = async (): Promise<Fees> => {
    try {
      const feesArray = await axios
        .get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`)
        .then((response) => response.data)
      const transferFee = feesArray.find(isTransferFee)
      if (!transferFee) {
        throw new Error('failed to get transfer fees')
      }

      return {
        type: 'base',
        average: baseAmount((transferFee as BinanceTransferFee).fixed_fee_params.fee),
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getMultiSendFees = async (): Promise<Fees> => {
    try {
      const feesArray = await axios
        .get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`)
        .then((response) => response.data)
      const transferFee = feesArray.find(isTransferFee)
      if (!transferFee) {
        throw new Error('failed to get transfer fees')
      }

      return {
        type: 'base',
        average: baseAmount((transferFee as BinanceTransferFee).multi_transfer_fee),
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFreezeFees = async (): Promise<Fees> => {
    try {
      const feesArray = await axios
        .get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`)
        .then((response) => response.data)
      const freezeFee = feesArray.find(isFreezeFee)
      if (!freezeFee) {
        throw new Error('failed to get transfer fees')
      }

      return {
        type: 'base',
        average: baseAmount((freezeFee as BinanceFee).fee),
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
