import moneroTs from 'monero-ts'
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
import slip10 from 'micro-key-producer/slip10.js'

import { AssetXMR, XMRChain, XMR_DECIMALS, defaultXMRParams } from './const'
import { Balance, Tx, TxParams, TxsPage, XMRClientParams } from './types'
import { bytesToHex, getMoneroNetworkType, scReduce32, validateMoneroAddress } from './utils'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private daemonUrls: Record<Network, string[]>

  constructor(params: XMRClientParams = defaultXMRParams) {
    super(XMRChain, {
      ...defaultXMRParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders ?? defaultXMRParams.explorerProviders
    this.daemonUrls = params.daemonUrls ?? defaultXMRParams.daemonUrls!
  }

  /**
   * Get information about the native asset of Monero.
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: AssetXMR,
      decimal: XMR_DECIMALS,
    }
  }

  /**
   * Get the explorer URL.
   */
  public getExplorerUrl(): string {
    return this.explorerProviders[this.getNetwork()].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   */
  public getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.getNetwork()].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: TxHash): string {
    return this.explorerProviders[this.getNetwork()].getExplorerTxUrl(txID)
  }

  /**
   * Get the full derivation path based on the wallet index.
   */
  public getFullDerivationPath(walletIndex: number): string {
    if (!this.rootDerivationPaths) {
      throw Error('Can not generate derivation path due to root derivation path is undefined')
    }
    return `${this.rootDerivationPaths[this.getNetwork()]}${walletIndex}'`
  }

  /**
   * Get the current address asynchronously.
   * Creates a keys-only wallet from derived spend key to get the primary address.
   *
   * @param {number} index The HD wallet index. Default 0
   * @returns {Address} The Monero address related to the index provided.
   */
  public async getAddressAsync(index?: number): Promise<string> {
    const spendKeyHex = this.getPrivateSpendKey(index ?? 0)
    const wallet = await moneroTs.createWalletKeys({
      networkType: getMoneroNetworkType(this.getNetwork()),
      privateSpendKey: spendKeyHex,
    })
    try {
      return await wallet.getPrimaryAddress()
    } finally {
      await wallet.close()
    }
  }

  /**
   * Get the current address synchronously.
   * @deprecated Use getAddressAsync instead
   */
  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  /**
   * Validate the given Monero address.
   */
  public validateAddress(address: Address): boolean {
    return validateMoneroAddress(address)
  }

  /**
   * Retrieves the balance of a given address.
   * Connects to daemon and creates a full wallet to scan for balance.
   * Note: This is a heavy operation requiring blockchain scanning.
   */
  public async getBalance(address: Address): Promise<Balance[]> {
    return this.roundRobinGetBalance(address)
  }

  /**
   * Get transaction fees.
   * Estimates fees via daemon RPC.
   */
  public async getFees(): Promise<Fees> {
    return this.roundRobinGetFees()
  }

  /**
   * Get the transaction details of a given transaction ID.
   */
  public async getTransactionData(txId: string): Promise<Tx> {
    return this.roundRobinGetTransactionData(txId)
  }

  /**
   * Get the transaction history of a given address.
   * Note: Monero does not support address-based tx lookups via daemon.
   * This requires full wallet sync which is a heavy operation.
   */
  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    return this.roundRobinGetTransactions(params)
  }

  /**
   * Transfer XMR.
   * Creates a full wallet, syncs with daemon, builds and sends the transaction.
   */
  public async transfer({ walletIndex, recipient, amount, memo }: TxParams): Promise<string> {
    return this.roundRobinTransfer({ walletIndex, recipient, amount, memo })
  }

  /**
   * Broadcast a signed transaction hex to the network.
   */
  public async broadcastTx(txHex: string): Promise<TxHash> {
    return this.roundRobinBroadcastTx(txHex)
  }

  /**
   * Prepare an unsigned transaction.
   * Note: Monero transactions require private key context for ring signature
   * construction, so this method is not supported in the traditional sense.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async prepareTx(_params: TxParams): Promise<PreparedTx> {
    throw Error('prepareTx is not supported for Monero. Use transfer() instead.')
  }

  /**
   * Derives private spend key from BIP-39 mnemonic via SLIP-10 derivation.
   * The derived key is reduced mod ed25519 order to ensure validity.
   */
  private getPrivateSpendKey(index: number): string {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)
    const derivedKey = hd.derive(this.getFullDerivationPath(index)).privateKey

    // Reduce mod ed25519 group order to produce valid Monero private key
    const reducedKey = scReduce32(derivedKey)
    return bytesToHex(reducedKey)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async roundRobinGetBalance(_address: Address): Promise<Balance[]> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const spendKeyHex = this.getPrivateSpendKey(0)
        const wallet = await moneroTs.createWalletFull({
          password: '',
          networkType: getMoneroNetworkType(this.getNetwork()),
          server: { uri: url },
          privateSpendKey: spendKeyHex,
        })

        try {
          await wallet.sync()
          const balance = await wallet.getBalance()

          return [
            {
              asset: AssetXMR,
              amount: baseAmount(balance.toString(), XMR_DECIMALS),
            },
          ]
        } finally {
          await wallet.close()
        }
      } catch (error) {
        console.warn(`Daemon ${url} failed for getBalance:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to get balance')
  }

  private async roundRobinGetFees(): Promise<Fees> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const daemon = await moneroTs.connectToDaemonRpc(url)
        const feeEstimate = await daemon.getFeeEstimate()
        const fee = baseAmount(feeEstimate.getFee().toString(), XMR_DECIMALS)

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

  private async roundRobinGetTransactionData(txId: string): Promise<Tx> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const daemon = await moneroTs.connectToDaemonRpc(url)
        const tx = await daemon.getTx(txId)

        if (!tx) throw Error('Transaction not found')

        return {
          asset: AssetXMR,
          date: new Date((tx.getBlock()?.getTimestamp() ?? 0) * 1000),
          type: TxType.Transfer,
          hash: tx.getHash(),
          from: [], // Monero txs don't expose sender addresses or amounts without view key
          to: [], // Monero txs don't expose recipient amounts without view key
        }
      } catch (error) {
        console.warn(`Daemon ${url} failed for getTransactionData:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to get transaction data')
  }

  private async roundRobinGetTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const spendKeyHex = this.getPrivateSpendKey(0)
        const wallet = await moneroTs.createWalletFull({
          password: '',
          networkType: getMoneroNetworkType(this.getNetwork()),
          server: { uri: url },
          privateSpendKey: spendKeyHex,
        })

        try {
          await wallet.sync()

          const transfers = await wallet.getTransfers()

          const offset = params?.offset ?? 0
          const limit = params?.limit ?? 10
          const sliced = transfers.slice(offset, offset + limit)

          const txs: Tx[] = sliced.map((transfer) => ({
            asset: AssetXMR,
            date: new Date((transfer.getTx().getBlock()?.getTimestamp() ?? 0) * 1000),
            type: TxType.Transfer,
            hash: transfer.getTx().getHash(),
            from: [
              {
                from: '',
                amount: baseAmount(transfer.getAmount().toString(), XMR_DECIMALS),
              },
            ],
            to: [
              {
                to: '',
                amount: baseAmount(transfer.getAmount().toString(), XMR_DECIMALS),
              },
            ],
          }))

          return {
            txs,
            total: transfers.length,
          }
        } finally {
          await wallet.close()
        }
      } catch (error) {
        console.warn(`Daemon ${url} failed for getTransactions:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to get transactions')
  }

  private async roundRobinTransfer({ walletIndex, recipient, amount, memo }: TxParams): Promise<string> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const spendKeyHex = this.getPrivateSpendKey(walletIndex ?? 0)
        const wallet = await moneroTs.createWalletFull({
          password: '',
          networkType: getMoneroNetworkType(this.getNetwork()),
          server: { uri: url },
          privateSpendKey: spendKeyHex,
        })

        try {
          await wallet.sync()

          const txConfig: {
            address: string
            amount: bigint
            note?: string
          } = {
            address: recipient,
            amount: BigInt(amount.amount().toString()),
          }

          if (memo) {
            txConfig.note = memo
          }

          const tx = await wallet.createTx(txConfig)
          const hash = await wallet.relayTx(tx)

          return hash
        } finally {
          await wallet.close()
        }
      } catch (error) {
        console.warn(`Daemon ${url} failed for transfer:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to transfer')
  }

  private async roundRobinBroadcastTx(txHex: string): Promise<TxHash> {
    const urls = this.daemonUrls[this.getNetwork()]

    for (const url of urls) {
      try {
        const daemon = await moneroTs.connectToDaemonRpc(url)
        const result = await daemon.submitTxHex(txHex, false)

        if (!result.getIsGood()) {
          throw Error(`Failed to broadcast: ${result.getReason() ?? 'unknown error'}`)
        }

        // Monero tx hash is not returned by submitTxHex.
        // The caller should obtain the hash from transfer() or the prepared tx.
        return txHex.substring(0, 64)
      } catch (error) {
        console.warn(`Daemon ${url} failed for broadcastTx:`, (error as Error).message)
        continue
      }
    }

    throw Error('No daemon able to broadcast transaction')
  }
}
