import {
  Address,
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
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, assetFromString, baseAmount, THORChain } from '@thorchain/asgardex-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey, Msg } from 'cosmos-client'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'
import { codec } from 'cosmos-client/codec'

import { ThorClient } from './thor/thor-client'
import { AssetThor, RawTxResponse } from './thor/types'
import { isMsgSend, isMsgMultiSend, getDenom, getAsset } from './util'
import { StdTx } from 'cosmos-client/x/auth'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  purgeClient(): void

  getAddress(): string

  validateAddress(address: string): boolean
}

class Client implements ThorchainClient, XChainClient {
  private network: Network
  private thorClient: ThorClient
  private phrase = ''
  private address: Address = ''
  private privateKey: PrivKey | null = null

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network
    this.thorClient = new ThorClient(this.getClientUrl(), this.getChainId(), this.getPrefix())

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  setNetwork(network: Network): XChainClient {
    this.network = network
    this.thorClient = new ThorClient(this.getClientUrl(), this.getChainId(), this.getPrefix())
    this.address = ''

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://13.238.212.224:1317' : 'http://104.248.96.152:1317'
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
    return xchainCrypto.generatePhrase()
  }

  static validatePhrase = (phrase: string): boolean => {
    return xchainCrypto.validatePhrase(phrase)
  }

  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!Client.validatePhrase(phrase)) {
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
    try {
      const balances = await this.thorClient.getBalance(address || this.getAddress())

      return balances
        .map((balance) => ({
          asset: (balance.denom && getAsset(balance.denom)) || AssetThor,
          amount: baseAmount(balance.amount, 8),
        }))
        .filter((balance) => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = undefined // filter MsgSend only
    const messageSender = (params && params.address) || this.getAddress()
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      const txHistory = await this.thorClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      const txs: Txs = (txHistory.txs || []).reduce((acc, tx) => {
        let msgs: Msg[] = []
        if ((tx.tx as RawTxResponse).body === undefined) {
          msgs = codec.fromJSONString(JSON.stringify(tx.tx as StdTx)).msg
        } else {
          msgs = codec.fromJSONString(JSON.stringify((tx.tx as RawTxResponse).body.messages))
        }

        const from: TxFrom[] = []
        const to: TxTo[] = []
        let asset: Asset | null = null

        msgs.map((msg) => {
          if (isMsgSend(msg)) {
            const msgSend = msg as MsgSend
            const amount = msgSend.amount
              .map((coin) => baseAmount(coin.amount, 8))
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
          } else if (isMsgMultiSend(msg)) {
            const msgMultiSend = msg as MsgMultiSend

            from.push(
              ...msgMultiSend.inputs.map((input) => {
                return {
                  from: input.address,
                  amount: input.coins
                    .map((coin) => baseAmount(coin.amount, 6))
                    .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6)),
                }
              }),
            )
            to.push(
              ...msgMultiSend.outputs.map((output) => {
                return {
                  to: output.address,
                  amount: output.coins
                    .map((coin) => baseAmount(coin.amount, 6))
                    .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6)),
                }
              }),
            )
          }
        })

        return [
          ...acc,
          {
            asset: asset || AssetThor,
            from,
            to,
            date: new Date(tx.timestamp),
            type: from.length > 0 || to.length > 0 ? 'transfer' : 'unknown',
            hash: tx.txhash || '',
          },
        ]
      }, [] as Txs)

      return {
        total: parseInt(txHistory.total_count?.toString() || '0'),
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
      const transferResult = await this.thorClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset || AssetThor),
        memo,
      })

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
