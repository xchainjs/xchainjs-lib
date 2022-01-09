import { AccAddress, LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js'
import {
  Balance,
  BaseXChainClient,
  Fees,
  Network,
  Tx,
  TxHistoryParams,
  TxParams,
  TxsPage,
  XChainClient,
  XChainClientParams,
} from '@xchainjs/xchain-client'
import { Asset, Chain } from '@xchainjs/xchain-util/lib'

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

/**
 * Terra Client
 */
class Client extends BaseXChainClient implements XChainClient {
  private mnemonicKey: MnemonicKey
  private lcdClient: LCDClient
  private wallet: Wallet

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
    if (!this.phrase) throw new Error('Mnemonic phrase required in constructor')

    this.mnemonicKey = new MnemonicKey({ mnemonic: phrase, index: 0 })
    this.lcdClient = new LCDClient({
      URL: CONFIG[this.network].cosmosAPIURL,
      chainID: CONFIG[this.network].ChainID,
    })
    this.wallet = this.lcdClient.wallet(this.mnemonicKey)
    this.wallet //TODO remove me
  }

  getFees(): Promise<Fees> {
    throw new Error('Method not implemented.')
  }
  getAddress(walletIndex = 0): string {
    this.mnemonicKey = new MnemonicKey({ mnemonic: this.phrase, index: walletIndex })
    return this.mnemonicKey.accAddress
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
  getTransactionData(txId: string, assetAddress?: string): Promise<Tx> {
    txId
    assetAddress
    throw new Error('Method not implemented.')
  }
  transfer(params: TxParams): Promise<string> {
    params
    throw new Error('Method not implemented.')
  }
}

export { Client }
