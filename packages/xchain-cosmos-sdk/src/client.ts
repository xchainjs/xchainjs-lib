import { fromBase64, fromBech32, toBase64 } from '@cosmjs/encoding'
import { DecodedTxRaw, DirectSecp256k1HdWallet, Registry, TxBodyEncodeObject, decodeTxRaw } from '@cosmjs/proto-signing'
import {
  GasPrice,
  IndexedTx,
  MsgSendEncodeObject,
  SigningStargateClient,
  StargateClient,
  StdFee,
  calculateFee,
} from '@cosmjs/stargate'
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
import * as xchainCrypto from '@xchainjs/xchain-crypto'
import { Address, Asset, BaseAmount, CachedValue, Chain, baseAmount } from '@xchainjs/xchain-util'
import * as bech32 from 'bech32'
import * as BIP32 from 'bip32'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import * as crypto from 'crypto'
import * as secp256k1 from 'secp256k1'

export type CosmosSdkClientParams = XChainClientParams & {
  chain: Chain
  clientUrls: Record<Network, string>
  prefix: string
  defaultDecimals: number
  defaultFee: BaseAmount
  baseDenom: string
}

/**
 * Generic implementation of the XChainClient interface chains built with cosmos-sdk (https://docs.cosmos.network/) using the dependencies of the official @cosmjs monorepo.
 */
export default abstract class Client extends BaseXChainClient implements XChainClient {
  private readonly startgateClient: CachedValue<StargateClient>
  private readonly clientUrls: Record<Network, string>
  private readonly signer: CachedValue<DirectSecp256k1HdWallet> | undefined
  private readonly prefix: string
  private readonly defaultDecimals: number
  private readonly defaultFee: BaseAmount
  protected readonly baseDenom: string
  /**
   * Constructor
   * @constructor
   * @param {CosmosSdkClientParams} params client configuration (prefix, decimal, fees, urls...)
   */
  constructor(params: CosmosSdkClientParams) {
    super(params.chain, params)
    this.clientUrls = params.clientUrls
    this.prefix = params.prefix
    this.defaultDecimals = params.defaultDecimals
    this.defaultFee = params.defaultFee
    this.baseDenom = params.baseDenom
    if (params.phrase) {
      this.signer = new CachedValue<DirectSecp256k1HdWallet>(
        async () =>
          await DirectSecp256k1HdWallet.fromMnemonic(params.phrase as string, { prefix: params.prefix || 'cosmos' }),
      )
    }
    this.startgateClient = new CachedValue<StargateClient>(() =>
      this.connectClient(this.clientUrls[params.network || Network.Mainnet]),
    )
  }

  private async connectClient(clientUrl: string) {
    return StargateClient.connect(clientUrl)
  }

  /**
   * @private
   * Split on amount and denom strings with format 300000uatom
   * @param {string[]} amountsAndDenoms strings with format 3000uatom
   * @returns {Array} array of strings splitted { amount: 300000, denom: uatom }
   */
  private splitAmountAndDenom(amountsAndDenoms: string[]) {
    const amounAndDenomParsed: { amount: string; denom: string }[] = []
    amountsAndDenoms.forEach((amountAndDenom) => {
      const regex = /^(\d+)(\D+)$/
      const match = amountAndDenom.match(regex)

      if (match) {
        const amount = match[1] // '3000000'
        const denom = match[2] // 'uatom'
        amounAndDenomParsed.push({ amount, denom })
      }
    })
    return amounAndDenomParsed
  }

