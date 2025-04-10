import { TxHash } from '@xchainjs/xchain-client'
import { Address } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'

import { Client } from './client'

class ClientLedger extends Client {

  constructor(params: UtxoClientParams) {
    super(params)
    throw Error('Ledger client not supported for Zcash.')
  }

  public async getApp(): Promise<any> {
    throw Error('Not implemented.')
  }

  getAddress(): string {
    throw Error('Not implemented.')
  }

  async getAddressAsync(): Promise<Address> {
    throw Error('Not implemented.')
  }

  async transfer(): Promise<TxHash> {
    throw Error('Not implemented.')
  }
}

export { ClientLedger }
