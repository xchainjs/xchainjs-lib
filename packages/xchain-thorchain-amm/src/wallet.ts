import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { Address, Balance, FeeOption, Network, TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient } from '@xchainjs/xchain-doge'
import {
  ApproveParams,
  Client as EthClient,
  ETH_DECIMAL,
  EthereumClient,
  MAX_APPROVAL,
} from '@xchainjs/xchain-ethereum'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { InboundAddressesItem } from '@xchainjs/xchain-midgard/src/generated/midgardApi'
import { Client as TerraClient } from '@xchainjs/xchain-terra'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Asset, AssetBTC, AssetETH, BaseAmount, Chain, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import routerABI from './abi/routerABI.json'
import { DepositParams, ExecuteSwap, SwapSubmitted } from './types'
import { Midgard } from './utils/midgard'
import { calcNetworkFee, getContractAddressFromAsset } from './utils/swap'

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
const APPROVE_GASLIMIT_FALLBACK = '200000'
const ONE_HOUR = 60 * 60 * 1000
/**
 * Wallet Class for managing all xchain-* wallets with a mnemonic seed.
 */
export class Wallet {
  private network: Network
  clients: Record<string, XChainClient>
  private asgardAssets: InboundAddressesItem[] | undefined = undefined
  private midgard: Midgard

