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
import { getSeed, validatePhrase } from '@xchainjs/xchain-crypto'
import { Address, BaseAmount, baseAmount } from '@xchainjs/xchain-util'
import { keccak_256 } from '@noble/hashes/sha3'
import slip10 from 'micro-key-producer/slip10.js'

import { AssetXMR, XMRChain, XMR_DECIMALS, TYPICAL_TX_WEIGHT, defaultXMRParams } from './const'
import { encodeAddress } from './crypto/address'
import { deriveKeyPairs } from './crypto/keys'
import * as daemon from './daemon'
import * as lws from './lws'
import * as walletRpc from './walletRpc'
import { scanBlocks, computeBalance, OwnedOutput } from './scanner'
import { Balance, Tx, TxParams, TxsPage, XMRClientParams } from './types'
import {
  bytesToHex,
  feeOptionToWalletRpcPriority,
  getMoneroNetworkType,
  scReduce32,
  validateMoneroAddress,
} from './utils'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private daemonUrls: Record<Network, string[]>
  private lwsUrls: Record<Network, string[]>
  private walletRpcUrls: Record<Network, string[]>
  private lwsLoggedIn = false
  private restoreHeight: number
  private walletRpcLock: Promise<unknown> = Promise.resolve()

  /** Cached scan state for daemon fallback */
  private scanCache: {
    lastHeight: number
    ownedOutputs: OwnedOutput[]
    spentKeyImages: Set<string>
  } | null = null

  constructor(params: XMRClientParams = defaultXMRParams) {
    super(XMRChain, {
      ...defaultXMRParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders ?? defaultXMRParams.explorerProviders
    this.daemonUrls = params.daemonUrls ?? defaultXMRParams.daemonUrls!
    this.lwsUrls = params.lwsUrls ?? defaultXMRParams.lwsUrls!
    this.walletRpcUrls = params.walletRpcUrls ?? defaultXMRParams.walletRpcUrls!
    this.restoreHeight = params.restoreHeight ?? 0
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetXMR,
      decimal: XMR_DECIMALS,
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

  /**
   * Derive the Monero address for a wallet index (pure JS, sync).
   */
  public getAddress(index?: number): string {
    const spendKey = this.getPrivateSpendKey(index ?? 0)
    const keys = deriveKeyPairs(spendKey)
    const networkType = getMoneroNetworkType(this.getNetwork())
    return encodeAddress(keys.publicSpendKey, keys.publicViewKey, networkType)
  }

  public async getAddressAsync(index?: number): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Set or update the mnemonic. Clears scan cache and LWS session state when the
   * phrase changes so a new wallet cannot reuse another wallet's cache. The
   * wallet-rpc lock queue is preserved so in-flight ops still serialize.
   */
  public setPhrase(phrase: string, walletIndex = 0): Address {
    if (this.phrase !== phrase) {
      if (!validatePhrase(phrase)) {
        throw new Error('Invalid phrase')
      }
      this.phrase = phrase
      this.resetWalletState()
    }
    return this.getAddress(walletIndex)
  }

  /**
   * Clear phrase and wallet session state (scan cache, LWS login). The wallet-rpc
   * lock queue is preserved so concurrent ops cannot race onto a new wallet.
   */
  public purgeClient(): void {
    super.purgeClient()
    this.resetWalletState()
  }

  public validateAddress(address: Address): boolean {
    return validateMoneroAddress(address)
  }

  /**
   * Get spendable balance via wallet-rpc (unlocked), then LWS, then a bounded daemon scan.
   * For wallet-rpc, prefer {@link getWalletBalanceDetail} when both total and unlocked are needed.
   */
  public async getBalance(address: Address): Promise<Balance[]> {
    const walletRpcUrls = this.walletRpcUrls[this.getNetwork()]
    if (walletRpcUrls && walletRpcUrls.length > 0) {
      const detail = await this.getWalletBalanceDetail(address)
      return [{ asset: AssetXMR, amount: detail.unlocked }]
    }

    // Try LWS next
    const urls = this.lwsUrls[this.getNetwork()]
    if (urls && urls.length > 0) {
      const viewKeyHex = this.getViewKeyHex(0)
      for (const url of urls) {
        try {
          if (!this.lwsLoggedIn) {
            await lws.login(url, address, viewKeyHex)
            this.lwsLoggedIn = true
          }
          const info = await lws.getAddressInfo(url, address, viewKeyHex)
          const received = BigInt(info.total_received)
          const sent = BigInt(info.total_sent)
          const balance = received - sent
          return [{ asset: AssetXMR, amount: baseAmount(balance.toString(), XMR_DECIMALS) }]
        } catch (error) {
          console.warn(`LWS ${url} failed for getBalance:`, (error as Error).message)
          this.lwsLoggedIn = false
          continue
        }
      }
    }

    // Fallback: daemon scanning
    console.warn('LWS unavailable, falling back to daemon scanning (this may be slow)')
    const scanResult = await this.daemonScan()
    const balance = computeBalance(scanResult.ownedOutputs, scanResult.spentKeyImages)
    return [{ asset: AssetXMR, amount: baseAmount(balance.toString(), XMR_DECIMALS) }]
  }

  /**
   * Estimate a typical tx fee as daemon fee-per-byte × TYPICAL_TX_WEIGHT.
   * Wallet-rpc computes the real fee at transfer time.
   */
  public async getFees(): Promise<Fees> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const feePerByte = await daemon.getFeeEstimate(url)
        const fee = baseAmount((BigInt(feePerByte) * BigInt(TYPICAL_TX_WEIGHT)).toString(), XMR_DECIMALS)

        return {
          type: FeeType.FlatFee,
          [FeeOption.Average]: fee,
          [FeeOption.Fast]: fee,
          [FeeOption.Fastest]: fee,
        }
      } catch (error) {
        console.warn(`Daemon ${url} failed for getFees:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to get fees')
  }

  /**
   * Get transaction details by hash via daemon RPC.
   */
  public async getTransactionData(txId: string): Promise<Tx> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const txs = await daemon.getTransactions(url, [txId])
        if (!txs.length) throw Error('Transaction not found')

        const tx = txs[0]
        return {
          asset: AssetXMR,
          date: new Date(tx.block_timestamp * 1000),
          type: TxType.Transfer,
          hash: tx.tx_hash,
          from: [],
          to: [],
        }
      } catch (error) {
        console.warn(`Daemon ${url} failed for getTransactionData:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to get transaction data')
  }

  /**
   * Get transaction history via wallet-rpc, then LWS, then a bounded daemon scan.
   * Incoming counterparties are unknown (Monero privacy). Outgoing destinations
   * are available when the tx was created by this wallet.
   */
  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync(0))
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? 10

    const walletRpcUrls = this.walletRpcUrls[this.getNetwork()]
    if (walletRpcUrls && walletRpcUrls.length > 0) {
      const ownAddress = await this.getAddressAsync(0)
      if (address !== ownAddress) {
        throw new Error('Monero wallet RPC can only return history for the unlocked wallet address')
      }
      let lastError: unknown
      for (const url of walletRpcUrls) {
        try {
          return await this.getTransactionsFromWalletRpc(url, address, offset, limit)
        } catch (error) {
          lastError = error
          console.warn(`Wallet RPC ${url} failed for getTransactions:`, (error as Error).message)
        }
      }
      throw lastError instanceof Error
        ? lastError
        : new Error('All Monero wallet RPC endpoints failed for getTransactions')
    }

    // Try LWS next
    const urls = this.lwsUrls[this.getNetwork()]
    if (urls && urls.length > 0) {
      const viewKeyHex = this.getViewKeyHex(0)
      for (const url of urls) {
        try {
          if (!this.lwsLoggedIn) {
            await lws.login(url, address, viewKeyHex)
            this.lwsLoggedIn = true
          }

          const result = await lws.getAddressTxs(url, address, viewKeyHex)

          const confirmedTxs = (result.transactions ?? [])
            .filter((tx) => !tx.mempool && tx.height > 0)
            .sort((a, b) => b.height - a.height)

          const paginated = confirmedTxs.slice(offset, offset + limit)

          const txs: Tx[] = paginated.map((tx) => {
            const received = BigInt(tx.total_received)
            const sent = BigInt(tx.total_sent)
            const netAmount = received - sent
            const isIncoming = netAmount > BigInt(0)

            return {
              asset: AssetXMR,
              date: new Date(tx.timestamp),
              type: TxType.Transfer,
              hash: tx.hash,
              from: isIncoming
                ? []
                : [{ from: address, amount: baseAmount((BigInt(-1) * netAmount).toString(), XMR_DECIMALS) }],
              to: isIncoming ? [{ to: address, amount: baseAmount(netAmount.toString(), XMR_DECIMALS) }] : [],
            }
          })

          return { total: confirmedTxs.length, txs }
        } catch (error) {
          console.warn(`LWS ${url} failed for getTransactions:`, (error as Error).message)
          this.lwsLoggedIn = false
          continue
        }
      }
    }

    // Fallback: daemon scanning
    console.warn('LWS unavailable, falling back to daemon scanning for tx history')
    const scanResult = await this.daemonScan()
    const allOutputs = scanResult.ownedOutputs.sort((a, b) => b.height - a.height)

    const paginated = allOutputs.slice(offset, offset + limit)
    const txs: Tx[] = paginated.map((out) => ({
      asset: AssetXMR,
      date: new Date(out.timestamp * 1000),
      type: TxType.Transfer,
      hash: out.txHash,
      from: [],
      to: [{ to: address, amount: baseAmount(out.amount.toString(), XMR_DECIMALS) }],
    }))

    return { total: allOutputs.length, txs }
  }

  /**
   * Total and unlocked balances from monero-wallet-rpc (own address only).
   * Unlocked is what can be spent immediately; total includes locked outputs.
   */
  public async getWalletBalanceDetail(address: Address): Promise<{ total: BaseAmount; unlocked: BaseAmount }> {
    const walletRpcUrls = this.walletRpcUrls[this.getNetwork()]
    if (!walletRpcUrls || walletRpcUrls.length === 0) {
      throw new Error('getWalletBalanceDetail requires walletRpcUrls')
    }
    const ownAddress = this.getAddress(0)
    if (address !== ownAddress) {
      throw new Error('Monero wallet RPC can only return the balance for the unlocked wallet address')
    }
    let lastError: unknown
    for (const url of walletRpcUrls) {
      try {
        const result = await this.getBalanceFromWalletRpc(url)
        return {
          total: baseAmount(result.total.toString(), XMR_DECIMALS),
          unlocked: baseAmount(result.unlocked.toString(), XMR_DECIMALS),
        }
      } catch (error) {
        lastError = error
        console.warn(`Wallet RPC ${url} failed for getWalletBalanceDetail:`, (error as Error).message)
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error('All Monero wallet RPC endpoints failed for getWalletBalanceDetail')
  }

  /**
   * Transfer XMR to a recipient address via monero-wallet-rpc.
   * The in-process RingCT builder is not used: it is not consensus-compatible.
   */
  public async transfer(params: TxParams): Promise<string> {
    const { recipient, amount } = params
    if (!recipient) throw new Error('Recipient address is required')
    if (!amount) throw new Error('Amount is required')
    if (!this.validateAddress(recipient)) {
      throw new Error('Invalid Monero recipient address')
    }

    const walletRpcUrls = this.walletRpcUrls[this.getNetwork()]
    if (!walletRpcUrls || walletRpcUrls.length === 0) {
      throw new Error(
        'Monero transfer requires monero-wallet-rpc (set walletRpcUrls). ' +
          'The in-process RingCT builder is not used for sending.',
      )
    }
    if (!this.phrase) throw new Error('Phrase must be provided')

    let lastError: unknown
    for (const url of walletRpcUrls) {
      try {
        return await this.transferViaWalletRpc(url, params)
      } catch (error) {
        lastError = error
        console.warn(`Wallet RPC ${url} failed for transfer:`, (error as Error).message)
      }
    }
    throw lastError instanceof Error ? lastError : new Error('All Monero wallet RPC endpoints failed for transfer')
  }

  /**
   * Not supported. Raw daemon broadcast returned a non-canonical txid and encouraged
   * use of the experimental in-process builder. Use {@link transfer} via wallet-rpc.
   */
  public async broadcastTx(_txHex: string): Promise<TxHash> {
    throw Error('broadcastTx is not supported for Monero. Use transfer() instead.')
  }

  /**
   * Prepare an unsigned transaction.
   * Monero transactions require private key context for ring signature
   * construction, so this method is not supported.
   */
  public async prepareTx(_params: TxParams): Promise<PreparedTx> {
    throw Error('prepareTx is not supported for Monero. Use transfer() instead.')
  }

  /**
   * Get the private view key hex for a wallet index.
   */
  private getViewKeyHex(index: number): string {
    const spendKey = this.getPrivateSpendKey(index)
    const keys = deriveKeyPairs(spendKey)
    return bytesToHex(keys.privateViewKey)
  }

  /**
   * Derives private spend key from BIP-39 mnemonic via SLIP-10 derivation.
   */
  private getPrivateSpendKey(index: number): Uint8Array {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)
    const derivedKey = hd.derive(this.getFullDerivationPath(index)).privateKey

    return scReduce32(derivedKey)
  }

  /**
   * Scan the blockchain via daemon RPC to find owned outputs.
   * Uses cached results and scans incrementally from the last scanned height.
   */
  private async daemonScan(walletIndex: number = 0): Promise<{
    ownedOutputs: OwnedOutput[]
    spentKeyImages: Set<string>
  }> {
    const daemonUrls = this.daemonUrls[this.getNetwork()]
    if (!daemonUrls || daemonUrls.length === 0) {
      throw new Error('No daemon URLs configured')
    }

    const daemonUrl = daemonUrls[0]
    const currentHeight = await daemon.getHeight(daemonUrl)

    const fromHeight = this.scanCache ? this.scanCache.lastHeight + 1 : this.restoreHeight

    if (fromHeight >= currentHeight && this.scanCache) {
      return this.scanCache
    }

    // JSON daemon scanning is only viable for a short range. A local node still
    // cannot answer "what is my balance?" without wallet-rpc or LWS.
    const MAX_DAEMON_SCAN_BLOCKS = 5_000
    if (currentHeight - fromHeight > MAX_DAEMON_SCAN_BLOCKS) {
      throw new Error(
        `Daemon scan range too large (${currentHeight - fromHeight} blocks from height ${fromHeight}). ` +
          'Configure walletRpcUrls or lwsUrls, or set a more recent restoreHeight.',
      )
    }

    const spendKey = this.getPrivateSpendKey(walletIndex)
    const keys = deriveKeyPairs(spendKey)

    const result = await scanBlocks(
      daemonUrl,
      keys.privateViewKey,
      keys.publicSpendKey,
      spendKey,
      fromHeight,
      currentHeight - 1,
    )

    // Merge with cached results
    const ownedOutputs = this.scanCache ? [...this.scanCache.ownedOutputs, ...result.ownedOutputs] : result.ownedOutputs

    const spentKeyImages = this.scanCache
      ? new Set([...this.scanCache.spentKeyImages, ...result.spentKeyImages])
      : result.spentKeyImages

    this.scanCache = {
      lastHeight: currentHeight - 1,
      ownedOutputs,
      spentKeyImages,
    }

    return this.scanCache
  }

  private async withWalletRpcLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.walletRpcLock.then(fn, fn)
    this.walletRpcLock = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }

  /**
   * Restore or open a wallet-rpc wallet from the BIP-39 derived keys and wait
   * until it has caught the local daemon. Returns the derived primary address.
   */
  private async prepareWalletRpc(url: string, walletIndex = 0): Promise<string> {
    const spendKey = this.getPrivateSpendKey(walletIndex)
    const keys = deriveKeyPairs(spendKey)
    const address = encodeAddress(keys.publicSpendKey, keys.publicViewKey, getMoneroNetworkType(this.getNetwork()))
    const filename = `xchain-${address.slice(0, 16)}`
    const password = bytesToHex(keccak_256(spendKey))

    await walletRpc.ensureWallet(url, {
      filename,
      address,
      spendKey: bytesToHex(spendKey),
      viewKey: bytesToHex(keys.privateViewKey),
      password,
      restoreHeight: this.restoreHeight,
    })

    await this.waitForWalletSync(url)
    return address
  }

  private resetWalletState(): void {
    this.scanCache = null
    this.lwsLoggedIn = false
  }

  private async getBalanceFromWalletRpc(url: string): Promise<{ total: bigint; unlocked: bigint }> {
    return this.withWalletRpcLock(async () => {
      await this.prepareWalletRpc(url)
      const result = await walletRpc.callWithBusyRetry(() => walletRpc.getBalance(url))
      return {
        total: BigInt(result.balance),
        unlocked: BigInt(result.unlockedBalance),
      }
    })
  }

  private async transferViaWalletRpc(url: string, params: TxParams): Promise<string> {
    return this.withWalletRpcLock(async () => {
      await this.prepareWalletRpc(url, params.walletIndex ?? 0)
      const balances = await walletRpc.callWithBusyRetry(() => walletRpc.getBalance(url))
      const unlocked = BigInt(balances.unlockedBalance)
      const amountPiconero = BigInt(params.amount.amount().toFixed(0))
      if (amountPiconero > unlocked) {
        throw new Error(
          `Insufficient unlocked balance: need ${amountPiconero.toString()} piconero, unlocked ${unlocked.toString()}`,
        )
      }
      return walletRpc.callWithBusyRetry(() =>
        walletRpc.transfer(url, {
          address: params.recipient,
          amountPiconero: amountPiconero.toString(),
          priority: feeOptionToWalletRpcPriority(params.feeOption),
        }),
      )
    })
  }

  private async getTransactionsFromWalletRpc(
    url: string,
    address: string,
    offset: number,
    limit: number,
  ): Promise<TxsPage> {
    const { ownAddress, transfers } = await this.withWalletRpcLock(async () => {
      const prepared = await this.prepareWalletRpc(url)
      const txs = await walletRpc.callWithBusyRetry(() => walletRpc.getTransfers(url))
      return { ownAddress: prepared, transfers: txs }
    })

    const confirmed = transfers.sort((a, b) => b.height - a.height || b.timestamp - a.timestamp)
    const paginated = confirmed.slice(offset, offset + limit)

    const txs: Tx[] = paginated.map((tx) => {
      const amount = baseAmount(tx.amount, XMR_DECIMALS)
      const isIncoming = tx.type !== 'out'

      return {
        asset: AssetXMR,
        date: new Date(tx.timestamp * 1000),
        type: TxType.Transfer,
        hash: tx.txid,
        from: isIncoming ? [] : [{ from: address || ownAddress, amount }],
        to: isIncoming
          ? [{ to: address || ownAddress, amount }]
          : tx.destinations.map((dest) => ({
              to: dest.address,
              amount: baseAmount(dest.amount, XMR_DECIMALS),
            })),
      }
    })

    return { total: confirmed.length, txs }
  }

  private async waitForWalletSync(walletUrl: string): Promise<void> {
    const daemonUrl = this.daemonUrls[this.getNetwork()]?.[0]
    let target: number | null = null
    if (daemonUrl) {
      try {
        target = await daemon.getHeight(daemonUrl)
      } catch (error) {
        console.warn('Could not read daemon height while waiting for wallet sync:', (error as Error).message)
      }
    }

    // Without a daemon tip there is nothing to wait for — refresh once and continue.
    if (target == null) {
      try {
        await walletRpc.refresh(walletUrl)
      } catch (error) {
        if (!walletRpc.isBusyError(error)) throw error
      }
      return
    }

    const started = Date.now()
    const timeoutMs = 15 * 60 * 1000
    let lastLogged = 0

    while (Date.now() - started < timeoutMs) {
      try {
        await walletRpc.refresh(walletUrl)
        const { height } = await walletRpc.getHeight(walletUrl)
        if (height !== lastLogged) {
          console.log(`[XMR] wallet sync ${height} / ${target}`)
          lastLogged = height
        }
        if (height + 2 >= target) return
      } catch (error) {
        if (!walletRpc.isBusyError(error)) throw error
      }
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }

    throw new Error('Timed out waiting for Monero wallet RPC to sync with the local node')
  }
}
