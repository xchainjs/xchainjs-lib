import { Balance, Network, PreparedTx, TxHash, TxParams, XChainClient } from '@xchainjs/xchain-client'
import { Client as EvmClient, GasPrices, isApproved } from '@xchainjs/xchain-evm'
import { DepositParam, MayachainClient } from '@xchainjs/xchain-mayachain'
import { Asset, BaseAmount, Chain, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

export type NodeUrls = Record<Network, string>

export class Wallet {
  private clients: Record<Chain, XChainClient>
  private network: Network

  /**
   * Constructor to create a wallet with the desired clients
   *
   * @param {Record<string>} clients Clients by chain the wallet work with
   * @returns Wallet
   */
  constructor(clients: Record<Chain, XChainClient>) {
    this.clients = clients
    this.network = Network.Mainnet

    if (Object.values(clients).length) {
      const network = Object.values(clients)[0].getNetwork()
      if (!Object.values(clients).every((client) => client.getNetwork() === network)) {
        throw Error('Clients not working on the same network')
      }
      this.network = network
    }
  }

  /**
   * Get the network clients are working in
   * @returns {Network} network
   */
  public getNetwork(): Network {
    return this.network
  }

  /**
   * Set the network clients are working in
   * @param {Network} network Network
   */
  public setNetwork(network: Network) {
    Object.values(this.clients).forEach((client) => client.setNetwork(network))
    this.network = network
  }

  /**
   * Get chain address
   * @param {Chain} chain
   * @returns the chain address
   */
  public async getAddress(chain: Chain): Promise<string> {
    const client = this.getClient(chain)
    return client.getAddressAsync()
  }

  /**
   * Check if address is valid
   * @param {Chain} chain in which the address has to be valid
   * @param {string} address to validate
   * @returns true if it is a valid address, otherwise, false
   */
  public validateAddress(chain: Chain, address: string): boolean {
    const client = this.getClient(chain)
    return client.validateAddress(address)
  }

  /**
   * Get chain balances
   * @param {Chain} chain to retrieve the balance of
   * @returns the chain balances
   */
  public async getBalance(chain: Chain, assets?: Asset[]): Promise<Balance[]> {
    const client = this.getClient(chain)
    return client.getBalance(await client.getAddressAsync(), assets)
  }

  // TODO: Review params by wallet type
  public async prepareTx(txParams: TxParams & { asset: Asset }): Promise<PreparedTx> {
    const client = this.getClient(txParams.asset.chain)
    return client.prepareTx(txParams)
  }

  /**
   * Make a transaction
   * @param {TxParams} txParams to make the transfer
   * @returns the transaction hash
   */
  // TODO: Review params by wallet type
  public async transfer({ asset, amount, recipient, memo, walletIndex }: TxParams & { asset: Asset }): Promise<string> {
    const client = this.getClient(asset.chain)
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
  public async deposit({ asset, amount, memo }: DepositParam & { asset: Asset }): Promise<string> {
    const client = this.getClient(asset.chain)
    if (!('deposit' in client)) throw Error(`Can not deposit with ${asset.chain} client`)

    return (client as unknown as MayachainClient).deposit({ asset, amount, memo })
  }

  /**
   * Broadcast transaction
   * @param chain in which broadcast the signed raw transaction
   * @param txHex signed raw transaction
   * @returns the broadcasted transaction hash
   */
  public async broadcast(chain: Chain, txHex: string): Promise<TxHash> {
    const client = this.getClient(chain)
    return client.broadcastTx(txHex)
  }

  /**
   * Check if an spenderAddress is allowed to spend in name of another address certain asset amount. Only available for EVM clients
   * @param {Asset} asset to check
   * @param {BaseAmount} amount to check
   * @param {string} fromAddress owner of the amount asset
   * @param {string} spenderAddress spender to check if it is allowed to spend
   * @returns true if the spenderAddress is allowed to spend the amount, otherwise, false
   * @throws {Error} if asset is a non ERC20 asset
   */
  public async isApproved(
    asset: Asset,
    amount: BaseAmount,
    fromAddress: string,
    spenderAddress: string,
  ): Promise<boolean> {
    const client = this.getClient(asset.chain)
    if (!('isApproved' in client)) throw Error('Can not validate approve over non EVM client')
    if (asset.chain === asset.ticker) throw Error('Can not validate approve over native asset')

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
   * Get feeRates. Only available for EVM clients
   * @param {Chain} chain of which return the feeRates
   * @returns the gas fee rates
   * @throws {Error} if gas fee rates can not be returned from the chain
   */
  public async getGasFeeRates(chain: Chain): Promise<GasPrices> {
    const client = this.getClient(chain)
    if (!('estimateGasPrices' in client)) throw Error(`Can not get gas with ${chain} client`)
    return (client as EvmClient).estimateGasPrices()
  }

  /**
   * Get explorer url
   * @param {Chain} chain to retrieve the explorer of
   * @returns the transaction url
   */
  public async getExplorerUrl(chain: Chain): Promise<string> {
    const client = this.getClient(chain)
    return client.getExplorerUrl()
  }

  /**
   * Get transaction url
   * @param {Chain} chain of the transaction
   * @param {string} hash to retrieve the url of
   * @returns the transaction url
   */
  public async getExplorerTxUrl(chain: Chain, hash: string): Promise<string> {
    const client = this.getClient(chain)
    return client.getExplorerTxUrl(hash)
  }

  /**
   * Get address url
   * @param {Chain} chain of the address
   * @param {string} address to retrieve the url of
   * @returns the transaction url
   */
  public async getExplorerAddressUrl(chain: Chain, address: string): Promise<string> {
    const client = this.getClient(chain)
    return client.getExplorerAddressUrl(address)
  }

  /**
   * Get chain wallet. Only available for EVM clients
   * @param {Chain} chain of which return the wallet
   * @returns the chain wallet
   * @throws {Error} wallet can not be retrieve from chain
   */
  public getChainWallet(chain: Chain): ethers.Wallet {
    const client = this.getClient(chain)
    if (!('getWallet' in client)) throw Error(`Can not get wallet of ${chain} client`)
    return (client as EvmClient).getWallet()
  }

  /**
   * Add a new client to the wallet
   * @param chain to remove the client of
   * @returns true if client is successfully added, otherwise, false
   * @throws {Error} If client to add is working on different network compared to others
   */
  public addClient(chain: Chain, client: XChainClient): boolean {
    if (chain in this.clients) return false

    const network = client.getNetwork()
    if (!Object.values(this.clients).length) {
      this.network = network
    } else {
      if (this.network !== network)
        throw Error(`Trying to add client in different network. Expected ${this.network} but got ${network}`)
    }

    this.clients[chain] = client
    return true
  }

  /**
   * Purge and remove client from wallet
   * @param chain to remove the client of
   * @returns true if the client is successfully purge and removed, otherwise, false
   */
  public purgeClient(chain: Chain): boolean {
    try {
      const client = this.getClient(chain)
      client.purgeClient()
      delete this.clients[chain]
      return true
    } catch {
      return false
    }
  }

  /**
   * Purge and remove all clients from wallet
   * @returns true if the wallet is successfully purge and removed, otherwise, false
   */
  public purgeWallet(): boolean {
    try {
      Object.values(this.clients).map((client) => {
        client.purgeClient()
      })
      this.clients = {}
      return true
    } catch {
      return false
    }
  }

  /**
   * Get chain client
   * @param {Chain} chain of which return the client
   * @returns the chain client
   * @throws {Error} if client does not exist
   */
  private getClient(chain: Chain): XChainClient {
    const client = this.clients[chain]
    if (!client) throw Error(`Client not found for ${chain} chain`)
    return client
  }
}
