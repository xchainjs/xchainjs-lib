import { AccAddress, Coin, Coins, LCDClient, MnemonicKey, MsgSend } from '@terra-money/terra.js'
import {
  Balance,
  BaseXChainClient,
  Fees,
  Network,
  Tx,
  TxHistoryParams,
  TxParams,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, Chain, baseAmount } from '@xchainjs/xchain-util'

const DEFAULT_CONFIG = {
  [Network.Mainnet]: {
    explorerURL: 'https://finder.terra.money/mainnet',
    explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
    explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
    cosmosAPIURL: 'https://lcd.terra.dev',
    ChainID: 'columbus-5',
  },
  [Network.Stagenet]: {
    explorerURL: 'https://finder.terra.money/mainnet',
    explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
    explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
    cosmosAPIURL: 'https://lcd.terra.dev',
    ChainID: 'columbus-5',
  },
  [Network.Testnet]: {
    explorerURL: 'https://finder.terra.money/testnet',
    explorerAddressURL: 'https://finder.terra.money/testnet/address/',
    explorerTxURL: 'https://finder.terra.money/testnet/tx/',
    cosmosAPIURL: 'https://bombay-lcd.terra.dev',
    ChainID: 'bombay-12',
  },
}
const ASSET_LUNA: Asset = {
  chain: Chain.Terra,
  symbol: 'LUNA',
  ticker: 'LUNA',
}

/**
 * Terra Client
 */
class Client extends BaseXChainClient implements XChainClient {
  private lcdClient: LCDClient

  constructor({
    network = Network.Testnet,

    phrase,
    rootDerivationPaths = {
      [Network.Mainnet]: "44'/330'/0'/0/",
      [Network.Stagenet]: "44'/330'/0'/0/",
      [Network.Testnet]: "44'/330'/0'/0/",
    },
  }: XChainClientParams) {
    super(Chain.Litecoin, { network, rootDerivationPaths, phrase })

    //TODO add client variables to ctor to override DEFAULT_CONFIG
    this.lcdClient = new LCDClient({
      URL: DEFAULT_CONFIG[this.network].cosmosAPIURL,
      chainID: DEFAULT_CONFIG[this.network].ChainID,
    })
  }

  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(walletIndex = 0): string {
    const mnemonicKey = new MnemonicKey({ mnemonic: this.phrase, index: walletIndex })
    return mnemonicKey.accAddress
  }
  getExplorerUrl(): string {
    return DEFAULT_CONFIG[this.network].explorerURL
  }
  getExplorerAddressUrl(address: string): string {
    return DEFAULT_CONFIG[this.network].explorerAddressURL + address?.toLowerCase()
  }
  getExplorerTxUrl(txID: string): string {
    return DEFAULT_CONFIG[this.network].explorerAddressURL + txID?.toLowerCase()
  }
  validateAddress(address: string): boolean {
    return AccAddress.validate(address)
  }
  async getBalance(address: string, assets?: Asset[]): Promise<Balance[]> {
    // const x: PaginationOptions = {
    //   'pagination.limit': '1',
    //   'pagination.offset': '0',
    //   'pagination.key': 's',
    //   'pagination.count_total': 'false',
    //   'pagination.reverse': 'false',
    //   order_by: OrderBy.ORDER_BY_UNSPECIFIED,
    // }

    let balances: Balance[] = []
    const [coins] = await this.lcdClient.bank.balance(address)
    balances = balances.concat(this.coinsToBalances(coins))
    //TODO add pagination
    if (assets) {
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
      URL: DEFAULT_CONFIG[this.network].cosmosAPIURL,
      chainID: DEFAULT_CONFIG[this.network].ChainID,
    })
  }
  getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    this.lcdClient.tx.search({
      events: [{ key: 'key', value: 'value' }],
      'pagination.key': 's',
    })
    params
    throw new Error('Method not implemented.')
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const txInfo = await this.lcdClient.tx.txInfo(txId?.toUpperCase())
    const msg = JSON.parse(txInfo.tx.body.messages[0].toJSON())

    const msgType = msg['@type']
    const amount = baseAmount(msg.amount[0].amount, 6)
    const denom = msg.amount[0].denom
    const asset = this.getTerraNativeAsset(denom)

    if (asset && msgType === '/cosmos.bank.v1beta1.MsgSend') {
      return {
        asset,
        from: [
          {
            from: msg.from_address,
            amount,
          },
        ],
        to: [
          {
            to: msg.to_address,
            amount,
          },
        ],
        date: new Date(txInfo.timestamp),
        type: TxType.Transfer,
        hash: txInfo.txhash,
      }
    } else {
      throw new Error(`unsupported asset ${denom} or msgType ${msgType}`)
    }
  }
  async transfer({ walletIndex = 0, asset = ASSET_LUNA, amount, recipient, memo }: TxParams): Promise<string> {
    if (!this.validateAddress(recipient)) throw new Error(`${recipient} is not a valid terra address`)

    // TODO use fee?
    // const fee = await this.getFees()

    const mnemonicKey = new MnemonicKey({ mnemonic: this.phrase, index: walletIndex })
    const wallet = this.lcdClient.wallet(mnemonicKey)

    let amountToSend: Coins.Input = {}

    if (asset.chain === Chain.Terra && asset.symbol === 'LUNA' && asset.ticker === 'LUNA') {
      amountToSend = {
        uluna: `${amount.amount().toFixed()}`,
      }
    } else if (asset.chain === Chain.Terra && asset.symbol === 'UST' && asset.ticker === 'UST') {
      amountToSend = {
        uusd: `${amount.amount().toFixed()}`,
      }
    } else {
      throw new Error('Only LUNA or UST transfers are currently supported on terra')
    }
    const send = new MsgSend(wallet.key.accAddress, recipient, amountToSend)
    console.log(send.toJSON())
    const tx = await wallet.createAndSignTx({ msgs: [send], memo })
    console.log(JSON.stringify(tx.toData(), null, 2))
    const result = await this.lcdClient.tx.broadcast(tx)
    console.log(result.txhash)
    return result.txhash
  }
  private getTerraNativeAsset(denom: string): Asset | undefined {
    if (denom.includes('luna')) {
      return {
        chain: Chain.Terra,
        symbol: 'LUNA',
        ticker: 'LUNA',
      }
    } else {
      // native coins other than luna, UST, KRT, etc
      // NOTE: https://docs.terra.money/Reference/Terra-core/Overview.html#currency-denominations
      const standardDenom = denom.toUpperCase().slice(1, 3) + 'T'
      return {
        chain: Chain.Terra,
        symbol: standardDenom,
        ticker: standardDenom,
      }
    }
    return undefined
  }
  private coinsToBalances(coins: Coins): Balance[] {
    return (coins.toArray().map((c: Coin) => {
      return {
        asset: this.getTerraNativeAsset(c.denom),
        amount: baseAmount(c.amount.toFixed(), 6),
      }
    }) as unknown) as Balance[]
  }
}

export { Client }
