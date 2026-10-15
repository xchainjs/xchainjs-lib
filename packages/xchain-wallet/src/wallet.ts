import {
  AssetInfo,
  Balance,
  FeeOption,
  Fees,
  Network,
  Protocol,
  Tx,
  TxHash,
  TxsPage,
  XChainClient,
} from '@xchainjs/xchain-client'
import { Client as EvmClient, GasPrices, isApproved } from '@xchainjs/xchain-evm'
import { DepositParam, MayachainClient } from '@xchainjs/xchain-mayachain'
import { Client as RadixClient } from '@xchainjs/xchain-radix'
import {
  Address,
  AnyAsset,
  BaseAmount,
  Chain,
  TokenAsset,
  baseAmount,
  getContractAddressFromAsset,
} from '@xchainjs/xchain-util'
import { Client as UtxoClient } from '@xchainjs/xchain-utxo'
import BigNumber from 'bignumber.js'

import { ChainBalances, CosmosTxParams, EvmTxParams, RadixTxParams, UtxoTxParams } from './types'
import { getAddress } from 'ethers'

export type NodeUrls = Record<Network, string>

export class Wallet {
  private clients: Record<Chain, XChainClient>
  private network: Network

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

  public async awaitTxConfirmed(chain: Chain, hash: string): Promise<void> {
    const client = this.getClient(chain)
    if (!this.isEvmClient(client)) throw Error('Can not make approve over non EVM client')
    await client.awaitTxConfirmed(hash)
  }

  public getNetwork(): Network {
    return this.network
  }

  public setNetwork(network: Network) {
    Object.values(this.clients).forEach((client) => client.setNetwork(network))
    this.network = network
  }

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

  public getAssetInfo(chain: Chain): AssetInfo {
    const client = this.getClient(chain)
    return client.getAssetInfo()
  }

  public async getAddress(chain: Chain): Promise<string> {
    const client = this.getClient(chain)
    return client.getAddressAsync()
  }

  public async getAddresses(chains: Chain[] = Object.keys(this.clients)): Promise<Record<Chain, Address>> {
    const tasks = chains.map((chain) => {
      return this.getAddress(chain)
    })

    const walletAddresses: Record<Chain, Address> = {}
    const addresses = await Promise.all(tasks)

    addresses.map((walletAddress, index) => {
      walletAddresses[chains[index]] = walletAddress
    })

    return walletAddresses
  }

  public validateAddress(chain: Chain, address: string): boolean {
    const client = this.getClient(chain)
    return client.validateAddress(address)
  }

  public async getBalance(chain: Chain, assets?: AnyAsset[]): Promise<Balance[]> {
    const client = this.getClient(chain)
    return client.getBalance(await client.getAddressAsync(), assets)
  }

  public async getBalances(
    assets: Record<Chain, AnyAsset[] | undefined> = Object.keys(this.clients).reduce((prev, client) => {
      prev[client] = undefined
      return prev
    }, {} as Record<Chain, AnyAsset[] | undefined>),
  ): Promise<ChainBalances> {
    const walletBalances: ChainBalances = {}

    const chains = Object.keys(assets)

    const results = await Promise.allSettled(
      chains.map((chain) => {
        return this.getBalance(chain, assets[chain])
      }),
    )

    results.forEach((chainBalance, index) => {
      if (chainBalance.status === 'fulfilled') {
        walletBalances[chains[index]] = { status: 'fulfilled', balances: chainBalance.value }
      } else if (chainBalance.status === 'rejected')
        walletBalances[chains[index]] = { status: 'rejected', reason: chainBalance.reason }
    })

    return walletBalances
  }

  public async getTransactionData(chain: Chain, hash: string): Promise<Tx> {
    const client = this.getClient(chain)
    return await client.getTransactionData(hash)
  }

  public async getTransactionsHistory(chain: Chain): Promise<TxsPage> {
    const client = this.getClient(chain)
    return client.getTransactions()
  }

