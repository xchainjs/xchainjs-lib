import { fromBech32 } from '@cosmjs/encoding'
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing'
import { GasPrice, IndexedTx, SigningStargateClient, StargateClient, StdFee, calculateFee } from '@cosmjs/stargate'
import {
  AssetInfo,
  Balance,
  BaseXChainClient,
  FeeType,
  Fees,
  Network,
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
 * Cosmos-sdk client
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
   */
  constructor(params: CosmosSdkClientParams) {
    super(params.chain, params)
    this.clientUrls = params.clientUrls
    this.prefix = params.prefix
    this.defaultDecimals = params.defaultDecimals
    this.defaultFee = params.defaultFee
    this.baseDenom = params.baseDenom
    this.signer = new CachedValue<DirectSecp256k1HdWallet>(
      async () =>
        await DirectSecp256k1HdWallet.fromMnemonic(params.phrase as string, { prefix: params.prefix || 'cosmos' }),
    )
    this.startgateClient = new CachedValue<StargateClient>(() =>
      this.connectClient(this.clientUrls[params.network || Network.Mainnet]),
    )
  }

  private async connectClient(clientUrl: string) {
    return StargateClient.connect(clientUrl)
  }

  /**
   * Give 300000uatom return { amount: 300000, denom: uatom }
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

  public async getTransactionData(txId: string, _assetAddress?: string | undefined): Promise<Tx> {
    const client = await this.startgateClient.getValue()
    const tx = await client.getTx(txId)
    if (!tx) {
      throw Error(`Can not find transaction ${txId}`)
    }
    return this.mapIndexedTxToTx(tx)
  }

  public async transfer(params: TxParams): Promise<string> {
    if (!this.signer) {
      throw Error('Invalid signer')
    }

    const denom = this.getDenom(params.asset || this.getAssetInfo().asset)

    if (!denom) {
      throw Error(
        `Invalid asset ${params.asset?.symbol} - Only ${this.baseDenom} asset is currently supported to transfer`,
      )
    }

    const signer = await this.signer.getValue()
    const signingClient = await SigningStargateClient.connectWithSigner(this.clientUrls[this.network], signer)
    const address = await this.getAddress()
    const amount = { amount: params.amount.amount().toString(), denom }

    // TODO: Support fee configuration (subsided fee)
    const defaultGasPrice = GasPrice.fromString(`0.025${denom}`)
    const defaultSendFee: StdFee = calculateFee(90_000, defaultGasPrice)

    const tx = await signingClient.sendTokens(address, params.recipient, [amount], defaultSendFee, params.memo)

    return tx.transactionHash
  }

  public async broadcastTx(txHex: string): Promise<string> {
    const client = await this.startgateClient.getValue()
    const txResponse = await client.broadcastTx(new Uint8Array(Buffer.from(txHex, 'hex')))
    return txResponse.transactionHash
  }

  abstract getAssetInfo(): AssetInfo
  abstract getExplorerUrl(): string
  abstract getExplorerAddressUrl(_address: string): string
  abstract getExplorerTxUrl(txID: string): string
  abstract assetFromDenom(denom: string): Asset | null
  abstract getDenom(asset: Asset): string | null
}

export { Client }
