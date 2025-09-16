import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'

import { TronTransaction, TronSignedTransaction, TRONClientParams } from './types'
import { Client, defaultTRONParams } from './client'

export class ClientKeystore extends Client {
  constructor(params: TRONClientParams = defaultTRONParams) {
    const clientParams = { ...defaultTRONParams, ...params }

    super(clientParams)
  }

  public getSigner(walletIndex = 0) {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = mnemonicToSeedSync(this.phrase)
    const hdKey = HDKey.fromMasterSeed(seed)
    const derived = hdKey.derive(this.getFullDerivationPath(walletIndex))

    if (!derived.privateKey) {
      throw new Error('No Tron Signer')
    }

    const privateKeyHex = Buffer.from(derived.privateKey).toString('hex')

    this.tronWeb.setPrivateKey(privateKeyHex)

    const address = this.tronWeb?.address.fromPrivateKey(privateKeyHex)

    return {
      getAddress: () => (typeof address === 'string' ? address : ''),
      signTransaction: async (transaction: TronTransaction) => {
        const signedTx = await this.tronWeb.trx.sign(transaction, privateKeyHex)
        return signedTx
      },
    }
  }
  /**
   * Get the current address synchronously.
   */
  public getAddress(walletIndex = 0): string {
    return this.getSigner(walletIndex).getAddress()
  }

  /**
   * Get the current address asynchronously.
   *
   * @param {number} index The index of the address. Default 0
   * @returns {Address} The TRON address related to the index provided.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  public async getAddressAsync(walletIndex = 0): Promise<string> {
    return this.getAddress(walletIndex)
  }

  public async signTransaction(transaction: TronTransaction, walletIndex = 0): Promise<TronSignedTransaction> {
    return this.getSigner(walletIndex).signTransaction(transaction)
  }
}