  public async getTransactionsHistories(chains: Chain[] = Object.keys(this.clients)): Promise<Record<Chain, TxsPage>> {
    const tasks = chains.map(async (chain) => {
      return this.getTransactionsHistory(chain)
    })

    const walletHistories: Record<Chain, TxsPage> = {}
    const histories = await Promise.all(tasks)

    histories.map((history, index) => {
      walletHistories[chains[index]] = history
    })

    return walletHistories
  }

  public async getExplorerUrl(chain: Chain): Promise<string> {
    const client = this.getClient(chain)
    return client.getExplorerUrl()
  }

  public async getExplorerAddressUrl(chain: Chain, address: string): Promise<string> {
    const client = this.getClient(chain)
    return client.getExplorerAddressUrl(address)
  }

  public async getExplorerTxUrl(chain: Chain, hash: string): Promise<string> {
    const client = this.getClient(chain)
    return client.getExplorerTxUrl(hash)
  }

  /** @deprecated Use getFeeRates instead. */
  public async getGasFeeRates(chain: Chain): Promise<GasPrices> {
    const client = this.getClient(chain)
    if (!this.isEvmClient(client)) throw Error(`Can not get gas with ${chain} client`)
    return client.estimateGasPrices()
  }

  /** If protocol is omitted, fee rates follow chain rules. */
  public async getFeeRates(chain: Chain, protocol?: Protocol): Promise<Record<FeeOption, BaseAmount>> {
    const client = this.getClient(chain)
    if (this.isEvmClient(client)) {
      return client.estimateGasPrices(protocol)
    }
    if (this.isUtxoClient(client)) {
      // Round up: `baseAmount` rounds half-up, which would pay less than the requested rate
      const feeRates = await client.getFeeRates(protocol)
      const nativeDecimals = client.getAssetInfo().decimal
      return {
        [FeeOption.Average]: baseAmount(Math.ceil(feeRates[FeeOption.Average]), nativeDecimals),
        [FeeOption.Fast]: baseAmount(Math.ceil(feeRates[FeeOption.Fast]), nativeDecimals),
        [FeeOption.Fastest]: baseAmount(Math.ceil(feeRates[FeeOption.Fastest]), nativeDecimals),
      }
    }
    throw Error(`getFeeRates method not supported in ${chain} chain`)
  }

  public async estimateTransferFees(
    params: UtxoTxParams | EvmTxParams | CosmosTxParams | RadixTxParams,
  ): Promise<Fees> {
    const client = this.getClient(params.asset.chain)
    if (this.isEvmClient(client)) {
      if (!this.isEvmTxParams(params)) throw Error(`Invalid params for estimating ${params.asset.chain} transfer`)
      return client.getFees(params)
    }
    if (this.isUtxoClient(client)) {
      if (!this.isUtxoTxParams(params)) throw Error(`Invalid params for estimating ${params.asset.chain} transfer`)
      const sender = await client.getAddressAsync(params.walletIndex)
      return client.getFees({ sender, memo: params.memo })
    }
    return client.getFees()
  }

  public async estimateGasLimit({
    asset,
    recipient,
    amount,
    memo,
    from,
    isMemoEncoded,
  }: EvmTxParams & { from?: Address }): Promise<BigNumber> {
    const client = this.getClient(asset.chain)
    if (!this.isEvmClient(client)) {
      throw Error(`estimateGasLimit method not supported in ${asset.chain} chain`)
    }
    return client.estimateGasLimit({
      asset,
      recipient,
      amount,
      memo,
      from,
      isMemoEncoded,
    })
  }

