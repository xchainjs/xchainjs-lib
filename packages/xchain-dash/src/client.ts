import {
  Address,
  Balance,
  Fee, FeeOption,
  FeeRate,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxsPage,
  TxType,
  UTXOClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import {getSeed} from '@xchainjs/xchain-crypto'
import {assetAmount, AssetDASH, assetToBase, baseAmount, Chain} from '@xchainjs/xchain-util'
import * as Dash from 'bitcoinjs-lib'
import * as insight from './insight-api'
import {InsightTxResponse} from './insight-api'
import * as Utils from './utils'
import axios from "axios";
import {checkFeeBounds} from "@xchainjs/xchain-client";
import * as nodeApi from "@xchainjs/xchain-dash/src/node-api";

export const DEFAULT_FEE_RATE = 1

export type NodeAuth = {
  username: string
  password: string
}

export type DashClientParams = XChainClientParams & {
  nodeUrl?: string
  nodeAuth?: NodeAuth | null
}

class Client extends UTXOClient {
  private readonly nodeUrl: string
  private readonly nodeAuth?: NodeAuth

  constructor({
    network = Network.Testnet,
    feeBounds = {
      lower: 1,
      upper: 500,
    },
    phrase,
    nodeUrl,
    nodeAuth = {
      username: 'thorchain',
      password: 'password',
    },
    rootDerivationPaths = {
      [Network.Mainnet]: `m/44'/5'/0'/0/`,
      [Network.Stagenet]: `m/44'/5'/0'/0/`,
      [Network.Testnet]: `m/44'/1'/0'/0/`,
    },
  }: DashClientParams) {
    super(Chain.Dash, {network, rootDerivationPaths, phrase, feeBounds})
    this.nodeUrl = nodeUrl ?? (() => {
      switch (network) {
        case Network.Mainnet:
        case Network.Stagenet:
          return 'https://dash.thorchain.info'
        case Network.Testnet:
          return 'https://testnet.dash.thorchain.info'
      }
    })()
    this.nodeAuth = nodeAuth === null ? undefined : nodeAuth
  }

  getExplorerUrl(): string {
    switch (this.network) {
      case Network.Mainnet:
      case Network.Stagenet:
        return 'https://insight.dash.org/insight'
      case Network.Testnet:
        return 'https://testnet-insight.dash.org/insight'
    }
  }

  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/address/${address}`
  }

  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/tx/${txID}`
  }

  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (!this.phrase) {
      throw new Error('Phrase must be provided')
    }

    const dashNetwork = Utils.dashNetwork(this.network)
    const dashKeys = this.getDashKeys(this.phrase, index)

    const {address} = Dash.payments.p2pkh({
      pubkey: dashKeys.publicKey,
      network: dashNetwork,
    })

    if (!address) {
      throw new Error('Address not defined')
    }

    return address
  }

  public getDashKeys(phrase: string, index = 0): Dash.ECPairInterface {
    const dashNetwork = Utils.dashNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Dash.bip32.fromSeed(seed, dashNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Dash.ECPair.fromPrivateKey(master.privateKey, {network: dashNetwork})
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  async getBalance(address: string): Promise<Balance[]> {
    const addressResponse = await insight.getAddress({network: this.network, address})
    const confirmed = baseAmount(addressResponse.balanceSat)
    const unconfirmed = baseAmount(addressResponse.unconfirmedBalanceSat)
    return [{
      asset: AssetDASH,
      amount: confirmed.plus(unconfirmed),
    }]
  }

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const offset = params?.offset ?? 0
    const limit = params?.limit || 10

    // Insight uses pages rather than offset/limit indexes, so we have to
    // iterate through each page within the offset/limit range.

    const perPage = 10
    const startPage = Math.floor(offset / perPage)
    const endPage = Math.floor((offset + limit - 1) / perPage)
    const firstPageOffset = offset % perPage
    const lastPageLimit = (firstPageOffset + (limit - 1)) % perPage

    let totalPages = -1
    let lastPageTotal = -1

    let insightTxs: InsightTxResponse[] = []

    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      const response = await insight.getAddressTxs({
        network: this.network,
        address: `${params?.address}`,
        pageNum,
      })
      let startIndex = 0
      let endIndex = perPage - 1
      if (pageNum == startPage) {
        startIndex = firstPageOffset
      }
      if (pageNum === endPage) {
        endIndex = lastPageLimit
      }
      insightTxs = [...insightTxs, ...response.txs.slice(startIndex, endIndex + 1)]

      // Insight only returns the number of pages not the total number of
      // transactions. If the last page is within the offset/limit range then we
      // can set the lastPageTotal here and avoid having to send another request,
      // otherwise we can fetch the last page later to determine the total
      // transaction count.

      totalPages = response.pagesTotal
      if (pageNum === totalPages - 1) {
        lastPageTotal = response.txs.length
      }
    }

    const txs: Tx[] = insightTxs.map(this.insightTxToXChainTx)

    if (lastPageTotal < 0) {
      const lastPageResponse = await insight.getAddressTxs({
        network: this.network,
        address: `${params?.address}`,
        pageNum: totalPages - 1,
      })
      lastPageTotal = lastPageResponse.txs.length
    }

    return {
      total: ((totalPages - 1) * perPage) + lastPageTotal,
      txs,
    }
  }

  async getTransactionData(txid: string): Promise<Tx> {
    const tx = await insight.getTx({network: this.network, txid})
    return this.insightTxToXChainTx(tx)
  }

  private insightTxToXChainTx(tx: InsightTxResponse): Tx {
    return {
      asset: AssetDASH,
      from: tx.vin.map((i) => ({
        from: i.addr,
        amount: assetToBase(assetAmount(i.value)),
      })),
      to: tx.vout
        .filter((i) => i.scriptPubKey.type !== 'nulldata')
        .map((i) => ({to: i.scriptPubKey.addresses?.[0], amount: assetToBase(assetAmount(i.value))})),
      date: new Date(tx.time * 1000),
      type: TxType.Transfer,
      hash: tx.txid,
    }
  }

  protected async getSuggestedFeeRate(): Promise<FeeRate> {
    try {
      const response = await axios.get('https://app.bitgo.com/api/v2/dash/tx/fee')
      return response.data.feePerKb / 1000 // feePerKb to feePerByte
    } catch (error) {
      return DEFAULT_FEE_RATE
    }
  }

  protected async calcFee(feeRate: FeeRate, memo?: string): Promise<Fee> {
    return Utils.calcFee(feeRate, memo)
  }

  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const fromAddressIndex = params?.walletIndex || 0
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Average]
    checkFeeBounds(this.feeBounds, feeRate)
    const {tx} = await Utils.buildTx({
      ...params,
      feeRate,
      sender: this.getAddress(fromAddressIndex),
      network: this.network,
    })
    const dashKeys = this.getDashKeys(this.phrase, fromAddressIndex)
    tx.sign(`${dashKeys?.privateKey?.toString('hex')}`)
    const txHex = tx.checkedSerialize({})
    return await nodeApi.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrl,
      auth: this.nodeAuth,
    })
  }
}

export {Client}
