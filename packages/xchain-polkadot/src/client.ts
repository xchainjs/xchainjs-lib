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
import { Asset, assetAmount, assetToString, assetToBase, baseAmount } from '@xchainjs/xchain-util/lib'
import * as xchainCrypto from '@xchainjs/xchain-crypto'

import Keyring from '@polkadot/keyring'
import { KeyringPair } from '@polkadot/keyring/types'
import { RuntimeDispatchInfo } from '@polkadot/types/interfaces'
import HttpProvider from '@polkadot/rpc-provider/http'
import * as txWrapper from '@substrate/txwrapper'
import { EXTRINSIC_VERSION } from '@substrate/txwrapper/lib/util/constants'

import { SubscanResponse, Account, AssetDOT, TransfersResult, Extrinsic, Transfer } from './types'
import { isSuccess } from './util'

const {
  POLKADOT_SS58_FORMAT,
  WESTEND_SS58_FORMAT,
  methods,
  createSigningPayload,
  createSignedTx,
  getRegistry,
} = txWrapper

const DECIMAL = 10

/**
 * Interface for custom Polkadot client
 */
export interface PolkadotClient {
  getSS58Format(): number
  getChainName(): 'Polkadot' | 'Westend'
  getSpecName(): 'polkadot' | 'westend'

  estimateFees(params: TxParams): Promise<Fees>
}

class Client implements PolkadotClient, XChainClient {
  private network: Network
  private phrase = ''
  private address: Address = ''
  private provider: HttpProvider

  constructor({ network = 'testnet', phrase }: XChainClientParams) {
    this.network = network

    this.provider = new HttpProvider(this.getRPCEndpoint())

    if (phrase) this.setPhrase(phrase)
  }

  purgeClient(): void {
    this.phrase = ''
    this.address = ''
  }

  setNetwork(network: Network): XChainClient {
    this.network = network
    this.address = ''

    this.provider = new HttpProvider(this.getRPCEndpoint())

    return this
  }

  getNetwork(): Network {
    return this.network
  }

  getClientUrl = (): string => {
    return this.network === 'testnet' ? 'https://westend.subscan.io' : 'https://polkadot.subscan.io'
  }

  getRPCEndpoint = (): string => {
    return this.network === 'testnet' ? 'https://westend-rpc.polkadot.io' : 'https://rpc.polkadot.io'
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
    return this.network === 'testnet' ? WESTEND_SS58_FORMAT : POLKADOT_SS58_FORMAT
  }

  getChainName = (): 'Polkadot' | 'Westend' => {
    return this.network === 'testnet' ? 'Westend' : 'Polkadot'
  }

  getSpecName = (): 'polkadot' | 'westend' => {
    return this.network === 'testnet' ? 'westend' : 'polkadot'
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

    return key.createFromUri(this.phrase)
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
              amount: assetToBase(assetAmount(account.balance, DECIMAL)),
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
              amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
            },
          ],
          to: [
            {
              to: transfer.to,
              amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
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
            amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
          },
        ],
        to: [
          {
            to: transfer.to,
            amount: assetToBase(assetAmount(transfer.amount, DECIMAL)),
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

  private getTxBytes = async (params: TxParams): Promise<string> => {
    try {
      const { block } = await this.provider.send('chain_getBlock', [])
      const blockHash = await this.provider.send('chain_getBlockHash', [])
      const genesisHash = await this.provider.send('chain_getBlockHash', [0])
      const metadataRpc = await this.provider.send('state_getMetadata', [])
      const { specVersion, transactionVersion } = await this.provider.send('state_getRuntimeVersion', [])

      // Get Account nonce.
      const nonce = await this.provider.send('account_nextIndex', [this.getAddress()])

      // Create Polkadot's type registry.
      const registry = getRegistry(this.getChainName(), this.getSpecName(), specVersion, metadataRpc)

      // Now we can create our `balances.transfer` unsigned tx. The following
      // function takes the above data as arguments, so can be performed offline
      // if desired.
      const unsigned = methods.balances.transfer(
        {
          value: params.amount.amount().toNumber(),
          dest: params.recipient,
        },
        {
          address: this.getAddress(),
          blockHash,
          blockNumber: registry.createType('BlockNumber', block.header.number).toNumber(),
          eraPeriod: 64,
          genesisHash,
          metadataRpc,
          nonce,
          specVersion,
          tip: 0,
          transactionVersion,
        },
        {
          metadataRpc,
          registry,
        },
      )

      // Construct the signing payload from an unsigned transaction.
      const signingPayload = createSigningPayload(unsigned, { registry })

      // Sign a payload. This operation should be performed on an offline device.
      const { signature } = registry
        .createType('ExtrinsicPayload', signingPayload, {
          version: EXTRINSIC_VERSION,
        })
        .sign(this.getKeyringPair())

      // Serialize a signed transaction.
      const tx = createSignedTx(unsigned, signature, { metadataRpc, registry })
      return tx
    } catch (error) {
      return Promise.reject(error)
    }
  }

  deposit = async (params: TxParams): Promise<TxHash> => {
    return this.transfer(params)
  }

  transfer = async (params: TxParams): Promise<TxHash> => {
    try {
      const tx = await this.getTxBytes(params)

      // Send the tx to the node. Again, since `txwrapper` is offline-only, this
      // operation should be handled externally. Here, we just send a JSONRPC
      // request directly to the node.
      const txHash = await this.provider.send('author_submitExtrinsic', [tx])

      return txHash
    } catch (error) {
      return Promise.reject(error)
    }
  }

  estimateFees = async (params: TxParams): Promise<Fees> => {
    try {
      const tx = await this.getTxBytes(params)

      const hash = await this.provider.send('chain_getFinalizedHead', [])
      const paymentInfo: RuntimeDispatchInfo = await this.provider.send('payment_queryInfo', [tx, hash])

      return {
        type: 'byte',
        average: baseAmount(paymentInfo.partialFee.toString(), DECIMAL),
        fast: baseAmount(paymentInfo.partialFee.toString(), DECIMAL),
        fastest: baseAmount(paymentInfo.partialFee.toString(), DECIMAL),
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getFees = async (): Promise<Fees> => {
    return await this.estimateFees({
      recipient: this.getAddress(),
      amount: baseAmount(0, DECIMAL),
    })
  }
}

export { Client }
