import { DEFAULT_CONSENSUS_BRANCH_ID, buildMaxTx, buildTx, getFee, memoToScript } from '@xchainjs/zcash-js'
import {
  AssetInfo,
  FeeEstimateOptions,
  FeeRate,
  FeeRates,
  Fees,
  FeeType,
  FeesWithRates,
  Network,
} from '@xchainjs/xchain-client'
import { Address, baseAmount } from '@xchainjs/xchain-util'
import {
  Client as UTXOClient,
  PreparedTx,
  TxParams,
  UTXO,
  UtxoClientParams,
  UtxoError,
  UtxoTransactionValidator,
} from '@xchainjs/xchain-utxo'
import { NownodesProvider } from '@xchainjs/xchain-utxo-providers'

import {
  AssetZEC,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  ZECChain,
  ZEC_DECIMAL,
  zcashDataProviders,
  zcashExplorerProviders,
} from './const'
import * as Utils from './utils'

export const defaultZECParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: zcashExplorerProviders,
  dataProviders: zcashDataProviders,
  rootDerivationPaths: {
    [Network.Mainnet]: `m/44'/133'/0'/0/`,
    [Network.Testnet]: `m/44'/1'/0'/0/`,
    [Network.Stagenet]: `m/44'/133'/0'/0/`,
  },
  feeBounds: {
    lower: LOWER_FEE_BOUND,
    upper: UPPER_FEE_BOUND,
  },
}
/** Transparent P2PKH. Recipients may be Base58Check (`t1` / `tm`) or ZIP 320 (`tex1` / `textest1`); derived addresses stay Base58Check. */
abstract class Client extends UTXOClient {
  constructor(
    params: UtxoClientParams = {
      ...defaultZECParams,
    },
  ) {
    super(ZECChain, {
      network: params.network,
      rootDerivationPaths: params.rootDerivationPaths,
      phrase: params.phrase,
      feeBounds: params.feeBounds,
      explorerProviders: params.explorerProviders,
      dataProviders: params.dataProviders,
    })
  }

  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetZEC,
      decimal: ZEC_DECIMAL,
    }
    return assetInfo
  }

  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  protected compileMemo(memo: string): Buffer {
    return memoToScript(memo)
  }

  /**
   * v5 transactions commit to the active upgrade's branch ID. A stale value is rejected.
   * Uses the live id, else {@link DEFAULT_CONSENSUS_BRANCH_ID}.
   */
  protected async getConsensusBranchId(): Promise<number> {
    for (const provider of this.dataProviders) {
      try {
        const prov = provider[this.network]
        if (prov instanceof NownodesProvider) {
          const branchId = await prov.getConsensusBranchId()
          if (branchId) return branchId
        }
      } catch (error) {
        // Log only the message: the full axios error serializes request headers, including the api-key.
        console.warn(error instanceof Error ? error.message : error)
      }
    }
    return DEFAULT_CONSENSUS_BRANCH_ID
  }

  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, _data: Buffer | null = null): number {
    if (feeRate) {
      throw 'No feerate supported for this client'
    }
    return getFee(inputs.length, 2, _data ? 'memo' : undefined)
  }

  /**
   * @deprecated Use `prepareMaxTx` for sweep transactions. Zcash uses flat fees.
   */
  async prepareTx({
    sender,
    memo,
    amount,
    recipient,
    feeRate: _feeRate, // Ignored: Zcash uses flat fees
    spendPendingUTXO = true,
  }: TxParams & {
    sender: Address
    feeRate: FeeRate
    spendPendingUTXO?: boolean
  }): Promise<PreparedTx> {
    if (!this.validateAddress(recipient)) {
      throw new Error('Invalid recipient address')
    }

    const utxos = await this.scanUTXOs(sender, spendPendingUTXO)
    if (utxos.length === 0) {
      throw new Error('No UTXOs available for transaction')
    }

    const zcashUtxos = utxos.map((utxo) => ({
      address: sender,
      txid: utxo.hash,
      outputIndex: utxo.index,
      satoshis: utxo.value,
    }))

    const unsignedTx = await buildTx(
      0, // height - can be 0 for prepared tx
      sender,
      recipient,
      amount.amount().toNumber(),
      zcashUtxos,
      this.network === Network.Testnet ? false : true,
      memo,
    )

    // zcash-js has no standard raw unsigned format.
    const rawUnsignedTx = JSON.stringify({
      height: 0,
      from: sender,
      to: recipient,
      amount: amount.amount().toNumber(),
      utxos: zcashUtxos,
      isMainnet: this.network === Network.Testnet ? false : true,
      memo,
      fee: unsignedTx.fee,
    })

    return {
      rawUnsignedTx,
      utxos,
      inputs: utxos,
    }
  }

  async getFeesWithRates(): Promise<FeesWithRates> {
    throw Error('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFeeRates(): Promise<FeeRates> {
    throw Error('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFees(options?: FeeEstimateOptions): Promise<Fees> {
    let utxoNumber = 2 // By default pro rought estimation to display on interface
    if (options?.sender) {
      const utxo = await this.scanUTXOs(options?.sender, false)
      utxoNumber = utxo.length // Max possible fee for interface display
    }
    const flatFee = getFee(utxoNumber, 2, options?.memo)
    return {
      average: baseAmount(flatFee, ZEC_DECIMAL),
      fast: baseAmount(flatFee, ZEC_DECIMAL),
      fastest: baseAmount(flatFee, ZEC_DECIMAL),
      type: FeeType.FlatFee,
    }
  }

  /** Flat fee is deducted from the total; there is no change output. */
  async prepareMaxTx({
    sender,
    recipient,
    memo,
    spendPendingUTXO = true,
    selectedUtxos,
  }: {
    sender: Address
    recipient: Address
    memo?: string
    spendPendingUTXO?: boolean
    selectedUtxos?: UTXO[]
  }): Promise<PreparedTx & { maxAmount: number; fee: number }> {
    try {
      if (!this.validateAddress(recipient)) {
        throw UtxoError.invalidAddress(recipient, this.network)
      }
      if (!this.validateAddress(sender)) {
        throw UtxoError.invalidAddress(sender, this.network)
      }

      let utxos: UTXO[]
      if (selectedUtxos && selectedUtxos.length > 0) {
        UtxoTransactionValidator.validateUtxoSet(selectedUtxos)
        utxos = selectedUtxos
      } else {
        utxos = await this.scanUTXOs(sender, spendPendingUTXO)
      }
      if (utxos.length === 0) {
        throw UtxoError.insufficientBalance('1', '0', this.network)
      }

      const totalValue = utxos.reduce((sum, utxo) => sum + utxo.value, 0)

      const fee = getFee(utxos.length, 1, memo) // 1 = recipient only; getFee adds memo slots

      const maxAmount = totalValue - fee
      if (maxAmount <= 0) {
        throw UtxoError.insufficientBalance(String(fee), String(totalValue), this.network)
      }

      const zcashUtxos = utxos.map((utxo) => ({
        address: sender,
        txid: utxo.hash,
        outputIndex: utxo.index,
        satoshis: utxo.value,
      }))

      const maxTx = await buildMaxTx(0, sender, recipient, zcashUtxos, this.network !== Network.Testnet, memo)

      // zcash-js has no standard raw unsigned format.
      const rawUnsignedTx = JSON.stringify({
        height: 0,
        from: sender,
        to: recipient,
        amount: maxTx.maxAmount,
        utxos: zcashUtxos,
        isMainnet: this.network !== Network.Testnet,
        memo,
        fee: maxTx.fee,
        isMaxTx: true,
      })

      return {
        rawUnsignedTx,
        utxos,
        inputs: utxos,
        maxAmount: maxTx.maxAmount,
        fee: maxTx.fee,
      }
    } catch (error) {
      if (UtxoError.isUtxoError(error)) {
        throw error
      }
      throw UtxoError.fromUnknown(error, 'prepareMaxTx')
    }
  }
}

export { Client }
