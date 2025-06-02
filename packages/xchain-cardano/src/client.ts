import { type Bip32PrivateKey, type TransactionBuilder } from '@emurgo/cardano-serialization-lib-browser'
import {
  AssetInfo,
  BaseXChainClient,
  ExplorerProviders,
  FeeEstimateOptions,
  FeeType,
  Fees,
  FeesWithRates,
  Network,
  PreparedTx,
  TxHash,
  TxType,
  TxsPage,
} from '@xchainjs/xchain-client'
import { phraseToEntropy } from '@xchainjs/xchain-crypto'
import { Address, BaseAmount, baseAmount, eqAsset } from '@xchainjs/xchain-util'
import WAValidator from 'multicoin-address-validator'

import { BlockFrostClient } from './blockfrost-client'
import { ADAAsset, ADAChain, ADA_DECIMALS, defaultAdaParams } from './const'
import { ADAClientParams, Balance, Tx, TxParams } from './types'
import { getCardanoNetwork } from './utils'
import { getCardano } from './wasm'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private blockfrostApis: Record<Network, BlockFrostClient[]>

  constructor(params: ADAClientParams) {
    const allParams = {
      ...defaultAdaParams,
      ...params,
    }
    super(ADAChain, allParams)
    this.explorerProviders = allParams.explorerProviders
    this.blockfrostApis = {
      [Network.Mainnet]: allParams.apiKeys.blockfrostApiKeys
        .filter((apiKey) => apiKey.mainnet.trim() !== '')
        .map((apiKey) => new BlockFrostClient({ projectId: apiKey.mainnet, network: Network.Mainnet })),
      [Network.Testnet]: allParams.apiKeys.blockfrostApiKeys
        .filter((apiKey) => apiKey.testnet.trim() !== '')
        .map((apiKey) => new BlockFrostClient({ projectId: apiKey.testnet, network: Network.Testnet })),
      [Network.Stagenet]: allParams.apiKeys.blockfrostApiKeys
        .filter((apiKey) => apiKey.stagenet.trim() !== '')
        .map((apiKey) => new BlockFrostClient({ projectId: apiKey.stagenet, network: Network.Stagenet })),
    }
  }

  /**
   * Get information about the native asset of the Cardano.
   *
   * @returns {AssetInfo} Information about the native asset.
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: ADAAsset,
      decimal: ADA_DECIMALS,
    }
  }

  /**
   * Get the explorer URL.
   *
   * @returns {string} The explorer URL.
   */
  public getExplorerUrl(): string {
    return this.explorerProviders[this.getNetwork()].getExplorerUrl()
  }

  /**
   * Get the explorer url for the given address.
   *
   * @param {Address} address
   * @returns {string} The explorer url for the given address.
   */
  public getExplorerAddressUrl(address: Address): string {
    return this.explorerProviders[this.getNetwork()].getExplorerAddressUrl(address)
  }

  /**
   * Get the explorer url for the given transaction id.
   *
   * @param {string} txID
   * @returns {string} The explorer url for the given transaction id.
   */
  public getExplorerTxUrl(txID: TxHash): string {
    return this.explorerProviders[this.getNetwork()].getExplorerTxUrl(txID)
  }

  /**
   * Get the full derivation path based on the wallet index.
   * @param {number} walletIndex The HD wallet index
   * @returns {string} The full derivation path
   */
  public getFullDerivationPath(walletIndex: number): string {
    if (!this.rootDerivationPaths) {
      throw Error('Can not generate derivation path due to root derivation path is undefined')
    }
    return `${this.rootDerivationPaths[this.getNetwork()]}${walletIndex}'`
  }

  /**
   * Get the current address asynchronously.
   *
   * @param {number} index The index of the address. Default 0
   * @returns {Address} The Cardano address related to the index provided.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  public async getAddressAsync(walletIndex = 0): Promise<string> {
    const accountKey = await this.generatePrivateKey(walletIndex)

    const paymentKeyPub = accountKey.derive(0).derive(0)
    const stakeKeyPub = accountKey.derive(2).derive(0)

    const cardanoLib = await getCardano()
    const network = await getCardanoNetwork(this.getNetwork())

    const baseAddress = cardanoLib.BaseAddress.new(
      network.network_id(),
      cardanoLib.Credential.from_keyhash(paymentKeyPub.to_raw_key().to_public().hash()),
      cardanoLib.Credential.from_keyhash(stakeKeyPub.to_raw_key().to_public().hash()),
    )

    return baseAddress.to_address().to_bech32()
  }

  /**
   * Get the current address synchronously.
   * @deprecated
   */
  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  /**
   * @deprecated
   */
  public validateAddress(address: string): boolean {
    return WAValidator.validate(address, 'ada', this.network === Network.Mainnet ? 'mainnet' : 'testnet')
  }

  /**
   * Validate the given Cardano address.
   * @param {string} address Cardano address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public async validateAddressAsync(address: string): Promise<boolean> {
    try {
      const cardanoLib = await getCardano()
      const network = await getCardanoNetwork(this.getNetwork())
      const addr = cardanoLib.Address.from_bech32(address)
      return !addr.is_malformed() && addr.network_id() === network.network_id()
    } catch (e) {
      return false
    }
  }

  /**
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {TokenAsset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   */
  public async getBalance(address: Address): Promise<Balance[]> {
    return this.roundRobinGetBalance(address)
  }

  /**
   * Get transaction fees.
   *
   * @param {TxParams} params - The transaction parameters.
   * @returns {Fees} The average, fast, and fastest fees.
   * @throws {"Params need to be passed"} Thrown if parameters are not provided.
   */
  public async getFees(params?: FeeEstimateOptions & { amount: BaseAmount; sender: Address }): Promise<Fees> {
    if (!params) {
      throw Error('Params not provided')
    }
    const { rawUnsignedTx } = await this.prepareTx({
      sender: params.sender,
      recipient: params.sender,
      memo: params.memo,
      amount: params.amount,
    })
    const cardanoLib = await getCardano()
    const fee: string = cardanoLib.Transaction.from_hex(rawUnsignedTx).body().fee().to_js_value()
    return {
      average: baseAmount(fee, ADA_DECIMALS),
      fast: baseAmount(Number(fee) * 1.25, ADA_DECIMALS),
      fastest: baseAmount(Number(fee) * 1.5, ADA_DECIMALS),
      type: FeeType.PerByte,
    }
  }

  async getFeesWithRates(options?: FeeEstimateOptions): Promise<FeesWithRates> {
    const blockfrostClient = this.blockfrostApis[this.getNetwork()][0]
    if (!blockfrostClient) {
      throw new Error('No BlockFrost client available for the current network')
    }

    const parameters = await blockfrostClient.epochsLatestParameters()
    const rates = await blockfrostClient.getFeeRates()

    // base size
    const baseTxSize = 100
    const utxoInputSize = 57
    const outputSize = 29
    // memo size
    const memoSize = options?.memo ? Buffer.from(options.memo).length : 0

    let estimatedInputs = 1 // 1 input by default
    if (options?.sender) {
      const utxos = await blockfrostClient.addressesUtxosAll(options.sender)
      const lovelaceUtxos = utxos.filter((u) => u.amount.some((a) => a.unit === 'lovelace'))
      estimatedInputs = Math.max(1, Math.ceil(lovelaceUtxos.length / 2)) // Estimamos usar la mitad de los UTXOs disponibles
    }

    const totalSize = baseTxSize + utxoInputSize * estimatedInputs + outputSize + memoSize

    const calculateFee = () => {
      return parameters.min_fee_a * totalSize + parameters.min_fee_b
    }

    const fee = calculateFee()

    return {
      fees: {
        average: baseAmount(fee, ADA_DECIMALS),
        fast: baseAmount(fee, ADA_DECIMALS),
        fastest: baseAmount(fee, ADA_DECIMALS),
        type: FeeType.PerByte,
      },
      rates,
    }
  }

  /**
   * Get the transaction details of a given transaction ID.
   *
   * @param {string} txId The transaction ID.
   * @returns {Tx} The transaction details.
   */
  public async getTransactionData(txId: string): Promise<Tx> {
    const txData = await this.roundRobinGetTransactionData(txId)
    const txUtxos = await this.roundRobinGetTransactionUtxos(txId)

    const nativeAsset = this.getAssetInfo()

    return {
      type: TxType.Transfer,
      hash: txData.hash,
      date: new Date(txData.block_time * 1000),
      asset: nativeAsset.asset,
      from: txUtxos.inputs.map((input) => {
        return {
          from: input.address,
          amount: baseAmount(input.amount[0].quantity, nativeAsset.decimal),
          asset: nativeAsset.asset,
        }
      }),
      to: txUtxos.outputs.map((output) => {
        return {
          to: output.address,
          amount: baseAmount(output.amount[0].quantity, nativeAsset.decimal),
          asset: nativeAsset.asset,
        }
      }),
    }
  }

  public async getTransactions(): Promise<TxsPage> {
    throw Error('Not implemented')
  }

  /**
   * Transfers ADA
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  public async transfer(params: TxParams): Promise<string> {
    if (!eqAsset(params.asset || ADAAsset, ADAAsset)) {
      throw Error(`Asset not supported`)
    }
    const { rawUnsignedTx } = await this.prepareTx({
      sender: await this.getAddressAsync(params.walletIndex),
      recipient: params.recipient,
      amount: params.amount,
      memo: params.memo,
      asset: ADAAsset,
    })

    const accountKey = await this.generatePrivateKey(params.walletIndex)

    const privKey = accountKey.derive(0).derive(0)

    const cardanoLib = await getCardano()
    const usignedTx = cardanoLib.Transaction.from_hex(rawUnsignedTx)
    const txBody = usignedTx.body()
    const auxData = usignedTx.auxiliary_data()

    const fixedTx = cardanoLib.FixedTransaction.new_from_body_bytes(txBody.to_bytes())

    const txHash = fixedTx.transaction_hash()

    const witnesses = cardanoLib.TransactionWitnessSet.new()
    const vKeyWitnesses = cardanoLib.Vkeywitnesses.new()

    const vKeyWitness = cardanoLib.make_vkey_witness(txHash, privKey.to_raw_key())

    vKeyWitnesses.add(vKeyWitness)
    witnesses.set_vkeys(vKeyWitnesses)

    const tx = cardanoLib.Transaction.new(txBody, witnesses, auxData)

    const hash = await this.broadcastTx(tx.to_hex())

    return hash
  }

  /**
   * Broadcast a transaction to the network
   * @param {string} txHex Raw transaction to broadcast
   * @returns {TxHash} The hash of the transaction broadcasted
   */
  public async broadcastTx(txHex: string): Promise<TxHash> {
    return this.roundRobinBroadcastTx(txHex)
  }

  /**
   * Prepares a transaction for transfer.
   *
   * @param {TxParams&Address} params - The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   */
  public async prepareTx({ sender, recipient, amount, memo }: TxParams & { sender: Address }): Promise<PreparedTx> {
    const currentSlot = await this.roundRobinGetLatestBlock()
    const utxos = await this.roundRobinGetAllAddressUTXOs(sender)

    if (!currentSlot.slot) {
      throw Error('Fail to fetch slot number')
    }

    const txBuilder = await this.getTransactionBuilder()

    // Set TTL to +2h from currentSlot
    // If the transaction is not included in a block before that slot it will be cancelled.
    txBuilder.set_ttl(currentSlot.slot + 7200)

    const cardanoLib = await getCardano()
    const recipientAddr = cardanoLib.Address.from_bech32(recipient)
    const senderAddr = cardanoLib.Address.from_bech32(sender)

    txBuilder.add_output(
      cardanoLib.TransactionOutput.new(
        recipientAddr,
        cardanoLib.Value.new(cardanoLib.BigNum.from_str(amount.amount().toString())),
      ),
    )

    const lovelaceUtxos = utxos.filter((u) => u.amount.some((a) => a.unit === 'lovelace'))

    const unspentOutputs = cardanoLib.TransactionUnspentOutputs.new()
    for (const utxo of lovelaceUtxos) {
      const amount = utxo.amount.find((a) => a.unit === 'lovelace')?.quantity

      if (!amount) continue

      const inputValue = cardanoLib.Value.new(cardanoLib.BigNum.from_str(amount.toString()))

      const input = cardanoLib.TransactionInput.new(
        cardanoLib.TransactionHash.from_bytes(Buffer.from(utxo.tx_hash, 'hex')),
        utxo.output_index,
      )
      const output = cardanoLib.TransactionOutput.new(senderAddr, inputValue)
      unspentOutputs.add(cardanoLib.TransactionUnspentOutput.new(input, output))
    }
    txBuilder.add_inputs_from(unspentOutputs, cardanoLib.CoinSelectionStrategyCIP2.LargestFirst)

    if (memo) {
      const metadata = cardanoLib.GeneralTransactionMetadata.new()
      metadata.insert(cardanoLib.BigNum.from_str('674'), cardanoLib.TransactionMetadatum.new_text(memo))
      txBuilder.set_metadata(metadata)
    }

    txBuilder.add_change_if_needed(senderAddr)

    return {
      rawUnsignedTx: txBuilder.build_tx().to_hex(),
    }
  }

  private async roundRobinGetBalance(address: Address): Promise<Balance[]> {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        try {
          const { amount } = await blockFrostApi.addresses(address)
          const adaBalance = amount.find((balance) => balance.unit === 'lovelace')

          return [
            {
              asset: ADAAsset,
              amount: baseAmount(adaBalance?.quantity || 0, this.getAssetInfo().decimal),
            },
          ]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if ('status_code' in e && e.status_code === 404) {
            return [
              {
                asset: ADAAsset,
                amount: baseAmount(0, ADA_DECIMALS),
              },
            ]
          }
          throw e
        }
      } catch (e) {
        console.error(e)
      }
    }

    throw Error('Can not get balance')
  }

  private async roundRobinGetEpochParameters() {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        return await blockFrostApi.epochsLatestParameters()
      } catch (e) {
        console.warn(e)
      }
    }
    throw Error('Can not get epoch parameters')
  }

  private async roundRobinGetLatestBlock() {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        return await blockFrostApi.blocksLatest()
      } catch {}
    }
    throw Error('Can not get epoch parameters')
  }

  private async roundRobinGetAllAddressUTXOs(address: Address) {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        return await blockFrostApi.addressesUtxosAll(address)
      } catch {}
    }
    throw Error('Can not get address UTXOs')
  }

  private async roundRobinGetTransactionData(txId: string) {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        return await blockFrostApi.txs(txId)
      } catch (e) {
        console.warn(e)
      }
    }
    throw Error('Can not get transaction')
  }

  private async roundRobinGetTransactionUtxos(txId: string) {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        return await blockFrostApi.txsUtxos(txId)
      } catch {}
    }
    throw Error('Can not get transaction UTXOs')
  }

  private async roundRobinBroadcastTx(txHex: string): Promise<TxHash> {
    for (const blockFrostApi of this.blockfrostApis[this.getNetwork()]) {
      try {
        return await blockFrostApi.txSubmit(txHex)
      } catch (e) {
        console.log(e)
      }
    }
    throw Error('Can not broadcast transaction')
  }

  private async generatePrivateKey(walletIndex = 0): Promise<Bip32PrivateKey> {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const cardanoLib = await getCardano()
    const rootKey = cardanoLib.Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(phraseToEntropy(this.phrase), 'hex'),
      Buffer.from(''),
    )

    return rootKey
      .derive(1852 | 0x80000000)
      .derive(1815 | 0x80000000)
      .derive(walletIndex | 0x80000000)
  }

  private async getTransactionBuilder(): Promise<TransactionBuilder> {
    const protocolParams = await this.roundRobinGetEpochParameters()
    const cardanoLib = await getCardano()
    return cardanoLib.TransactionBuilder.new(
      cardanoLib.TransactionBuilderConfigBuilder.new()
        .fee_algo(
          cardanoLib.LinearFee.new(
            cardanoLib.BigNum.from_str(protocolParams.min_fee_a.toString()),
            cardanoLib.BigNum.from_str(protocolParams.min_fee_b.toString()),
          ),
        )
        .pool_deposit(cardanoLib.BigNum.from_str(protocolParams.pool_deposit))
        .key_deposit(cardanoLib.BigNum.from_str(protocolParams.key_deposit))
        // coins_per_utxo_size is already introduced in current Cardano fork
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .coins_per_utxo_byte(cardanoLib.BigNum.from_str(protocolParams.coins_per_utxo_size!))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .max_value_size(parseInt(protocolParams.max_val_size!))
        .max_tx_size(protocolParams.max_tx_size)
        .build(),
    )
  }
}
