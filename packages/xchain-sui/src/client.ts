import { SuiClient as SuiJsonRpcClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
import { SuiGraphQLClient } from '@mysten/sui/graphql'
import { SuiGrpcClient } from '@mysten/sui/grpc'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'
import { fromBase64, isValidSuiAddress } from '@mysten/sui/utils'
import {
  AssetInfo,
  BaseXChainClient,
  ExplorerProviders,
  FeeOption,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  TxHash,
  TxHistoryParams,
  TxType,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import {
  Address,
  TokenAsset,
  assetFromStringEx,
  baseAmount,
  eqAsset,
  getContractAddressFromAsset,
} from '@xchainjs/xchain-util'
import slip10 from 'micro-key-producer/slip10.js'

import { DEFAULT_GAS_BUDGET, SUIAsset, SUIChain, SUI_DECIMALS, SUI_TYPE_TAG, defaultSuiParams } from './const'
import { Balance, SUIClientParams, SuiTransport, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'
import {
  formatGrpcExecutionFailure,
  getSuiNetwork,
  isGrpcExecutionFailure,
  resolveGraphqlUrl,
  resolvePrimaryUrl,
} from './utils'

type CoreClient = SuiGrpcClient | SuiJsonRpcClient
type GasCoinRef = { objectId: string; version: string | number; digest: string }

type GraphqlTxNode = {
  digest: string
  effects: {
    timestamp: string | null
    status: string
    balanceChanges: {
      nodes: Array<{
        amount: string
        coinType: { repr: string } | null
        owner: { address: string } | null
      }>
    } | null
  } | null
}

/**
 * Sui client for XChainJS.
 *
 * Defaults to **gRPC** against Sui Foundation public fullnodes. Foundation JSON-RPC on
 * `fullnode.*.sui.io` is deprecated (disabled week of 2026-07-27). Historical transaction
 * queries use GraphQL (`graphql.*.sui.io`).
 *
 * Optional `transport: 'jsonRpc'` keeps the legacy JSON-RPC path for private nodes that
 * still enable it.
 *
 * @see https://docs.sui.io/develop/accessing-data/json-rpc-migration
 */
export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private transport: SuiTransport
  private clientUrls: Record<Network, string>
  private graphqlUrls: Record<Network, string>
  private coreClient: CoreClient
  private graphqlClient: SuiGraphQLClient

  constructor(params: SUIClientParams = defaultSuiParams) {
    const mergedParams = { ...defaultSuiParams, ...params }
    super(SUIChain, mergedParams)
    this.explorerProviders = mergedParams.explorerProviders
    this.transport = params.transport ?? mergedParams.transport ?? 'grpc'

    // Resolve endpoints from caller params only (not shallow-merged defaults),
    // so consumer `clientUrls` / `graphqlUrls` are not shadowed by baked-in maps.
    this.clientUrls = {
      [Network.Mainnet]: resolvePrimaryUrl(Network.Mainnet, params),
      [Network.Testnet]: resolvePrimaryUrl(Network.Testnet, params),
      [Network.Stagenet]: resolvePrimaryUrl(Network.Stagenet, params),
    }
    this.graphqlUrls = {
      [Network.Mainnet]: resolveGraphqlUrl(Network.Mainnet, params),
      [Network.Testnet]: resolveGraphqlUrl(Network.Testnet, params),
      [Network.Stagenet]: resolveGraphqlUrl(Network.Stagenet, params),
    }

    const network = this.getNetwork()
    this.coreClient = this.createCoreClient(network)
    this.graphqlClient = this.createGraphqlClient(network)
  }

  public setNetwork(network: Network): void {
    super.setNetwork(network)
    this.coreClient = this.createCoreClient(network)
    this.graphqlClient = this.createGraphqlClient(network)
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: SUIAsset,
      decimal: SUI_DECIMALS,
    }
  }

  public getExplorerUrl(): string {
    return this.explorerProviders[this.getNetwork()].getExplorerUrl()
  }

  public getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.getNetwork()].getExplorerAddressUrl(address)
  }

  public getExplorerTxUrl(txID: TxHash): string {
    return this.explorerProviders[this.getNetwork()].getExplorerTxUrl(txID)
  }

  public getFullDerivationPath(walletIndex: number): string {
    if (!this.rootDerivationPaths) {
      throw Error('Can not generate derivation path due to root derivation path is undefined')
    }
    return `${this.rootDerivationPaths[this.getNetwork()]}${walletIndex}'/0'`
  }

  public async getAddressAsync(index?: number): Promise<string> {
    return this.getKeypair(index || 0)
      .getPublicKey()
      .toSuiAddress()
  }

  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  public validateAddress(address: Address): boolean {
    return isValidSuiAddress(address)
  }

  public async getBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    const balances: Balance[] = []

    if (this.isJsonRpc(this.coreClient)) {
      const suiBalance = await this.coreClient.getBalance({ owner: address })
      balances.push({
        asset: SUIAsset,
        amount: baseAmount(suiBalance.totalBalance, SUI_DECIMALS),
      })

      const allBalances = await this.coreClient.getAllBalances({ owner: address })
      for (const coinBalance of allBalances) {
        if (coinBalance.coinType === SUI_TYPE_TAG || this.isSuiCoinType(coinBalance.coinType)) continue

        const tokenAsset = assetFromStringEx(`SUI.${this.coinTypeToSymbol(coinBalance.coinType)}`) as TokenAsset
        if (assets && !assets.some((a) => eqAsset(a, tokenAsset))) continue

        const decimals = await this.getCoinDecimals(coinBalance.coinType)
        balances.push({
          asset: tokenAsset,
          amount: baseAmount(coinBalance.totalBalance, decimals),
        })
      }
      return balances
    }

    const suiBalance = await this.coreClient.core.getBalance({
      address,
      coinType: SUI_TYPE_TAG,
    })
    balances.push({
      asset: SUIAsset,
      amount: baseAmount(suiBalance.balance.balance, SUI_DECIMALS),
    })

    let cursor: string | null = null
    const decimalsCache = new Map<string, number>()
    // Cap pages so pathological addresses cannot hang the client.
    for (let pageNum = 0; pageNum < 20; pageNum++) {
      const page = await this.coreClient.core.getAllBalances({
        address,
        cursor: cursor ?? undefined,
      })
      for (const coinBalance of page.balances) {
        if (this.isSuiCoinType(coinBalance.coinType)) continue

        const tokenAsset = assetFromStringEx(`SUI.${this.coinTypeToSymbol(coinBalance.coinType)}`) as TokenAsset
        if (assets && !assets.some((a) => eqAsset(a, tokenAsset))) continue

        let decimals = decimalsCache.get(coinBalance.coinType)
        if (decimals === undefined) {
          decimals = await this.getCoinDecimals(coinBalance.coinType)
          decimalsCache.set(coinBalance.coinType, decimals)
        }
        balances.push({
          asset: tokenAsset,
          amount: baseAmount(coinBalance.balance, decimals),
        })
      }
      if (!page.hasNextPage || !page.cursor || page.cursor === cursor) break
      cursor = page.cursor
    }

    return balances
  }

  public async getFees(): Promise<Fees> {
    const gasPrice = await this.getReferenceGasPrice()
    const baseFee = BigInt(gasPrice) * BigInt(2000)

    return {
      type: FeeType.FlatFee,
      [FeeOption.Average]: baseAmount(baseFee.toString(), SUI_DECIMALS),
      [FeeOption.Fast]: baseAmount(baseFee.toString(), SUI_DECIMALS),
      [FeeOption.Fastest]: baseAmount(baseFee.toString(), SUI_DECIMALS),
    }
  }

  public async getTransactionData(txId: string): Promise<Tx> {
    // Prefer GraphQL for history (fullnode gRPC retention is limited).
    try {
      return await this.getTransactionDataFromGraphql(txId)
    } catch {
      // Fall back to primary transport for very recent txs still in fullnode window.
    }

    if (this.isJsonRpc(this.coreClient)) {
      const txResponse = await this.coreClient.getTransactionBlock({
        digest: txId,
        options: {
          showInput: true,
          showEffects: true,
          showBalanceChanges: true,
        },
      })
      return this.parseJsonRpcTransaction(txResponse)
    }

    const { transaction } = await this.coreClient.core.getTransaction({ digest: txId })
    return this.parseCoreTransaction(transaction.digest, transaction.balanceChanges, null)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync())
    const limit = params?.limit || 50
    const offset = params?.offset || 0

    // GraphQL supports affectedAddress (sent + received). Core API only supports sender.
    const nodes = await this.fetchGraphqlTransactions(address, limit + offset)
    const decimalsCache = new Map<string, number>()

    const txs: Tx[] = []
    for (const node of nodes) {
      try {
        txs.push(await this.parseGraphqlTransactionNode(node, decimalsCache))
      } catch {
        // Skip unparseable transactions
      }
    }

    const paged = txs.slice(offset, offset + limit)
    return {
      txs: paged,
      total: txs.length,
    }
  }

  public async transfer({ walletIndex, recipient, asset, amount, memo, gasBudget }: TxParams): Promise<string> {
    if (memo) throw Error('Memo is not supported for SUI transfers')

    const keypair = this.getKeypair(walletIndex || 0)
    const sender = keypair.getPublicKey().toSuiAddress()
    const { bytes } = await this.buildTransferTransaction({
      sender,
      recipient,
      asset,
      amount,
      gasBudget,
    })

    const { signature } = await keypair.signTransaction(bytes)

    if (this.isJsonRpc(this.coreClient)) {
      const result = await this.coreClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true },
      })
      if (result.effects?.status?.status !== 'success') {
        throw Error(`Transaction failed: ${result.effects?.status?.error || 'unknown error'}`)
      }
      await this.coreClient.waitForTransaction({ digest: result.digest })
      return result.digest
    }

    const execDigest = await this.executeGrpcTransaction(bytes, signature)
    await this.waitForGraphqlTransaction(execDigest)
    return execDigest
  }

  public async broadcastTx(txHex: string): Promise<TxHash> {
    const txBytes = Uint8Array.from(Buffer.from(txHex, 'hex'))
    const keypair = this.getKeypair(0)
    const { signature } = await keypair.signTransaction(txBytes)

    if (this.isJsonRpc(this.coreClient)) {
      const result = await this.coreClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature,
        options: { showEffects: true },
      })
      if (result.effects?.status?.status !== 'success') {
        throw Error(`Transaction failed: ${result.effects?.status?.error || 'unknown error'}`)
      }
      return result.digest
    }

    return this.executeGrpcTransaction(txBytes, signature)
  }

  public async prepareTx({ walletIndex, memo, recipient, asset, amount, gasBudget }: TxParams): Promise<PreparedTx> {
    if (memo) throw Error('Memo is not supported for SUI transfers')

    const sender = await this.getAddressAsync(walletIndex ?? 0)
    const { bytes } = await this.buildTransferTransaction({
      sender,
      recipient,
      asset,
      amount,
      gasBudget,
    })

    return { rawUnsignedTx: Buffer.from(bytes).toString('hex') }
  }

  private createCoreClient(network: Network): CoreClient {
    const url = this.clientUrls[network]
    const suiNetwork = getSuiNetwork(network)

    if (this.transport === 'jsonRpc') {
      return new SuiJsonRpcClient({ url })
    }

    return new SuiGrpcClient({
      baseUrl: url,
      network: suiNetwork,
    })
  }

  private createGraphqlClient(network: Network): SuiGraphQLClient {
    return new SuiGraphQLClient({
      url: this.graphqlUrls[network],
      network: getSuiNetwork(network),
    })
  }

  private isJsonRpc(client: CoreClient): client is SuiJsonRpcClient {
    return this.transport === 'jsonRpc' && !(client instanceof SuiGrpcClient)
  }

  private getKeypair(index: number): Ed25519Keypair {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)
    const derived = hd.derive(this.getFullDerivationPath(index))

    return Ed25519Keypair.fromSecretKey(derived.privateKey)
  }

  private async getReferenceGasPrice(): Promise<bigint> {
    if (this.isJsonRpc(this.coreClient)) {
      return this.coreClient.getReferenceGasPrice()
    }
    const { referenceGasPrice } = await this.coreClient.core.getReferenceGasPrice()
    return BigInt(referenceGasPrice)
  }

  private async getCoinDecimals(coinType: string): Promise<number> {
    if (this.isSuiCoinType(coinType)) return SUI_DECIMALS

    if (this.isJsonRpc(this.coreClient)) {
      try {
        const metadata = await this.coreClient.getCoinMetadata({ coinType })
        return metadata?.decimals ?? SUI_DECIMALS
      } catch {
        return SUI_DECIMALS
      }
    }

    // Prefer a single GraphQL metadata lookup (lighter than full CoinInfo over gRPC).
    try {
      const response: { data?: { coinMetadata?: { decimals: number } | null } } = await this.graphqlClient.query({
        query: `query ($coinType: String!) {
            coinMetadata(coinType: $coinType) { decimals }
          }`,
        variables: { coinType },
      })
      if (response.data?.coinMetadata?.decimals != null) {
        return response.data.coinMetadata.decimals
      }
    } catch {
      // fall through
    }

    try {
      const { response } = await this.coreClient.stateService.getCoinInfo({ coinType })
      return response.metadata?.decimals ?? SUI_DECIMALS
    } catch {
      return SUI_DECIMALS
    }
  }

  private async getCoins(owner: string, coinType: string): Promise<GasCoinRef[]> {
    if (this.isJsonRpc(this.coreClient)) {
      const page = await this.coreClient.getCoins({ owner, coinType })
      return page.data.map((c) => ({
        objectId: c.coinObjectId,
        version: c.version,
        digest: c.digest,
      }))
    }

    const page = await this.coreClient.core.getCoins({
      address: owner,
      coinType,
    })
    return page.objects.map((c) => ({
      objectId: c.id,
      version: c.version,
      digest: c.digest,
    }))
  }

  /**
   * Build a signed-ready transfer PTB with explicit gas payment.
   * Avoids transaction resolution (unsupported on public gRPC/GraphQL clients).
   */
  private async buildTransferTransaction({
    sender,
    recipient,
    asset,
    amount,
    gasBudget,
  }: {
    sender: string
    recipient: string
    asset?: TxParams['asset']
    amount: TxParams['amount']
    gasBudget?: TxParams['gasBudget']
  }): Promise<{ bytes: Uint8Array }> {
    const budget = gasBudget?.amount().toNumber() ?? DEFAULT_GAS_BUDGET
    const gasPrice = await this.getReferenceGasPrice()
    const gasCoins = await this.getCoins(sender, SUI_TYPE_TAG)
    if (gasCoins.length === 0) {
      throw Error('No SUI coins available for gas')
    }

    const tx = new Transaction()
    tx.setSender(sender)
    tx.setGasPayment([
      {
        objectId: gasCoins[0].objectId,
        version: gasCoins[0].version,
        digest: gasCoins[0].digest,
      },
    ])
    tx.setGasBudget(budget)
    tx.setGasPrice(gasPrice)

    if (!asset || eqAsset(asset, SUIAsset)) {
      const [coin] = tx.splitCoins(tx.gas, [amount.amount().toString()])
      tx.transferObjects([coin], recipient)
    } else {
      const coinType = getContractAddressFromAsset(asset as TokenAsset)
      const tokenCoins = await this.getCoins(sender, coinType)
      if (tokenCoins.length === 0) {
        throw Error('No coins found for the specified asset')
      }

      const primary = tx.objectRef({
        objectId: tokenCoins[0].objectId,
        version: tokenCoins[0].version,
        digest: tokenCoins[0].digest,
      })
      if (tokenCoins.length > 1) {
        tx.mergeCoins(
          primary,
          tokenCoins.slice(1).map((c) =>
            tx.objectRef({
              objectId: c.objectId,
              version: c.version,
              digest: c.digest,
            }),
          ),
        )
      }
      const [splitCoin] = tx.splitCoins(primary, [amount.amount().toString()])
      tx.transferObjects([splitCoin], recipient)
    }

    // Gas payment is set explicitly; no client resolution required.
    const bytes = await tx.build()
    return { bytes }
  }

  /**
   * Execute via gRPC with a read mask compatible with current fullnodes.
   * SDK 1.x core client requests invalid paths (`transaction.transaction`).
   */
  private async executeGrpcTransaction(transaction: Uint8Array, signature: string): Promise<string> {
    if (!(this.coreClient instanceof SuiGrpcClient)) {
      throw Error('gRPC client required for executeGrpcTransaction')
    }

    const { response } = await this.coreClient.transactionExecutionService.executeTransaction({
      transaction: {
        bcs: {
          value: transaction,
        },
      },
      signatures: [
        {
          bcs: {
            value: fromBase64(signature),
          },
          signature: {
            oneofKind: undefined,
          },
        },
      ],
      readMask: {
        // Compatible with fullnode read-mask validation (SDK default paths break).
        paths: ['digest', 'effects'],
      },
    })

    const digest = response.transaction?.digest
    if (!digest) {
      throw Error('Transaction execution returned no digest')
    }

    const status = response.transaction?.effects?.status
    // status may be enum number or object depending on protobuf version
    if (isGrpcExecutionFailure(status)) {
      // Prefer description; never JSON.stringify raw protobuf (BigInt throws).
      throw Error(formatGrpcExecutionFailure(status))
    }

    return digest
  }

  private async waitForGraphqlTransaction(digest: string, timeoutMs = 60_000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      try {
        const response: { data?: { transaction?: { digest?: string } } } = await this.graphqlClient.query({
          query: `query ($digest: String!) {
            transaction(digest: $digest) {
              digest
              effects { status }
            }
          }`,
          variables: { digest },
        })
        if (response.data?.transaction?.digest) {
          return
        }
      } catch {
        // keep polling
      }
      await new Promise((r) => setTimeout(r, 1000))
    }
    throw Error(`Timed out waiting for transaction ${digest} to be indexed`)
  }

  private async getTransactionDataFromGraphql(txId: string): Promise<Tx> {
    const response: { data?: { transaction?: GraphqlTxNode | null } } = await this.graphqlClient.query({
      query: `query ($digest: String!) {
        transaction(digest: $digest) {
          digest
          effects {
            timestamp
            status
            balanceChanges {
              nodes {
                amount
                coinType { repr }
                owner { address }
              }
            }
          }
        }
      }`,
      variables: { digest: txId },
    })

    const node = response.data?.transaction
    if (!node) {
      throw Error(`Transaction ${txId} not found`)
    }
    return this.parseGraphqlTransactionNode(node)
  }

  private async fetchGraphqlTransactions(address: string, maxResults: number): Promise<GraphqlTxNode[]> {
    const nodes: GraphqlTxNode[] = []
    let cursor: string | null = null
    const pageSize = Math.min(maxResults, 50)

    while (nodes.length < maxResults) {
      const response: {
        data?: {
          transactions?: {
            nodes: GraphqlTxNode[]
            pageInfo: { hasNextPage: boolean; endCursor: string | null }
          }
        }
      } = await this.graphqlClient.query({
        query: `query ($address: SuiAddress!, $first: Int!, $after: String) {
          transactions(first: $first, after: $after, filter: { affectedAddress: $address }) {
            nodes {
              digest
              effects {
                timestamp
                status
                balanceChanges {
                  nodes {
                    amount
                    coinType { repr }
                    owner { address }
                  }
                }
              }
            }
            pageInfo { hasNextPage endCursor }
          }
        }`,
        variables: { address, first: pageSize, after: cursor },
      })

      const page = response.data?.transactions
      if (!page) break

      nodes.push(...page.nodes)
      if (!page.pageInfo.hasNextPage || !page.pageInfo.endCursor) break
      cursor = page.pageInfo.endCursor
    }

    return nodes.slice(0, maxResults)
  }

  private async parseGraphqlTransactionNode(
    node: GraphqlTxNode,
    decimalsCache: Map<string, number> = new Map(),
  ): Promise<Tx> {
    const from: TxFrom[] = []
    const to: TxTo[] = []
    const changes = node.effects?.balanceChanges?.nodes || []

    for (const change of changes) {
      const coinType = change.coinType?.repr || SUI_TYPE_TAG
      const isSui = this.isSuiCoinType(coinType)
      let decimals = decimalsCache.get(coinType)
      if (decimals === undefined) {
        decimals = await this.getCoinDecimals(coinType)
        decimalsCache.set(coinType, decimals)
      }
      const asset = isSui ? SUIAsset : (assetFromStringEx(`SUI.${this.coinTypeToSymbol(coinType)}`) as TokenAsset)
      const changeAmount = BigInt(change.amount)
      const ownerAddress = change.owner?.address || ''

      if (changeAmount < BigInt(0)) {
        from.push({
          from: ownerAddress,
          amount: baseAmount((-changeAmount).toString(), decimals),
          asset,
        })
      } else if (changeAmount > BigInt(0)) {
        to.push({
          to: ownerAddress,
          amount: baseAmount(changeAmount.toString(), decimals),
          asset,
        })
      }
    }

    return {
      asset: SUIAsset,
      date: node.effects?.timestamp ? new Date(node.effects.timestamp) : new Date(0),
      type: TxType.Transfer,
      hash: node.digest,
      from,
      to,
    }
  }

  private async parseJsonRpcTransaction(txResponse: SuiTransactionBlockResponse): Promise<Tx> {
    const from: TxFrom[] = []
    const to: TxTo[] = []

    if (txResponse.balanceChanges) {
      for (const change of txResponse.balanceChanges) {
        const isSui = this.isSuiCoinType(change.coinType)
        const decimals = await this.getCoinDecimals(change.coinType)
        const asset = isSui
          ? SUIAsset
          : (assetFromStringEx(`SUI.${this.coinTypeToSymbol(change.coinType)}`) as TokenAsset)
        const changeAmount = BigInt(change.amount)
        const ownerAddress =
          change.owner && typeof change.owner === 'object' && 'AddressOwner' in change.owner
            ? change.owner.AddressOwner
            : ''

        if (changeAmount < BigInt(0)) {
          from.push({
            from: ownerAddress,
            amount: baseAmount((-changeAmount).toString(), decimals),
            asset,
          })
        } else if (changeAmount > BigInt(0)) {
          to.push({
            to: ownerAddress,
            amount: baseAmount(changeAmount.toString(), decimals),
            asset,
          })
        }
      }
    }

    return {
      asset: SUIAsset,
      date: new Date(Number(txResponse.timestampMs || 0)),
      type: TxType.Transfer,
      hash: txResponse.digest,
      from,
      to,
    }
  }

  private parseCoreTransaction(
    digest: string,
    balanceChanges: { coinType: string; address: string; amount: string }[] | undefined,
    timestamp: string | null,
  ): Tx {
    const from: TxFrom[] = []
    const to: TxTo[] = []

    for (const change of balanceChanges || []) {
      const isSui = this.isSuiCoinType(change.coinType)
      const asset = isSui
        ? SUIAsset
        : (assetFromStringEx(`SUI.${this.coinTypeToSymbol(change.coinType)}`) as TokenAsset)
      const changeAmount = BigInt(change.amount)

      if (changeAmount < BigInt(0)) {
        from.push({
          from: change.address,
          amount: baseAmount((-changeAmount).toString(), SUI_DECIMALS),
          asset,
        })
      } else if (changeAmount > BigInt(0)) {
        to.push({
          to: change.address,
          amount: baseAmount(changeAmount.toString(), SUI_DECIMALS),
          asset,
        })
      }
    }

    return {
      asset: SUIAsset,
      date: timestamp ? new Date(timestamp) : new Date(0),
      type: TxType.Transfer,
      hash: digest,
      from,
      to,
    }
  }

  private isSuiCoinType(coinType: string): boolean {
    // Normalize padded package ids: 0x2 vs 0x000...002
    const normalized = coinType.replace(/^0x0+/, '0x').toLowerCase()
    return normalized === '0x2::sui::sui' || coinType === SUI_TYPE_TAG
  }

  private coinTypeToSymbol(coinType: string): string {
    // coinType format: "0xpackage::module::Type"
    // Convert to symbol format for xchainjs: "TYPE-0xpackage::module::Type"
    const parts = coinType.split('::')
    const typeName = parts[parts.length - 1] || coinType
    return `${typeName}-${coinType}`
  }
}
