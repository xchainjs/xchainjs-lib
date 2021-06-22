import { BncClient } from '@binance-chain/javascript-sdk/lib/client'
import {
  Address,
  Fees,
  TxHash,
  ClientParams as BaseClientParams,
  MultiAssetClient,
  BoundClientFactory,
} from '@xchainjs/xchain-client'
import { Asset, BaseAmount } from '@xchainjs/xchain-util'

import { Delegate } from './delegate'

export type SingleAndMultiFees = {
  single: Fees
  multi: Fees
}

export type MultiSendParams = {
  walletIndex?: number
  transactions: Array<{
    to: Address
    coins: Array<{
      asset: Asset
      amount: BaseAmount
    }>
  }>
  memo?: string
}

export interface ClientParams extends BaseClientParams {
  clientUrl: string
  clientNetwork: 'mainnet' | 'testnet'
}

// eslint-disable-next-line prefer-const
let boundClientFactory: BoundClientFactory<Client>

export class Client extends MultiAssetClient<typeof Delegate.create> {
  static create(...args: Parameters<typeof boundClientFactory>): ReturnType<typeof boundClientFactory> {
    return boundClientFactory(...args)
  }

  getBncClient(walletIndex?: number): Promise<BncClient> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getBncClient', ...[walletIndex, Array.from(arguments).slice(1)])
  }

  multiSend(params: MultiSendParams): Promise<TxHash> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('multiSend', ...[params, Array.from(arguments).slice(1)])
  }
  getMultiSendFees(): Promise<Fees> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getMultiSendFees', ...[Array.from(arguments).slice(0)])
  }
  getSingleAndMultiFees(): Promise<SingleAndMultiFees> {
    // eslint-disable-next-line prefer-rest-params
    return this.useDelegateMethod('getSingleAndMultiFees', ...[Array.from(arguments).slice(0)])
  }
}

const mainnetDefaultParams: ClientParams = {
  getFullDerivationPath: (index: number) => `44'/118'/0'/0/${index}`,
  explorer: {
    url: 'https://explorer.binance.org',
    getAddressUrl(address: string) {
      return `${this.url}/address/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/tx/${txid}`
    },
  },
  clientNetwork: 'mainnet',
  clientUrl: 'https://dex.binance.org',
}

const testnetDefaultParams: ClientParams = {
  ...mainnetDefaultParams,
  getFullDerivationPath: (index: number) => `44'/118'/1'/0/${index}`,
  explorer: {
    ...mainnetDefaultParams.explorer,
    url: 'https://testnet-explorer.binance.org',
  },
  clientNetwork: 'testnet',
  clientUrl: 'https://testnet-dex.binance.org',
}

boundClientFactory = Client.bindDelegateFactory(Delegate.create, {
  mainnet: mainnetDefaultParams,
  testnet: testnetDefaultParams,
})
