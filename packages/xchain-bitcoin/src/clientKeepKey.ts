import { KeepKeySdk, PairingInfo } from '@keepkey/keepkey-sdk'
import { FeeOption, FeeRate, Network, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'
import * as Bitcoin from 'bitcoinjs-lib'

import { Client } from './client'
import { BTCOutputScriptType, bip32ToAddressNList } from './utils'
/**
 *    KK rest api
    - view swagger docs at
      http://localhost:1646/docs

    - Docs: https://medium.com/@highlander_35968/building-on-the-keepkey-sdk-2023fda41f38
 */

type Config = {
  apiKey: string
  pairingInfo: PairingInfo
}

interface psbtTxOutput {
  address: string
  script: Buffer
  value: number
  change?: boolean // Optional, assuming it indicates if the output is a change
}

/**
 * Custom KeepKey Bitcoin client
 */
class ClientKeepKey extends Client {
  private config: Config
  private sdk: KeepKeySdk | null = null

  constructor(params: UtxoClientParams & { config: any }) {
    super(params)
    //this may need to get into a init? as its async
    this.config = params.config
  }
  /*
    Get the KeepKey BTC app instance
    @st0rmzy I would generally do init ONCE, then use this.sdk when it's time to use
    and I would make the class sdk param public as unlike software wallets we dont need to protect private keys in this class
    the entire app should be allowed to access this.sdk as wall as any apps using this class
   */
  public async getApp(): Promise<KeepKeySdk> {
    if (this.sdk) {
      return this.sdk
    }
    this.sdk = await KeepKeySdk.create(this.config)
    return this.sdk
  }

  // Get the current address synchronously
  //TODO we do this in swapkit, we init the app and get the address in getApp, can be a bit slow 400ish ms
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  // Get the current address asynchronously
  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const path = `m/${this.getFullDerivationPath(index)}`
    const coinType = this.network === Network.Mainnet ? 'Bitcoin' : 'Testnet'
    const addressInfo = {
      addressNList: bip32ToAddressNList(path),
      showDisplay: verify,
      scriptType: BTCOutputScriptType.PayToWitness, // p2wpkh for bech32 (native) segwit
      coin: coinType,
    }
    const app = await this.getApp()

    const address = await app.address.utxoGetAddress({
      address_n: addressInfo.addressNList,
      script_type: addressInfo.scriptType,
      coin: addressInfo.coin,
    })
    if (!address) {
      throw new Error('Failed to retrieve address from KeepKey')
    }
    return address.address
  }

  // Transfer BTC from KeepKey -- TODO finish this
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0

    // Set path
    const path = `m/${this.getFullDerivationPath(fromAddressIndex)}`
    // Get fee rate
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)
    // Prepare transaction
    const { rawUnsignedTx, utxos } = await this.prepareTx({ ...params, sender, feeRate })
    const psbt = Bitcoin.Psbt.fromBase64(rawUnsignedTx)
    // network
    const coinType = this.network === Network.Mainnet ? 'Bitcoin' : 'Testnet'
    /*

        // will need to format the inputs
        // ref: https://github.com/thorswap/SwapKit/blob/develop/packages/wallets/keepkey/src/chains/utxo.ts#L80

        here is a working sandbox. https://thorswap.github.io/SwapKit/

        swapkit uses blockchair api to get the utxos
        then it formats the inputs and outputs to how keepkey needs them

        In general we only need the raw hex of the tx and we do most the magic behind the REST api to format to pass over the wire.

        We do opReturn magic behind the API. DO NOT SEND OP_RETURN DATA IN an output yourself,
        we will handle building the custom output you, use opReturnData object and attach to vault output.
     */
    const memo = params.memo || ''

    // inputs
    const inputs = utxos.map(({ hash, txHex, index }) => ({
      addressNList: bip32ToAddressNList(path), // This is the path of the input address needed for signing
      scriptType: BTCOutputScriptType.PayToWitness,
      amount: params.amount.amount().toNumber(),
      vout: index,
      txid: hash,
      hex: txHex || '',
    }))

    // outputs
    const outputs = psbt.txOutputs
      .map((output) => {
        const { value, address, change } = output as psbtTxOutput
        const outputAddress = address

        if (change || address === sender) {
          return {
            addressNList: bip32ToAddressNList(path),
            isChange: true,
            addressType: 'change',
            amount: value,
            scriptType: BTCOutputScriptType.PayToWitness,
          }
        }
        if (outputAddress) {
          return { address: outputAddress, amount: value, addressType: 'spend' }
        }

        return null
      })
      .filter(Boolean)
    // sign tx // currently fails
    const signedTx = await app.utxo.utxoSignTransaction({
      coin: coinType,
      inputs,
      outputs,
      opReturnData: memo,
    })

    if (!signedTx) {
      throw new Error('Failed to sign transaction with KeepKey')
    }

    // Broadcast
    const txHash = await this.broadcastTx(signedTx.serializedTx.toString())
    if (!txHash) {
      throw new Error('Failed to broadcast transaction')
    }

    return txHash
  }
}

export { ClientKeepKey }
