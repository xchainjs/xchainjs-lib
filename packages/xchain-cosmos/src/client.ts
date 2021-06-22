import {
  Address,
  Balance,
  Client as BaseClient,
  ClientParams as BaseClientParams,
  FeeType,
  Fees,
  MultiAssetClient,
  Network,
  Tx,
  TxHistoryParams,
  TxsPage,
  Wallet as BaseWallet,
} from '@xchainjs/xchain-client'
import { Asset, assetToString, baseAmount } from '@xchainjs/xchain-util'

import { CosmosSDKClient } from './cosmos'
import { AssetAtom, AssetMuon } from './types'
import { DECIMAL, getAsset, getTxsFromHistory, registerCodecsOnce } from './util'

export interface ClientParams extends BaseClientParams {
  mainAsset: Asset
  sdkServer: string
  sdkChainId: string
}

export const MAINNET_PARAMS: ClientParams = {
  network: Network.Mainnet,
  getFullDerivationPath: (index: number) => `44'/118'/0'/0/${index}`,
  explorer: {
    url: 'https://cosmos.bigdipper.live',
    getAddressUrl(address: string) {
      return `${this.url}/account/${address}`
    },
    getTxUrl(txid: string) {
      return `${this.url}/transactions/${txid}`
    },
  },
  mainAsset: AssetAtom,
  sdkServer: 'https://api.cosmos.network',
  sdkChainId: 'cosmoshub-3',
}

export const TESTNET_PARAMS: ClientParams = {
  ...MAINNET_PARAMS,
  network: Network.Testnet,
  getFullDerivationPath: (index: number) => `44'/118'/1'/0/${index}`,
  explorer: {
    ...MAINNET_PARAMS.explorer,
    url: 'https://gaia.bigdipper.live',
  },
  mainAsset: AssetMuon,
  sdkServer: 'http://lcd.gaia.bigdipper.live:1317',
  sdkChainId: 'gaia-3a',
}

export class Client extends BaseClient<ClientParams, BaseWallet> implements MultiAssetClient<ClientParams, BaseWallet> {
  readonly sdkClient: CosmosSDKClient

  protected constructor(params: ClientParams) {
    super(params)
    this.sdkClient = new CosmosSDKClient({
      server: this.params.sdkServer,
      chainId: this.params.sdkChainId,
    })
  }

  protected async init() {
    await super.init()
    await registerCodecsOnce()
  }

  static readonly create = Client.bindFactory((x: ClientParams) => new Client(x))

  async validateAddress(address: Address): Promise<boolean> {
    return this.sdkClient.checkAddress(address)
  }

  async getBalance(address: Address, assets?: Asset[]): Promise<Balance[]> {
    const balances = await this.sdkClient.getBalance(address)

    return balances
      .map((balance) => {
        return {
          asset: (balance.denom && getAsset(balance.denom)) || this.params.mainAsset,
          amount: baseAmount(balance.amount, DECIMAL),
        }
      })
      .filter(
        (balance) => !assets || assets.filter((asset) => assetToString(balance.asset) === assetToString(asset)).length,
      )
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const messageAction = undefined
    const page = (params && params.offset) || undefined
    const limit = (params && params.limit) || undefined
    const txMinHeight = undefined
    const txMaxHeight = undefined

    const txHistory = await this.sdkClient.searchTx({
      messageAction,
      messageSender: params.address,
      page,
      limit,
      txMinHeight,
      txMaxHeight,
    })

    return {
      total: parseInt(txHistory.total_count?.toString() || '0'),
      txs: getTxsFromHistory(txHistory.txs ?? [], this.params.mainAsset),
    }
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const txResult = await this.sdkClient.txsHashGet(txId)
    const txs = getTxsFromHistory([txResult], this.params.mainAsset)

    if (txs.length <= 0) throw new Error('transaction not found')
    return txs[0]
  }

  async getFees(): Promise<Fees> {
    return {
      type: FeeType.FlatFee,
      fast: baseAmount(750, DECIMAL),
      fastest: baseAmount(2500, DECIMAL),
      average: baseAmount(0, DECIMAL),
    }
  }
}
