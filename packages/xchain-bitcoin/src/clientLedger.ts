import AppBtc from '@ledgerhq/hw-app-btc'
import TransportNodeHid from '@ledgerhq/hw-transport-node-hid'
import { Address } from '@xchainjs/xchain-util'

import { ClientBtc } from './client'

/**
 * Custom Ledger Bitcoin client
 */
class ClientLedger extends ClientBtc {
  // NOT FINAL CODE ONLY POC PORPUSE.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private transport: any
  private app: AppBtc | undefined
  private address: string | undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(params: any) {
    super(params)
  }

  // NOT FINAL CODE ONLY POC PORPUSE.
  public async initialize() {
    this.transport = await TransportNodeHid.create()
    this.app = new AppBtc({ transport: this.transport })
    const result = await this.app.getWalletPublicKey(this.getFullDerivationPath(0), {
      format: 'bech32',
      verify: false,
    })
    this.address = result.bitcoinAddress
  }

  getAddress(): Address {
    return this.address as string
  }

  async transfer(): Promise<string> {
    // TODO: Implement transfer using prepareTx + Ledger App
    return ''
  }
}

export { ClientLedger }
