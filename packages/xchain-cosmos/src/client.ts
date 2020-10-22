import {
  Address,
  Balances,
  Fees,
  Network,
  TxFrom,
  TxTo,
  TxParams,
  TxHash,
  TxHistoryParams,
  Txs,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, baseAmount } from '@thorchain/asgardex-util'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'

import { PrivKey, Msg } from 'cosmos-client'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { codec } from 'cosmos-client/codec'

import { CosmosSDKClient } from './cosmos/sdk-client'
import { AssetAtom, AssetMuon } from './cosmos/types'
import { isMsgSend, isMsgMultiSend, getDenom, getAsset } from './util'

/**
 * Interface for custom Cosmos client
 */
export interface CosmosClient {
  purgeClient(): void

  getAddress(): string

  validateAddress(address: string): boolean

  getMainAsset(): Asset
}

class Client implements CosmosClient, XChainClient {
  private network: Network
  private thorClient: CosmosSDKClient
  private phrase = ''
  private address: Address = '' // default address at index 0
  private privateKey: PrivKey | null = null // default private key at index 0

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network
    this.thorClient = new CosmosSDKClient(this.getClientUrl(), this.getChainId())

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  setNetwork = (network: Network): XChainClient => {
    this.network = network
    this.thorClient = new CosmosSDKClient(this.getClientUrl(), this.getChainId())
    this.address = ''

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://lcd.gaia.bigdipper.live:1317' : 'https://api.cosmos.network'
  }

  getChainId = (): string => {
    return this.network === 'testnet' ? 'gaia-3a' : 'cosmoshub-3'
  }

  private getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://gaia.bigdipper.live' : 'https://cosmos.bigdipper.live'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/transactions/${txID}`
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

  getMainAsset = (): Asset => {
    return this.network === 'testnet' ? AssetMuon : AssetAtom
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    if (!address) {
      address = this.getAddress()
    }

    try {
      const balances = await this.thorClient.getBalance(address)
      const mainAsset = this.getMainAsset()

      return balances
        .map((balance) => {
          return {
            asset: (balance.denom && getAsset(balance.denom)) || mainAsset,
            amount: baseAmount(balance.amount, 6),
          }
        })
        .filter((balance) => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = 'send' // filter MsgSend only
    const messageSender = (params && params.address) || this.getAddress()
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      const mainAsset = this.getMainAsset()
      const txHistory = await this.thorClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      const txs: Txs = (txHistory.txs || []).reduce((acc, tx: any) => {
        let msgs: Msg[] = []
        if (tx.tx.type !== undefined) {
          msgs = codec.fromJSONString(JSON.stringify(tx.tx)).msg
        } else {
          msgs = codec.fromJSONString(JSON.stringify(tx.tx.body.messages))
        }

        const from: TxFrom[] = []
        const to: TxTo[] = []
        msgs.map((msg) => {
          if (isMsgSend(msg)) {
            const msgSend = msg as MsgSend
            const amount = msgSend.amount
              .map((coin) => baseAmount(coin.amount, 6))
              .reduce((acc, cur) => baseAmount(acc.amount().plus(cur.amount()), 6), baseAmount(0, 6))

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
            asset: mainAsset,
            from,
            to,
            date: new Date(tx.timestamp),
            type: from.length > 0 || to.length > 0 ? 'transfer' : 'unknown',
            hash: tx.hash || '',
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
      const mainAsset = this.getMainAsset()
      const transferResult = await this.thorClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset || mainAsset),
        memo,
      })

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // Need to be updated
  getFees = async (): Promise<Fees> => {
    try {
      return {
        type: 'base',
        average: baseAmount(0, 6),
      } as Fees
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

export { Client }
