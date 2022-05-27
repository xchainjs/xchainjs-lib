import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { Balance, Network, TxHash, XChainClient } from '@xchainjs/xchain-client'
import { Client as DogeClient } from '@xchainjs/xchain-doge'
import { Client as EthClient, EthereumClient } from '@xchainjs/xchain-ethereum'
import { ETHAddress, strip0x } from '@xchainjs/xchain-ethereum/src'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { Configuration, MIDGARD_API_TS_URL, MidgardApi } from '@xchainjs/xchain-midgard'
import { InboundAddressesItem } from '@xchainjs/xchain-midgard/src/generated/midgardApi'
import { Client as TerraClient } from '@xchainjs/xchain-terra'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Asset, AssetETH, AssetRuneNative, BaseAmount, Chain, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { ethers } from 'ethers'

import routerABI from './abi/routerABI.json'
import { DepositParams } from './types'
import { getInboundDetails } from './utils/midgard'

export type Swap = {
  fromBaseAmount: BaseAmount
  from: Asset
  to: Asset
  limit: BaseAmount | undefined
}
export type SwapSubmitted = {
  hash: string
  url: string
}
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
  private midgardApi: MidgardApi

  constructor(network: Network, phrase: string) {
    this.network = network
    const settings = { network, phrase }
    this.midgardApi = new MidgardApi(new Configuration({ basePath: MIDGARD_API_TS_URL }))
    this.clients = {
      BCH: new BchClient(settings),
      BTC: new BtcClient(settings),
      DOGE: new DogeClient(settings),
      TERRA: new TerraClient(settings),
      ETH: new EthClient(settings),
      THOR: new ThorClient({ ...settings, chainIds }),
      LTC: new LtcClient(settings),
      BNB: new BnbClient(settings),
      // GAIA: new CosmosClient(settings), //FAKE for now
      // POLKA: new PolkadotClient(settings), //FAKE for now
    }

    this.updateAsgardAddresses(60 * 1000)
  }
  private async updateAsgardAddresses(checkTimeMs: number) {
    try {
      this.asgardAssets = await (await this.midgardApi.getProxiedInboundAddresses()).data
    } catch (error) {
      console.error(error)
    }
    setTimeout(this.updateAsgardAddresses.bind(this), checkTimeMs)
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
  async swap(swap: Swap): Promise<SwapSubmitted> {
    if (swap.from.chain === Chain.THORChain) {
      return await this.swapRuneTo(swap)
    } else {
      return await this.swapNonRune(swap)
    }
  }

  private async swapRuneTo(swap: Swap): Promise<SwapSubmitted> {
    const thorClient = (this.clients.THOR as unknown) as ThorchainClient
    let memo = `=:${assetToString(swap.to)}:${await this.clients[swap.to.chain].getAddress()}`
    if (swap.limit) {
      memo = memo + `:${swap.limit.amount().toFixed()}`
    }
    const hash = await thorClient.deposit({
      amount: swap.fromBaseAmount,
      asset: AssetRuneNative,
      memo,
    })

    return { hash, url: this.clients.THOR.getExplorerTxUrl(hash) }
  }
  private async swapNonRune(swap: Swap): Promise<SwapSubmitted> {
    const client = this.clients[swap.from.chain]
    let memo = `=:${assetToString(swap.to)}:${await this.clients[swap.to.chain].getAddress()}`
    if (swap.limit) {
      memo = memo + `:${swap.limit.amount().toFixed()}`
    }
    const inboundAsgard = this.asgardAssets.find((item: InboundAddressesItem) => {
      return item.chain === swap.from.chain
    })
    // ==============
    //TODO we need to check router approve before we can handle eth swaps
    if (inboundAsgard?.router) throw new Error('TBD implment eth')
    // ==============
    const params = {
      walletIndex: 0,
      asset: swap.from,
      amount: swap.fromBaseAmount,
      recipient: inboundAsgard?.address || '',
      memo: memo,
    }

    // console.log(JSON.stringify(params, null, 2))
    const hash = await client.transfer(params)
    return { hash, url: client.getExplorerTxUrl(hash) }
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
    const { haltedChain, haltedTrading, router, vault } = await getInboundDetails(asset.chain, this.network)

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
  //   /**
  //    * Transaction to THORChain inbound address.
  //    *
  //    * @param {DepositParams} params The transaction options.
  //    * @returns {TxHash} The transaction hash.
  //    *
  //    * @throws {"halted chain"} Thrown if chain is halted.
  //    * @throws {"halted trading"} Thrown if trading is halted.
  //    */
  //    async deposit({ walletIndex = 0, asset, amount, memo }: DepositParams): Promise<TxHash> {
  //     const inboundDetails = await getInboundDetails(asset.chain, this.network)

  //     if (inboundDetails.haltedChain) {
  //       throw new Error(`Halted chain for ${assetToString(asset)}`)
  //     }
  //     if (inboundDetails.haltedTrading) {
  //       throw new Error(`Halted trading for ${assetToString(asset)}`)
  //     }
  //     if (asset?.chain === Chain.Ethereum) {
  //       throw new Error('must be an ethereum asset')
  //     }

  //     const txHash = await this.transfer({
  //       walletIndex,
  //       asset,
  //       amount,
  //       recipient: inboundDetails.vault,
  //       memo,
  //     })

  //     return txHash
  //   }
}
