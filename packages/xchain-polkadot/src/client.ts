import axios from 'axios'
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
import { Asset, assetAmount, assetToString, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import { ApiPromise, WsProvider, Keyring } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'
import { hexToU8a, isHex } from '@polkadot/util'

import { SubscanResponse, Account, AssetDOT, TransfersResult, Extrinsic, Transfer } from './types'
import { isSuccess, getDecimal } from './util'

/**
 * Interface for custom Polkadot client
 */
export interface PolkadotClient {
  getSS58Format(): number
  getWsEndpoint(): string
  estimateFees(params: TxParams): Promise<Fees>
}

class Client implements PolkadotClient, XChainClient {
  private network: Network
  private phrase = ''
  private address: Address = ''
  private api: ApiPromise | null = null
  private derivationPath = "44//354//0//0//0'"

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network

    if (phrase) this.setPhrase(phrase)
  }

  private purgeProvider = (): void => {
    this.api?.disconnect()
    this.api = null
  }

  purgeClient = (): void => {
    this.purgeProvider()

    this.phrase = ''
    this.address = ''
  }

  setNetwork(network: Network): XChainClient {
    if (network !== this.network) {
      this.purgeProvider()

      this.network = network
      this.address = ''
    }

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'https://westend.subscan.io' : 'https://polkadot.subscan.io'
  }

  getWsEndpoint = (): string => {
    return this.network === 'testnet' ? 'wss://westend-rpc.polkadot.io' : 'wss://rpc.polkadot.io'
  }

  getExplorerUrl = (): string => {
    return this.network === 'testnet' ? 'https://westend.subscan.io' : 'https://polkadot.subscan.io'
  }

  getExplorerAddressUrl = (address: Address): string => {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  getExplorerTxUrl = (txID: string): string => {
    return `${this.getExplorerUrl()}/extrinsic/${txID}`
  }

  getSS58Format = (): number => {
    return this.network === 'testnet' ? 42 : 0
  }

  setPhrase = (phrase: string): Address => {
    if (this.phrase !== phrase) {
      if (!xchainCrypto.validatePhrase(phrase)) {
        throw new Error('Invalid BIP39 phrase')
      }

      this.phrase = phrase
      this.address = ''
    }

    return this.getAddress()
  }

  private getKeyringPair = (): KeyringPair => {
    const key = new Keyring({ ss58Format: this.getSS58Format(), type: 'ed25519' })

    return key.createFromUri(`${this.phrase}//${this.derivationPath}`)
  }

  private getAPI = async (): Promise<ApiPromise> => {
    try {
      if (!this.api) {
        this.api = new ApiPromise({ provider: new WsProvider(this.getWsEndpoint()) })
        await this.api.isReady
      }

      if (!this.api.isConnected) {
        await this.api.connect()
      }

      return this.api
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * https://polkadot.js.org/docs/util-crypto/examples/validate-address
   * @param address
   */
  validateAddress = (address: string): boolean => {
    try {
      const key = new Keyring({ ss58Format: this.getSS58Format(), type: 'ed25519' })
      return key.encodeAddress(isHex(address) ? hexToU8a(address) : key.decodeAddress(address)) === address
    } catch (error) {
      return false
    }
  }

  getAddress = (): Address => {
    if (!this.address) {
      const address = this.getKeyringPair().address

      if (!address) {
        throw new Error('address not defined')
      }

      this.address = address
    }

    return this.address
  }

  getBalance = async (address?: Address, asset?: Asset): Promise<Balances> => {
    try {
      const response: SubscanResponse<Account> = await axios
        .post(`${this.getClientUrl()}/api/open/account`, { address: address || this.getAddress() })
        .then((res) => res.data)

      if (!isSuccess(response)) {
        throw new Error('Invalid address')
      }

      const account = response.data

      return account && (!asset || assetToString(asset) === assetToString(AssetDOT))
        ? [
            {
              asset: AssetDOT,
              amount: assetToBase(assetAmount(account.balance, getDecimal(this.network))),
            },
          ]
        : []
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactions = async (params?: TxHistoryParams): Promise<TxsPage> => {
    const address = params?.address ?? this.getAddress()
    const limit = params?.limit ?? 10
    const offset = params?.offset ?? 0

    try {
      const response: SubscanResponse<TransfersResult> = await axios
        .post(`${this.getClientUrl()}/api/scan/transfers`, {
          address: address,
          row: limit,
          page: offset,
        })
        .then((res) => res.data)

      if (!isSuccess(response) || !response.data) {
        throw new Error('Failed to get transactions')
      }

      const transferResult: TransfersResult = response.data

      return {
        total: transferResult.count,
        txs: (transferResult.transfers || []).map((transfer) => ({
          asset: AssetDOT,
          from: [
            {
              from: transfer.from,
              amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
            },
          ],
          to: [
            {
              to: transfer.to,
              amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
            },
          ],
          date: new Date(transfer.block_timestamp * 1000),
          type: 'transfer',
          hash: transfer.hash,
        })),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getTransactionData = async (txId: string): Promise<Tx> => {
    try {
      const response: SubscanResponse<Extrinsic> = await axios
        .post(`${this.getClientUrl()}/api/scan/extrinsic`, {
          hash: txId,
        })
        .then((res) => res.data)

      if (!isSuccess(response) || !response.data) {
        throw new Error('Failed to get transactions')
      }

      const extrinsic: Extrinsic = response.data
      const transfer: Transfer = extrinsic.transfer

      return {
        asset: AssetDOT,
        from: [
          {
            from: transfer.from,
            amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
          },
        ],
        to: [
          {
            to: transfer.to,
            amount: assetToBase(assetAmount(transfer.amount, getDecimal(this.network))),
          },
        ],
        date: new Date(extrinsic.block_timestamp * 1000),
        type: 'transfer',
        hash: extrinsic.extrinsic_hash,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  transfer = async (params: TxParams): Promise<TxHash> => {
    try {
      const api = await this.getAPI()
      let transaction = null

      // Createing a transfer
      const transfer = api.tx.balances.transfer(params.recipient, params.amount.amount().toString())
      if (!params.memo) {
        // Send a simple transfer
        transaction = transfer
      } else {
        // Send a `utility.batch` with two Calls: i) Balance.Transfer ii) System.Remark

        // Creating a remark
        const remark = api.tx.system.remark(params.memo)

        // Send the Batch Transaction
        transaction = api.tx.utility.batch([transfer, remark])
      }

      // Check balances
      const paymentInfo = await transaction.paymentInfo(this.getKeyringPair())
      const fee = baseAmount(paymentInfo.partialFee.toString(), getDecimal(this.network))
      const balances = await this.getBalance(this.getAddress(), AssetDOT)

      if (!balances || params.amount.amount().plus(fee.amount()).isGreaterThan(balances[0].amount.amount())) {
        throw new Error('insufficient balance')
      }

      const txHash = await transaction.signAndSend(this.getKeyringPair())
      return txHash.toString()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  estimateFees = async (params: TxParams): Promise<Fees> => {
    try {
      const api = await this.getAPI()
      const info = await api.tx.balances
        .transfer(params.recipient, params.amount.amount().toNumber())
        .paymentInfo(this.getKeyringPair())

      const fee = baseAmount(info.partialFee.toString(), getDecimal(this.network))

      return {
        type: 'byte',
        average: fee,
        fast: fee,
        fastest: fee,
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFees = async (): Promise<Fees> => {
    return await this.estimateFees({
      recipient: this.getAddress(),
      amount: baseAmount(0, getDecimal(this.network)),
    })
  }
}

export { Client }
