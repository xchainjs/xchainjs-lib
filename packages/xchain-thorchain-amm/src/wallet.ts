import { Client as AvaxClient, defaultAvaxParams } from '@xchainjs/xchain-avax'
import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { Balance, FeeOption, Network, XChainClient } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient } from '@xchainjs/xchain-doge'
import { Client as EthClient } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { Client as TerraClient } from '@xchainjs/xchain-terra'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { AssetBTC, Chain, assetToString, eqAsset } from '@xchainjs/xchain-util'

import { ThorchainCache } from './thorchain-cache'
import { ExecuteLP, ExecuteSwap, SwapSubmitted, TxSubmitted } from './types'
import { EthHelper } from './utils/eth-helper'
import { EvmHelper } from './utils/evm-helper'

type AllBalances = {
  chain: Chain
  address: string
  balances: Balance[] | string
}
const chainIds = {
  [Network.Mainnet]: 'thorchain-mainnet-v1',
  [Network.Stagenet]: 'chain-id-stagenet',
  [Network.Testnet]: 'thorchain-testnet-v2',
}

/**
 * Wallet Class for managing all xchain-* wallets with a mnemonic seed.
 */
export class Wallet {
  private thorchainCache: ThorchainCache
  clients: Record<string, XChainClient>
  private ethHelper: EthHelper

  /**
   * Contructor to create a Wallet
   *
   * @param network - stagenet,testnet,mainnet
   * @param phrase - mnemonic phrase
   * @returns Wallet
   */
  constructor(phrase: string, thorchainCache: ThorchainCache) {
    this.thorchainCache = thorchainCache

    const settings = { network: thorchainCache.midgard.network, phrase }
    this.clients = {
      BCH: new BchClient(settings),
      BTC: new BtcClient(settings),
      DOGE: new DogeClient(settings),
      TERRA: new TerraClient(settings),
      ETH: new EthClient(settings),
      THOR: new ThorClient({ ...settings, chainIds }),
      LTC: new LtcClient(settings),
      BNB: new BnbClient(settings),
      GAIA: new CosmosClient(settings),
      AVAX: new AvaxClient({ ...defaultAvaxParams, network: settings.network, phrase }),
    }
    this.ethHelper = new EthHelper(this.clients.ETH, this.thorchainCache)
  }

  /**
   * Fetch balances for all wallets
   *
   * @returns AllBalances[]
   */
  async getAllBalances(): Promise<AllBalances[]> {
    const clientArray = Object.entries(this.clients)
    const allBalances = await Promise.all(
      clientArray.map(async (entry) => {
        const chain = entry[0] as Chain
        const address = entry[1].getAddress(0)
        try {
          const balances = await entry[1].getBalance(address)
          return { chain, address, balances }
        } catch (err) {
          return { chain, address, balances: (err as Error).message }
        }
      }),
    )
    return allBalances
  }

  /**
   * Executes a Swap from THORChainAMM.doSwap()
   *
   * @param swap object with all the required details for a swap.
   * @returns transaction details and explorer url
   * @see ThorchainAMM.doSwap()
   */
  async executeSwap(swap: ExecuteSwap): Promise<SwapSubmitted> {
    this.validateSwap(swap)
    if (swap.input.asset.chain === Chain.THORChain || swap.input.asset.synth) {
      return await this.swapRuneTo(swap)
    } else {
      return await this.swapNonRune(swap)
    }
  }
  private constructSwapMemo(swap: ExecuteSwap): string {
    const limstring = swap.limit.amount().toFixed()

    // create LIM with interface ID
    const lim = limstring.substring(0, limstring.length - 3).concat(swap.interfaceID.toString())
    // create the full memo
    let memo = `=:${assetToString(swap.destinationAsset)}`

    if (swap.affiliateAddress != '' || swap.affiliateFee == undefined) {
      memo = memo.concat(
        `:${swap.destinationAddress}:${lim}:${swap.affiliateAddress}:${swap.affiliateFee.amount().toFixed()}`,
      )
    } else {
      memo = memo.concat(`:${swap.destinationAddress}:${lim}`)
    }

    // If memo length is too long for BTC, trim it
    if (eqAsset(swap.input.asset, AssetBTC) && memo.length > 80) {
      memo = `=:${assetToString(swap.destinationAsset)}:${swap.destinationAddress}`
    }
    return memo
  }
  private validateSwap(swap: ExecuteSwap) {
    const errors: string[] = []
    const isThorchainDestinationAsset = swap.destinationAsset.synth || swap.destinationAsset.chain === Chain.THORChain
    const chain = isThorchainDestinationAsset ? Chain.THORChain : swap.destinationAsset.chain

    if (!this.clients[chain].validateAddress(swap.destinationAddress)) {
      errors.push(`destinationAddress ${swap.destinationAddress} is not a valid address`)
    }
    if (swap.affiliateAddress && !this.clients[Chain.THORChain].validateAddress(swap.affiliateAddress))
      errors.push(`affiliateAddress ${swap.affiliateAddress} is not a valid address`)

    if (errors.length > 0) throw Error(errors.join('\n'))
  }

