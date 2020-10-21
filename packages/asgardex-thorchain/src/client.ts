import { PrivKey, Msg } from 'cosmos-client'
import { codec } from 'cosmos-client/codec'

import { ThorClient } from './thor/thor-client'
import { MsgSend } from './thor/types'
import { isMsgSend } from './util'

import { 
  Address,
  AsgardexClient,
  AsgardexClientParams,
  Balances,
  Fees,
  Network,
  Txs,
  TxFrom,
  TxTo,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
} from '@asgardex-clients/asgardex-client'
import {
  Asset,
  AssetRuneNative,
  assetFromString,
  baseAmount,
  baseToAsset,
  THORChain,
} from '@thorchain/asgardex-util'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  purgeClient(): void

  getAddress(): string
  
  validateAddress(address: string): boolean
}

class Client implements ThorchainClient, AsgardexClient {
  private network: Network
  private thorClient: ThorClient
  private phrase: string = ''
  private address: Address = ''
  private privateKey: PrivKey | null = null

  constructor({ network = 'testnet', phrase }: AsgardexClientParams) {
    this.network = network
    this.thorClient = new ThorClient(this.getClientUrl(), this.getChainId(), this.getPrefix())

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  setNetwork(network: Network): AsgardexClient {
    this.network = network
    this.thorClient = new ThorClient(this.getClientUrl(), this.getChainId(), this.getPrefix())
    this.address = ''
    
    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://168.119.22.92:1317' : 'http://13.250.144.124:1317'
  }

  getChainId = (): string => {
    return 'thorchain'
  }

  private getExplorerUrl = (): string => {
    return 'https://thorchain.net/'
  }
  
  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/addresses/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/txs/${txID}`
  }

  private getPrefix = (): string => {
    return this.network === 'testnet' ? 'tthor' : 'thor'
  }

  static generatePhrase = (): string => {
    return asgardexCrypto.generatePhrase()
  }

  static validatePhrase = (phrase: string): boolean => {
    return asgardexCrypto.validatePhrase(phrase)
  }

  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!asgardexCrypto.validatePhrase(phrase)) {
        throw new Error('Invalid BIP39 phrase')
      }

      this.phrase = phrase
      this.privateKey = null
      this.address = ''
    }
    
    return this.getAddress()
  }

  private getPrivateKey = (): PrivKey => {
    if (!this.privateKey) {
      if (!this.phrase) throw new Error('Phrase not set')

      this.privateKey = this.thorClient.getPrivKeyFromMnemonic(this.phrase)
    }

    return this.privateKey
  }

  getAddress = (): string => {
    if (!this.address) {
      const address = this.thorClient.getAddressFromPrivKey(this.getPrivateKey())
      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }
    
    return this.address
  }

  validateAddress = (address: Address): boolean => {
    return this.thorClient.checkAddress(address)
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    if (!address) {
      address = this.getAddress()
    }

    try {
      const balances = await this.thorClient.getBalance(address)
      console.log('original balances', balances)

      return balances.map(balance => (
        {
          asset: balance.denom && assetFromString(`${THORChain}.${balance.denom}`) || AssetRuneNative,
          amount: baseAmount(balance.amount, 8),
        }
      )).filter(balance => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = undefined;
    const messageSender = params && params.address || this.getAddress()
    const page = params && params.offset || undefined
    const limit = params && params.limit || undefined    
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      const txHistory = await this.thorClient.searchTx(messageAction, messageSender, page, limit, txMinHeight, txMaxHeight)

      console.log('original tx history', txHistory)

      const txs: Txs = (txHistory.txs || []).reduce((acc, tx: any) => {
        let msgs: Msg[] = []
        if (tx.tx.type !== undefined)
        {
          msgs = codec.fromJSONString(JSON.stringify(tx.tx)).msg
        } else {
          msgs = codec.fromJSONString(JSON.stringify(tx.tx.body.messages))
        }

        let from: TxFrom[] = []
        let to: TxTo[] = []
        let asset: Asset | null = null

        msgs.map(msg => {
          if (isMsgSend(msg)) {
            const msgSend = msg as MsgSend
            const amount = msgSend.amount
              .map(coin => baseAmount(coin.amount, 8))
              .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 8), baseAmount(0, 8))

            asset = msgSend.amount.reduce((acc, cur) => {
              if (acc) return acc
              return assetFromString(`${THORChain}.${cur.denom}`)
            }, null as Asset | null)
            
            from.push({
              from: msgSend.from_address.toBech32(),
              amount,
            })
            to.push({
              to: msgSend.to_address.toBech32(),
              amount,
            })
          }
        })

        return [
          ...acc,
          {
            asset: asset || AssetRuneNative,
            from,
            to,
            date: new Date(tx.timestamp),
            type: (from.length > 0 || to.length > 0) ? 'transfer' : 'unknown',
            hash: tx.hash || '',
          }
        ]
      }, [] as Txs)

      return {
        total: txHistory.total_count || 0,
        txs,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  deposit = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    return this.transfer({ asset, amount, recipient, memo })
  }

  transfer = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      const transferResult = await this.thorClient.transfer(
        this.getPrivateKey(),
        this.getAddress(),
        recipient,
        baseToAsset(amount).amount().toString(),
        asset ? asset.symbol : AssetRuneNative.symbol,
        memo
      )

      return transferResult?.txhash || ''

    } catch (err) {
      return ''
    }
  }
  
  // Need to be updated
  getFees = async (): Promise<Fees> => {
    try {
      return {
        type: 'base',
        average: baseAmount(0),
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