  /**
   * Contructor to create a Wallet
   *
   * @param network - stagenet,testnet,mainnet
   * @param phrase - mnemonic phrase
   * @returns Wallet
   */
  constructor(network: Network, phrase: string) {
    this.network = network
    const settings = { network, phrase }
    this.midgard = new Midgard(this.network)
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
    }
    this.updateAsgardAddresses(ONE_HOUR)
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
    if (swap.sourceAsset.chain === Chain.THORChain || swap.sourceAsset.synth) {
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

    // needs to be tested
    if (swap.affiliateAddress != '' || swap.affiliateFee == undefined) {
      memo = memo.concat(
        `:${swap.destinationAddress}:${lim}:${swap.affiliateAddress}:${swap.affiliateFee.amount().toFixed()}`,
      )
    } else {
      memo = memo.concat(`:${swap.destinationAddress}:${lim}`)
    }

    // If memo length is too long for BTC, trim it
    if (eqAsset(swap.sourceAsset, AssetBTC) && memo.length > 80) {
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
      amount: swap.fromBaseAmount,
      asset: swap.sourceAsset,
      memo: this.constructSwapMemo(swap),
    })
    return { hash, url: this.clients.THOR.getExplorerTxUrl(hash), waitTimeSeconds }
  }

  private async swapNonRune(swap: ExecuteSwap): Promise<SwapSubmitted> {
    const client = this.clients[swap.sourceAsset.chain]
    const waitTimeSeconds = swap.waitTimeSeconds
    const inboundAsgard = (await this.getAsgardAssets()).find((item: InboundAddressesItem) => {
      return item.chain === swap.sourceAsset.chain
    })
    if (swap.sourceAsset.chain === Chain.Ethereum) {
      const params = {
        walletIndex: 0,
        asset: swap.sourceAsset,
        amount: swap.fromBaseAmount,
        feeOption: swap.feeOption || FeeOption.Fast,
        memo: this.constructSwapMemo(swap),
      }
      const hash = await this.sendETHDeposit(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    } else {
      const params = {
        walletIndex: 0,
        asset: swap.sourceAsset,
        amount: swap.fromBaseAmount,
        recipient: inboundAsgard?.address || '', //TODO fix this
        memo: this.constructSwapMemo(swap),
      }

      const hash = await client.transfer(params)
      return { hash, url: client.getExplorerTxUrl(hash), waitTimeSeconds }
    }
  }

  private async updateAsgardAddresses(checkTimeMs: number) {
    try {
      this.asgardAssets = await this.midgard.getAllInboundAddresses()
    } catch (error) {
      console.error(error)
    }
    setTimeout(this.updateAsgardAddresses.bind(this), checkTimeMs)
  }
  /**
   * Transaction to THORChain inbound address.
   *
   * @param {DepositParams} params The transaction options.
   * @returns {TxHash} The transaction hash.
   *
   * @throws {"halted chain"} Thrown if chain is halted.
   * @throws {"halted trading"} Thrown if trading is halted.
   * @throws {"amount is not approved"} Thrown if the amount is not allowed to spend
   * @throws {"router address is not defined"} Thrown if router address is not defined
   */
  async sendETHDeposit(params: DepositParams): Promise<TxHash> {
    const ethClient = (this.clients.ETH as unknown) as EthereumClient
    const inboundAsgard = (await this.getAsgardAssets()).find((item: InboundAddressesItem) => {
      return item.chain === params.asset.chain
    })

    if (!inboundAsgard?.router) {
      throw new Error('router address is not defined')
    }

    const address = this.clients.ETH.getAddress(params.walletIndex)
    const gasPrice = await ethClient.estimateGasPrices()

    if (eqAsset(params.asset, AssetETH)) {
      //ETH is a simple transfer
      return await this.clients.ETH.transfer({
        walletIndex: params.walletIndex || 0,
        asset: params.asset,
        amount: params.amount,
        recipient: inboundAsgard.address,
        memo: params.memo,
      })
    } else {
      //erc-20 must be depsited to the router
      const isApprovedResult = await this.isTCRouterApprovedToSpend(params.asset, params.amount, params.walletIndex)
      if (!isApprovedResult) {
        throw new Error('The amount is not allowed to spend')
      }
      const contractAddress = getContractAddressFromAsset(params.asset)
      const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
      const depositParams = [
        inboundAsgard.address,
        checkSummedContractAddress,
        params.amount.amount().toFixed(),
        params.memo,
      ]

      const routerContract = new ethers.Contract(inboundAsgard.router, routerABI)
      const gasPriceInWei = gasPrice[params.feeOption]
      const gasPriceInGwei = gasPriceInWei.div(10 ** 9).amount()

      // TODO should we change the calcInboundFee() to use gasRate in BaseAmount instead of BIgNumber?
      // currently its hardto know the units to use, GWEI/WEI, etc
      const gasLimitInWei = calcNetworkFee(params.asset, gasPriceInGwei)
      const gasLimitInGWei = gasLimitInWei
        .div(10 ** 9)
        .baseAmount.amount()
        .toFixed()

      const unsignedTx = await routerContract.populateTransaction.deposit(...depositParams, {
        from: address,
        value: 0,
        gasPrice: gasPrice.fast.amount().toFixed(),
        gasLimit: gasLimitInGWei,
      })
      const { hash } = await ethClient.getWallet(params.walletIndex).sendTransaction(unsignedTx)
      return hash
    }
  }
  async isTCRouterApprovedToSpend(asset: Asset, amount: BaseAmount, walletIndex = 0): Promise<boolean> {
    const ethClient = (this.clients.ETH as unknown) as EthereumClient

    const router = await this.getRouterAddressForChain(asset.chain)
    const contractAddress = getContractAddressFromAsset(asset)
    return await ethClient.isApproved({
      amount: amount,
      spenderAddress: router,
      contractAddress,
      walletIndex: walletIndex,
    })
  }
  async approveTCRouterToSpend(
    asset: Asset,
    amount = MAX_APPROVAL,
    walletIndex = 0,
  ): Promise<ethers.providers.TransactionResponse> {
    const ethClient = (this.clients.ETH as unknown) as EthereumClient

    const contractAddress = getContractAddressFromAsset(asset)
    const router = await this.getRouterAddressForChain(asset.chain)
    // const gasPrice = await ethClient.estimateGasPrices()
    // const gasLimit = calcInboundFee(asset, gasPrice.fast.amount())
    const approveParams: ApproveParams = {
      contractAddress,
      spenderAddress: router,
      amount: baseAmount(amount.toString(), ETH_DECIMAL),
      walletIndex,
      gasLimitFallback: APPROVE_GASLIMIT_FALLBACK,
    }
    return await ethClient.approve(approveParams)
  }

  private async getRouterAddressForChain(chain: Chain): Promise<Address> {
    const inboundAsgard = (await this.getAsgardAssets()).find((item: InboundAddressesItem) => {
      return item.chain === chain
    })

    if (!inboundAsgard?.router) {
      throw new Error('router address is not defined')
    }
    return inboundAsgard?.router
  }
  async getAsgardAssets(): Promise<InboundAddressesItem[]> {
    if (!this.asgardAssets) {
      this.asgardAssets = await this.midgard.getAllInboundAddresses()
    }
    return this.asgardAssets
  }
}
