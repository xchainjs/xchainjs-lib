import {
  Address,
  Balances,
  Fees,
  Network,
  Tx,
  TxParams,
  TxHash,
  TxHistoryParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import { Asset, baseAmount } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { PrivKey, codec, Msg, AccAddress } from 'cosmos-client'
import { StdTxFee } from 'cosmos-client/api'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgSend, MsgMultiSend } from 'cosmos-client/x/bank'

import { AssetRune, MsgNativeTx, DepositParam } from './types'
import { getDenom, getAsset, getTxsFromHistory, DECIMAL, getDenomWithChain, isBroadcastSuccess } from './util'

/**
 * Interface for custom Thorchain client
 */
export interface ThorchainClient {
  validateAddress(address: string): boolean

  deposit(params: DepositParam): Promise<TxHash>
}

class Client implements ThorchainClient, XChainClient {
  private network: Network
  private thorClient: CosmosSDKClient
  private phrase = ''
  private address: Address = ''
  private privateKey: PrivKey | null = null

  private derive_path = "44'/931'/0'/0/0"

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network
    this.thorClient = new CosmosSDKClient({
      server: this.getClientUrl(),
      chainId: this.getChainId(),
      prefix: this.getPrefix(),
      derive_path: this.derive_path,
    })

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient = (): void => {
    this.phrase = ''
    this.address = ''
    this.privateKey = null
  }

  setNetwork = (network: Network): XChainClient => {
    this.network = network
    this.thorClient = new CosmosSDKClient({
      server: this.getClientUrl(),
      chainId: this.getChainId(),
      prefix: this.getPrefix(),
      derive_path: this.derive_path,
    })
    this.address = ''

    return this
  }

  getNetwork = (): Network => {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'http://18.198.92.45:1317' : 'http://138.68.125.107:1317'
  }

  getChainId = (): string => {
    return 'thorchain'
  }

  private getPrefix = (): string => {
    return this.network === 'testnet' ? 'tthor' : 'thor'
  }

  private registerCodecs = (): void => {
    codec.registerCodec('thorchain/MsgSend', MsgSend, MsgSend.fromJSON)
    codec.registerCodec('thorchain/MsgMultiSend', MsgMultiSend, MsgMultiSend.fromJSON)
    codec.registerCodec('thorchain/MsgNativeTx', MsgNativeTx, MsgNativeTx.fromJSON)
  }

  getExplorerUrl = (): string => {
    return 'https://thorchain.net'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/addresses/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/txs/${txID}`
  }

  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!xchainCrypto.validatePhrase(phrase)) {
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
          asset: (balance.denom && getAsset(balance.denom)) || AssetRune,
          amount: baseAmount(balance.amount, DECIMAL),
        }))
        .filter((balance) => !asset || balance.asset === asset)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const messageAction = undefined
    const messageSender = (params && params.address) || this.getAddress()
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    try {
      this.registerCodecs()

      const txHistory = await this.thorClient.searchTx({
        messageAction,
        messageSender,
        page,
        limit,
        txMinHeight,
        txMaxHeight,
      })

      return {
        total: parseInt(txHistory.total_count?.toString() || '0'),
        txs: getTxsFromHistory(txHistory.txs || [], AssetRune),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const txResult = await this.thorClient.txsHashGet(txId)
      const txs = getTxsFromHistory([txResult], AssetRune)

      if (txs.length === 0) {
        throw new Error('transaction not found')
      }

      return txs[0]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  private getDefaultStdTxFee = (): StdTxFee => {
    return {
      amount: [],
      gas: '10000000',
    }
  }

  deposit = async ({ asset, amount, memo }: DepositParam): Promise<TxHash> => {
    try {
      this.registerCodecs()

      if (!asset) asset = AssetRune

      const assetBalance = await this.getBalance(this.getAddress(), asset)
      const fee = await this.getFees()
      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(fee.average.amount()))) {
        throw new Error('insufficient funds')
      }

      const signer = this.getAddress()

      const msg: Msg = [
        MsgNativeTx.fromJSON({
          coins: [
            {
              asset: getDenomWithChain(asset),
              amount: amount.amount().toString(),
            },
          ],
          memo,
          signer,
        }),
      ]

      const unsignedStdTx = StdTx.fromJSON({
        msg,
        fee: this.getDefaultStdTxFee(),
        signatures: [],
        memo: '',
      })

      const transferResult = await this.thorClient.signAndBroadcast(
        unsignedStdTx,
        this.getPrivateKey(),
        AccAddress.fromBech32(signer),
      )

      if (!isBroadcastSuccess(transferResult)) {
        throw new Error(`failed to broadcast transaction: ${transferResult.txhash}`)
      }

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  transfer = async ({ asset, amount, recipient, memo }: TxParams): Promise<TxHash> => {
    try {
      this.registerCodecs()

      if (!asset) asset = AssetRune

      const assetBalance = await this.getBalance(this.getAddress(), asset)
      const fee = await this.getFees()
      if (assetBalance.length === 0 || assetBalance[0].amount.amount().lt(amount.amount().plus(fee.average.amount()))) {
        throw new Error('insufficient funds')
      }

      const transferResult = await this.thorClient.transfer({
        privkey: this.getPrivateKey(),
        from: this.getAddress(),
        to: recipient,
        amount: amount.amount().toString(),
        asset: getDenom(asset),
        memo,
        fee: this.getDefaultStdTxFee(),
      })

      if (!isBroadcastSuccess(transferResult)) {
        throw new Error(`failed to broadcast transaction: ${transferResult.txhash}`)
      }

      return transferResult?.txhash || ''
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // there is no fixed fee, we set fee amount when creating a transaction.
  getFees = async (): Promise<Fees> => {
    return Promise.resolve(this.getDefaultFees())
  }

  getDefaultFees = (): Fees => {
    const fee = baseAmount(10000000, DECIMAL)
    return {
      type: 'base',
      fast: fee,
      fastest: fee,
      average: fee,
    }
  }
}

export { Client }
