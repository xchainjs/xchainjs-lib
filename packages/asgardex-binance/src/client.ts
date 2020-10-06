import axios from 'axios'
import { Big } from 'big.js'
import {
  Balances as BinanceBalances,
  Fees as BinanceFees,
  Prefix,
  TransferFee,
  FreezeParams,
  // GetTxsParams,
  // TxPage,
  // VaultTxParams,
  // NormalTxParams,
  // MultiSendParams,
  // GetMarketsParams,
} from './types/binance'

import { crypto } from '@binance-chain/javascript-sdk'
import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import { 
  Address,
  AsgardexClient,
  Fees,
  Network,
  Path,
  TxParams,
  TransferResult
} from '@asgardex-clients/asgardex-client'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'
import { isTransferFee } from './util'

// This should be moved to asgardex-client interface
type PrivKey = string

// This should be moved to asgardex-client interface
interface Balance {
  coin: string
  amount: number
  frozenAmount?: number
}

/**
 * Interface for custom Binance client
 */
export interface BinanceClient {
  purgeClient(): void

  getAddress(): string

  validateAddress(address: string): boolean

  freeze(params: FreezeParams): Promise<TransferResult>

  unfreeze(params: FreezeParams): Promise<TransferResult>

  // getTransactions(params?: GetTxsParams): Promise<TxPage>
  // getMarkets(params: GetMarketsParams): Promise<any>
  // multiSend(params: MultiSendParams): Promise<TransferResult>
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

  constructor({ network = Network.TEST, phrase }: { network: Network; phrase?: string }) {
    // Invalid phrase will throw an error!
    this.network = network
    this.bncClient = new BncClient(this.getClientUrl())
    this.bncClient.chooseNetwork(network)
    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
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
    // return this.network === Network.TEST ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org'

    // Accelerated 1
    return this.network === Network.TEST ? 'https://testnet-dex-asiapacific.binance.org' : 'https://dex-asiapacific.binance.org'
  }

  getExplorerUrl = (type: Path, param: string): string => {
    const networkPath = this.network === Network.TEST ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org'
    return type === Path.tx ? `${networkPath}/tx/${param}` : `${networkPath}/address/${param}`
  }

  // Not used for binance client
  setNodeURL(_url: string): void {
  }

  // Not used for binance client
  setNodeAPIKey(_key: string): void {
  }

  private getPrefix = (): Prefix => {
    return this.network === Network.TEST ? 'tbnb' : 'bnb'
  }

  static generatePhrase = (): string => {
    return asgardexCrypto.generatePhrase()
  }

  // Sets this.phrase to be accessed later
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

  getBalance = async (address?: Address, asset?: string): Promise<Balance[]> => {
    if (!address) {
      address = this.getAddress()
    }
    try {
      await this.bncClient.initChain()
      const balances: BinanceBalances = await this.bncClient.getBalance(address)

      return balances.map(balance => (
        {
          coin: balance.symbol,
          amount: Number((parseFloat(balance.free) * 1e8).toFixed()),
          frozenAmount: Number((parseFloat(balance.frozen) * 1e8).toFixed()),
        }
      )).filter(balance => !asset || balance.coin === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // getTransactions = async (params: GetTxsParams = {}): Promise<TxPage> => {
  //   const {
  //     address = this.getAddress(),
  //     blockHeight,
  //     endTime,
  //     limit,
  //     offset,
  //     side,
  //     startTime,
  //     txAsset,
  //     txType,
  //   } = params

  //   const clientUrl = `${this.getClientUrl()}/api/v1/transactions`
  //   const url = new URL(clientUrl)
  //   if (address) url.searchParams.set('address', address)
  //   if (blockHeight) url.searchParams.set('blockHeight', blockHeight.toString())
  //   if (endTime) url.searchParams.set('endTime', endTime.toString())
  //   if (limit) url.searchParams.set('limit', limit.toString())
  //   if (offset) url.searchParams.set('offset', offset.toString())
  //   if (side) url.searchParams.set('side', side.toString())
  //   if (startTime) url.searchParams.set('startTime', startTime.toString())
  //   if (txAsset) url.searchParams.set('txAsset', txAsset.toString())
  //   if (txType) url.searchParams.set('txType', txType.toString())

  //   await this.bncClient.initChain()

  //   try {
  //     const response = await axios.get<TxPage>(url.toString())
  //     return response.data
  //   } catch (error) {
  //     return Promise.reject(error)
  //   }
  // }

  // getMarkets = async ({ limit = 1000, offset = 0 }: GetMarketsParams) => {
  //   await this.bncClient.initChain()
  //   return this.bncClient.getMarkets(limit, offset)
  // }

  // multiSend = async ({ address, transactions, memo = '' }: MultiSendParams) => {
  //   await this.bncClient.initChain()
  //   return await this.bncClient.multiSend(address, transactions, memo)
  // }

  async deposit({ asset, amount, recipient, memo, feeRate }: TxParams): Promise<string> {
    return this.transfer({ asset, amount, recipient, memo, feeRate })
  }

  async transfer({ asset, amount, recipient, memo }: TxParams): Promise<TransferResult> {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

    const transferResult = await this.bncClient.transfer(this.getAddress(), recipient, amount / 1e8, asset, memo)
    try {
      return transferResult.result.map((txResult: any) => txResult.hash)[0]
    } catch (err) {
      return ''
    }
  }

  freeze = async ({ address, asset, amount }: FreezeParams): Promise<TransferResult> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

    const addr = address || this.getAddress()
    if (!addr)
      return Promise.reject(
        new Error(
          'Address has to be set. Or set a phrase by calling `setPhrase` before to use an address of an imported key.',
        ),
      )

    const transferResult = await this.bncClient.tokens.freeze(addr, asset, Big(amount).div(Big(1e8)))

    try {
      return transferResult.result.map((txResult: any) => txResult.hash)[0]
    } catch (err) {
      return ''
    }
  }

  unfreeze = async ({ address, asset, amount }: FreezeParams): Promise<TransferResult> => {
    await this.bncClient.initChain()
    await this.bncClient.setPrivateKey(this.getPrivateKey()).catch((error) => Promise.reject(error))

    const addr = address || this.getAddress()
    if (!addr)
      return Promise.reject(
        new Error(
          'Address has to be set. Or set a phrase by calling `setPhrase` before to use an address of an imported key.',
        ),
      )

    const transferResult = await this.bncClient.tokens.unfreeze(addr, asset, Big(amount).div(Big(1e8)))

    try {
      return transferResult.result.map((txResult: any) => txResult.hash)[0]
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
        average: (transferFee as TransferFee).fixed_fee_params.fee,
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client, Network, Balance, Path }
