import { fromBase64, fromBech32 } from '@cosmjs/encoding'
import { GeneratedType, Registry } from '@cosmjs/proto-signing'
import { IndexedTx, StargateClient, StdFee, defaultRegistryTypes } from '@cosmjs/stargate'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  Tx,
  TxFrom,
  TxHistoryParams,
  TxParams,
  TxTo,
  TxType,
  TxsPage,
  XChainClient,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import { Address, Asset, BaseAmount, CachedValue, Chain, assetToString, baseAmount } from '@xchainjs/xchain-util'

/**
 * Represents the parameters required to configure a Cosmos SDK client.
 */
export type CosmosSdkClientParams = XChainClientParams & {
  chain: Chain // The chain identifier
  clientUrls: Record<Network, string> // URLs for connecting to the chain's client
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
  protected startgateClient: CachedValue<StargateClient> // Cached instance of StargateClient
  protected prefix: string // Address prefix
  protected readonly defaultDecimals: number // Default number of decimals for assets
  protected readonly clientUrls: Record<Network, string> // URLs for connecting to the chain's client
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
    this.startgateClient = new CachedValue<StargateClient>(
      () => this.connectClient(this.clientUrls[params.network || Network.Mainnet]), // Initialize StargateClient
    )
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
    this.startgateClient = new CachedValue<StargateClient>(() => this.connectClient(this.clientUrls[network])) // Reconnect with the new network
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
    const mapTo: Map<string, { amount: BaseAmount; asset: Asset | undefined; address: Address }> = new Map()
    const mapFrom: Map<string, { amount: BaseAmount; asset: Asset | undefined; address: Address }> = new Map()

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
                  asset: Asset
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
                  asset: Asset
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
    const client = await this.startgateClient.getValue()
    const blockData = await client.getBlock(indexedTx.height)
    // Return the mapped transaction object
    return {
      asset: txFrom[0].asset as Asset,
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
   * @param {Asset[] | undefined} _assets An array of assets. Ignored in this implementation.
   * @returns {Balance[]} A promise that resolves to an array of balances.
   */
  public async getBalance(address: string, _assets?: Asset[] | undefined): Promise<Balance[]> {
    const client = await this.startgateClient.getValue()
    const result = await client.getAllBalances(address)
    // TODO: Filter using assets
    const balances: Balance[] = []
    result.forEach((balance) => {
      const asset = this.assetFromDenom(balance.denom)
      if (asset) {
        balances.push({
          asset,
          amount: baseAmount(balance.amount, this.getAssetDecimals(asset)),
        })
      }
    })
    return balances
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

    const client = await this.startgateClient.getValue()

    const indexedTxsSender = await client.searchTx([
      // TODO: Unify in one filter
      {
        key: 'message.sender',
        value: params?.address as string,
      },
    ])

    const indexedTxsReceipent = await client.searchTx([
      // TODO: Unify in one filter
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
    const client = await this.startgateClient.getValue()
    const tx = await client.getTx(txId)
    if (!tx) {
      throw Error(`Can not find transaction ${txId}`)
    }
    return this.mapIndexedTxToTx(tx)
  }

  public async broadcastTx(txHex: string): Promise<string> {
    const client = await this.startgateClient.getValue()
    const txResponse = await client.broadcastTx(fromBase64(txHex))
    return txResponse.transactionHash
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
  abstract assetFromDenom(denom: string): Asset | null
  abstract getDenom(asset: Asset): string | null
  public abstract getAssetDecimals(asset: Asset): number
  protected abstract getMsgTypeUrlByType(msgType: MsgTypes): string
  protected abstract getStandardFee(asset: Asset): StdFee
  protected abstract getPrefix(network: Network): string
}

export { Client }
