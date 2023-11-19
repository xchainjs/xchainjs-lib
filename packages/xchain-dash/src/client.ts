import * as dashcore from '@dashevo/dashcore-lib'
import { Transaction } from '@dashevo/dashcore-lib/typings/transaction/Transaction'
import {
  AssetInfo,
  Balance,
  FeeOption,
  FeeRate,
  Network,
  Tx,
  TxHash,
  TxHistoryParams,
  TxParams,
  TxType,
  TxsPage,
  UTXO,
  UTXOClient,
  UtxoClientParams,
  checkFeeBounds,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import * as nodeApi from '@xchainjs/xchain-dash/src/node-api'
import { Address, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import * as Dash from 'bitcoinjs-lib'

import {
  AssetDASH,
  BitgoProviders,
  BlockcypherDataProviders,
  DASHChain,
  DASH_DECIMAL,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  explorerProviders,
} from './const'
import * as insight from './insight-api'
import { InsightTxResponse } from './insight-api'
import { DashPreparedTx } from './types'
import * as Utils from './utils'

export type NodeAuth = {
  username: string
  password: string
}

export type NodeUrls = Record<Network, string>

export const defaultDashParams: UtxoClientParams & {
  nodeUrls: NodeUrls
  nodeAuth?: NodeAuth
} = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: explorerProviders,
  dataProviders: [BitgoProviders, BlockcypherDataProviders],
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/5'/0'/0/`,
    [Network.Stagenet]: `m/44'/5'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
  nodeUrls: {
    [Network.Mainnet]: 'https://insight.dash.org/insight-api',
    [Network.Stagenet]: 'https://insight.dash.org/insight-api',
    [Network.Testnet]: 'http://insight.testnet.networks.dash.org:3001/insight-api',
  },
}

class Client extends UTXOClient {
  private readonly nodeUrls: NodeUrls
  private readonly nodeAuth?: NodeAuth

  constructor(params = defaultDashParams) {
    super(DASHChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
    this.nodeUrls = params.nodeUrls
    this.nodeAuth = params.nodeAuth
  }

  /**
   * @deprecated this function eventually will be removed use getAddressAsync instead
   */
  getAddress(index = 0): Address {
    if (index < 0) {
      throw new Error('index must be greater than zero')
    }
    if (!this.phrase) {
      throw new Error('Phrase must be provided')
    }

    const dashNetwork = Utils.dashNetwork(this.network)
    const dashKeys = this.getDashKeys(this.phrase, index)

    const { address } = Dash.payments.p2pkh({
      pubkey: dashKeys.publicKey,
      network: dashNetwork,
    })

    if (!address) {
      throw new Error('Address not defined')
    }

    return address
  }

  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   *
   * @returns BTC asset info
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetDASH,
      decimal: DASH_DECIMAL,
    }
    return assetInfo
  }

  public getDashKeys(phrase: string, index = 0): Dash.ECPairInterface {
    const dashNetwork = Utils.dashNetwork(this.network)

    const seed = getSeed(phrase)
    const master = Dash.bip32.fromSeed(seed, dashNetwork).derivePath(this.getFullDerivationPath(index))

    if (!master.privateKey) {
      throw new Error('Could not get private key from phrase')
    }

    return Dash.ECPair.fromPrivateKey(master.privateKey, { network: dashNetwork })
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  async getBalance(address: string): Promise<Balance[]> {
    const addressResponse = await insight.getAddress({ network: this.network, address })
    const confirmed = baseAmount(addressResponse.balanceSat)
    const unconfirmed = baseAmount(addressResponse.unconfirmedBalanceSat)
    return [
      {
        asset: AssetDASH,
        amount: confirmed.plus(unconfirmed),
      },
    ]
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
      total: (totalPages - 1) * perPage + lastPageTotal,
      txs,
    }
  }

  async getTransactionData(txid: string): Promise<Tx> {
    const tx = await insight.getTx({ network: this.network, txid })
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
        .map((i) => ({ to: i.scriptPubKey.addresses?.[0], amount: assetToBase(assetAmount(i.value)) })),
      date: new Date(tx.time * 1000),
      type: TxType.Transfer,
      hash: tx.txid,
    }
  }

  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Average]
    checkFeeBounds(this.feeBounds, feeRate)

    const fromAddressIndex = params.walletIndex || 0
    const { rawUnsignedTx, utxos } = await this.prepareTx({
      ...params,
      feeRate,
      sender: await this.getAddressAsync(fromAddressIndex),
    })

    const tx: Transaction = new dashcore.Transaction(rawUnsignedTx)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.inputs.forEach((input: any, index: number) => {
      const insightUtxo = utxos.find((utxo) => {
        return utxo.hash === input.prevTxId.toString('hex') && utxo.index == input.outputIndex
      })
      if (!insightUtxo) {
        throw new Error('Unable to match accumulative inputs with insight utxos')
      }
      const scriptBuffer: Buffer = Buffer.from(insightUtxo.scriptPubKey || '', 'hex')
      const script = new dashcore.Script(scriptBuffer)
      tx.inputs[index] = new dashcore.Transaction.Input.PublicKeyHash({
        prevTxId: Buffer.from(insightUtxo.hash, 'hex'),
        outputIndex: insightUtxo.index,
        script: '',
        output: new dashcore.Transaction.Output({
          satoshis: insightUtxo.value,
          script,
        }),
      })
    })

    const dashKeys = this.getDashKeys(this.phrase, fromAddressIndex)

    tx.sign(`${dashKeys.privateKey?.toString('hex')}`)

    const txHex = tx.checkedSerialize({})
    return await nodeApi.broadcastTx({
      txHex,
      nodeUrl: this.nodeUrls[this.network],
      auth: this.nodeAuth,
    })
  }
  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address&FeeRate} params The transfer options.
   * @returns {string} The raw unsigned transaction.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
  }): Promise<DashPreparedTx> {
    const { tx, utxos } = await Utils.buildTx({
      sender,
      recipient,
      memo,
      amount,
      feeRate,
      network: this.network,
    })

    return { rawUnsignedTx: tx.toString(), utxos }
  }
  /**
   * Compile memo.
   *
   * @param {string} memo The memo to be compiled.
   * @returns {Buffer} The compiled memo.
   */
  protected compileMemo(memo: string): Buffer {
    return dashcore.Script.buildDataOut(memo)
  }

  /**
   * Get the transaction fee.
   *
   * @param {UTXO[]} inputs The UTXOs.
   * @param {FeeRate} feeRate The fee rate.
   * @param {Buffer} data The compiled memo (Optional).
   * @returns {number} The fee amount.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, data: Buffer | null = null): number {
    let sum =
      Utils.TransactionBytes.Version +
      Utils.TransactionBytes.Type +
      Utils.TransactionBytes.InputCount +
      inputs.length *
        (Utils.TransactionBytes.InputPrevOutputHash +
          Utils.TransactionBytes.InputPrevOutputIndex +
          Utils.TransactionBytes.InputScriptLength +
          Utils.TransactionBytes.InputPubkeyHash +
          Utils.TransactionBytes.InputSequence) +
      Utils.TransactionBytes.OutputCount +
      2 *
        (Utils.TransactionBytes.OutputValue +
          Utils.TransactionBytes.OutputScriptLength +
          Utils.TransactionBytes.OutputPubkeyHash) +
      Utils.TransactionBytes.LockTime
    if (data) {
      sum +=
        Utils.TransactionBytes.OutputValue +
        Utils.TransactionBytes.OutputScriptLength +
        Utils.TransactionBytes.OutputOpReturn +
        data.length
    }
    const fee = sum * feeRate
    return fee > Utils.TX_MIN_FEE ? fee : Utils.TX_MIN_FEE
  }
}

export { Client }