  /**
   * @private
   * Function that transforms the transaction type returned by cosmjs to the transaction type used by xchainjs.
   * @param {IndexedTx} indexedTx transaction to transform
   * @returns {Tx} transaction with xchainjs format
   */
  private async mapIndexedTxToTx(indexedTx: IndexedTx): Promise<Tx> {
    const mapTo: Map<Address, { amount: BaseAmount; asset: Asset | undefined }> = new Map()
    const mapFrom: Map<Address, { amount: BaseAmount; asset: Asset | undefined }> = new Map()

    indexedTx.events.forEach((event) => {
      if (event.type === 'transfer') {
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
          const allTokensInEvent = keyAmount.value.split(',') // More than one asset per event (kuji faucet example)
          const amounts = this.splitAmountAndDenom(allTokensInEvent)
          const nativeAssetAmounts = amounts.filter((amount) => amount.denom === this.baseDenom) // TODO: Temporally discard non native assets
          const totalNativeAmount = nativeAssetAmounts.reduce(
            // TODO: Diferenciate fee from amount
            (acum, amount) => acum.plus(amount.amount),
            baseAmount(0, this.defaultDecimals),
          )
          // Fill to
          if (mapTo.has(keyRecipient.value)) {
            const currentTo = mapTo.get(keyRecipient.value) as { amount: BaseAmount; asset: Asset | undefined }
            currentTo.amount = currentTo?.amount.plus(totalNativeAmount)
            mapTo.set(keyRecipient.value, currentTo)
          } else {
            const asset = this.assetFromDenom(this.baseDenom)
            if (asset) {
              mapTo.set(keyRecipient.value, {
                amount: totalNativeAmount,
                asset,
              })
            }
          }
          // Fill from
          if (mapFrom.has(keySender.value)) {
            const currentTo = mapFrom.get(keySender.value) as { amount: BaseAmount; asset: Asset | undefined }
            currentTo.amount = currentTo?.amount.plus(totalNativeAmount)
            mapFrom.set(keySender.value, currentTo)
          } else {
            const asset = this.assetFromDenom(this.baseDenom)
            if (asset) {
              mapFrom.set(keySender.value, {
                amount: totalNativeAmount,
                asset,
              })
            }
          }
        } catch (e) {
          console.error('Error:', e)
        }
      }
    })

    const txTo: TxTo[] = []
    for (const [key, value] of mapTo.entries()) {
      const txToObj: TxTo = {
        to: key,
        amount: value.amount,
        asset: value.asset,
      }
      txTo.push(txToObj)
    }

    const txFrom: TxFrom[] = []
    for (const [key, value] of mapFrom.entries()) {
      const txFromObj: TxFrom = {
        from: key,
        amount: value.amount,
        asset: value.asset,
      }
      txFrom.push(txFromObj)
    }

    const client = await this.startgateClient.getValue()
    const blockData = await client.getBlock(indexedTx.height)

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
   * This function returns the fee object in a generalised way for a simple transfer function. In this case this funcion use the default fee
   * defined in the constructor.
   * @returns {Fees} fees estimation for average, fast and fastests scenarios.
   */
  getFees(): Promise<Fees> {
    return Promise.resolve(singleFee(FeeType.FlatFee, this.defaultFee))
  }

  private hash160(buffer: Uint8Array) {
    const sha256Hash: Buffer = crypto.createHash('sha256').update(buffer).digest()
    try {
      return crypto.createHash('rmd160').update(sha256Hash).digest()
    } catch (err) {
      return crypto.createHash('ripemd160').update(sha256Hash).digest()
    }
  }

  /**
   * @deprecated this function eventually will be removed use getAddressAsync instead
   */
  public getAddress(walletIndex?: number | undefined): string {
    const seed = xchainCrypto.getSeed(this.phrase)
    const node = BIP32.fromSeed(seed)
    const child = node.derivePath(this.getFullDerivationPath(walletIndex || 0))

    if (!child.privateKey) throw new Error('child does not have a privateKey')

    // TODO: Make this method async and use CosmosJS official address generation strategy
    const pubKey = secp256k1.publicKeyCreate(child.privateKey)
    const rawAddress = this.hash160(Uint8Array.from(pubKey))
    const words = bech32.toWords(Buffer.from(rawAddress))
    const address = bech32.encode(this.prefix, words)
    return address
  }

  /**
   * Get an address derived from the phrase defined in the constructor.
   * @param {number | undefined} walletIndex derivation path index of address that will be generated
   * @returns {string} user address at index defined on walletIndex
   */
  async getAddressAsync(index = 0): Promise<string> {
    return this.getAddress(index)
  }

