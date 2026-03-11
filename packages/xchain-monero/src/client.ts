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
import { Address, baseAmount } from '@xchainjs/xchain-util'
import { keccak_256 } from '@noble/hashes/sha3'
import slip10 from 'micro-key-producer/slip10.js'

import { AssetXMR, XMRChain, XMR_DECIMALS, defaultXMRParams } from './const'
import { encodeAddress, decodeAddress } from './crypto/address'
import { deriveKeyPairs } from './crypto/keys'
import * as daemon from './daemon'
import * as lws from './lws'
import { buildTransaction } from './tx/builder'
import type { SpendableOutput, Destination } from './tx/builder'
import { scanBlocks, computeBalance, OwnedOutput } from './scanner'
import { Balance, Tx, TxParams, TxsPage, XMRClientParams } from './types'
import { bytesToHex, hexToBytes, getMoneroNetworkType, scReduce32, validateMoneroAddress } from './utils'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private daemonUrls: Record<Network, string[]>
  private lwsUrls: Record<Network, string[]>
  private lwsLoggedIn = false
  private restoreHeight: number

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
   * Get the current address asynchronously.
   * Derives keys from mnemonic and encodes as Monero address (pure JS, no WASM).
   */
  public async getAddressAsync(index?: number): Promise<string> {
    const spendKey = this.getPrivateSpendKey(index ?? 0)
    const keys = deriveKeyPairs(spendKey)
    const networkType = getMoneroNetworkType(this.getNetwork())
    return encodeAddress(keys.publicSpendKey, keys.publicViewKey, networkType)
  }

  /**
   * @deprecated Use getAddressAsync instead
   */
  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  public validateAddress(address: Address): boolean {
    return validateMoneroAddress(address)
  }

  /**
   * Get balance via LWS, falling back to daemon scanning if LWS is unavailable.
   */
  public async getBalance(address: Address): Promise<Balance[]> {
    // Try LWS first
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
   * Get transaction fees via daemon RPC.
   */
  public async getFees(): Promise<Fees> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const feeEstimate = await daemon.getFeeEstimate(url)
        const fee = baseAmount(feeEstimate.toString(), XMR_DECIMALS)

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
   * Get transaction history via LWS, falling back to daemon scanning.
   * Due to Monero privacy, counterparty addresses are unavailable;
   * the own address is used with net amount for from/to.
   */
  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync(0))
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? 10

    // Try LWS first
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
   * Transfer XMR to a recipient address.
   * Builds a complete RingCT transaction with CLSAG signatures and Bulletproofs+ range proof.
   */
  public async transfer(params: TxParams): Promise<string> {
    const { recipient, amount } = params
    if (!recipient) throw new Error('Recipient address is required')
    if (!amount) throw new Error('Amount is required')

    const recipientKeys = decodeAddress(recipient)
    const spendKey = this.getPrivateSpendKey(params.walletIndex ?? 0)
    const keys = deriveKeyPairs(spendKey)

    // Get daemon URL
    const daemonUrls = this.daemonUrls[this.getNetwork()]
    if (!daemonUrls || daemonUrls.length === 0) throw new Error('No daemon URLs configured')
    const daemonUrl = daemonUrls[0]

    // Get LWS URL for unspent outputs
    const lwsUrls = this.lwsUrls[this.getNetwork()]
    if (!lwsUrls || lwsUrls.length === 0) throw new Error('No LWS URLs configured')

    const address = await this.getAddressAsync(params.walletIndex ?? 0)
    const viewKeyHex = this.getViewKeyHex(params.walletIndex ?? 0)

    if (!this.lwsLoggedIn) {
      await lws.login(lwsUrls[0], address, viewKeyHex)
      this.lwsLoggedIn = true
    }

    // Get unspent outputs
    const unspent = await lws.getUnspentOuts(lwsUrls[0], address, viewKeyHex, amount.amount().toString())

    // Convert LWS outputs to SpendableOutput format
    const amountPiconero = BigInt(amount.amount().toString())
    const fee = BigInt(unspent.per_byte_fee) * BigInt(3000) // approximate tx size * per byte fee

    // Select inputs to cover amount + fee
    const spendableOutputs: SpendableOutput[] = []
    let selectedTotal = BigInt(0)
    const needed = amountPiconero + fee

    for (const out of unspent.outputs) {
      if (selectedTotal >= needed) break
      const outAmount = BigInt(out.amount)

      // Parse rct field: first 64 chars = commitment, next 64 = mask
      if (out.rct.length < 128) {
        console.warn(`Skipping output ${out.global_index}: invalid rct data (length ${out.rct.length})`)
        continue
      }
      const rctMask = hexToBytes(out.rct.substring(64, 128))

      spendableOutputs.push({
        globalIndex: out.global_index,
        amount: outAmount,
        mask: rctMask,
        txPubKey: hexToBytes(out.tx_pub_key),
        outputIndex: out.index,
        publicKey: hexToBytes(out.public_key),
      })
      selectedTotal += outAmount
    }

    if (selectedTotal < needed) {
      throw new Error(`Insufficient funds: have ${selectedTotal}, need ${needed}`)
    }

    const destinations: Destination[] = [
      {
        pubViewKey: recipientKeys.publicViewKey,
        pubSpendKey: recipientKeys.publicSpendKey,
        amount: amountPiconero,
      },
    ]

    const changeKeys = {
      pubViewKey: keys.publicViewKey,
      pubSpendKey: keys.publicSpendKey,
    }

    const built = await buildTransaction(
      spendableOutputs,
      destinations,
      changeKeys,
      fee,
      keys.privateViewKey,
      spendKey,
      daemonUrl,
    )

    // Broadcast
    await this.broadcastTx(built.txHex)
    return built.txHash
  }

  /**
   * Broadcast a signed transaction hex to the network.
   * Note: The returned hash is keccak256 of the raw tx blob, which differs from
   * the canonical Monero txid (three-hash construction). Use transfer() for the correct txid.
   */
  public async broadcastTx(txHex: string): Promise<TxHash> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        await daemon.sendRawTransaction(url, txHex)
        const txBytes = hexToBytes(txHex)
        return bytesToHex(keccak_256(txBytes))
      } catch (error) {
        console.warn(`Daemon ${url} failed for broadcastTx:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to broadcast transaction')
  }

  /**
   * Prepare an unsigned transaction.
   * Monero transactions require private key context for ring signature
   * construction, so this method is not supported.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  private async daemonScan(): Promise<{
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

    const spendKey = this.getPrivateSpendKey(0)
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
}
