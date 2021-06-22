import { Asset } from '@xchainjs/xchain-util'

import { Client, ClientParams, Wallet } from './client'
import { Address, Balance } from './types'

export interface MultiAssetClient<ClientParamsType extends ClientParams, WalletType extends Wallet>
  extends Client<ClientParamsType, WalletType> {
  getBalance(address: Address, assets?: Asset[]): Promise<Balance[]>
}