  /**
   * Validate the address format.
   * @param {string} address address to be validated
   * @returns {boolean} represents whether the address is valid or invalid
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
   * Obtains all the balances of the address passed as parameter for all the assets of the network. For the moment for this client the assets parameter is ignored.
   * Do not hesitate to open a PR if you need it and it is not yet available.
   * @param {string} address address to be validated
   * @param {Asset[] | undefined} _assets IGNORED FOR THIS IMPLEMENTATION
   * @returns {Balance[]} array of balances
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
          amount: baseAmount(balance.amount, this.defaultDecimals),
        })
      }
    })
    return balances
  }

  /**
   * Get transactions filtered using params
   * @param {TxHistoryParams | undefined} params Only param address IS SUPPORTED FOR THIS CLIENT, new feature will be added in the future
   * @returns {TxsPage} array of balances
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
   * Get transaction info using txId
   * @param {string} txId Idetifier of transaction
   * @returns {Tx} Transaction data
   */
  public async getTransactionData(txId: string, _assetAddress?: string | undefined): Promise<Tx> {
    const client = await this.startgateClient.getValue()
    const tx = await client.getTx(txId)
    if (!tx) {
      throw Error(`Can not find transaction ${txId}`)
    }
    return this.mapIndexedTxToTx(tx)
  }

  public async transfer(params: TxParams): Promise<string> {
    if (!this.signer) throw Error('Invalid signer')

    const sender = await this.getAddressAsync(params.walletIndex || 0)

    const { rawUnsignedTx } = await this.prepareTx({
      sender,
      recipient: params.recipient,
      asset: params.asset,
      amount: params.amount,
      memo: params.memo,
    })

    // TODO: Support fee configuration (subsided fee)
    const denom = this.getDenom(this.getAssetInfo().asset)
    const defaultGasPrice = GasPrice.fromString(`0.025${denom}`)
    const defaultSendFee: StdFee = calculateFee(90_000, defaultGasPrice)

    const unsignedTx: DecodedTxRaw = decodeTxRaw(fromBase64(rawUnsignedTx))

    const signer = await this.signer.getValue()
    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], signer)

    const messages: MsgSendEncodeObject[] = unsignedTx.body.messages.map((message) => {
      return { typeUrl: '/cosmos.bank.v1beta1.MsgSend', value: signingClient.registry.decode(message) }
    })
    const tx = await signingClient.signAndBroadcast(sender, messages, defaultSendFee, unsignedTx.body.memo)

    return tx.transactionHash
  }

  public async broadcastTx(txHex: string): Promise<string> {
    const client = await this.startgateClient.getValue()
    const txResponse = await client.broadcastTx(new Uint8Array(Buffer.from(txHex, 'hex')))
    return txResponse.transactionHash
  }

  /**
   * Prepare transfer.
   *
   * @param {TxParams&Address} params The transfer options.
   * @returns {PreparedTx} The raw unsigned transaction.
   */
  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    if (!this.validateAddress(sender)) throw Error('Invalid sender address')
    if (!this.validateAddress(recipient)) throw Error('Invalid recipient address')

    const denom = this.getDenom(asset || this.getAssetInfo().asset)
    if (!denom)
      throw Error(`Invalid asset ${asset?.symbol} - Only ${this.baseDenom} asset is currently supported to transfer`)

    const demonAmount = { amount: amount.amount().toString(), denom }

    const txBody: TxBodyEncodeObject = {
      typeUrl: '/cosmos.tx.v1beta1.TxBody',
      value: {
        messages: [
          {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
              fromAddress: sender,
              toAddress: recipient,
              amount: [demonAmount],
            },
          },
        ],
        memo: memo,
      },
    }

    const rawTx = TxRaw.fromPartial({
      bodyBytes: new Registry().encode(txBody),
    })
    return { rawUnsignedTx: toBase64(TxRaw.encode(rawTx).finish()) }
  }

  abstract getAssetInfo(): AssetInfo
  abstract getExplorerUrl(): string
  abstract getExplorerAddressUrl(_address: string): string
  abstract getExplorerTxUrl(txID: string): string
  abstract assetFromDenom(denom: string): Asset | null
  abstract getDenom(asset: Asset): string | null
}

export { Client }
