import { fromBase64, fromBech32 } from '@cosmjs/encoding'
import { Coin, GeneratedType, Registry } from '@cosmjs/proto-signing'
import {
  Account,
  Block,
  DeliverTxResponse,
  IndexedTx,
  StargateClient,
  StdFee,
  defaultRegistryTypes,
} from '@cosmjs/stargate'
import {
  AssetInfo,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  TxHistoryParams,
  TxType,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import {
  Address,
  Asset,
  BaseAmount,
  CachedValue,
  Chain,
  assetToString,
  baseAmount,
  eqAsset,
} from '@xchainjs/xchain-util'

import { isAlreadyBroadcastError, roundRobinGetTx, roundRobinTry, tendermintTxHash } from './roundRobin'
import { Balance, CompatibleAsset, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'

export type CosmosSdkClientParams = XChainClientParams & {
  chain: Chain
  clientUrls: Record<Network, string[]>
  prefix: string
  defaultDecimals: number
  defaultFee: BaseAmount
  baseDenom: string
  registryTypes: Iterable<[string, GeneratedType]>
}
export enum MsgTypes {
  TRANSFER = 'transfer',
}

export default abstract class Client extends BaseXChainClient implements XChainClient {
  private readonly defaultFee: BaseAmount
  private txLock: Promise<void> = Promise.resolve() // Serializes sign-and-broadcast operations
  protected stargateClients: CachedValue<StargateClient[]>
  protected prefix: string
  protected readonly defaultDecimals: number
  protected readonly clientUrls: Record<Network, string[]>
  protected readonly baseDenom: string
  protected readonly registry: Registry

  constructor(params: CosmosSdkClientParams) {
    super(params.chain, params)
    this.clientUrls = params.clientUrls
    this.prefix = this.getPrefix(this.getNetwork())
    this.defaultDecimals = params.defaultDecimals
    this.defaultFee = params.defaultFee
    this.baseDenom = params.baseDenom
    this.registry = new Registry([...defaultRegistryTypes, ...params.registryTypes])
    this.stargateClients = new CachedValue<StargateClient[]>(() => {
      return this.connectToClientUrls(this.clientUrls[params.network || Network.Mainnet])
    })
  }
  private async connectClient(clientUrl: string) {
    return StargateClient.connect(clientUrl)
  }

  public setNetwork(network: Network): void {
    super.setNetwork(network)
    this.stargateClients = new CachedValue<StargateClient[]>(() => {
      return this.connectToClientUrls(this.clientUrls[network])
    })
    this.prefix = this.getPrefix(network)
  }

  /** Amount strings are `{amount}{denom}`, e.g. `3000uatom`. */
  private splitAmountAndDenom(amountsAndDenoms: string[]) {
    const amounAndDenomParsed: { amount: string; denom: string }[] = []
    amountsAndDenoms.forEach((amountAndDenom) => {
      const regex = /^(\d+)(.*)$/
      const match = amountAndDenom.match(regex)

      if (match) {
        const amount = match[1]
        const denom = match[2]
        amounAndDenomParsed.push({ amount, denom })
      }
    })
    return amounAndDenomParsed
  }

  private async mapIndexedTxToTx(indexedTx: IndexedTx): Promise<Tx> {
    const mapTo: Map<string, { amount: BaseAmount; asset: CompatibleAsset | undefined; address: Address }> = new Map()
    const mapFrom: Map<string, { amount: BaseAmount; asset: CompatibleAsset | undefined; address: Address }> = new Map()

    // Skip ante handler events (fee processing) by finding the last 'tx' type event
    let txEventIndex = -1
    for (let i = indexedTx.events.length - 1; i >= 0; i--) {
      if (indexedTx.events[i].type === 'tx') {
        txEventIndex = i
        break
      }
    }
    const messageEvents = txEventIndex >= 0 ? indexedTx.events.slice(txEventIndex + 1) : indexedTx.events

    messageEvents.forEach((event) => {
      if (event.type === 'transfer') {
        const keyAmount = event.attributes.find((atribute) => atribute.key === 'amount')
        const keySender = event.attributes.find((atribute) => atribute.key === 'sender')
        const keyRecipient = event.attributes.find((atribute) => atribute.key === 'recipient')

        if (!keyAmount?.value || !keySender?.value || !keyRecipient?.value) {
          console.warn(
            `[mapIndexedTxToTx] Transfer event missing required attributes in tx ${indexedTx.hash}. Skipping.`,
          )
          return
        }

        try {
          const allTokensInEvent = keyAmount.value.split(',') // More than one asset per event (kuji faucet example)
          const amounts = this.splitAmountAndDenom(allTokensInEvent)
          const denomAmountMap: Record<string, BaseAmount> = {}
          amounts.forEach((amount) => {
            if (amount.denom in denomAmountMap) {
              denomAmountMap[amount.denom] = denomAmountMap[amount.denom].plus(
                baseAmount(amount.amount, this.defaultDecimals),
              )
            } else {
              denomAmountMap[amount.denom] = baseAmount(amount.amount, this.defaultDecimals)
            }
          })
          Object.entries(denomAmountMap).forEach(([denom, amount]) => {
            const asset = this.assetFromDenom(denom)
            if (asset) {
              const recipientAssetKey = `${keyRecipient.value}${assetToString(asset)}`
              if (mapTo.has(recipientAssetKey)) {
                const currentTo = mapTo.get(recipientAssetKey) as {
                  amount: BaseAmount
                  asset: CompatibleAsset
                  address: Address
                }
                currentTo.amount = currentTo.amount.plus(amount)
                mapTo.set(recipientAssetKey, currentTo)
              } else {
                mapTo.set(recipientAssetKey, {
                  amount,
                  asset,
                  address: keyRecipient.value,
                })
              }
              const senderAssetKey = `${keySender.value}${assetToString(asset)}`
              if (mapFrom.has(senderAssetKey)) {
                const currentTo = mapFrom.get(senderAssetKey) as {
                  amount: BaseAmount
                  asset: CompatibleAsset
                  address: Address
                }
                currentTo.amount = currentTo.amount.plus(amount)
                mapFrom.set(senderAssetKey, currentTo)
              } else {
                mapFrom.set(senderAssetKey, {
                  amount,
                  asset,
                  address: keySender.value,
                })
              }
            }
          })
        } catch (e) {
          console.error('Error:', e)
        }
      }
    })
    const txTo: TxTo[] = []
    for (const value of mapTo.values()) {
      const txToObj: TxTo = {
        to: value.address,
        amount: value.amount,
        asset: value.asset,
      }
      txTo.push(txToObj)
    }
    const txFrom: TxFrom[] = []
    for (const value of mapFrom.values()) {
      const txFromObj: TxFrom = {
        from: value.address,
        amount: value.amount,
        asset: value.asset,
      }
      txFrom.push(txFromObj)
    }
    // Retrieve block data (best-effort — pruned blocks fall back to epoch 0)
    let txDate: Date
    try {
      const blockData = await this.roundRobinGetBlock(indexedTx.height)
      txDate = new Date(blockData.header.time)
    } catch {
      txDate = new Date(0)
    }
    return {
      asset:
        txFrom[0]?.asset ??
        txTo[0]?.asset ??
        (() => {
          throw new Error(`No transfer events found in tx ${indexedTx.hash}`)
        })(),
      from: txFrom,
      to: txTo,
      date: txDate,
      type: TxType.Transfer,
      hash: indexedTx.hash,
    }
  }

  /**
   * Serializes async operations to prevent concurrent sequence number conflicts.
   * Each call waits for the previous one to complete before executing.
   */
  protected withTxLock<T>(fn: () => Promise<T>): Promise<T> {
    const prev = this.txLock
    let resolve: () => void
    this.txLock = new Promise<void>((r) => (resolve = r))
    return prev.then(async () => {
      try {
        return await fn()
      } finally {
        resolve!()
      }
    })
  }

  getFees(): Promise<Fees> {
    return Promise.resolve(singleFee(FeeType.FlatFee, this.defaultFee))
  }

  public validateAddress(address: string): boolean {
    try {
      const { prefix: decodedPrefix } = fromBech32(address)
      if (decodedPrefix !== this.prefix) {
        return false
      }
      return true
    } catch (_error) {
      return false
    }
  }

  public async getBalance(address: string, assets?: CompatibleAsset[]): Promise<Balance[]> {
    const results = await this.roundRobinGetBalance(address)
    const nativeAssetInfo = this.getAssetInfo()
    const balancesMap = new Map<string, Balance>()

    results.forEach((coin) => {
      const asset = this.assetFromDenom(coin.denom)
      if (asset) {
        balancesMap.set(assetToString(asset), {
          asset,
          amount: baseAmount(coin.amount, this.getAssetDecimals(asset)),
        })
      }
    })

    if (!balancesMap.has(assetToString(nativeAssetInfo.asset))) {
      balancesMap.set(assetToString(nativeAssetInfo.asset), {
        asset: nativeAssetInfo.asset,
        amount: baseAmount(0, nativeAssetInfo.decimal),
      })
    }

    if (!assets) return Array.from(balancesMap.values())

    const requestedAssets = new Set(assets.map((asset) => assetToString(asset)))

    const requestedBalances: Balance[] = Array.from(balancesMap.values()).filter(
      (balance) => eqAsset(balance.asset, nativeAssetInfo.asset) || requestedAssets.has(assetToString(balance.asset)),
    )

    assets.forEach((asset) => {
      if (!balancesMap.has(assetToString(asset))) {
        requestedBalances.push({
          asset,
          amount: baseAmount(0, this.getAssetDecimals(asset)),
        })
      }
    })

    return requestedBalances
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    // TODO: Use all filters
    if (params?.startTime || params?.limit || params?.offset) {
      throw Error('Not supported param limit for this client')
    }

    const indexedTxsSender = await this.roundRobinSearchTx([
      {
        key: 'message.sender',
        value: params?.address as string,
      },
    ])

    const indexedTxsReceipent = await this.roundRobinSearchTx([
      {
        key: 'transfer.recipient',
        value: params?.address as string,
      },
    ])

    const indexedTxs = [...indexedTxsReceipent, ...indexedTxsSender]
    const results = await Promise.allSettled(indexedTxs.map((indexedTx) => this.mapIndexedTxToTx(indexedTx)))
    const txs: Tx[] = []
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        txs.push(result.value)
      } else {
        console.warn(`Skipping tx ${indexedTxs[i].hash}: ${result.reason}`)
      }
    })
    return {
      total: txs.length,
      txs,
    }
  }

  public async getTransactionData(txId: string, _assetAddress?: string): Promise<Tx> {
    const tx = await this.roundRobinGetTransaction(txId)
    return this.mapIndexedTxToTx(tx)
  }

  public async broadcastTx(txHex: string): Promise<string> {
    const txResponse = await this.roundRobinBroadcast(fromBase64(txHex))
    return txResponse.transactionHash
  }

  protected async getChainId(): Promise<string> {
    return this.roundRobinGetChainId()
  }

  protected async getAccount(address: Address): Promise<Account> {
    const account = await this.roundRobinGetAccount(address)
    if (!account) throw Error('Con not retrieve account. Account is null')
    return account
  }

  private async connectToClientUrls(urls: string[]): Promise<StargateClient[]> {
    const results = await Promise.allSettled(
      urls.map((url) => {
        return this.connectClient(url)
      }),
    )

    const clients: StargateClient[] = []
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') clients.push(result.value)
      else console.warn(`Can not connect to ${urls[index]}`)
    })

    return clients
  }

  private async roundRobinGetBalance(address: Address): Promise<readonly Coin[]> {
    const clients = await this.stargateClients.getValue()
    return roundRobinTry(clients, `retrieve balances for ${address}`, (client) => client.getAllBalances(address))
  }

  private async roundRobinGetBlock(height: number): Promise<Block> {
    const clients = await this.stargateClients.getValue()
    return roundRobinTry(clients, `retrieve block ${height}`, (client) => client.getBlock(height), {
      onRetryableError: (e) => {
        console.warn(`Failed to get block ${height}:`, e instanceof Error ? e.message : e)
      },
    })
  }

  /**
   * @throws {TxNotFoundError} if no client returns the tx (distinct from RPC unavailability).
   * @throws {Error} if no client is reachable.
   */
  private async roundRobinGetTransaction(txId: string): Promise<IndexedTx> {
    const clients = await this.stargateClients.getValue()
    return roundRobinGetTx(clients, txId, (client) => client.getTx(txId))
  }

  private async roundRobinBroadcast(txHex: Uint8Array): Promise<DeliverTxResponse> {
    const clients = await this.stargateClients.getValue()
    const knownHash = tendermintTxHash(txHex)
    return roundRobinTry(clients, 'broadcast transaction', async (client) => {
      try {
        return await client.broadcastTx(txHex)
      } catch (error) {
        // Same signed bytes already accepted — treat as success for Ledger / offline paths.
        if (isAlreadyBroadcastError(error)) {
          return { transactionHash: knownHash, code: 0 } as DeliverTxResponse
        }
        throw error
      }
    })
  }

  private async roundRobinSearchTx(filters: { key: string; value: string }[]): Promise<IndexedTx[]> {
    const clients = await this.stargateClients.getValue()
    return roundRobinTry(clients, 'search transaction', (client) => client.searchTx(filters))
  }

  private async roundRobinGetAccount(address: Address): Promise<Account | null> {
    const clients = await this.stargateClients.getValue()
    return roundRobinTry(clients, 'get address account', (client) => client.getAccount(address))
  }

  private async roundRobinGetChainId(): Promise<string> {
    const clients = await this.stargateClients.getValue()
    return roundRobinTry(clients, 'get chain id', (client) => client.getChainId())
  }

  public abstract prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
  }: TxParams & { sender: Address }): Promise<PreparedTx>
  abstract getAssetInfo(): AssetInfo
  abstract getExplorerUrl(): string
  abstract getExplorerAddressUrl(_address: string): string
  abstract getExplorerTxUrl(txID: string): string
  abstract assetFromDenom(denom: string): CompatibleAsset | null
  abstract getDenom(asset: CompatibleAsset): string | null
  public abstract getAssetDecimals(asset: CompatibleAsset): number
  protected abstract getMsgTypeUrlByType(msgType: MsgTypes): string
  protected abstract getStandardFee(asset: Asset): StdFee
  protected abstract getPrefix(network: Network): string
}

export { Client }
