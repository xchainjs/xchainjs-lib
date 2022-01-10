import { AccAddress, Coins, LCDClient, MnemonicKey, MsgSend } from '@terra-money/terra.js'
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

const CONFIG = {
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

    this.lcdClient = new LCDClient({
      URL: CONFIG[this.network].cosmosAPIURL,
      chainID: CONFIG[this.network].ChainID,
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
    return CONFIG[this.network].explorerURL
  }
  getExplorerAddressUrl(address: string): string {
    return CONFIG[this.network].explorerAddressURL + address?.toLowerCase()
  }
  getExplorerTxUrl(txID: string): string {
    return CONFIG[this.network].explorerAddressURL + txID?.toLowerCase()
  }
  validateAddress(address: string): boolean {
    return AccAddress.validate(address)
  }
  getBalance(address: string, assets?: Asset[]): Promise<Balance[]> {
    address
    assets
    throw new Error('Method not implemented.')
  }
  getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    params
    throw new Error('Method not implemented.')
  }
  async getTransactionData(txId: string): Promise<Tx> {
    const txInfo = await this.lcdClient.tx.txInfo(txId?.toUpperCase())
    const msg = JSON.parse(txInfo.tx.body.messages[0].toJSON())
    const msgType = msg['@type']
    const amount = baseAmount(msg.amount[0].amount)
    const denom = msg.amount[0].denom
    const asset = this.getAsset(denom)
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
  private getAsset(denom: string): Asset | undefined {
    if (denom.includes('luna')) {
      return {
        chain: Chain.Terra,
        symbol: 'LUNA',
        ticker: 'LUNA',
      }
    }
    if (denom.includes('usd')) {
      return {
        chain: Chain.Terra,
        symbol: 'UST',
        ticker: 'UST',
      }
    }
    return undefined
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
}

export { Client }
