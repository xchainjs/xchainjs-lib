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
import { Address, TokenAsset, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import slip10 from 'micro-key-producer/slip10.js'
import {
  Account,
  FailoverRpcProvider,
  JsonRpcProvider,
  KeyPair,
  KeyPairEd25519,
  KeyPairSigner,
  Provider,
  SignedTransaction,
  actions,
  base64Encode,
  baseEncode,
  decodeSignedTransaction,
  decodeTransaction,
} from 'near-api-js'

/** Minimal shape of near-api-js transaction RPC responses we consume. */
type RpcTxResult = {
  transaction?: {
    hash?: string
    signer_id?: string
    receiver_id?: string
    actions?: Array<{ Transfer?: { deposit: string } }>
  }
  transaction_outcome?: {
    id?: string
    outcome?: { tokens_burnt?: string }
  }
}

import { NEARAsset, NEARChain, NEAR_DECIMALS, TRANSFER_GAS, defaultNearParams } from './const'
import { Balance, NearClientParams, Tx, TxParams, TxsPage } from './types'
import {
  getNearNetworkId,
  publicKeyToImplicitAccount,
  resolveClientUrls,
  resolveNearblocksUrl,
  validateNearAddress,
} from './utils'

type NearblocksTxn = {
  transaction_hash?: string
  predecessor_account_id?: string
  receiver_account_id?: string
  block_timestamp?: string | number
  actions_agg?: { deposit?: number | string }
  outcomes?: { status?: boolean }
  outcomes_agg?: { transaction_fee?: number | string }
  actions?: Array<{ action?: string; method?: string }>
}

type NearblocksTxnsResponse = {
  txns?: NearblocksTxn[]
}

type NearblocksTxnDetailResponse = {
  txns?: Array<
    NearblocksTxn & {
      transaction_hash: string
      receipts_outcome?: unknown
    }
  >
}

/**
 * NEAR Protocol client for XChainJS.
 *
 * Wallet addresses are **implicit accounts** (64-char hex of the ed25519 public key)
 * derived via SLIP-0010 at `m/44'/397'/{index}'`. Transfers may target named accounts
 * (e.g. `alice.near`) as well as implicit ids.
 *
 * History and hash-only tx lookups use NearBlocks. Balance / fees / transfer use
 * JSON-RPC via `near-api-js` with provider failover.
 */
export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private clientUrls: Record<Network, string[]>
  private nearblocksUrls: Record<Network, string>
  private nearblocksApiKey?: string
  private provider: Provider
  private readonly callerParams: Pick<NearClientParams, 'clientUrls' | 'nearblocksUrls'>

  constructor(params: NearClientParams = defaultNearParams) {
    const mergedParams = { ...defaultNearParams, ...params }
    super(NEARChain, mergedParams)
    this.explorerProviders = mergedParams.explorerProviders
    this.nearblocksApiKey = params.nearblocksApiKey
    this.callerParams = {
      clientUrls: params.clientUrls,
      nearblocksUrls: params.nearblocksUrls,
    }

    this.clientUrls = {
      [Network.Mainnet]: resolveClientUrls(Network.Mainnet, this.callerParams),
      [Network.Testnet]: resolveClientUrls(Network.Testnet, this.callerParams),
      [Network.Stagenet]: resolveClientUrls(Network.Stagenet, this.callerParams),
    }
    this.nearblocksUrls = {
      [Network.Mainnet]: resolveNearblocksUrl(Network.Mainnet, this.callerParams),
      [Network.Testnet]: resolveNearblocksUrl(Network.Testnet, this.callerParams),
      [Network.Stagenet]: resolveNearblocksUrl(Network.Stagenet, this.callerParams),
    }

    this.provider = this.createProvider(this.getNetwork())
  }

  public setNetwork(network: Network): void {
    super.setNetwork(network)
    this.provider = this.createProvider(network)
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: NEARAsset,
      decimal: NEAR_DECIMALS,
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
    return `${this.rootDerivationPaths[this.getNetwork()]}${walletIndex}'`
  }

  public async getAddressAsync(index = 0): Promise<string> {
    return this.getImplicitAccountId(index)
  }

  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  public validateAddress(address: Address): boolean {
    return validateNearAddress(address)
  }

  public async getBalance(address: Address, _assets?: TokenAsset[]): Promise<Balance[]> {
    try {
      const account = await this.provider.viewAccount({ accountId: address })
      return [
        {
          asset: NEARAsset,
          amount: baseAmount(account.amount.toString(), NEAR_DECIMALS),
        },
      ]
    } catch (error) {
      if (this.isAccountDoesNotExistError(error)) {
        return [
          {
            asset: NEARAsset,
            amount: baseAmount(0, NEAR_DECIMALS),
          },
        ]
      }
      throw error
    }
  }

  public async getFees(): Promise<Fees> {
    const gasPrice = await this.provider.viewGasPrice()
    const feeYocto = BigInt(gasPrice.gas_price) * TRANSFER_GAS
    const fee = baseAmount(feeYocto.toString(), NEAR_DECIMALS)
    return {
      type: FeeType.FlatFee,
      [FeeOption.Average]: fee,
      [FeeOption.Fast]: fee,
      [FeeOption.Fastest]: fee,
    }
  }

  public async getTransactionData(txId: string, signerAccountId?: string): Promise<Tx> {
    try {
      return await this.getTransactionDataFromNearblocks(txId)
    } catch {
      // Fall through to RPC when NearBlocks is unavailable.
    }

    const signerId = signerAccountId || (await this.tryGetSignerAddress())
    if (!signerId) {
      throw Error('Can not find transaction: signer account id required for RPC lookup')
    }

    const status = await this.provider.viewTransactionStatus({
      txHash: txId,
      accountId: signerId,
      waitUntil: 'NONE',
    })
    return this.parseRpcTransaction(status as RpcTxResult)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync())
    const limit = params?.limit || 10
    const offset = params?.offset || 0
    const page = Math.floor(offset / limit) + 1

    const response = await this.fetchNearblocks<NearblocksTxnsResponse>(
      `/v1/account/${encodeURIComponent(address)}/txns?per_page=${limit}&page=${page}`,
    )
    const txns = response.txns || []
    const txs = txns.map((txn) => this.parseNearblocksTxn(txn)).filter((tx): tx is Tx => tx !== null)

    return {
      total: offset + txs.length,
      txs,
    }
  }

  public async transfer({ walletIndex = 0, recipient, asset, amount, memo }: TxParams): Promise<string> {
    if (memo) throw Error('Memo is not supported for NEAR transfers')
    if (asset && !eqAsset(asset, NEARAsset)) {
      throw Error('Only native NEAR transfers are supported')
    }
    if (!this.validateAddress(recipient)) {
      throw Error('Invalid recipient address')
    }

    const keyPair = this.getKeyPair(walletIndex)
    const sender = this.getImplicitAccountId(walletIndex)
    const account = new Account(sender, this.provider, new KeyPairSigner(keyPair))

    const result = await account.transfer({
      receiverId: recipient,
      amount: BigInt(amount.amount().toFixed(0)),
    })

    return this.extractTxHash(result as RpcTxResult)
  }

  public async prepareTx({ walletIndex = 0, recipient, asset, amount, memo }: TxParams): Promise<PreparedTx> {
    if (memo) throw Error('Memo is not supported for NEAR transfers')
    if (asset && !eqAsset(asset, NEARAsset)) {
      throw Error('Only native NEAR transfers are supported')
    }
    if (!this.validateAddress(recipient)) {
      throw Error('Invalid recipient address')
    }

    const keyPair = this.getKeyPair(walletIndex)
    const sender = this.getImplicitAccountId(walletIndex)
    const account = new Account(sender, this.provider, new KeyPairSigner(keyPair))

    const transaction = await account.createTransaction({
      receiverId: recipient,
      actions: [actions.transfer(BigInt(amount.amount().toFixed(0)))],
      publicKey: keyPair.getPublicKey(),
    })

    return {
      rawUnsignedTx: base64Encode(transaction.encode()),
    }
  }

  /**
   * Broadcast a NEAR transaction.
   * Accepts base64 of either a signed transaction, or an unsigned prepared tx
   * (which is signed with wallet index 0).
   */
  public async broadcastTx(txHex: string): Promise<TxHash> {
    const keyPair = this.getKeyPair(0)
    const sender = this.getImplicitAccountId(0)
    const account = new Account(sender, this.provider, new KeyPairSigner(keyPair))

    let signed: SignedTransaction
    try {
      signed = decodeSignedTransaction(Buffer.from(txHex, 'base64'))
    } catch {
      const unsigned = decodeTransaction(Buffer.from(txHex, 'base64'))
      signed = await account.createSignedTransaction({
        receiverId: unsigned.receiverId,
        actions: unsigned.actions,
      })
    }

    const result = await this.provider.sendTransaction(signed)
    return this.extractTxHash(result as RpcTxResult)
  }

  /** Whether the account exists on-chain (funded implicit / created named). */
  public async accountExists(address: Address): Promise<boolean> {
    try {
      await this.provider.viewAccount({ accountId: address })
      return true
    } catch (error) {
      if (this.isAccountDoesNotExistError(error)) return false
      throw error
    }
  }

  public getNetworkId(): 'mainnet' | 'testnet' {
    return getNearNetworkId(this.getNetwork())
  }

  private createProvider(network: Network): Provider {
    const urls = this.clientUrls[network]
    const providers = urls.map((url) => new JsonRpcProvider({ url }))
    if (providers.length === 1) return providers[0]
    return new FailoverRpcProvider(providers)
  }

  private getDerivedKey(index: number): { privateKey: Uint8Array; publicKey: Uint8Array } {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)
    const derived = hd.derive(this.getFullDerivationPath(index))
    return {
      privateKey: derived.privateKey,
      publicKey: derived.publicKey,
    }
  }

  private getImplicitAccountId(index: number): string {
    return publicKeyToImplicitAccount(this.getDerivedKey(index).publicKey)
  }

  private getKeyPair(index: number): KeyPair {
    const { privateKey } = this.getDerivedKey(index)
    // KeyPairEd25519 accepts base58 of the 32-byte secret (pubkey is derived).
    return new KeyPairEd25519(baseEncode(privateKey))
  }

  private async tryGetSignerAddress(): Promise<string | undefined> {
    try {
      if (!this.phrase) return undefined
      return await this.getAddressAsync(0)
    } catch {
      return undefined
    }
  }

  private async getTransactionDataFromNearblocks(txId: string): Promise<Tx> {
    const response = await this.fetchNearblocks<NearblocksTxnDetailResponse>(`/v1/txns/${encodeURIComponent(txId)}`)
    const txn = response.txns?.[0]
    if (!txn) throw Error('Can not find transaction')
    const parsed = this.parseNearblocksTxn(txn)
    if (!parsed) throw Error('Can not parse transaction')
    return parsed
  }

  private parseNearblocksTxn(txn: NearblocksTxn): Tx | null {
    const hash = txn.transaction_hash
    if (!hash) return null

    const fromAddress = txn.predecessor_account_id || ''
    const toAddress = txn.receiver_account_id || ''
    const deposit = txn.actions_agg?.deposit != null ? String(txn.actions_agg.deposit) : '0'
    const dateMs = txn.block_timestamp ? Math.floor(Number(txn.block_timestamp) / 1_000_000) : Date.now()

    return {
      asset: NEARAsset,
      hash,
      date: new Date(dateMs),
      type: TxType.Transfer,
      from: [
        {
          from: fromAddress,
          amount: baseAmount(deposit, NEAR_DECIMALS),
          asset: NEARAsset,
        },
      ],
      to: [
        {
          to: toAddress,
          amount: baseAmount(deposit, NEAR_DECIMALS),
          asset: NEARAsset,
        },
      ],
    }
  }

  private parseRpcTransaction(status: RpcTxResult): Tx {
    const tx = status.transaction || {}
    const hash = tx.hash || status.transaction_outcome?.id || ''
    const depositAction = tx.actions?.find((a) => a.Transfer)
    const deposit = depositAction?.Transfer?.deposit || '0'

    return {
      asset: NEARAsset,
      hash,
      date: new Date(),
      type: TxType.Transfer,
      from: [
        {
          from: tx.signer_id || '',
          amount: baseAmount(deposit, NEAR_DECIMALS),
          asset: NEARAsset,
        },
      ],
      to: [
        {
          to: tx.receiver_id || '',
          amount: baseAmount(deposit, NEAR_DECIMALS),
          asset: NEARAsset,
        },
      ],
    }
  }

  private extractTxHash(result: RpcTxResult): string {
    if (result.transaction?.hash) return result.transaction.hash
    if (result.transaction_outcome?.id) return result.transaction_outcome.id
    throw Error('Transaction submitted but hash was not returned')
  }

  private async fetchNearblocks<T>(path: string): Promise<T> {
    const base = this.nearblocksUrls[this.getNetwork()].replace(/\/$/, '')
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (this.nearblocksApiKey) {
      headers.Authorization = `Bearer ${this.nearblocksApiKey}`
    }

    const response = await fetch(`${base}${path}`, { headers })
    if (!response.ok) {
      throw Error(`NearBlocks request failed: ${response.status} ${response.statusText}`)
    }
    return (await response.json()) as T
  }

  private isAccountDoesNotExistError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error)
    return /does not exist|doesn't exist|UnknownAccount|ACCOUNT_DOES_NOT_EXIST/i.test(message)
  }
}