  private async swapRuneTo(swap: ExecuteSwap): Promise<SwapSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    const waitTimeSeconds = swap.waitTimeSeconds
    const hash = await thorClient.deposit({
      amount: swap.input.baseAmount,
      asset: swap.input.asset,
      memo: this.constructSwapMemo(swap),
    })
    return { hash, url: this.clients.THOR.getExplorerTxUrl(hash), waitTimeSeconds }
  }

  private async swapNonRune(swap: ExecuteSwap): Promise<SwapSubmitted> {
    const client = this.clients[swap.input.asset.chain]
    const waitTimeSeconds = swap.waitTimeSeconds
    const inboundAsgard = (await this.thorchainCache.getInboundAddressesItems())[swap.input.asset.chain]

    if (swap.input.asset.chain === Chain.Ethereum) {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: this.constructSwapMemo(swap),
      }
      const hash = await this.ethHelper.sendDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (swap.input.asset.chain === Chain.Avalanche) {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: this.constructSwapMemo(swap),
      }
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainCache)
      const hash = await evmHelper.sendDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const params = {
        walletIndex: 0,
        asset: swap.input.asset,
        amount: swap.input.baseAmount,
        recipient: inboundAsgard?.address || '', //TODO fix this
        memo: this.constructSwapMemo(swap),
      }

      const hash = await client.transfer(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    }
  }
  /**
   *
   * @param params input parameters needed to add liquidity
   * @returns transaction details submitted
   */
  async addLiquidity(params: ExecuteLP): Promise<TxSubmitted[]> {
    const assetClient = this.clients[params.asset.asset.chain]
    const inboundAsgard = (await this.thorchainCache.getInboundAddressesItems())[params.asset.asset.chain].address
    const thorchainClient = this.clients[params.asset.asset.chain]
    const addressRune = thorchainClient.getAddress()
    const waitTimeSeconds = params.waitTimeSeconds
    let constructedMemo = ''
    const txSubmitted: TxSubmitted[] = []
    // Do we need to check to see if its 50/50 for sym add?
    // symmetrical add
    if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.gt(0)) {
      constructedMemo = `${params.action}:${params.asset.asset.chain}.${params.rune.asset.symbol}:${addressRune}`
      txSubmitted.push(await this.addAssetLP(params, constructedMemo, waitTimeSeconds, assetClient, inboundAsgard))
      txSubmitted.push(await this.addRuneLP(params, constructedMemo, inboundAsgard, thorchainClient, waitTimeSeconds))
      return txSubmitted
    } else if (params.asset.assetAmount.gt(0) && params.rune.assetAmount.eq(0)) {
      // asymmetrical asset only
      constructedMemo = `${params.action}:${params.asset.asset.chain}.${params.asset.asset.symbol}:`
      txSubmitted.push(await this.addAssetLP(params, constructedMemo, waitTimeSeconds, assetClient, inboundAsgard))
      return txSubmitted
    } else {
      // asymmetrical rune only
      constructedMemo = `${params.action}:${params.asset.asset.chain}.${params.asset.asset.symbol}:`
      txSubmitted.push(await this.addRuneLP(params, constructedMemo, inboundAsgard, thorchainClient, waitTimeSeconds))
      return txSubmitted
    }
  }

  /**
   *
   * @param params - parameters for the liquidity add
   * @param constructedMemo - memo needed for thorchain
   * @param waitTimeSeconds - wait time for the tx to be confirmed
   * @param assetClient - passing XchainClient
   * @param inboundAsgard - inbound Asgard address for the LP
   * @returns
   */
  private async addAssetLP(
    params: ExecuteLP,
    constructedMemo: string,
    waitTimeSeconds: number,
    assetClient: XChainClient,
    inboundAsgard: string,
  ): Promise<TxSubmitted> {
    if (params.asset.asset.chain === Chain.Ethereum) {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      console.log(addParams, waitTimeSeconds)
      const hash = await this.ethHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else if (params.asset.asset.chain === Chain.Avalanche) {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        feeOption: FeeOption.Fast,
        memo: constructedMemo,
      }
      console.log(addParams.amount.amount(), waitTimeSeconds)
      const evmHelper = new EvmHelper(this.clients.AVAX, this.thorchainCache)
      const hash = await evmHelper.sendDeposit(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const addParams = {
        wallIndex: 0,
        asset: params.asset.asset,
        amount: params.asset.baseAmount,
        recipient: inboundAsgard,
        memo: constructedMemo,
      }
      console.log(addParams, waitTimeSeconds)
      const hash = await assetClient.transfer(addParams)
      return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
    }
  }

  /**
   *
   * @param params
   * @param memo
   * @param inboundAsgard
   * @returns
   */
  private async addRuneLP(
    params: ExecuteLP,
    memo: string,
    inboundAsgard: string,
    thorchainClient: XChainClient,
    waitTimeSeconds: number,
  ): Promise<TxSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    const addParams = {
      wallIndex: 0,
      asset: params.rune.asset,
      amount: params.rune.baseAmount,
      recipient: inboundAsgard,
      memo: memo,
    }
    console.log(addParams, params.waitTimeSeconds)
    const hash = await thorClient.deposit(addParams)
    return { hash, url: thorchainClient.getExplorerTxUrl(hash), waitTimeSeconds }
  }

  // /**
  //  *
  //  * @param params - parameters required for liquidity position
  //  * @returns object with tx response, url and wait time in seconds
  //  */
  // async removeLiquidity(params: ExecuteLP): Promise<SwapSubmitted> {
  //   const assetClient = this.clients[params.asset.asset.chain]
  //   const runeClient = this.clients[params.asset.asset.chain]
  //   const addressRune = runeClient.getAddress()
  //   //const addressAsset = assetClient.getAddress()
  //   const inboundAsgard = (await this.thorchainCache.getInboundAddressesItems())[params.asset.asset.chain]
  //   const waitTimeSeconds = params.waitTimeSeconds
  //   const memo = await this.constructLPMemo(params, addressRune)
  //   const addParams = {
  //     wallIndex: 0,
  //     asset: params.asset.asset,
  //     amount: params.asset.assetAmount,
  //     recipient: inboundAsgard.address,
  //     memo: memo,
  //   }
  //   const hash = await assetClient.transfer(addParams)
  //   return { hash, url: assetClient.getExplorerTxUrl(hash), waitTimeSeconds }
  // }
}
