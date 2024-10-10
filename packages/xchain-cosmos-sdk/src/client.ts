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

import { Balance, CompatibleAsset, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'

/**
 * Represents the parameters required to configure a Cosmos SDK client.
 */
export type CosmosSdkClientParams = XChainClientParams & {
  chain: Chain // The chain identifier
  clientUrls: Record<Network, string[]> // URLs for connecting to the chain's client
  prefix: string // The prefix used for generating addresses
  defaultDecimals: number // Default number of decimals for assets
  defaultFee: BaseAmount // Default fee structure
  baseDenom: string // Base denomination
  registryTypes: Iterable<[string, GeneratedType]> // Custom registry types
}
/**
 * Enum representing different message types for transactions.
 */
export enum MsgTypes {
  TRANSFER = 'transfer',
}

/**
 * Abstract class representing a generic implementation of an XChainClient interface for chains built with Cosmos SDK.
 * Uses dependencies from the official @cosmjs monorepo.
 */
export default abstract class Client extends BaseXChainClient implements XChainClient {
  private readonly defaultFee: BaseAmount // Default fee structure
  protected stargateClients: CachedValue<StargateClient[]> // Cached instance of StargateClient
  protected prefix: string // Address prefix
  protected readonly defaultDecimals: number // Default number of decimals for assets
  protected readonly clientUrls: Record<Network, string[]> // URLs for connecting to the chain's client
  protected readonly baseDenom: string // Base denomination
  protected readonly registry: Registry // Registry instance for encoding and decoding data

  /**
   * Constructor for initializing the Cosmos SDK client.
   * @param {CosmosSdkClientParams} params Configuration parameters for the client
   */
  constructor(params: CosmosSdkClientParams) {
    super(params.chain, params) // Call the constructor of the superclass (BaseXChainClient)
    this.clientUrls = params.clientUrls // Assign client URLs
    this.prefix = this.getPrefix(this.getNetwork()) // Assign address prefix based on network
    this.defaultDecimals = params.defaultDecimals // Assign default number of decimals
    this.defaultFee = params.defaultFee // Assign default fee structure
    this.baseDenom = params.baseDenom // Assign base denomination
    this.registry = new Registry([...defaultRegistryTypes, ...params.registryTypes]) // Create a new registry
    this.stargateClients = new CachedValue<StargateClient[]>(() => {
      return this.connectToClientUrls(this.clientUrls[params.network || Network.Mainnet])
    }) // Initialize StargateClient
  }
  /**
   * Connects the client to a given client URL.
   * @private
   * @param {string} clientUrl The URL of the client to connect to
   * @returns {Promise<StargateClient>} The connected StargateClient instance
   */
  private async connectClient(clientUrl: string) {
    return StargateClient.connect(clientUrl)
  }

  /**
   * Sets the network for the client to work with.
   * @param {Network} network The network to set
   * @returns {void}
   */
  public setNetwork(network: Network): void {
    super.setNetwork(network) // Call the superclass method to set the network
    this.stargateClients = new CachedValue<StargateClient[]>(() => {
      return this.connectToClientUrls(this.clientUrls[network])
    })
    // Reconnect with the new network
    this.prefix = this.getPrefix(network) // Update the address prefix
  }

  /**
   * Splits the amount and denomination strings.
   * @private
   * @param {string[]} amountsAndDenoms The strings in the format '3000uatom'
   * @returns {Array} An array of objects containing the amount and denomination
   */
  private splitAmountAndDenom(amountsAndDenoms: string[]) {
    const amounAndDenomParsed: { amount: string; denom: string }[] = []
    amountsAndDenoms.forEach((amountAndDenom) => {
      const regex = /^(\d+)(.*)$/
      const match = amountAndDenom.match(regex)

      if (match) {
        const amount = match[1] // Extract the amount
        const denom = match[2] // Extract the denomination
        amounAndDenomParsed.push({ amount, denom })
      }
    })
    return amounAndDenomParsed
  }

  /**
   * Maps the indexed transaction to the transaction type used by xchainjs.
   * @private
   * @param {IndexedTx} indexedTx The indexed transaction to transform
   * @returns {Promise<Tx>} The transformed transaction
   */
  private async mapIndexedTxToTx(indexedTx: IndexedTx): Promise<Tx> {
    const mapTo: Map<string, { amount: BaseAmount; asset: CompatibleAsset | undefined; address: Address }> = new Map()
    const mapFrom: Map<string, { amount: BaseAmount; asset: CompatibleAsset | undefined; address: Address }> = new Map()

    /**
     * Approach to be compatible with other clients. Due to Cosmos transaction sorted events, the first 7 events
     * belongs to the transaction fee, so they can be skipped
     */

    indexedTx.events.slice(7).forEach((event) => {
      if (event.type === 'transfer') {
        // Logic for parsing transfer events and mapping them to xchainjs transactions
        // Find necessary attributes
        const keyAmount = event.attributes.find((atribute) => atribute.key === 'amount') as {
          key: string
          value: string
        }
        const keySender = event.attributes.find((atribute) => atribute.key === 'sender') as {
          key: string
          value: string
        }
        const keyRecipient = event.attributes.find((atribute) => atribute.key === 'recipient') as {
          key: string
          value: string
        }
        try {
          // Split amount and denomination strings
          const allTokensInEvent = keyAmount.value.split(',') // More than one asset per event (kuji faucet example)
          const amounts = this.splitAmountAndDenom(allTokensInEvent)
          const denomAmountMap: Record<string, BaseAmount> = {}
          // Calculate total amounts for each denomination
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
            // Fill to
            const asset = this.assetFromDenom(denom)
            if (asset) {
              const recipientAssetKey = `${keyRecipient.value}${assetToString(asset)}`
              if (mapTo.has(recipientAssetKey)) {
                const currentTo = mapTo.get(keyRecipient.value) as {
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
              // Fill from
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
    // Initialize arrays to hold 'to' and 'from' transactions
    const txTo: TxTo[] = []
    for (const value of mapTo.values()) {
      const txToObj: TxTo = {
        to: value.address,
        amount: value.amount,
        asset: value.asset,
      }
      txTo.push(txToObj)
    }
    // Populate 'to' and 'from' arrays from maps
    const txFrom: TxFrom[] = []
    for (const value of mapFrom.values()) {
      const txFromObj: TxFrom = {
        from: value.address,
        amount: value.amount,
        asset: value.asset,
      }
      txFrom.push(txFromObj)
    }
    // Retrieve block data
    const blockData = await this.roundRobinGetBlock(indexedTx.height)
    // Return the mapped transaction object
    return {
      asset: txFrom[0].asset as CompatibleAsset,
      from: txFrom,
      to: txTo,
      date: new Date(blockData.header.time),
      type: TxType.Transfer,
      hash: indexedTx.hash,
    }
  }

  /**
   * Returns the fee object in a generalized way for a simple transfer function.
   * @returns {Fees} fees estimation for average, fast and fastests scenarios.
   */
  getFees(): Promise<Fees> {
    return Promise.resolve(singleFee(FeeType.FlatFee, this.defaultFee))
  }

  /**
   * Validates the format of the provided address.
   * @param {string} address The address to be validated.
   * @returns {boolean} Returns true if the address is valid, otherwise false.
   */
  public validateAddress(address: string): boolean {
    try {
      const { prefix: decodedPrefix } = fromBech32(address)
      if (decodedPrefix !== this.prefix) {
        return false
      }
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Obtains the balances of the specified address for all assets on the network.
   * @param {string} address The address for which balances are to be retrieved.
   * @param {Asset[] | undefined} assets An array of assets. Ignored in this implementation.
   * @returns {Balance[]} A promise that resolves to an array of balances.
   */
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

  /**
   * Retrieves transactions filtered using specified parameters.
   * @param {TxHistoryParams | undefined} params Parameters for filtering transactions. Only the 'address' parameter is supported in this client.
   * @returns {TxsPage} A promise that resolves to an array of transactions.
   */
  public async getTransactions(params?: TxHistoryParams | undefined): Promise<TxsPage> {
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
    const promisesTxs = indexedTxs.map((indexedTx) => this.mapIndexedTxToTx(indexedTx))
    const txs = await Promise.all(promisesTxs)
    return {
      total: indexedTxs.length,
      txs,
    }
  }

  /**
   * Retrieves transaction data using the transaction ID.
   * @param {string} txId The identifier of the transaction.
   * @param {string | undefined} _assetAddress Ignored parameter.
   * @returns {Tx} A promise that resolves to transaction data.
   */
  public async getTransactionData(txId: string, _assetAddress?: string | undefined): Promise<Tx> {
    const tx = await this.roundRobinGetTransaction(txId)
    return this.mapIndexedTxToTx(tx)
  }

  public async broadcastTx(txHex: string): Promise<string> {
    const txResponse = await this.roundRobinBroadcast(fromBase64(txHex))
    return txResponse.transactionHash
  }

  /**
   * Get the chain id of the network connected the client is connected
   * @returns {string} - The chain id
   * @throws {Error} If the chain id can not be retrieved
   */
  protected async getChainId(): Promise<string> {
    return this.roundRobinGetChainId()
  }

  /**
   * Get the account of an address
   * @param {Address} address - The address of which return the account
   * @returns {Account} - The address account
   * @throws {Error} If the account can not be retrieved
   */
  protected async getAccount(address: Address): Promise<Account> {
    const account = await this.roundRobinGetAccount(address)
    if (!account) throw Error('Con not retrieve account. Account is null')
    return account
  }

  /**
   * Connect to each url provided
   *
   * @param {string[]} urls URLs of the providers to connect
   * @returns {StargateClient[]} List of the providers that can be used to interact with the blockchain
   */
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

  /**
   * Retrieve the balance of an address making a round robin over the clients urls provided to the client
   * @param {string} address The address for which balances are to be retrieved.
   * @returns {Coin[]} List of balances of the address
   * @throws {Error} if balance can not be retrieved
   */
  private async roundRobinGetBalance(address: Address): Promise<readonly Coin[]> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        return await client.getAllBalances(address)
      } catch {}
    }

    throw Error(`No clients available. Can not retrieve balances for ${address}`)
  }

  /**
   * Retrieve a block making a round robin over the clients urls provided to the client
   * @param {number} height The height of the block to be retrieved.
   * @returns {Block} The block linked to the height provided
   * @throws {Error} if the block can not be retrieved
   */
  private async roundRobinGetBlock(height: number): Promise<Block> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        return await client.getBlock(height)
      } catch {}
    }

    throw Error(`No clients available. Can not retrieve block ${height}`)
  }

  /**
   * Retrieve a transaction making a round robin over the clients urls provided to the client
   * @param {string} txId The hash of the transaction to be retrieved.
   * @returns {IndexedTx} The transaction linked to the hash provided
   * @throws {Error} if the transaction can not be retrieved
   */
  private async roundRobinGetTransaction(txId: string): Promise<IndexedTx> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        const tx = await client.getTx(txId)
        if (!tx) throw Error(`Can not find transaction ${txId}`)
        return tx
      } catch {}
    }

    throw Error(`No clients available. Can not retrieve transaction ${txId}`)
  }

  /**
   * Broadcast a raw signed transaction making a round robin over the clients urls provided to the client
   * @param {Uint8Array} txHex The raw signed transaction to be broadcast.
   * @returns {DeliverTxResponse} The broadcasted transaction
   * @throws {Error} if the transaction can not be broadcasted
   */
  private async roundRobinBroadcast(txHex: Uint8Array): Promise<DeliverTxResponse> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        return await client.broadcastTx(txHex)
      } catch {}
    }

    throw Error(`No clients available. Can not broadcast transaction`)
  }

  /**
   * Search transactions by the filters provided making a round robin over the clients urls provided to the client
   * @param {{ key: string; value: string }[]} filters The raw signed transaction to be broadcast.
   * @returns {IndexedTx[]} The broadcasted transaction
   * @throws {Error} if the transaction can not be broadcasted
   */
  private async roundRobinSearchTx(filters: { key: string; value: string }[]): Promise<IndexedTx[]> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        return await client.searchTx(filters)
      } catch {}
    }

    throw Error(`No clients available. Can not search transaction`)
  }

  /**
   * Get the account of an address making a round robin system over the stargate clients
   * @param {Address} address - The address of which return the account
   * @returns {Account | null} - The account if it is found
   * @throws {Error} If the account can not be retrieved from the stargate clients
   */
  private async roundRobinGetAccount(address: Address): Promise<Account | null> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        return await client.getAccount(address)
      } catch {}
    }
    throw Error('No clients available. Can not get address account')
  }

  /**
   * Get the chain id of the network connected the client is connected making a round robin over
   * the stargate clients
   * @returns {string} - The chain id
   * @throws {Error} If the chain id can not be retrieved from the stargate clients
   */
  private async roundRobinGetChainId(): Promise<string> {
    const clients = await this.stargateClients.getValue()

    for (const client of clients) {
      try {
        return await client.getChainId()
      } catch {}
    }

    throw Error(`No clients available. Can not get chain id`)
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
