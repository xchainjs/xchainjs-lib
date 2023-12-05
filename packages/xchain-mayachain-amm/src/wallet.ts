import { BTCChain, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network, TxParams, UtxoClientParams, XChainClient, XChainClientParams } from '@xchainjs/xchain-client'
import { CosmosSdkClientParams } from '@xchainjs/xchain-cosmos-sdk'
import { Client as DashClient, DASHChain, defaultDashParams } from '@xchainjs/xchain-dash'
import { AssetETH, Client as EthClient, ETHChain, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as EvmClient, EVMClientParams, GasPrices, isApproved } from '@xchainjs/xchain-evm'
import { Client as KujiraClient, KUJIChain, defaultKujiParams } from '@xchainjs/xchain-kujira'
import {
  AssetCacao,
  Client as MayaClient,
  DepositParam,
  MAYAChain,
  MayachainClient,
  MayachainClientParams,
} from '@xchainjs/xchain-mayachain'
import { Client as ThorClient, THORChain, ThorchainClientParams } from '@xchainjs/xchain-thorchain'
import { Asset, BaseAmount, Chain, assetToString, getContractAddressFromAsset } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import { ChainBalances } from './types'

export type NodeUrls = Record<Network, string>
export type ChainConfigs = Partial<{
  [BTCChain]: Partial<Omit<UtxoClientParams, 'phrase' | 'network'>>
  [ETHChain]: Partial<Omit<EVMClientParams, 'phrase' | 'network'>>
  [DASHChain]: Partial<Omit<UtxoClientParams, 'phrase' | 'network'>>
  [KUJIChain]: Partial<Omit<CosmosSdkClientParams, 'phrase' | 'network'>>
  [THORChain]: Omit<XChainClientParams & ThorchainClientParams, 'phrase' | 'network'>
  [MAYAChain]: Omit<XChainClientParams & MayachainClientParams, 'phrase' | 'network'>
}>
/**
 * Wallet Class for managing all xchain-* wallets with a mnemonic seed.
 */
export class Wallet {
  clients: Record<string, XChainClient>
  /**
   * Constructor to create a Wallet
   *
   * @param phrase - mnemonic phrase
   * @param thorchainCache - an instance of the ThorchainCache (could be pointing to stagenet,testnet,mainnet)
   * @param chainConfigs - Config by chain
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
   * Fetch balances for all wallets
   *
   * @returns AllBalances[]
   */
  async getAllBalances(): Promise<ChainBalances[]> {
    const allBalances: ChainBalances[] = []

    for (const [chain, client] of Object.entries(this.clients)) {
      const address = await client.getAddressAsync(0)
      try {
        const balances = await client.getBalance(address)
        allBalances.push({ chain, address, balances })
      } catch (err) {
        allBalances.push({ chain, address, balances: [], error: (err as Error).message })
      }
    }
    return allBalances
  }

  async deposit({ asset = AssetCacao, amount, memo }: DepositParam): Promise<string> {
    const client = this.getChainClient(asset.chain)
    if (!('deposit' in client)) throw Error(`Can not deposit with ${asset.chain} client`)

    return (client as unknown as MayachainClient).deposit({ asset, amount, memo })
  }

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

  public validateAddress(chain: Chain, address: string): boolean {
    const client = this.getChainClient(chain)
    return client.validateAddress(address)
  }

  async getAddress(chain: Chain): Promise<string> {
    const client = this.getChainClient(chain)
    return client.getAddressAsync()
  }

  async getExplorerTxUrl(chain: Chain, hash: string): Promise<string> {
    const client = this.getChainClient(chain)
    return client.getExplorerTxUrl(hash)
  }

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

  async getGasFeeRates(chain: Chain): Promise<GasPrices> {
    const client = this.getChainClient(chain)
    if (!('getWallet' in client)) throw Error(`Can not deposit with ${chain} client`)
    return (client as EvmClient).estimateGasPrices()
  }

  public getChainWallet(chain: Chain): ethers.Wallet {
    const client = this.getChainClient(chain)
    if (!('getWallet' in client)) throw Error(`Can not deposit with ${chain} client`)
    return (client as EvmClient).getWallet()
  }

  private getChainClient(chain: Chain): XChainClient {
    const client = this.clients[chain]
    if (!client) throw Error(`Client not found for ${chain} chain`)

    return client
  }

  public isERC20Asset(asset: Asset): boolean {
    const isGasAsset = [AssetETH.symbol].includes(asset.symbol)
    return this.isEVMChain(asset) && !isGasAsset
  }

  public isEVMChain(asset: Asset): boolean {
    return [AssetETH.chain].includes(asset.chain)
  }
}
