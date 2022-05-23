import { Client as BnbClient } from '@xchainjs/xchain-binance'
import { Client as BtcClient } from '@xchainjs/xchain-bitcoin'
import { Client as BchClient } from '@xchainjs/xchain-bitcoincash'
import { Balance, Network, XChainClient } from '@xchainjs/xchain-client'
import { Client as DogeClient } from '@xchainjs/xchain-doge'
import { Client as EthClient } from '@xchainjs/xchain-ethereum'
import { Client as LtcClient } from '@xchainjs/xchain-litecoin'
import { Configuration, MIDGARD_API_TS_URL, MidgardApi } from '@xchainjs/xchain-midgard'
import { InboundAddressesItem } from '@xchainjs/xchain-midgard/src/generated/midgardApi'
import { Client as TerraClient } from '@xchainjs/xchain-terra'
import { Client as ThorClient, ThorchainClient } from '@xchainjs/xchain-thorchain'
import { Asset, AssetRuneNative, BaseAmount, Chain, assetToString } from '@xchainjs/xchain-util'

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
  clients: Record<string, XChainClient>
  private asgardAssets: InboundAddressesItem[] = []
  private midgardApi: MidgardApi

  constructor(network: Network, phrase: string) {
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
}
