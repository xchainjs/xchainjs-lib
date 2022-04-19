import {
  AccAddress,
  Coin,
  Coins,
  CreateTxOptions,
  Fee,
  LCDClient,
  MnemonicKey,
  MsgMultiSend,
  MsgSend,
  TxInfo,
} from '@terra-money/terra.js'
import { BaseXChainClient, FeeType, Network, TxHash, TxType, singleFee } from '@xchainjs/xchain-client'
import type {
  Balance,
  Fees,
  Tx,
  TxFrom,
  TxHistoryParams,
  TxParams,
  TxTo,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, Chain, assetToString, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

import { AssetLUNA, TERRA_DECIMAL } from './const'
import { EstimatedFee } from './types'
import type { ClientConfig, ClientParams, FeeParams } from './types/client'
import {
  getDefaultClientConfig,
  getDefaultRootDerivationPaths,
  getEstimatedFee,
  getTerraNativeAsset,
  getTerraNativeDenom,
} from './util'

/**
 * Interface for Terra client
 */
export interface TerraClient {
  // `getFees` of `BaseXChainClient` needs to be overridden
  getFees(params: FeeParams): Promise<Fees>
  getEstimatedFee(params: FeeParams): Promise<EstimatedFee>
}

/**
 * Terra Client
 */
class Client extends BaseXChainClient implements XChainClient, TerraClient {
  private lcdClient: LCDClient
  private config: Record<Network, ClientConfig>
  constructor({
    network = Network.Testnet,
    phrase,
    rootDerivationPaths = getDefaultRootDerivationPaths(),
    explorerURL,
    explorerAddressURL,
    explorerTxURL,
    cosmosAPIURL,
    chainID,
  }: XChainClientParams & ClientParams) {
    super(Chain.Terra, { network, rootDerivationPaths, phrase })
    const defaultClientConfigs = getDefaultClientConfig()
    const defaultClientConfig = defaultClientConfigs[network]
    this.config = {
      ...defaultClientConfigs,
      // override default config of given network with given values
      [network]: {
        ...defaultClientConfig,
        explorerURL: explorerURL || defaultClientConfig.explorerURL,
        explorerAddressURL: explorerAddressURL || defaultClientConfig.explorerAddressURL,
        explorerTxURL: explorerTxURL || defaultClientConfig.explorerTxURL,
        cosmosAPIURL: cosmosAPIURL || defaultClientConfig.cosmosAPIURL,
        chainID: chainID || defaultClientConfig.chainID,
      },
    }

    this.lcdClient = new LCDClient({
      URL: defaultClientConfig.cosmosAPIURL,
      chainID: defaultClientConfig.chainID,
    })
  }

  /**
   * Get estimated fee.
   *
   * @param {Asset} feeAsset Asset to pay fees
   * @param {CreateTxOptions} options Options to create a simulated tx to estimate fees
   * @returns {EstimatedFee} Estimated fee
   */
  async getEstimatedFee(params: FeeParams): Promise<EstimatedFee> {
    if (!params) throw new Error('Params need to be passed')

    const { feeAsset, sender, recipient, asset, amount, memo } = params

    const config = this.config[this.network]
    return await getEstimatedFee({
      chainId: config.chainID,
      cosmosAPIURL: config.cosmosAPIURL,
      sender,
      recipient,
      amount,
      asset,
      feeAsset,
      memo,
      network: this.network,
    })
  }

  /**
   * Get fees.
   *
   * @param {FeeParams} Fee params (required - they are defined as optional function parameters to fit XChainClient interface only
   * @returns {Fees} The average/fast/fastest fees.
   */
  async getFees(params?: FeeParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')
    const { amount: feeAmount } = await this.getEstimatedFee(params)
    return singleFee(FeeType.PerByte, feeAmount)
  }

  getAddress(walletIndex = 0): string {
    const mnemonicKey = new MnemonicKey({ mnemonic: this.phrase, index: walletIndex })
    return mnemonicKey.accAddress
  }
  getExplorerUrl(): string {
    return this.config[this.network].explorerURL
  }
  getExplorerAddressUrl(address: string): string {
    return this.config[this.network].explorerAddressURL + address?.toLowerCase()
  }
  getExplorerTxUrl(txID: string): string {
    return this.config[this.network].explorerTxURL + txID?.toLowerCase()
  }
  validateAddress(address: string): boolean {
    return AccAddress.validate(address)
  }
  async getBalance(address: string, assets?: Asset[]): Promise<Balance[]> {
    let balances: Balance[] = []
    let [coins, pagination] = await this.lcdClient.bank.balance(address)
    balances = balances.concat(this.coinsToBalances(coins))
    while (pagination.next_key) {
      ;[coins, pagination] = await this.lcdClient.bank.balance(address, { 'pagination.offset': pagination.next_key })
      balances = balances.concat(this.coinsToBalances(coins))
    }

    if (assets) {
      //filter out only the assets the user wants to see
      return balances.filter((bal: Balance) => {
        const exists = assets.find((asset) => asset.symbol === bal.asset.symbol)
        return exists !== undefined
      })
    } else {
      return balances
    }
  }

  setNetwork(network: Network): void {
    super.setNetwork(network)
    this.lcdClient = new LCDClient({
      URL: this.config[this.network].cosmosAPIURL,
      chainID: this.config[this.network].chainID,
    })
  }

  getConfig = (): ClientConfig => this.config[this.network]

  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    //TODO filter by start time?
    //TODO filter by asset
    const address = params?.address || this.getAddress()
    const offset = params?.offset ? `${params?.offset}` : '0'
    const limit = params?.limit ? `${params?.limit}` : '100'
    const results = (
      await axios.get(
        `${this.config[this.network].cosmosAPIURL}/v1/txs?offset=${offset}&limit=${limit}&account=${address}`,
      )
    ).data

    const txs: Tx[] = results.txs.map((tx: unknown) => this.convertSearchResultTxToTx(tx))
    return {
      total: results.txs.length,
      txs,
    }
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const txInfo = await this.lcdClient.tx.txInfo(txId.toUpperCase())
    return this.convertTxInfoToTx(txInfo)
  }

  /**
   * Transfer
   *
   * Note: For paying fees other than `LUNA` (by default), `estimatedFee` parameter is required.
   * Use `getEstimatedFee` helper from `utils` to get all needed data for `estimatedFee`.
   */
  async transfer({
    walletIndex = 0,
    asset = AssetLUNA,
    amount,
    recipient,
    memo,
    estimatedFee,
  }: TxParams & { estimatedFee?: EstimatedFee }): Promise<TxHash> {
    if (!this.validateAddress(recipient)) throw new Error(`${recipient} is not a valid terra address`)

    const assetDenom = getTerraNativeDenom(asset)
    if (!assetDenom)
      throw Error(`Invalid asset ${assetToString(asset)} - Only Terra native asset are supported to transfer`)

    const mnemonicKey = new MnemonicKey({ mnemonic: this.phrase, index: walletIndex })
    const wallet = this.lcdClient.wallet(mnemonicKey)
    const amountToSend: Coins.Input = {
      [assetDenom]: amount.amount().toFixed(),
    }
    const send = new MsgSend(wallet.key.accAddress, recipient, amountToSend)

    const txOptions: CreateTxOptions = { msgs: [send], memo }

    if (estimatedFee) {
      const { amount: feeAmount, asset: feeAsset, gasLimit } = estimatedFee
      const feeDenom = getTerraNativeDenom(feeAsset)
      if (!feeDenom)
        throw Error(`Invalid asset ${assetToString(feeAsset)} - Only Terra native assets are supported to pay fees`)

      const gasFee: Coin.Data = { amount: feeAmount.amount().toFixed(), denom: feeDenom }
      const gasCoins = new Coins([Coin.fromData(gasFee)])
      txOptions.fee = new Fee(gasLimit.toNumber(), gasCoins)
    }

    const tx = await wallet.createAndSignTx(txOptions)
    // broadcast (`sync` mode)
    const result = await this.lcdClient.tx.broadcastSync(tx)
    return result.txhash
  }

  // TODO (xchain-contributors) Extract to `util` + add tests
  private coinsToBalances(coins: Coins): Balance[] {
    return (coins.toArray().map((c: Coin) => {
      return {
        asset: getTerraNativeAsset(c.denom),
        amount: baseAmount(c.amount.toFixed(), TERRA_DECIMAL),
      }
    }) as unknown) as Balance[]
  }

  // TODO (xchain-contributors) Extract to `util` + add tests
  // (@xchain-contributors) TODO: Fix `tx` type to avoid `any`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertSearchResultTxToTx(tx: any): Tx {
    let from: TxFrom[] = []
    let to: TxTo[] = []
    // (@xchain-contributors) TODO: Fix `msg` type to avoid `any`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx.tx.value.msg.forEach((msg: any) => {
      if (msg.type === 'bank/MsgSend') {
        const xfers = this.convertMsgSend(MsgSend.fromAmino(msg))
        from = from.concat(xfers.from)
        to = to.concat(xfers.to)
      } else if (msg.type === 'bank/MsgMultiSend') {
        const xfers = this.convertMsgMultiSend(MsgMultiSend.fromAmino(msg))
        from = from.concat(xfers.from)
        to = to.concat(xfers.to)
      }
    })
    return {
      // NOTE: since multiple assettypes can be xfered in one tx, this asset should not really exist
      // TODO we should consider refactoring xchain-client.Tx to remove the top level Asset...
      asset: {
        chain: Chain.Terra,
        symbol: '',
        ticker: '',
        synth: false,
      },
      from,
      to,
      date: new Date(tx.timestamp),
      type: TxType.Transfer,
      hash: tx.txhash,
    }
  }

  // TODO (xchain-contributors) Extract to `util` + add tests
  private convertTxInfoToTx(txInfo: TxInfo): Tx {
    let from: TxFrom[] = []
    let to: TxTo[] = []
    txInfo.tx.body.messages.forEach((msg) => {
      const msgObject = JSON.parse(msg.toJSON())
      if (msgObject['@type'] === '/cosmos.bank.v1beta1.MsgSend') {
        const xfers = this.convertMsgSend(msg as MsgSend)
        from = from.concat(xfers.from)
        to = to.concat(xfers.to)
      } else if (msgObject['@type'] === '/cosmos.bank.v1beta1.MsgMultiSend') {
        const xfers = this.convertMsgMultiSend(msg as MsgMultiSend)
        from = from.concat(xfers.from)
        to = to.concat(xfers.to)
      }
    })
    return {
      // NOTE: since multiple assettypes can be xfered in one tx, this asset should not really exist
      // TODO we should consider refactoring xchain-client.Tx to remove the top level Asset...
      asset: {
        chain: Chain.Terra,
        symbol: '',
        ticker: '',
        synth: false,
      },
      from,
      to,
      date: new Date(txInfo.timestamp),
      type: TxType.Transfer,
      hash: txInfo.txhash,
    }
  }

  // TODO (xchain-contributors) Extract to `util` + add tests
  private convertMsgSend(msgSend: MsgSend): { from: TxFrom[]; to: TxTo[] } {
    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgSend.amount.toArray().forEach((coin) => {
      //ensure this is in base units ex uluna, uusd
      const baseCoin = coin.toIntCoin()
      const asset = getTerraNativeAsset(baseCoin.denom)
      const amount = baseAmount(baseCoin.amount.toFixed(), TERRA_DECIMAL)
      if (asset) {
        // NOTE: this will only populate native terra Assets
        from.push({
          from: msgSend.from_address,
          amount,
          asset,
        })
        to.push({
          to: msgSend.to_address,
          amount,
          asset,
        })
      }
    })

    return { from, to }
  }

  // TODO (xchain-contributors) Extract to `util` + add tests
  private convertMsgMultiSend(msgMultiSend: MsgMultiSend): { from: TxFrom[]; to: TxTo[] } {
    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgMultiSend.inputs.forEach((input) => {
      input.coins.toArray().forEach((coin) => {
        //ensure this is in base units ex uluna, uusd
        const baseCoin = coin.toIntCoin()
        const asset = getTerraNativeAsset(baseCoin.denom)
        const amount = baseAmount(baseCoin.amount.toFixed(), TERRA_DECIMAL)
        if (asset) {
          // NOTE: this will only populate native terra Assets
          from.push({
            from: input.address,
            amount,
            asset,
          })
        }
      })
    })
    msgMultiSend.outputs.forEach((output) => {
      output.coins.toArray().forEach((coin) => {
        //ensure this is in base units ex uluna, uusd
        const baseCoin = coin.toIntCoin()
        const asset = getTerraNativeAsset(baseCoin.denom)
        const amount = baseAmount(baseCoin.amount.toFixed(), TERRA_DECIMAL)
        // TODO (xchain-contributors) Double check: Why is check of asset needed? `asset` will never fail ...
        if (asset) {
          // NOTE: this will only populate native terra Assets
          to.push({
            to: output.address,
            amount,
            asset,
          })
        }
      })
    })

    return { from, to }
  }
}

export { Client }
