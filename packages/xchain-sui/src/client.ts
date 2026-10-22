import { SuiGrpcClient } from '@mysten/sui/grpc'
import type { SuiJsonRpcClient, SuiTransactionBlockResponse } from '@mysten/sui/jsonRpc'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'
import { isValidSuiAddress } from '@mysten/sui/utils'
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
import { graphqlQuery, type GraphqlResult } from './graphql'
import { Balance, SUIClientParams, SuiTransport, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'
import {
  formatGrpcExecutionFailure,
  getSuiNetwork,
  isGrpcExecutionFailure,
  resolveGraphqlUrl,
  resolvePrimaryUrl,
} from './utils'

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

type GraphqlTxConnection = {
  transactions?: {
    nodes: GraphqlTxNode[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

/**
 * Defaults to gRPC on Foundation fullnodes. Foundation JSON-RPC is deprecated
 * (disabled week of 2026-07-27); history uses GraphQL. `transport: 'jsonRpc'` is only
 * for private nodes that still enable JSON-RPC.
 * @see https://docs.sui.io/develop/accessing-data/json-rpc-migration
 */
export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private transport: SuiTransport
  private clientUrls: Record<Network, string>
  private graphqlUrls: Record<Network, string>
  private grpcClient: SuiGrpcClient | null
  private jsonRpcClient: SuiJsonRpcClient | null = null

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
    this.grpcClient =
      this.transport === 'jsonRpc'
        ? null
        : new SuiGrpcClient({ baseUrl: this.clientUrls[network], network: getSuiNetwork(network) })
  }

  public setNetwork(network: Network): void {
    super.setNetwork(network)
    this.jsonRpcClient = null
    this.grpcClient =
      this.transport === 'jsonRpc'
        ? null
        : new SuiGrpcClient({ baseUrl: this.clientUrls[network], network: getSuiNetwork(network) })
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

    if (this.transport === 'jsonRpc') {
      const jsonRpc = await this.getJsonRpcClient()
      const suiBalance = await jsonRpc.getBalance({ owner: address })
      balances.push({
        asset: SUIAsset,
        amount: baseAmount(suiBalance.totalBalance, SUI_DECIMALS),
      })

      const allBalances = await jsonRpc.getAllBalances({ owner: address })
      for (const coinBalance of allBalances) {
        if (coinBalance.coinType === SUI_TYPE_TAG || this.isSuiCoinType(coinBalance.coinType)) continue

        const tokenAsset = assetFromStringEx(`SUI.${this.coinTypeToSymbol(coinBalance.coinType)}`) as TokenAsset
        if (assets && !assets.some((a) => eqAsset(a, tokenAsset))) continue

        const decimals = await this.getCoinDecimals(coinBalance.coinType)
        if (decimals === undefined) continue
        balances.push({
          asset: tokenAsset,
          amount: baseAmount(coinBalance.totalBalance, decimals),
        })
      }
      return balances
    }

    const grpc = this.requireGrpc()
    const suiBalance = await grpc.getBalance({
      owner: address,
      coinType: SUI_TYPE_TAG,
    })
    balances.push({
      asset: SUIAsset,
      amount: baseAmount(suiBalance.balance.balance, SUI_DECIMALS),
    })

    let cursor: string | null = null
    const decimalsCache = new Map<string, number | undefined>()
    // Cap pages so pathological addresses cannot hang the client.
    for (let pageNum = 0; pageNum < 20; pageNum++) {
      const page = await grpc.listBalances({
        owner: address,
        cursor: cursor ?? undefined,
      })
      for (const coinBalance of page.balances) {
        if (this.isSuiCoinType(coinBalance.coinType)) continue

        const tokenAsset = assetFromStringEx(`SUI.${this.coinTypeToSymbol(coinBalance.coinType)}`) as TokenAsset
        if (assets && !assets.some((a) => eqAsset(a, tokenAsset))) continue

        if (!decimalsCache.has(coinBalance.coinType)) {
          decimalsCache.set(coinBalance.coinType, await this.getCoinDecimals(coinBalance.coinType))
        }
        const decimals = decimalsCache.get(coinBalance.coinType)
        if (decimals === undefined) continue
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

    if (this.transport === 'jsonRpc') {
      const jsonRpc = await this.getJsonRpcClient()
      const txResponse = await jsonRpc.getTransactionBlock({
        digest: txId,
        options: {
          showInput: true,
          showEffects: true,
          showBalanceChanges: true,
        },
      })
      return this.parseJsonRpcTransaction(txResponse)
    }

    const result = await this.requireGrpc().getTransaction({
      digest: txId,
      include: { balanceChanges: true },
    })
    const transaction = result.Transaction ?? result.FailedTransaction
    if (!transaction?.digest) {
      throw Error(`Transaction ${txId} not found`)
    }
    return this.parseCoreTransaction(transaction.digest, transaction.balanceChanges, transaction.timestampMs ?? null)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync())
    const limit = params?.limit || 50
    const offset = params?.offset || 0

    // GraphQL supports affectedAddress (sent + received). Core API only supports sender.
    const nodes = await this.fetchGraphqlTransactions(address, limit + offset)
    const decimalsCache = new Map<string, number | undefined>()

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

    if (this.transport === 'jsonRpc') {
      const jsonRpc = await this.getJsonRpcClient()
      const result = await jsonRpc.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: { showEffects: true },
      })
      if (result.effects?.status?.status !== 'success') {
        throw Error(`Transaction failed: ${result.effects?.status?.error || 'unknown error'}`)
      }
      await jsonRpc.waitForTransaction({ digest: result.digest })
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

    if (this.transport === 'jsonRpc') {
      const jsonRpc = await this.getJsonRpcClient()
      const result = await jsonRpc.executeTransactionBlock({
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

  private requireGrpc(): SuiGrpcClient['core'] {
    if (!this.grpcClient) {
      throw Error('gRPC client is not available for the jsonRpc transport')
    }
    return this.grpcClient.core
  }

  private async getJsonRpcClient(): Promise<SuiJsonRpcClient> {
    if (this.jsonRpcClient) return this.jsonRpcClient
    // setNetwork can run while this import is in flight. Build the client for the
    // network this call started on, and cache it only if that network is still current.
    const network = this.getNetwork()
    const { SuiJsonRpcClient: JsonRpcClient } = await import('@mysten/sui/jsonRpc')
    const client = new JsonRpcClient({
      url: this.clientUrls[network],
      network: getSuiNetwork(network),
    })
    if (this.getNetwork() === network) {
      this.jsonRpcClient = client
    }
    return client
  }

  private getKeypair(index: number): Ed25519Keypair {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)
    const derived = hd.derive(this.getFullDerivationPath(index))

    return Ed25519Keypair.fromSecretKey(derived.privateKey)
  }

  private async getReferenceGasPrice(): Promise<bigint> {
    if (this.transport === 'jsonRpc') {
      return (await this.getJsonRpcClient()).getReferenceGasPrice()
    }
    const { referenceGasPrice } = await this.requireGrpc().getReferenceGasPrice()
    return BigInt(referenceGasPrice)
  }

  // Missing metadata has no decimals. Callers skip the coin instead of labeling its base units as 9.
  private async getCoinDecimals(coinType: string): Promise<number | undefined> {
    if (this.isSuiCoinType(coinType)) return SUI_DECIMALS

    if (this.transport === 'jsonRpc') {
      try {
        const metadata = await (await this.getJsonRpcClient()).getCoinMetadata({ coinType })
        if (metadata?.decimals != null) return metadata.decimals
      } catch {
        // fall through
      }
      return undefined
    }

    // Prefer a single GraphQL metadata lookup (lighter than full CoinInfo over gRPC).
    try {
      const response = await graphqlQuery<{ coinMetadata?: { decimals: number } | null }>(
        this.graphqlUrls[this.getNetwork()],
        `query ($coinType: String!) {
            coinMetadata(coinType: $coinType) { decimals }
          }`,
        { coinType },
      )
      if (response.data?.coinMetadata?.decimals != null) {
        return response.data.coinMetadata.decimals
      }
    } catch {
      // fall through
    }

    try {
      const { coinMetadata } = await this.requireGrpc().getCoinMetadata({ coinType })
      if (coinMetadata?.decimals != null) return coinMetadata.decimals
    } catch {
      return undefined
    }
    return undefined
  }

  private async getCoins(owner: string, coinType: string): Promise<GasCoinRef[]> {
    if (this.transport === 'jsonRpc') {
      const page = await (await this.getJsonRpcClient()).getCoins({ owner, coinType })
      return page.data.map((c) => ({
        objectId: c.coinObjectId,
        version: c.version,
        digest: c.digest,
      }))
    }

    const page = await this.requireGrpc().listCoins({
      owner,
      coinType,
    })
    return page.objects.map((c) => ({
      objectId: c.objectId,
      version: c.version,
      digest: c.digest,
    }))
  }

  /** Explicit gas payment. Public gRPC/GraphQL clients cannot resolve transactions. */
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
    // Use ALL SUI coin objects as gas payment. Native transfers split the send
    // amount from `tx.gas`; if only the first coin is set, fragmented balances
    // fail with InsufficientCoinBalance even when total SUI is enough (common
    // after many receives / swaps). Multiple gas inputs are merged by the PTB.
    tx.setGasPayment(
      gasCoins.map((c) => ({
        objectId: c.objectId,
        version: c.version,
        digest: c.digest,
      })),
    )
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
   * Execute via the SDK 2 gRPC client. Its read mask requests digest and
   * effects.status; SDK 1.x requested the invalid path `transaction.transaction`.
   */
  private async executeGrpcTransaction(transaction: Uint8Array, signature: string): Promise<string> {
    const result = await this.requireGrpc().executeTransaction({
      transaction,
      signatures: [signature],
    })
    const executed = result.Transaction ?? result.FailedTransaction
    const digest = executed?.digest
    if (!executed || !digest) {
      throw Error('Transaction execution returned no digest')
    }

    // Parsed status uses `error.message`. Raw protobuf status can still carry
    // `error.description` and BigInt fields — formatGrpcExecutionFailure handles both.
    const status = executed.status
    if (result.$kind === 'FailedTransaction' || isGrpcExecutionFailure(status)) {
      throw Error(formatGrpcExecutionFailure(status))
    }

    return digest
  }

  private async waitForGraphqlTransaction(digest: string, timeoutMs = 60_000): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now()
      try {
        const response = await graphqlQuery<{ transaction?: { digest?: string } }>(
          this.graphqlUrls[this.getNetwork()],
          `query ($digest: String!) {
            transaction(digest: $digest) {
              digest
              effects { status }
            }
          }`,
          { digest },
          AbortSignal.timeout(remaining),
        )
        if (response.data?.transaction?.digest) {
          return
        }
      } catch {
        // keep polling, including a request aborted at the deadline
      }
      const pause = Math.min(1000, deadline - Date.now())
      if (pause <= 0) break
      await new Promise((r) => setTimeout(r, pause))
    }
    throw Error(`Timed out waiting for transaction ${digest} to be indexed`)
  }

  private async getTransactionDataFromGraphql(txId: string): Promise<Tx> {
    const response = await graphqlQuery<{ transaction?: GraphqlTxNode | null }>(
      this.graphqlUrls[this.getNetwork()],
      `query ($digest: String!) {
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
      { digest: txId },
    )

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
      // Copy the cursor so its later assignment from `response` is not part of this initializer.
      const after = cursor
      const response: GraphqlResult<GraphqlTxConnection> = await graphqlQuery<GraphqlTxConnection>(
        this.graphqlUrls[this.getNetwork()],
        `query ($address: SuiAddress!, $first: Int!, $after: String) {
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
        { address, first: pageSize, after },
      )

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
    decimalsCache: Map<string, number | undefined> = new Map(),
  ): Promise<Tx> {
    const from: TxFrom[] = []
    const to: TxTo[] = []
    const changes = node.effects?.balanceChanges?.nodes || []

    for (const change of changes) {
      const coinType = change.coinType?.repr || SUI_TYPE_TAG
      const isSui = this.isSuiCoinType(coinType)
      if (!decimalsCache.has(coinType)) {
        decimalsCache.set(coinType, await this.getCoinDecimals(coinType))
      }
      const decimals = decimalsCache.get(coinType)
      if (decimals === undefined) continue
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
        if (decimals === undefined) continue
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
    timestamp: string | number | null,
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
