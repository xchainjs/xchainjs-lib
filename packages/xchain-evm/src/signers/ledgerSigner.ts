import AppEth, { ledgerService } from '@ledgerhq/hw-app-eth'
import Transport from '@ledgerhq/hw-transport'
import { Address } from '@xchainjs/xchain-util'

import { SignApproveParams, SignTransferParams } from '../types'

import { Signer, SignerParams } from './signer'

export type LedgerSignerParams = SignerParams & { transport: Transport }

export class LedgerSigner extends Signer {
  private app: AppEth

  constructor(params: LedgerSignerParams) {
    super(params)
    this.app = new AppEth(params.transport)
  }

  public getApp(): AppEth {
    return this.app
  }

  public purge() {}

  /** `verify` checks the address on the Ledger device. */
  public async getAddressAsync(index = 0, verify = false): Promise<Address> {
    if (index < 0) throw new Error('Index must be greater than or equal to zero')
    const app = this.getApp()
    const result = await app.getAddress(this.getFullDerivationPath(index), verify)
    return result.address
  }

  public async signTransfer({ walletIndex, tx }: SignTransferParams): Promise<string> {
    // const unsignedTx = ethers.utils.serializeTransaction(tx).substring(2)
    const unsignedTx = tx.unsignedSerialized.substring(2)
    const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, { externalPlugins: true, erc20: true })

    const ethApp = this.getApp()

    const signatureData = await ethApp.signTransaction(this.getFullDerivationPath(walletIndex), unsignedTx, resolution)

    tx.signature = {
      v: Number(BigInt(signatureData.v)),
      r: `0x${signatureData.r}`,
      s: `0x${signatureData.s}`,
    }

    const rawSignedTx = tx.serialized
    return rawSignedTx
  }

  public async signApprove({ walletIndex, tx }: SignApproveParams): Promise<string> {
    const unsignedTx = tx.unsignedSerialized.substring(2)

    const resolution = await ledgerService.resolveTransaction(unsignedTx, {}, { externalPlugins: true, erc20: true })

    const ethApp = this.getApp()
    const signatureData = await ethApp.signTransaction(this.getFullDerivationPath(walletIndex), unsignedTx, resolution)

    tx.signature = {
      v: Number(BigInt(signatureData.v)),
      r: `0x${signatureData.r}`,
      s: `0x${signatureData.s}`,
    }

    const rawSignedTx = tx.serialized
    return rawSignedTx
  }
}