  public async transfer(params: UtxoTxParams | EvmTxParams | CosmosTxParams | RadixTxParams): Promise<string> {
    const client = this.getClient(params.asset.chain)
    if (this.isEvmClient(client)) {
      if (!this.isEvmTxParams(params)) throw Error(`Invalid params for ${params.asset.chain} transfer`)
      return client.transfer({
        walletIndex: params.walletIndex,
        asset: params.asset,
        amount: params.amount,
        recipient: params.recipient,
        memo: params.memo,
        gasPrice: params.gasPrice,
        gasLimit: params.gasLimit,
        isMemoEncoded: params.isMemoEncoded,
      })
    }
    if (this.isUtxoClient(client)) {
      if (!this.isUtxoTxParams(params)) throw Error(`Invalid params for ${params.asset.chain} transfer`)
      return client.transfer({
        walletIndex: params.walletIndex,
        asset: params.asset,
        amount: params.amount,
        recipient: params.recipient,
        memo: params.memo,
        feeRate: params.feeRate ? params.feeRate.amount().toNumber() : undefined,
      })
    }
    if (this.isRadixClient(client)) {
      if (!this.isRadixTxParams(params)) throw Error(`Invalid params for ${params.asset.chain} transfer`)
      return client.transfer({
        walletIndex: params.walletIndex,
        asset: params.asset,
        amount: params.amount,
        recipient: params.recipient,
        memo: params.memo,
        methodToCall: params.methodToCall,
      })
    }
    return client.transfer({
      walletIndex: params.walletIndex,
      asset: params.asset,
      amount: params.amount,
      recipient: params.recipient,
      memo: params.memo,
    })
  }

  public async deposit({
    asset,
    amount,
    memo,
    walletIndex,
    sequence,
    gasLimit,
    chain,
  }: DepositParam & { asset: AnyAsset; chain: Chain }): Promise<string> {
    const client = this.getClient(chain)
    if (!('deposit' in client)) throw Error(`Can not deposit with ${chain} client`)

    return (client as unknown as MayachainClient).deposit({ asset, amount, memo, walletIndex, sequence, gasLimit })
  }

  async approve(asset: TokenAsset, amount: BaseAmount, spenderAddress: string): Promise<string> {
    const client = this.getClient(asset.chain)
    if (!this.isEvmClient(client)) throw Error('Can not make approve over non EVM client')
    if (asset.chain === asset.ticker) throw Error('Can not make approve over native asset')

    const contractAddress = getAddress(getContractAddressFromAsset(asset))

    return await client.approve({ contractAddress, amount, spenderAddress })
  }

  async isApproved(
    asset: TokenAsset,
    amount: BaseAmount,
    fromAddress: string,
    spenderAddress: string,
  ): Promise<boolean> {
    const client = this.getClient(asset.chain)
    if (!this.isEvmClient(client)) throw Error('Can not validate approve over non EVM client')
    if (asset.chain === asset.ticker) throw Error('Can not validate approve over native asset')

    const contractAddress = getAddress(getContractAddressFromAsset(asset))

    return isApproved({
      provider: client.getProvider(),
      amount,
      spenderAddress,
      contractAddress,
      fromAddress,
    })
  }

  public async broadcast(chain: Chain, txHex: string): Promise<TxHash> {
    const client = this.getClient(chain)
    return client.broadcastTx(txHex)
  }

  private getClient(chain: Chain): XChainClient {
    const client = this.clients[chain]
    if (!client) throw Error(`Client not found for ${chain} chain`)
    return client
  }

  private isEvmTxParams(params: EvmTxParams | UtxoTxParams | CosmosTxParams | RadixTxParams): params is EvmTxParams {
    return !('feeRate' in params)
  }

  private isUtxoTxParams(params: EvmTxParams | UtxoTxParams | CosmosTxParams | RadixTxParams): params is UtxoTxParams {
    return !('gasPrice' in params)
  }

  private isRadixTxParams(
    params: EvmTxParams | UtxoTxParams | CosmosTxParams | RadixTxParams,
  ): params is RadixTxParams {
    return !this.isEvmTxParams(params) && !this.isUtxoTxParams(params)
  }

  // TEMPORAL APPROACH UNTIL A NEW ONE
  private isEvmClient(client: XChainClient): client is EvmClient {
    return 'estimateGasPrices' in client
  }

  // TEMPORAL APPROACH UNTIL A NEW ONE
  private isUtxoClient(client: XChainClient): client is UtxoClient {
    return 'getFeeRates' in client
  }

  // TEMPORAL APPROACH UNTIL A NEW ONE
  private isRadixClient(client: XChainClient): client is RadixClient {
    return 'radixClient' in client
  }
}
