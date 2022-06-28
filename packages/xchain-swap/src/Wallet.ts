import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { Balance, Network, TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Client as CosmosClient } from '@xchainjs/xchain-cosmos'
import { Client as DogeClient } from '@xchainjs/xchain-doge'
import { Client as EthClient, EthereumClient } from '@xchainjs/xchain-ethereum'
import { ETHAddress, strip0x } from '@xchainjs/xchain-ethereum/src'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { InboundAddressesItem } from '@xchainjs/xchain-midgard/src/generated/midgardApi'
import { Client as TerraClient } from '@xchainjs/xchain-terra'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import {
  AssetBTC,
  AssetETH,
  AssetRuneNative,
  Chain,
  assetToString,
  baseAmount,
  eqAsset,
  eqChain,
} from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import routerABI from './abi/routerABI.json'
import { DepositParams, ExecuteSwap, SwapSubmitted } from './types'
import { Midgard } from './utils/midgard'

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

export class Wallet {
  private network: Network
  clients: Record<string, XChainClient>
  private asgardAssets: InboundAddressesItem[] = []
  private midgard: Midgard

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

    this.updateAsgardAddresses(60 * 1000)
  }

  async getAllBalances(): Promise<AllBalances[]> {
    const clientArray = Object.entries(this.clients)
    const allBalances = await Promise.all(
      clientArray.map(async (entry) => {
        const chain = entry[0] as Chain
        const address = entry[1].getAddress(0)
        try {
          const balances = await entry[1].getBalance(address)
          return { chain, address, balances }
        } catch (error: any) {
          return { chain, address, balances: error.message }
        }
      }),
    )
    return allBalances
  }
  // /**
  //  * Executes a Swap from THORChainAMM.doSwap()
  //  *
  //  * @param swap object with all the required details for a swap.
  //  * @returns transaction details and explorer url
  //  * @see ThorchainAMM.doSwap()
  //  */
  // async executeSwap(swap: ExecuteSwap): Promise<SwapSubmitted> {
  //   if (swap.sourceAsset.chain === Chain.THORChain) {
  //     return await this.swapRuneTo(swap)
  //   } else {
  //     return await this.swapNonRune(swap)
  //   }
  // }

  /**
   * Executes a Swap from THORChainAMM.doSwap()
   *
   * @param swap object with all the required details for a swap.
   * @returns transaction details and explorer url
   * @see ThorchainAMM.doSwap()
   */
  async executeSwap(swap: ExecuteSwap): Promise<SwapSubmitted> {
    this.validateSwap(swap)
    if (swap.sourceAsset.chain === Chain.THORChain) {
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
    let memo = `=:${swap.destinationAsset.chain}.${swap.destinationAsset.symbol}`
    // If synth construct a synth memo
    if (swap.destinationAsset.synth && eqChain(swap.destinationAsset.chain, Chain.THORChain)) {
      memo = `=:${swap.destinationAsset.chain}/${swap.destinationAsset.symbol}`
    }
    memo = memo.concat(
      `:${swap.destinationAddress}:${lim}:${swap.affiliateAddress}:${swap.affiliateFee.amount().toFixed()}`,
    )
    // If memo length is too long for BTC, trim it
    if (eqAsset(swap.sourceAsset, AssetBTC) && memo.length > 80) {
      memo = `:${swap.destinationAsset.chain}.${swap.destinationAsset.symbol}`
      // If swapping to a synth
      if (swap.destinationAsset.synth && eqChain(swap.destinationAsset.chain, Chain.THORChain)) {
        memo = `=:${swap.destinationAsset.chain}/${swap.destinationAsset.symbol}`
      }
      memo = memo.concat(`:${swap.destinationAddress}`)
    }
    return memo
  }
  private validateSwap(swap: ExecuteSwap) {
    const errors: string[] = []

    if (!this.clients[swap.destinationAsset.chain].validateAddress(swap.destinationAddress))
      errors.push(`${swap.destinationAddress} is not a valid address`)

    if (swap.affiliateAddress?.length > 0 && !this.clients['THOR'].validateAddress(swap.affiliateAddress))
      errors.push(`${swap.affiliateAddress} is not a valid address`)

    if (errors.length > 0) throw Error(errors.join('\n'))
  }

  private async swapRuneTo(swap: ExecuteSwap): Promise<SwapSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    const hash = await thorClient.deposit({
      amount: swap.fromBaseAmount,
      asset: AssetRuneNative,
      memo: this.constructSwapMemo(swap),
    })
    return { hash, url: this.clients.THOR.getExplorerTxUrl(hash) }
  }

  private async swapNonRune(swap: ExecuteSwap): Promise<SwapSubmitted> {
    const client = this.clients[swap.sourceAsset.chain]
    const inboundAsgard = this.asgardAssets.find((item: InboundAddressesItem) => {
      return item.chain === swap.sourceAsset.chain
    })
    // ==============
    //TODO we need to check router approve before we can handle eth swaps
    if (inboundAsgard?.router) throw new Error('TBD implment eth')
    // ==============
    const params = {
      walletIndex: 0,
      asset: swap.sourceAsset,
      amount: swap.fromBaseAmount,
      recipient: inboundAsgard?.address || '',
      memo: this.constructSwapMemo(swap),
    }

    // console.log(JSON.stringify(params, null, 2))
    const hash = await client.transfer(params)
    return { hash, url: client.getExplorerTxUrl(hash) }
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
  async sendETHDeposit({ walletIndex = 0, asset = AssetETH, amount, memo }: DepositParams): Promise<TxHash> {
    const ethClient = (this.clients.ETH as unknown) as EthereumClient
    const { haltedChain, haltedTrading, router, vault } = (await this.midgard.getInboundDetails([asset.chain]))[0]

    if (haltedChain) {
      throw new Error(`Halted chain for ${assetToString(asset)}`)
    }
    if (haltedTrading) {
      throw new Error(`Halted trading for ${assetToString(asset)}`)
    }
    if (!router) {
      throw new Error('router address is not defined')
    }
    if (asset.chain !== Chain.Ethereum) {
      throw new Error('must be an ethereum asset')
    }

    const address = this.clients.ETH.getAddress(walletIndex)
    const gasPrice = await ethClient.estimateGasPrices()

    if (asset.ticker.toUpperCase() === 'ETH') {
      const contract = new ethers.Contract(router, routerABI)
      const unsignedTx = await contract.populateTransaction.deposit(
        vault,
        ETHAddress,
        amount.amount().toFixed(),
        memo,
        {
          from: address,
          value: 0,
          gasPrice: gasPrice.fast.amount().toFixed(),
        },
      )
      const response = await ethClient.getWallet(walletIndex).sendTransaction(unsignedTx)
      return typeof response === 'string' ? response : response.hash
    } else {
      const assetAddress = asset.symbol.slice(asset.ticker.length + 1)
      const contractAddress = strip0x(assetAddress)
      const isApprovedResult = await ethClient.isApproved({
        amount: baseAmount(amount.amount()),
        spenderAddress: router,
        contractAddress,
        walletIndex,
      })

      if (!isApprovedResult) {
        throw new Error('The amount is not allowed to spend')
      }

      const checkSummedContractAddress = ethers.utils.getAddress(contractAddress)
      const params = [vault, checkSummedContractAddress, amount.amount().toFixed(), memo]
      const vaultContract = new ethers.Contract(router, routerABI)
      const unsignedTx = await vaultContract.populateTransaction.deposit(...params, {
        from: address,
        value: 0,
        gasPrice: gasPrice.fast.amount().toFixed(),
      })
      const { hash } = await ethClient.getWallet(walletIndex).sendTransaction(unsignedTx)
      return hash
    }
  }
}
