import {
  CommittedTransactionInfo,
  TransactionCommittedDetailsRequest,
  TransactionCommittedDetailsResponse,
} from '@radixdlt/babylon-gateway-api-sdk'
import {
  Convert,
  Curve,
  LTSRadixEngineToolkit,
  NetworkId,
  PrivateKey,
  PublicKey,
  RadixEngineToolkit,
  TransactionBuilder,
} from '@radixdlt/radix-engine-toolkit'
import {
  AssetInfo,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
  PreparedTx,
  TxHistoryParams,
  TxType,
  XChainClientParams,
  singleFee,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import { Address, AssetType, baseAmount } from '@xchainjs/xchain-util'
import { bech32m } from 'bech32'
import BIP32Factory, { BIP32Interface } from 'bip32'
import { derivePath } from 'ed25519-hd-key'
import * as ecc from 'tiny-secp256k1'

import {
  RadixChain,
  XRD_DECIMAL,
  assets,
  bech32Lengths,
  bech32Networks,
  feesEstimationPublicKeys,
  xrdRootDerivationPaths,
} from './const'
import { RadixSpecificClient } from './radix-client'
import { Balance, CompatibleAsset, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types/radix'
import { getAssetResource } from './utils'

const xChainJsNetworkToRadixNetworkId = (network: Network): number => {
  switch (network) {
    case Network.Mainnet:
    case Network.Stagenet:
      return NetworkId.Mainnet
    case Network.Testnet:
      return NetworkId.Stokenet
  }
}

/**
 * Custom Radix client
 */

export default class Client extends BaseXChainClient {
  private radixSpecificClient: RadixSpecificClient
  private curve: Curve
  constructor({
    network = Network.Mainnet,
    phrase,
    rootDerivationPaths = xrdRootDerivationPaths,
    feeBounds = {
      lower: 0,
      upper: 3,
    },
    curve = 'Ed25519',
  }: XChainClientParams & { curve?: Curve }) {
    super(RadixChain, {
      network: network,
      phrase: phrase,
      rootDerivationPaths: rootDerivationPaths,
      feeBounds: feeBounds,
    })
    this.curve = curve
    this.radixSpecificClient = new RadixSpecificClient(xChainJsNetworkToRadixNetworkId(network))
  }

  public get radixClient(): RadixSpecificClient {
    return this.radixSpecificClient
  }

  setNetwork(network: Network): void {
    super.setNetwork(network)
    this.radixSpecificClient.networkId = xChainJsNetworkToRadixNetworkId(network)
  }

  /**
   * Get an estimated fee for a test transaction that involves sending
   * XRD from one account to another
   *
   * @returns {Fee} An estimated fee
   */
  async getFees(): Promise<Fees> {
    // TODO: This can fail if we use it on stokenet, we need to replace these with network aware
    // addresses.
    const feesInXrd = await this.radixSpecificClient
      .constructSimpleTransferIntent(
        feesEstimationPublicKeys[this.getRadixNetwork()].from,
        feesEstimationPublicKeys[this.getRadixNetwork()].to,
        feesEstimationPublicKeys[this.getRadixNetwork()].resourceAddress,
        0,
        new PublicKey.Ed25519(
          Convert.HexString.toUint8Array(feesEstimationPublicKeys[this.getRadixNetwork()].publicKey),
        ),
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      )
      .then((result) => result.fees)
    // We need to add another 10% to the fees as the preview response does not include everything needed
    // to actually submit the transaction, ie: signature validation
    const feeRate1e18 = feesInXrd * 1.1 * 10 ** XRD_DECIMAL
    // Create the fee amount with the adjusted fee rate
    const fee = baseAmount(feeRate1e18, XRD_DECIMAL)
    return singleFee(FeeType.FlatFee, fee)
  }

  getRadixNetwork(): number {
    return xChainJsNetworkToRadixNetworkId(this.getNetwork())
  }

  getPrivateKey(index: number): Buffer {
    const seed = getSeed(this.phrase)
    let derivationPath
    if (this.rootDerivationPaths) {
      derivationPath = this.rootDerivationPaths[this.getNetwork()]
    } else {
      derivationPath = xrdRootDerivationPaths[this.getNetwork()]
    }
    const updatedDerivationPath = derivationPath.replace(/\/$/, '') + `/${index}'`
    if (this.curve === 'Ed25519') {
      const seedHex = seed.toString('hex')
      const keys = derivePath(updatedDerivationPath, seedHex)
      return keys.key
    } else {
      const bip32 = BIP32Factory(ecc)
      const node: BIP32Interface = bip32.fromSeed(seed)
      const child: BIP32Interface = node.derivePath(updatedDerivationPath)
      if (!child.privateKey) throw new Error('child does not have a privateKey')
      return child.privateKey
    }
  }

  getRadixPrivateKey(index: number): PrivateKey {
    const privateKey = this.getPrivateKey(index)
    const privateKeyBytes = Uint8Array.from(privateKey)
    if (this.curve === 'Ed25519') {
      return new PrivateKey.Ed25519(privateKeyBytes)
    } else {
      return new PrivateKey.Secp256k1(privateKeyBytes)
    }
  }

  /**
   * Get the address for a given account.
   * @deprecated Use getAddressAsync instead.
   */
  getAddress(): string {
    throw new Error('getAddress is synchronous and cannot retrieve addresses directly. Use getAddressAsync instead.')
  }

  /**
   * Get the current address asynchronously for a given account.
   * @returns {Address} A promise resolving to the current address.
   * A phrase is needed to create a wallet and to derive an address from it.
   */
  async getAddressAsync(index = 0): Promise<string> {
    const networkId = this.getRadixNetwork()
    const radixPrivateKey = this.getRadixPrivateKey(index)
    const address = await LTSRadixEngineToolkit.Derive.virtualAccountAddress(radixPrivateKey.publicKey(), networkId)
    return address.toString()
  }

  /**
   * Get the explorer URL based on the network.
   *
   * @returns {string} The explorer URL based on the network.
   */
  getExplorerUrl(): string {
    switch (this.getRadixNetwork()) {
      case NetworkId.Mainnet:
        return 'https://dashboard.radixdlt.com'
      case NetworkId.Stokenet:
        return 'https://stokenet-dashboard.radixdlt.com'
      default:
        throw new Error('Unsupported network')
    }
  }

  /**
   * Get the explorer URL for a given account address based on the network.
   * @param {Address} address The address to generate the explorer URL for.
   * @returns {string} The explorer URL for the given address.
   */
  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  /**
   * Get the explorer URL for a given transaction ID based on the network.
   * @param {string} txID The transaction ID to generate the explorer URL for.
   * @returns {string} The explorer URL for the given transaction ID.
   */
  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transaction/${txID}`
  }

  /**
   *  Validate the given address.
   * @param {Address} address The address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  async validateAddressAsync(address: string): Promise<boolean> {
    try {
      await RadixEngineToolkit.Address.decode(address)
      return true
    } catch {
      return false
    }
  }

  validateAddress(address: string): boolean {
    try {
      const decodedAddress = bech32m.decode(address)
      if (!decodedAddress.prefix.startsWith('account_')) {
        return false
      }

      const network = decodedAddress.prefix.split('_')[1]
      if (bech32Networks[this.getRadixNetwork()] !== network) {
        return false
      }

      if (address.length !== bech32Lengths[this.getRadixNetwork()]) {
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Retrieves the balances of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {Asset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   */
  async getBalance(address: Address, assets?: CompatibleAsset[]): Promise<Balance[]> {
    const balances: Balance[] = await this.radixSpecificClient.fetchBalances(address)
    // If assets is undefined, return all balances
    if (!assets) {
      return balances
    }
    const filteredBalances: Balance[] = balances.filter((balance) =>
      assets.some((asset) => balance.asset.symbol === asset.symbol),
    )
    return filteredBalances
  }

  /**
   * Get transaction history of a given address with pagination options.
   * @param {TxHistoryParams} params The options to get transaction history. (optional)
   * @returns {TxsPage} The transaction history.
   */
  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const { address, offset = 0, limit, asset } = params
    let hasNextPage = true
    let nextCursor = undefined
    let committedTransactions: CommittedTransactionInfo[] = []
    const txList: TxsPage = { txs: [], total: 0 }

    while (hasNextPage) {
      const response = await this.radixSpecificClient.gatewayClient.stream.innerClient.streamTransactions({
        streamTransactionsRequest: {
          affected_global_entities_filter: [address],
          limit_per_page: limit && limit > 100 ? 100 : limit,
          from_ledger_state: {
            state_version: offset,
          },
          manifest_resources_filter: asset ? [asset] : undefined,
          opt_ins: {
            raw_hex: true,
          },
          cursor: nextCursor,
        },
      })
      committedTransactions = committedTransactions.concat(response.items)
      if (response.next_cursor) {
        nextCursor = response.next_cursor
      } else {
        hasNextPage = false
      }
    }
    for (const txn of committedTransactions) {
      try {
        if (
          txn.raw_hex !== undefined &&
          txn.confirmed_at !== null &&
          txn.intent_hash !== undefined &&
          txn.confirmed_at !== undefined
        ) {
          const transaction: Tx = await this.convertTransactionFromHex(txn.raw_hex, txn.intent_hash, txn.confirmed_at)
          txList.txs.push(transaction)
        }
      } catch (error) {}
    }
    txList.total = txList.txs.length
    return txList
  }

  /**
   * Get the transaction details of a given transaction id.
   * This method uses LTSRadixEngineToolkit.Transaction.summarizeTransaction
   * to convert a transaction hex to a transaction summary. If the transaction was not built with
   * the SimpleTransactionBuilder, the method will fail to get the transaction data
   * @param {string} txId The transaction id.
   * @returns {Tx} The transaction details of the given transaction id.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    try {
      const transactionCommittedDetailsRequest: TransactionCommittedDetailsRequest = {
        intent_hash: txId,
        opt_ins: {
          raw_hex: true,
        },
      }
      const transactionCommittedDetailsResponse: TransactionCommittedDetailsResponse =
        await this.radixSpecificClient.gatewayClient.transaction.innerClient.transactionCommittedDetails({
          transactionCommittedDetailsRequest: transactionCommittedDetailsRequest,
        })
      if (
        transactionCommittedDetailsResponse.transaction.raw_hex !== undefined &&
        transactionCommittedDetailsResponse.transaction.confirmed_at !== null &&
        transactionCommittedDetailsResponse.transaction.confirmed_at !== undefined &&
        transactionCommittedDetailsResponse.transaction.intent_hash !== undefined
      ) {
        const transaction: Tx = await this.convertTransactionFromHex(
          transactionCommittedDetailsResponse.transaction.raw_hex,
          transactionCommittedDetailsResponse.transaction.intent_hash,
          transactionCommittedDetailsResponse.transaction.confirmed_at,
        )
        return transaction
      } else {
        throw new Error('Incomplete transaction data received')
      }
    } catch (error) {
      throw new Error('Failed to fetch transaction data')
    }
  }

  /**
   * Helper function to convert a transaction in hex, returned by the gateway to a Tx type
   * @param transaction_hex - The raw_hex returned by the gateway for a transaction id
   * @param confirmed_at - The confirmed_at date for the transaction
   * @param intent_hash - The transaction intent hash
   * @returns a transaction in Tx type
   */
  async convertTransactionFromHex(transaction_hex: string, intent_hash: string, confirmed_at: Date): Promise<Tx> {
    const transactionBinary = Convert.HexString.toUint8Array(transaction_hex)
    try {
      const transactionSummary = await LTSRadixEngineToolkit.Transaction.summarizeTransaction(transactionBinary)

      const from: TxFrom[] = []
      const to: TxTo[] = []

      // Iterate over withdraws
      for (const withdrawAccount in transactionSummary.withdraws) {
        for (const withdrawResource in transactionSummary.withdraws[withdrawAccount]) {
          const withdrawAmount: number = transactionSummary.withdraws[withdrawAccount][withdrawResource].toNumber()
          from.push({
            from: withdrawAccount,
            amount: baseAmount(withdrawAmount),
            asset: { symbol: withdrawResource, ticker: withdrawResource, type: AssetType.TOKEN, chain: RadixChain },
          })
        }
      }

      // Iterate over deposits
      for (const depositAccount in transactionSummary.deposits) {
        for (const depositResource in transactionSummary.deposits[depositAccount]) {
          const depositAmount: number = transactionSummary.deposits[depositAccount][depositResource].toNumber()
          to.push({
            to: depositAccount,
            amount: baseAmount(depositAmount),
            asset: { symbol: depositResource, ticker: depositResource, type: AssetType.TOKEN, chain: RadixChain },
          })
        }
      }

      const transaction: Tx = {
        from: from,
        to: to,
        date: confirmed_at,
        type: TxType.Transfer,
        hash: intent_hash,
        asset: { symbol: '', ticker: '', type: AssetType.TOKEN, chain: RadixChain },
      }

      return transaction
    } catch (error) {
      return {
        from: [],
        to: [],
        asset: assets[this.getRadixNetwork()],
        date: confirmed_at,
        type: TxType.Unknown,
        hash: intent_hash,
      }
    }
  }

  /**
   * Creates a transaction using the SimpleTransactionBuilder, signs it with the
   * private key and returns the signed hex
   * @param params - The transactions params
   * @returns A signed transaction hex
   */
  async transfer(params: TxParams): Promise<string> {
    const walletIndex = params.walletIndex ?? 0
    const intent = await this.prepareTx(params)
      .then((response) => response.rawUnsignedTx)
      .then(Convert.HexString.toUint8Array)
      .then(RadixEngineToolkit.Intent.decompile)

    const notarizedTransaction = await TransactionBuilder.new().then((builder) => {
      return builder
        .header(intent.header)
        .message(intent.message)
        .manifest(intent.manifest)
        .notarize(this.getRadixPrivateKey(walletIndex))
    })

    const notarizedTransactionBytes = await RadixEngineToolkit.NotarizedTransaction.compile(notarizedTransaction)
    const transactionId = await this.broadcastTx(Convert.Uint8Array.toHexString(notarizedTransactionBytes))
    return transactionId
  }

  /**
   * Submits a transaction
   * @param txHex - The transaction hex build with the transfer method
   * @returns - The response from the gateway
   */
  async broadcastTx(txHex: string): Promise<string> {
    const notarizedTransaction = await RadixEngineToolkit.NotarizedTransaction.decompile(
      Convert.HexString.toUint8Array(txHex),
    )
    const response = await this.radixSpecificClient.submitTransaction(notarizedTransaction)
    return response[1].id
  }

  /**
   * Prepares a transaction to be used by the transfer method
   * It will include a non signed transaction
   * @param params - The transaction params
   * @returns a PreparedTx
   */
  async prepareTx(params: TxParams): Promise<PreparedTx> {
    const walletIndex = params.walletIndex ?? 0
    const from = await this.getAddressAsync()

    const transferAmmount = params.amount.amount().toNumber() / 10 ** XRD_DECIMAL
    const intent = await this.radixSpecificClient
      .constructSimpleTransferIntent(
        from,
        params.recipient,
        getAssetResource(params.asset || this.getAssetInfo().asset),
        transferAmmount,
        this.getRadixPrivateKey(walletIndex).publicKey(),
        params.memo,
        params.methodsToCall,
      )
      .then((response) => response.intent)

    const compiledIntent = await RadixEngineToolkit.Intent.compile(intent)
    return {
      rawUnsignedTx: Convert.Uint8Array.toHexString(compiledIntent),
    }
  }

  /**
   * Get asset information.
   * @returns Asset information.
   */
  getAssetInfo(): AssetInfo {
    return {
      asset: assets[this.getRadixNetwork()],
      decimal: XRD_DECIMAL,
    }
  }
}

export { Client }
