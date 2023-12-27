import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Balance, Network, Tx, TxParams, TxsPage, XChainClient, XChainClientParams } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Client as DashClient, DASHChain, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as EvmClient, EVMClientParams, GasPrices, isApproved } from '@xchainjs/xchain-evm'
import { Client as KujiraClient, KUJIChain, defaultKujiParams } from '@xchainjs/xchain-kujira'
import {
  Client as MayaClient,
  DepositParam,
  MAYAChain,
  MayachainClient,
  MayachainClientParams,
} from '@xchainjs/xchain-mayachain'
import { Client as ThorClient, THORChain, ThorchainClientParams } from '@xchainjs/xchain-thorchain'
import { Address, Asset, BaseAmount, Chain, assetToString, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { UtxoClientParams } from '@xchainjs/xchain-utxo'
import { ethers } from 'ethers'

export type NodeUrls = Record<Network, string>
export type ChainConfigs = Partial<{
  [BTCChain]: Partial<Omit<UtxoClientParams, 'phrase' | 'network'>>
  [ETHChain]: Partial<Omit<EVMClientParams, 'phrase' | 'network'>>
  [DASHChain]: Partial<Omit<UtxoClientParams, 'phrase' | 'network'>>
  [KUJIChain]: Partial<Omit<CosmosSdkClientParams, 'phrase' | 'network'>>
  [THORChain]: Omit<XChainClientParams & ThorchainClientParams, 'phrase' | 'network'>
  [MAYAChain]: Omit<XChainClientParams & MayachainClientParams, 'phrase' | 'network'>
}>

export class Wallet {
  clients: Record<string, XChainClient>

  /**
   * Constructor to create a Wallet
   *
   * @param {string} phrase - mnemonic phrase
   * @param {Network} network - mnemonic phrase
   * @param {ChainConfigs} chainConfigs - Config by chain. If it isn not set, each client uses its default params
   * @returns Wallet
   */
  constructor(phrase: string, network: Network, chainConfigs: ChainConfigs = {}) {
    const settings = { network, phrase }

    this.clients = {
      BTC: new BtcClient({ ...defaultBtcParams, ...chainConfigs[BTCChain], ...settings }),
      ETH: new EthClient({ ...defaultEthParams, ...chainConfigs[ETHChain], ...settings }),
      DASH: new DashClient({ ...defaultDashParams, ...chainConfigs[DASHChain], ...settings }),
      KUJI: new KujiraClient({ ...defaultKujiParams, ...chainConfigs[KUJIChain], ...settings }),
      THOR: new ThorClient({ ...chainConfigs[THORChain], ...settings }),
      MAYA: new MayaClient({ ...chainConfigs[MAYAChain], ...settings }),
    }
  }

  /**
   * Get chain address
   * @param {Chain} chain
   * @returns the chain address
   */
  async getAddress(chain: Chain): Promise<string> {
    const client = this.getChainClient(chain)
    return client.getAddressAsync()
  }

  /**
   * Get wallet chain addresses.
   * @param {Chain[]} chains Optional - Chains of which return the address of. If not provided, it will return
   * the wallet chain addresses
   * @returns the chains addresses
   */
  async getAddresses(chains?: Chain[]): Promise<Record<Chain, Address>> {
    const _chains: Chain[] = chains || Object.keys(this.clients)
    const tasks = _chains.map((chain) => {
      return this.getAddress(chain)
    })

    const walletAddresses: Record<Chain, Address> = {}
    const addresses = await Promise.all(tasks)

    addresses.map((walletAddress, index) => {
      walletAddresses[_chains[index]] = walletAddress
    })

    return walletAddresses
  }

  /**
   * Check if an address is valid
   * @param {Chain} chain in which the address has to be valid
   * @param {string} address to validate
   * @returns true if it is a valid address, otherwise, false
   */
  public validateAddress(chain: Chain, address: string): boolean {
    const client = this.getChainClient(chain)
    return client.validateAddress(address)
  }

  /**
   * Get chain balances.
   * @param {Chain} chain - Chains of the assets
   * @param {Assets[]} assets - Optional. Assets of which return the balance
   * @returns {Balance[]} Balances by chain
   */
  public async getBalance(chain: Chain, assets?: Asset[]): Promise<Balance[]> {
    const client = this.getChainClient(chain)
    return client.getBalance(await this.getAddress(chain), assets)
  }

  /**
   * Get wallet balances. By default, it returns all the wallet balances unless assets are provided, in that case,
   * only asset balances will be returned by chain
   * @param {Assets[]} assets - Optional. Assets of which return the balance
   * @returns {Record<Chain, Balance[]>} Balances by chain
   */
  public async getBalances(assets?: Asset[]): Promise<Record<Chain, Balance[]>> {
    const chains: Chain[] = assets ? Array.from(new Set(assets.map((asset) => asset.chain))) : Object.keys(this.clients)

    const tasks = chains.map(async (chain) => {
      return await this.getBalance(
        chain,
        assets?.filter((asset) => asset.chain === chain),
      )
    })

    const walletBalances: Record<Chain, Balance[]> = {}
    const balances = await Promise.all(tasks)

    balances.map((chainBalance, index) => {
      walletBalances[chains[index]] = chainBalance
    })

    return walletBalances
  }

  /**
   * Get transaction data from hash
   * @param {Chain} chain - Chain in which the transaction was done
   * @param {string} hash - Hash of the transaction
   * @returns
   */
  public async getTransactionData(chain: Chain, hash: string): Promise<Tx> {
    const client = this.getChainClient(chain)
    return await client.getTransactionData(hash)
  }

  /**
   * Returns the transaction history of a chain
   * @param {Chain} chain Chain of which return the transaction history
   * @returns {TxsPage} the chain transaction history
   */
  public async getTransactionsHistory(chain: Chain): Promise<TxsPage> {
    const client = this.getChainClient(chain)
    return client.getTransactions()
  }

  /**
   * Get wallet histories. By default, it returns all the wallet histories unless chains are provided, in that case,
   * only chain histories will be returned by chain
   * @param {Chain[]} chains - Optional. Chain of which return the transaction history
   * @returns {TxsPage} the chain transaction history
   */
  public async getTransactionsHistories(chains?: Chain[]): Promise<Record<Chain, TxsPage>> {
    const _chains: Chain[] = chains || Object.keys(this.clients)

    const tasks = _chains.map(async (chain) => {
      return this.getTransactionsHistory(chain)
    })

    const walletHistories: Record<Chain, TxsPage> = {}
    const histories = await Promise.all(tasks)

    histories.map((history, index) => {
      walletHistories[_chains[index]] = history
    })

    return walletHistories
  }

  /**
   * Make a transaction
   * @param {TxParams} txParams to make the transfer
   * @returns the transaction hash
   */
  async transfer({ asset, amount, recipient, memo, walletIndex }: TxParams & { asset: Asset }): Promise<string> {
    const client = this.getChainClient(asset.chain)
    return client.transfer({
      walletIndex,
      asset,
      amount,
      recipient,
      memo,
    })
  }

  /**
   * Make a deposit
   * @param {DepositParam} depositParams
   * @returns the hash of the deposit
   * @throws {Error} if can not make deposit with the asset
   */
  async deposit({ asset, amount, memo }: DepositParam & { asset: Asset }): Promise<string> {
    const client = this.getChainClient(asset.chain)
    if (!('deposit' in client)) throw Error(`Can not deposit with ${asset.chain} client`)

    return (client as unknown as MayachainClient).deposit({ asset, amount, memo })
  }

  /**
   * Check if an spenderAddress is allowed to spend in name of another address certain asset amount
   * @param {Asset} asset to check
   * @param {BaseAmount} amount to check
   * @param {string} fromAddress owner of the amount asset
   * @param {string} spenderAddress spender to check if it is allowed to spend
   * @returns true if the spenderAddress is allowed to spend the amount, otherwise, false
   * @throws {Error} if asset is a non ERC20 asset
   */
  async isApproved(asset: Asset, amount: BaseAmount, fromAddress: string, spenderAddress: string): Promise<boolean> {
    const client = this.getChainClient(asset.chain)
    if (!this.isERC20Asset(asset)) throw Error(`${assetToString(asset)} is not an ERC20 token`)
    const contractAddress = getContractAddressFromAsset(asset)

    return isApproved({
      provider: (client as EvmClient).getProvider(),
      amount,
      spenderAddress,
      contractAddress,
      fromAddress,
    })
  }

  /**
   * Get transaction url
   * @param {Chain} chain of the transaction
   * @param {string} hash of the transaction
   * @returns the transaction url
   */
  async getExplorerTxUrl(chain: Chain, hash: string): Promise<string> {
    const client = this.getChainClient(chain)
    return client.getExplorerTxUrl(hash)
  }

  /**
   * Get feeRates
   * @param {Chain} chain of which return the feeRates
   * @returns the gas fee rates
   * @throws {Error} if gas fee rates can not be returned from the chain
   */
  async getGasFeeRates(chain: Chain): Promise<GasPrices> {
    const client = this.getChainClient(chain)
    if (!('estimateGasPrices' in client)) throw Error(`Can not get gas with ${chain} client`)
    return (client as EvmClient).estimateGasPrices()
  }

  /**
   * Get chain wallet
   * @param {Chain} chain of which return the wallet
   * @returns the chain wallet
   * @throws {Error} wallet can not be retrieve from chain
   */
  public getChainWallet(chain: Chain): ethers.Wallet {
    const client = this.getChainClient(chain)
    if (!('getWallet' in client)) throw Error(`Can not get wallet of ${chain} client`)
    return (client as EvmClient).getWallet()
  }

  /**
   * Get chain client
   * @param {Chain} chain of which return the client
   * @returns the chain client
   * @throws {Error} if client does not exist
   */
  private getChainClient(chain: Chain): XChainClient {
    const client = this.clients[chain]
    if (!client) throw Error(`Client not found for ${chain} chain`)
    return client
  }

  /**
   * Check if asset is ERC20
   * @param {Asset} asset to check
   * @returns true if asset is ERC20, otherwise, false
   */
  public isERC20Asset(asset: Asset): boolean {
    const isGasAsset = [AssetETH.symbol].includes(asset.symbol)
    return this.isEVMChain(asset.chain) && !isGasAsset
  }

  /**
   * Check if asset chain is EVM
   * @param {Chain} chain to check
   * @returns true if chain is EVM, otherwise, false
   */
  public isEVMChain(chain: string): boolean {
    return [AssetETH.chain].includes(chain)
  }
}
