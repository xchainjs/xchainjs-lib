import { AssetInfo, FeeEstimateOptions, FeeRate, FeeRates, FeesWithRates, FeeType, Network } from '@xchainjs/xchain-client'
import { Client as UTXOClient, PreparedTx, UTXO, UtxoClientParams } from '@xchainjs/xchain-utxo'

import {
  AssetZEC,
  ZECChain,
  ZEC_DECIMAL,
  NownodesProviders,
  LOWER_FEE_BOUND,
  UPPER_FEE_BOUND,
  zcashExplorerProviders,
} from './const'
import * as Utils from './utils'
import { getFee, memoToScript } from '@hippocampus-web3/zcash-wallet-js'
import { baseAmount } from '@xchainjs/xchain-util'

// Default parameters for the Zcash client
export const defaultZECParams: UtxoClientParams = {
  network: Network.Mainnet,
  phrase: '',
  explorerProviders: zcashExplorerProviders,
  dataProviders: [NownodesProviders],
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
/**
 * Custom Zcash client (only support t-addresses)
 */
abstract class Client extends UTXOClient {
  /**
   * Constructor
   * Initializes the client with network type and other parameters.
   * @param {UtxoClientParams} params
   */
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

  /**
   * Get ZEC asset info.
   * @returns {AssetInfo} ZEC asset information.
   */
  getAssetInfo(): AssetInfo {
    const assetInfo: AssetInfo = {
      asset: AssetZEC,
      decimal: ZEC_DECIMAL,
    }
    return assetInfo
  }

  /**
   * Validate the given Zcash address.
   * @param {string} address Zcash address to validate (only t-addresses).
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  validateAddress(address: string): boolean {
    return Utils.validateAddress(address, this.network)
  }

  /**
   * Compile memo into a buffer.
   * @param {string} memo Memo to compile.
   * @returns {Buffer} Compiled memo.
   */
    protected compileMemo(memo: string): Buffer {
      return memoToScript(memo)
    }
  
  /**
   * Get transaction fee from UTXOs.
   * @param {UTXO[]} inputs UTXOs to calculate fee from.
   * @param {FeeRate} feeRate Fee rate.
   * @param {Buffer | null} data Compiled memo (Optional).
   * @returns {number} Transaction fee.
   */
  protected getFeeFromUtxos(inputs: UTXO[], feeRate: FeeRate, _data: Buffer | null = null): number {
    if (feeRate) {
      throw ('No feerate supported for thsi clienet')
    }
    return getFee(inputs.length, !!_data)
  }

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address&FeeRate&boolean} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  async prepareTx(): Promise<PreparedTx> {
    throw Error ('Prepare unsiged TX not supported for Zcash. Request functionality if you need it.')
  }

  async getFeesWithRates(): Promise<FeesWithRates> {
    throw Error ('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFeeRates(): Promise<FeeRates> {
    throw Error ('Error Zcash has flat fee. Fee rates not supported')
  }

  async getFees(options?: FeeEstimateOptions) {
    let utxoNumber = 2 // By default pro rought estimation to display on interface
    if (options?.sender) {
      const utxo = await this.scanUTXOs(options?.sender, false)
      utxoNumber = utxo.length // Max possible fee for interface display
    }
    const flatFee = getFee(utxoNumber, !!options?.memo)
    return {
      average: baseAmount(flatFee, ZEC_DECIMAL),
      fast: baseAmount(flatFee, ZEC_DECIMAL),
      fastest: baseAmount(flatFee, ZEC_DECIMAL),
      type: FeeType.FlatFee
    } 
  }
}

export { Client }


