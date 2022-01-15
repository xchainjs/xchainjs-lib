/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccAddress, Coin, Coins, LCDClient, MnemonicKey, MsgMultiSend, MsgSend, TxInfo } from '@terra-money/terra.js'
import {
  Balance,
  BaseXChainClient,
  Fees,
  Network,
  Tx,
  TxFrom,
  TxHistoryParams,
  TxParams,
  TxTo,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, Chain, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'

const DEFAULT_CONFIG = {
  [Network.Mainnet]: {
    explorerURL: 'https://finder.terra.money/mainnet',
    explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
    explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
    cosmosAPIURL: 'https://fcd.terra.dev',
    ChainID: 'columbus-5',
  },
  [Network.Stagenet]: {
    explorerURL: 'https://finder.terra.money/mainnet',
    explorerAddressURL: 'https://finder.terra.money/mainnet/address/',
    explorerTxURL: 'https://finder.terra.money/mainnet/tx/',
    cosmosAPIURL: 'https://fcd.terra.dev',
    ChainID: 'columbus-5',
  },
  [Network.Testnet]: {
    explorerURL: 'https://finder.terra.money/testnet',
    explorerAddressURL: 'https://finder.terra.money/testnet/address/',
    explorerTxURL: 'https://finder.terra.money/testnet/tx/',
    cosmosAPIURL: 'https://bombay-fcd.terra.dev',
    ChainID: 'bombay-12',
  },
}
const ASSET_LUNA: Asset = {
  chain: Chain.Terra,
  symbol: 'LUNA',
  ticker: 'LUNA',
}
export type SearchTxParams = {
  messageAction?: string
  messageSender?: string
  transferSender?: string
  transferRecipient?: string
  page?: number
  limit?: number
  txMinHeight?: number
  txMaxHeight?: number
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
    // TODO
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
      URL: DEFAULT_CONFIG[this.network].cosmosAPIURL,
      chainID: DEFAULT_CONFIG[this.network].ChainID,
    })
  }
  async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    //TODO filter by start time?
    //TODO filter by asset
    const address = params?.address || this.getAddress()
    const offset = params?.offset ? `${params?.offset}` : '0'
    const limit = params?.limit ? `${params?.limit}` : '100'
    const results = (
      await axios.get(
        `${DEFAULT_CONFIG[this.network].cosmosAPIURL}/v1/txs?offset=${offset}&limit=${limit}&account=${address}`,
      )
    ).data

    const txs: Tx[] = results.txs.map((tx: unknown) => this.convertSearchResultTxToTx(tx))
    return {
      total: results.txs.length,
      txs,
    }
  }

  async getTransactionData(txId: string): Promise<Tx> {
    const txInfo = await this.lcdClient.tx.txInfo(txId?.toUpperCase())
    return this.convertTxInfoToTx(txInfo)
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
  private convertSearchResultTxToTx(tx: any): Tx {
    let from: TxFrom[] = []
    let to: TxTo[] = []
    // console.log(tx)
    tx.tx.value.msg.forEach((msg: any) => {
      console.log(msg)
      if (msg.type === 'bank/MsgSend') {
        const xfers = this.convertMsgSend(MsgSend.fromAmino(msg))
        from = from.concat(xfers.from)
        to = to.concat(xfers.to)
      } else if (msg.type === 'bank/MsgMultiSend') {
        const xfers = this.convertMsgMultiSend(MsgMultiSend.fromAmino(msg))
        from = from.concat(xfers.from)
        to = to.concat(xfers.to)
      } else {
        // we ignore every other type of msg
        //TODO remove this log after testing
        console.log(msg.type)
      }
    })
    return {
      // NOTE: since multiple assettypes can be xfered in one tx, this asset should not really exist
      // TODO we shoudl consider refactoring xchain-client.Tx to remove the top level Asset...
      asset: {
        chain: Chain.Terra,
        symbol: '',
        ticker: '',
      },
      from,
      to,
      date: new Date(tx.timestamp),
      type: TxType.Transfer,
      hash: tx.txhash,
    }
  }
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
      } else {
        //we ignore every other type of msg
        console.log(msgObject['@type'])
      }
    })
    return {
      // NOTE: since multiple assettypes can be xfered in one tx, this asset should not really exist
      // TODO we shoudl consider refactoring xchain-client.Tx to remove the top level Asset...
      asset: {
        chain: Chain.Terra,
        symbol: '',
        ticker: '',
      },
      from,
      to,
      date: new Date(txInfo.timestamp),
      type: TxType.Transfer,
      hash: txInfo.txhash,
    }
  }
  private convertMsgSend(msgSend: MsgSend): { from: TxFrom[]; to: TxTo[] } {
    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgSend.amount.toArray().forEach((coin) => {
      //ensure this is in base units ex uluna, uusd
      const baseCoin = coin.toIntCoin()
      const asset = this.getTerraNativeAsset(baseCoin.denom)
      const amount = baseAmount(baseCoin.amount.toFixed(), 6)
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
  private convertMsgMultiSend(msgMultiSend: MsgMultiSend): { from: TxFrom[]; to: TxTo[] } {
    const from: TxFrom[] = []
    const to: TxTo[] = []
    msgMultiSend.inputs.forEach((input) => {
      input.coins.toArray().forEach((coin) => {
        //ensure this is in base units ex uluna, uusd
        const baseCoin = coin.toIntCoin()
        const asset = this.getTerraNativeAsset(baseCoin.denom)
        const amount = baseAmount(baseCoin.amount.toFixed(), 6)
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
        const asset = this.getTerraNativeAsset(baseCoin.denom)
        const amount = baseAmount(baseCoin.amount.toFixed(), 6)
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
