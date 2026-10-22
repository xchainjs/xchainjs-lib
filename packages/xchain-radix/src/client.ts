import { CommittedTransactionInfo } from './gateway-api'
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
import { Address, AssetType, TokenAsset, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import { bech32m } from '@scure/base'
import { HDKey } from '@scure/bip32'
import slip10 from 'micro-key-producer/slip10.js'

import {
  AssetXRD,
  RadixChain,
  XRD_DECIMAL,
  bech32Lengths,
  bech32Networks,
  feesEstimationPublicKeys,
  xrdRootDerivationPaths,
} from './const'
import { RadixSpecificClient } from './radix-client'
import { Balance, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types/radix'
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

  async getFees(): Promise<Fees> {
    const feesInXrd = await this.radixSpecificClient
      .constructTransferIntent(
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
      const masterKey = slip10.fromMasterSeed(seed)
      const childKey = masterKey.derive(updatedDerivationPath)
      if (!childKey.privateKey) throw new Error('child does not have a privateKey')
      return Buffer.from(childKey.privateKey)
    } else {
      const node = HDKey.fromMasterSeed(seed)
      const child = node.derive(updatedDerivationPath)
      if (!child.privateKey) throw new Error('child does not have a privateKey')
      return Buffer.from(child.privateKey)
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
   * @deprecated Use getAddressAsync instead.
   */
  getAddress(): string {
    throw new Error('getAddress is synchronous and cannot retrieve addresses directly. Use getAddressAsync instead.')
  }

  async getAddressAsync(index = 0): Promise<string> {
    const networkId = this.getRadixNetwork()
    const radixPrivateKey = this.getRadixPrivateKey(index)
    const address = await LTSRadixEngineToolkit.Derive.virtualAccountAddress(radixPrivateKey.publicKey(), networkId)
    return address.toString()
  }

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

  getExplorerAddressUrl(address: Address): string {
    return `${this.getExplorerUrl()}/account/${address}`
  }

  getExplorerTxUrl(txID: string): string {
    return `${this.getExplorerUrl()}/transaction/${txID}`
  }

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
      const decodedAddress = bech32m.decode(address as `${string}1${string}`)
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
    } catch (_error) {
      return false
    }
  }

  async getBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    const balances: Balance[] = await this.radixSpecificClient.fetchBalances(address)

    // Return native asset even if there is no balance
    if (balances.findIndex((balance) => eqAsset(balance.asset, this.getAssetInfo().asset)) === -1) {
      balances.push({
        asset: this.getAssetInfo().asset,
        amount: baseAmount(0, this.getAssetInfo().decimal),
      })
    }

    if (!assets) {
      return balances
    }
    const filteredBalances: Balance[] = balances.filter(
      (balance) =>
        eqAsset(balance.asset, this.getAssetInfo().asset) ||
        assets.some((asset) => balance.asset.symbol === asset.symbol),
    )
    return filteredBalances
  }

  async getTransactions(params: TxHistoryParams): Promise<TxsPage> {
    const { address, offset = 0, limit, asset } = params
    let hasNextPage = true
    let nextCursor = undefined
    let committedTransactions: CommittedTransactionInfo[] = []
    const txList: TxsPage = { txs: [], total: 0 }

    while (hasNextPage) {
      const response = await this.radixSpecificClient.gateway.getStreamTransactions({
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
      } catch (_error) {}
    }
    txList.total = txList.txs.length
    return txList
  }

  /**
   * `summarizeTransaction` fails when the tx was not built with SimpleTransactionBuilder.
   */
  async getTransactionData(txId: string): Promise<Tx> {
    try {
      const transactionCommittedDetailsResponse = await this.radixSpecificClient.gateway.getTransactionDetails({
        intent_hash: txId,
        opt_ins: {
          raw_hex: true,
        },
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
    } catch (_error) {
      throw new Error('Failed to fetch transaction data')
    }
  }

  async convertTransactionFromHex(transaction_hex: string, intent_hash: string, confirmed_at: Date): Promise<Tx> {
    const transactionBinary = Convert.HexString.toUint8Array(transaction_hex)
    try {
      const transactionSummary = await LTSRadixEngineToolkit.Transaction.summarizeTransaction(transactionBinary)

      const from: TxFrom[] = []
      const to: TxTo[] = []

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
    } catch (_error) {
      return {
        from: [],
        to: [],
        asset: AssetXRD,
        date: confirmed_at,
        type: TxType.Unknown,
        hash: intent_hash,
      }
    }
  }

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

  async broadcastTx(txHex: string): Promise<string> {
    const notarizedTransaction = await RadixEngineToolkit.NotarizedTransaction.decompile(
      Convert.HexString.toUint8Array(txHex),
    )
    const response = await this.radixSpecificClient.submitTransaction(notarizedTransaction)
    return response[1].id
  }

  async prepareTx(params: TxParams): Promise<PreparedTx> {
    const walletIndex = params.walletIndex ?? 0
    const from = await this.getAddressAsync()

    const transferAmmount = params.amount.amount().toNumber() / 10 ** XRD_DECIMAL
    const intent = await this.radixSpecificClient
      .constructTransferIntent(
        from,
        params.recipient,
        getAssetResource(params.asset || this.getAssetInfo().asset, this.getRadixNetwork()),
        transferAmmount,
        this.getRadixPrivateKey(walletIndex).publicKey(),
        params.memo,
        params.methodToCall,
      )
      .then((response) => response.intent)

    const compiledIntent = await RadixEngineToolkit.Intent.compile(intent)
    return {
      rawUnsignedTx: Convert.Uint8Array.toHexString(compiledIntent),
    }
  }

  getAssetInfo(): AssetInfo {
    return {
      asset: AssetXRD,
      decimal: XRD_DECIMAL,
    }
  }
}

export { Client }
