import axios from 'axios'
import {
  Balances as BinanceBalances,
  Fees as BinanceFees,
  Prefix,
  TransferFee as BinanceTransferFee,
  Fee as BinanceFee,
  TxPage as BinanceTxPage,
} from './types/binance'

import { crypto } from '@binance-chain/javascript-sdk'
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import { 
  Address,
  AsgardexClient,
  AsgardexClientParams,
  Balances,
  Fees,
  Network,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
} from '@asgardex-clients/asgardex-client'
import {
  Asset,
  AssetBNB,
  BaseAmount,
  assetFromString,
  assetAmount,
  assetToBase,
  baseToAsset,
} from '@thorchain/asgardex-util'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'
import { isTransferFee, getTxType, isFreezeFee } from './util'

type PrivKey = string

export type FreezeParams = {
  asset: Asset;
  amount: BaseAmount;
  recipient?: Address;
};

export type Coin = {
  asset: Asset
  amount: BaseAmount
}

export type MultiTransfer = {
  to: Address
  coins: Coin[]
}

export type MultiSendParams = {
  address?: Address;
  transactions: MultiTransfer[];
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
class Client implements BinanceClient, AsgardexClient {
  private network: Network
  private bncClient: BncClient
  private phrase: string = ''
  private address: Address = ''
  private privateKey: PrivKey | null = null

  /**
   * Client has to be initialised with network type and phrase
   * It will throw an error if an invalid phrase has been passed
   **/

  constructor({ network = 'testnet', phrase }: AsgardexClientParams) {
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
  setNetwork(network: Network): AsgardexClient {
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
    return this.network === 'testnet'? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'
  }
  
  getExplorerAddressUrl = (): string => {
    const networkPath = this.network === 'testnet' ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org'
    return `${networkPath}/address/${this.getAddress()}`
  }

  getExplorerTxUrl = (): string => {
    const networkPath = this.network === 'testnet' ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org'
    return `${networkPath}/tx/`
  }

  private getPrefix = (): Prefix => {
    return this.network === 'testnet' ? 'tbnb' : 'bnb'
  }

  static generatePhrase = (): string => {
    return asgardexCrypto.generatePhrase()
  }

  setPhrase = (phrase: string): Address => {
    if (!this.phrase || this.phrase !== phrase) {
      if (!asgardexCrypto.validatePhrase(phrase)) {
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
  private getPrivateKey = () => {
    if (!this.privateKey) {
      if (!this.phrase) throw new Error('Phrase not set')

      const privateKey = crypto.getPrivateKeyFromMnemonic(this.phrase)
      this.privateKey = privateKey
      return privateKey
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
    if (!address) {
      address = this.getAddress()
    }
    try {
      await this.bncClient.initChain()
      const balances: BinanceBalances = await this.bncClient.getBalance(address)

      return balances.map(balance => {
        return {
          asset: assetFromString(balance.symbol) || AssetBNB,
          amount: assetToBase(assetAmount(balance.free, 8)),
          frozenAmount: assetToBase(assetAmount(balance.frozen, 8)),
        }
      }).filter(balance => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    await this.bncClient.initChain()

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
      const txHistory = await axios.get<BinanceTxPage>(url.toString()).then(response => response.data)
      return {
        total: txHistory.total,
        txs: txHistory.tx.map(tx => {
          const asset = assetFromString(`${AssetBNB.chain}.${tx.txAsset}`);

          if (!asset) return null

          return {
            asset,
            from: [
              {
                from: tx.fromAddr,
                amount: assetToBase(assetAmount(tx.value, 8)),
              }
            ],
            to: [
              {
                to: tx.toAddr,
                amount: assetToBase(assetAmount(tx.value, 8)),
              }
            ],
            date: new Date(tx.timeStamp),
            type: getTxType(tx.txType),
            hash: tx.txHash,
          }
        })
        .filter(tx => tx).map(tx => tx!)
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
      transactions.map(transaction => {
        return {
          to: transaction.to,
          coins: transaction.coins.map(coin => {
            return {
              denom: coin.asset.symbol,
              amount: baseToAsset(coin.amount).amount().toString()
            }
          })
        }
      }),
      memo
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  deposit = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    return this.transfer({ asset, amount, recipient, memo })
  }

  transfer = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

    const transferResult = await this.bncClient.transfer(
      this.getAddress(),
      recipient,
      baseToAsset(amount).amount().toString(),
      asset.symbol,
      memo
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  freeze = async ({ recipient, asset, amount }: FreezeParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

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
      baseToAsset(amount).amount().toString()
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }

  unfreeze = async ({ recipient, asset, amount }: FreezeParams): Promise<TxHash> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

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
      baseToAsset(amount).amount().toString()
    )

    try {
      return transferResult.result.map((txResult: { hash?: TxHash }) => txResult?.hash ?? '')[0]
    } catch (err) {
      return ''
    }
  }
  
  getFees = async (): Promise<Fees> => {
    await this.bncClient.initChain()
    try {
      const feesArray = await axios.get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`).then(response => response.data)
      const transferFee = feesArray.find(isTransferFee)
      if (!transferFee) {
        throw new Error('failed to get transfer fees')
      }

      return {
        type: 'base',
        average: (transferFee as BinanceTransferFee).fixed_fee_params.fee,
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
  
  getMultiSendFees = async (): Promise<Fees> => {
    await this.bncClient.initChain()
    try {
      const feesArray = await axios.get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`).then(response => response.data)
      const transferFee = feesArray.find(isTransferFee)
      if (!transferFee) {
        throw new Error('failed to get transfer fees')
      }

      return {
        type: 'base',
        average: (transferFee as BinanceTransferFee).multi_transfer_fee,
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
  
  getFreezeFees = async (): Promise<Fees> => {
    await this.bncClient.initChain()
    try {
      const feesArray = await axios.get<BinanceFees>(`${this.getClientUrl()}/api/v1/fees`).then(response => response.data)
      const transferFee = feesArray.find(isFreezeFee)
      if (!transferFee) {
        throw new Error('failed to get transfer fees')
      }

      return {
        type: 'base',
        average: (transferFee as BinanceFee).fee,
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
