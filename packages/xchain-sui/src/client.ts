import { SuiClient as SuiRpcClient, SuiTransactionBlockResponse } from '@mysten/sui/client'
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

import { SUIAsset, SUIChain, SUI_DECIMALS, SUI_TYPE_TAG, defaultSuiParams } from './const'
import { Balance, SUIClientParams, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'
import { getDefaultClientUrl } from './utils'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private suiClient: SuiRpcClient
  private clientUrl?: string

  constructor(params: SUIClientParams = defaultSuiParams) {
    super(SUIChain, {
      ...defaultSuiParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders
    this.clientUrl = params.clientUrls?.[this.getNetwork()]
    this.suiClient = new SuiRpcClient({
      url: this.clientUrl || getDefaultClientUrl(this.getNetwork()),
    })
  }

  public setNetwork(network: Network): void {
    super.setNetwork(network)
    this.suiClient = new SuiRpcClient({
      url: this.clientUrl || getDefaultClientUrl(this.getNetwork()),
    })
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
    return this.getKeypair(index || 0).getPublicKey().toSuiAddress()
  }

  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  public validateAddress(address: Address): boolean {
    return isValidSuiAddress(address)
  }

  public async getBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    const balances: Balance[] = []

    // Get native SUI balance
    const suiBalance = await this.suiClient.getBalance({ owner: address })
    balances.push({
      asset: SUIAsset,
      amount: baseAmount(suiBalance.totalBalance, SUI_DECIMALS),
    })

    // Get all coin balances if no specific assets requested, or filter by requested assets
    const allBalances = await this.suiClient.getAllBalances({ owner: address })

    for (const coinBalance of allBalances) {
      // Skip native SUI (already added)
      if (coinBalance.coinType === SUI_TYPE_TAG) continue

      const tokenAsset = assetFromStringEx(`SUI.${this.coinTypeToSymbol(coinBalance.coinType)}`) as TokenAsset

      if (assets && !assets.some((a) => eqAsset(a, tokenAsset))) continue

      balances.push({
        asset: tokenAsset,
        amount: baseAmount(coinBalance.totalBalance, SUI_DECIMALS),
      })
    }

    return balances
  }

  public async getFees(): Promise<Fees> {
    // SUI uses a gas-based fee model. Reference gas price from the network.
    const gasPrice = await this.suiClient.getReferenceGasPrice()
    const baseFee = BigInt(gasPrice) * BigInt(2000) // Estimate for a simple transfer

    return {
      type: FeeType.FlatFee,
      [FeeOption.Average]: baseAmount(baseFee.toString(), SUI_DECIMALS),
      [FeeOption.Fast]: baseAmount(baseFee.toString(), SUI_DECIMALS),
      [FeeOption.Fastest]: baseAmount(baseFee.toString(), SUI_DECIMALS),
    }
  }

  public async getTransactionData(txId: string): Promise<Tx> {
    const txResponse = await this.suiClient.getTransactionBlock({
      digest: txId,
      options: {
        showInput: true,
        showEffects: true,
        showBalanceChanges: true,
      },
    })

    return this.parseTransaction(txResponse)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const address = params?.address || (await this.getAddressAsync())

    const fromTxs = await this.suiClient.queryTransactionBlocks({
      filter: { FromAddress: address },
      options: {
        showInput: true,
        showEffects: true,
        showBalanceChanges: true,
      },
      limit: params?.limit || 50,
    })

    const toTxs = await this.suiClient.queryTransactionBlocks({
      filter: { ToAddress: address },
      options: {
        showInput: true,
        showEffects: true,
        showBalanceChanges: true,
      },
      limit: params?.limit || 50,
    })

    // Merge and deduplicate by digest
    const seen = new Set<string>()
    const allTxResponses: SuiTransactionBlockResponse[] = []

    for (const tx of [...fromTxs.data, ...toTxs.data]) {
      if (!seen.has(tx.digest)) {
        seen.add(tx.digest)
        allTxResponses.push(tx)
      }
    }

    // Sort by timestamp descending
    allTxResponses.sort((a, b) => {
      const timeA = Number(a.timestampMs || 0)
      const timeB = Number(b.timestampMs || 0)
      return timeB - timeA
    })

    const txs: Tx[] = []
    for (const txResponse of allTxResponses) {
      try {
        txs.push(this.parseTransaction(txResponse))
      } catch {
        // Skip unparseable transactions
      }
    }

    const offset = params?.offset || 0
    const paged = txs.slice(offset, params?.limit ? offset + params.limit : undefined)

    return {
      txs: paged,
      total: txs.length,
    }
  }

  public async transfer({ walletIndex, recipient, asset, amount, memo, gasBudget }: TxParams): Promise<string> {
    const keypair = this.getKeypair(walletIndex || 0)
    const tx = new Transaction()

    if (!asset || eqAsset(asset, SUIAsset)) {
      // Native SUI transfer
      const [coin] = tx.splitCoins(tx.gas, [amount.amount().toString()])
      tx.transferObjects([coin], recipient)
    } else {
      // Token transfer
      const coinType = getContractAddressFromAsset(asset as TokenAsset)
      const coins = await this.suiClient.getCoins({
        owner: keypair.getPublicKey().toSuiAddress(),
        coinType,
      })

      if (coins.data.length === 0) {
        throw Error('No coins found for the specified asset')
      }

      // Merge all coins into the first one if there are multiple
      const primaryCoin = tx.object(coins.data[0].coinObjectId)
      if (coins.data.length > 1) {
        tx.mergeCoins(
          primaryCoin,
          coins.data.slice(1).map((c) => tx.object(c.coinObjectId)),
        )
      }

      const [splitCoin] = tx.splitCoins(primaryCoin, [amount.amount().toString()])
      tx.transferObjects([splitCoin], recipient)
    }

    if (memo) {
      // No native memo support in SUI; memo can be stored in tx metadata externally
    }

    if (gasBudget) {
      tx.setGasBudget(gasBudget.amount().toNumber())
    }

    const result = await this.suiClient.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    })

    await this.suiClient.waitForTransaction({ digest: result.digest })

    return result.digest
  }

  public async broadcastTx(txHex: string): Promise<TxHash> {
    const txBytes = Uint8Array.from(Buffer.from(txHex, 'hex'))
    const keypair = this.getKeypair(0)
    const { signature } = await keypair.signTransaction(txBytes)

    const result = await this.suiClient.executeTransactionBlock({
      transactionBlock: txHex,
      signature,
    })

    return result.digest
  }

  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    gasBudget,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    const tx = new Transaction()
    tx.setSender(sender)

    if (!asset || eqAsset(asset, SUIAsset)) {
      const [coin] = tx.splitCoins(tx.gas, [amount.amount().toString()])
      tx.transferObjects([coin], recipient)
    } else {
      const coinType = getContractAddressFromAsset(asset as TokenAsset)
      const coins = await this.suiClient.getCoins({
        owner: sender,
        coinType,
      })

      if (coins.data.length === 0) {
        throw Error('No coins found for the specified asset')
      }

      const primaryCoin = tx.object(coins.data[0].coinObjectId)
      if (coins.data.length > 1) {
        tx.mergeCoins(
          primaryCoin,
          coins.data.slice(1).map((c) => tx.object(c.coinObjectId)),
        )
      }

      const [splitCoin] = tx.splitCoins(primaryCoin, [amount.amount().toString()])
      tx.transferObjects([splitCoin], recipient)
    }

    if (gasBudget) {
      tx.setGasBudget(gasBudget.amount().toNumber())
    }

    const builtTx = await tx.build({ client: this.suiClient })
    return { rawUnsignedTx: Buffer.from(builtTx).toString('hex') }
  }

  private getKeypair(index: number): Ed25519Keypair {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)
    const derived = hd.derive(this.getFullDerivationPath(index))

    return Ed25519Keypair.fromSecretKey(derived.privateKey)
  }

  private parseTransaction(txResponse: SuiTransactionBlockResponse): Tx {
    const from: TxFrom[] = []
    const to: TxTo[] = []

    if (txResponse.balanceChanges) {
      for (const change of txResponse.balanceChanges) {
        const isSui = change.coinType === SUI_TYPE_TAG
        const asset = isSui ? SUIAsset : (assetFromStringEx(`SUI.${this.coinTypeToSymbol(change.coinType)}`) as TokenAsset)
        const changeAmount = BigInt(change.amount)

        if (changeAmount < BigInt(0)) {
          from.push({
            from: change.owner && typeof change.owner === 'object' && 'AddressOwner' in change.owner
              ? change.owner.AddressOwner
              : '',
            amount: baseAmount((-changeAmount).toString(), SUI_DECIMALS),
            asset,
          })
        } else if (changeAmount > BigInt(0)) {
          to.push({
            to: change.owner && typeof change.owner === 'object' && 'AddressOwner' in change.owner
              ? change.owner.AddressOwner
              : '',
            amount: baseAmount(changeAmount.toString(), SUI_DECIMALS),
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

  private coinTypeToSymbol(coinType: string): string {
    // coinType format: "0xpackage::module::Type"
    // Convert to symbol format for xchainjs: "TYPE-0xpackage::module::Type"
    const parts = coinType.split('::')
    const typeName = parts[parts.length - 1] || coinType
    return `${typeName}-${coinType}`
  }
}
