/*
    KK rest api
    - view swagger docs at
      http://localhost:1646/docs

    - Docs: https://medium.com/@highlander_35968/building-on-the-keepkey-sdk-2023fda41f38

*/
import { KeepKeySdk, PairingInfo } from '@keepkey/keepkey-sdk'
import { FeeOption, FeeRate, TxHash, TxParams } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'
import { Client, defaultBTCParams } from './client'
import { bip32ToAddressNList, BTCOutputScriptType } from './utils'

type Config = {
  apiKey: string
  pairingInfo: PairingInfo
}



/**
 * Custom Ledger Bitcoin client
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
    const path = `${defaultBTCParams.rootDerivationPaths}${index}`
    const addressInfo = {
      addressNList: bip32ToAddressNList(path),
      showDisplay: verify,
      scriptType: BTCOutputScriptType.Bech32, // p2wpkh for bech32 (native) segwit
      coin: 'Bitcoin',
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
    return address
  }

  // Transfer BTC from KeepKey
  async transfer(params: TxParams & { feeRate?: FeeRate }): Promise<TxHash> {
    const app = await this.getApp()
    const fromAddressIndex = params?.walletIndex || 0
    // Get fee rate
    const feeRate = params.feeRate || (await this.getFeeRates())[FeeOption.Fast]
    // Get sender address
    const sender = await this.getAddressAsync(fromAddressIndex)
    // Prepare transaction
    const { rawUnsignedTx, utxos } = await this.prepareTx({ ...params, sender, feeRate })

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
    const txid = "b3002cd9c033f4f3c2ee5a374673d7698b13c7f3525c1ae49a00d2e28e8678ea";
    const hex =
      "010000000181f605ead676d8182975c16e7191c21d833972dd0ed50583ce4628254d28b6a3010000008a47304402207f3220930276204c83b1740bae1da18e5a3fa2acad34944ecdc3b361b419e3520220598381bdf8273126e11460a8c720afdbb679233123d2d4e94561f75e9b280ce30141045da61d81456b6d787d576dce817a2d61d7f8cb4623ee669cbe711b0bcff327a3797e3da53a2b4e3e210535076c087c8fb98aef60e42dfeea8388435fc99dca43ffffffff0250ec0e00000000001976a914f7b9e0239571434f0ccfdba6f772a6d23f2cfb1388ac10270000000000001976a9149c9d21f47382762df3ad81391ee0964b28dd951788ac00000000";

    const inputs = [
      {
        addressNList: [0x80000000 + 44, 0x80000000 + 0, 0x80000000 + 0, 0, 0], //This is the path of the input address needed for signing
        scriptType: '',
        amount: String(10000),
        vout: 1,
        txid: txid,
        hex,
      },
    ];

    const outputs = [
      {
        address: "bc1q6m9u2qsu8mh8y7v8rr2ywavtj8g5arzlyhcej7",
        addressType: 'spend', // spend/change  change will be verified by the keepkey the device owns the address
        opReturnData: Buffer.from(memo, "utf-8"),
        amount: String(0),
        isChange: false,
      },
    ];

    // Create the BTCSignTxKK message
    let signPayload = {
      coin: 'Bitcoin',
      inputs,
      outputs,
      version: 1,
      locktime: 0,
      opReturnData: memo,
    };
    //console.log('signPayload: ', JSON.stringify(signPayload));
    const signedTx = await app.utxo.utxoSignTransaction(signPayload);
    if (!signedTx) {
      throw new Error('Failed to sign transaction with KeepKey')
    }
    // Broadcast
    const txHash = await this.broadcastTx(signedTx.serializedTx)
    if (!txHash) {
      throw new Error('Failed to broadcast transaction')
    }

    return txHash
  }
}

export { ClientKeepKey }
