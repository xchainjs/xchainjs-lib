import { fetchAllDigitalAsset, fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey as UmiPubliKey, Umi, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { isAddress } from '@solana/addresses'
import {
  Account,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import {
  ComputeBudgetProgram,
  Connection,
  Keypair,
  ParsedTransactionWithMeta,
  PublicKey,
  SendTransactionError,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} from '@solana/web3.js'
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
  BaseAmount,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  baseAmount,
  eqAsset,
  getContractAddressFromAsset,
} from '@xchainjs/xchain-util'
import bs58 from 'bs58'
import slip10 from 'micro-key-producer/slip10.js'

import { SOLAsset, SOLChain, SOL_DECIMALS, defaultSolanaParams } from './const'
import { TokenAssetData } from './solana-types'
import { Balance, SOLClientParams, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'
import { getSolanaNetwork } from './utils'

type Providers = {
  solanaProvider: Connection
  umiProvider: Umi
}

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  protected providers: Providers[]
  private clientUrls?: Record<Network, string[]>

  constructor(params: SOLClientParams = defaultSolanaParams) {
    super(SOLChain, {
      ...defaultSolanaParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders
    this.clientUrls = params.clientUrls

    if (!this.clientUrls) {
      const solanaProvider = new Connection(clusterApiUrl(getSolanaNetwork(this.getNetwork())))
      const umiProvider = createUmi(solanaProvider).use(mplTokenMetadata())
      this.providers = [
        {
          solanaProvider,
          umiProvider,
        },
      ]
    } else {
      this.providers = this.clientUrls[this.getNetwork()].map((url) => {
        const solanaProvider = new Connection(url)
        const umiProvider = createUmi(solanaProvider).use(mplTokenMetadata())
        return {
          solanaProvider,
          umiProvider,
        }
      })
    }
  }

  public setNetwork(network: Network): void {
    super.setNetwork(network)
    if (!this.clientUrls) {
      const solanaProvider = new Connection(clusterApiUrl(getSolanaNetwork(this.getNetwork())))
      const umiProvider = createUmi(solanaProvider).use(mplTokenMetadata())
      this.providers = [
        {
          solanaProvider,
          umiProvider,
        },
      ]
    } else {
      this.providers = this.clientUrls[this.getNetwork()].map((url) => {
        const solanaProvider = new Connection(url)
        const umiProvider = createUmi(solanaProvider).use(mplTokenMetadata())
        return {
          solanaProvider,
          umiProvider,
        }
      })
    }
  }

  public getAssetInfo(): AssetInfo {
    return {
      asset: SOLAsset,
      decimal: SOL_DECIMALS,
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

  public async getAddressAsync(index?: number): Promise<string> {
    return this.getPrivateKeyPair(index || 0).publicKey.toBase58()
  }

  /** @deprecated */
  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  public validateAddress(address: Address): boolean {
    return isAddress(address)
  }

  public async getBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    return this.roundRobinGetBalance(address, assets)
  }

  public async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')
    return this.roundRobinGetFees(params)
  }

  public async getTransactionData(txId: string): Promise<Tx> {
    const transaction = await this.roundRobinGetTransactionData(txId)
    if (!transaction) throw Error('Can not find transaction')

    return this.parseTransaction(transaction)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    return this.roundRobinGetTransactions(params)
  }

  public async transfer({
    walletIndex,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
    allowOwnerOffCurve,
  }: TxParams): Promise<string> {
    return this.roundRobinTransfer({
      walletIndex,
      recipient,
      asset,
      amount,
      memo,
      limit,
      priorityFee,
      allowOwnerOffCurve,
    })
  }

  public async broadcastTx(txHex: string): Promise<TxHash> {
    return this.roundRobinBroadcastTx(txHex)
  }

  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
    allowOwnerOffCurve,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    return this.roundRobinPrepareTx({
      sender,
      recipient,
      asset,
      amount,
      memo,
      limit,
      priorityFee,
      allowOwnerOffCurve,
    })
  }

  private getPrivateKeyPair(index: number): Keypair {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = slip10.fromMasterSeed(seed)

    return Keypair.fromSeed(hd.derive(this.getFullDerivationPath(index)).privateKey)
  }

  private async parseTransaction(tx: ParsedTransactionWithMeta): Promise<Tx> {
    const from: TxFrom[] = []
    const to: TxTo[] = []

    tx.transaction.message.accountKeys.forEach((accountKey, index) => {
      if (accountKey.writable) {
        const preBalance = tx.meta?.preBalances[index]
        const postBalance = tx.meta?.postBalances[index]

        if (preBalance !== undefined && postBalance !== undefined) {
          if (postBalance > preBalance) {
            to.push({
              amount: baseAmount(postBalance - preBalance, this.getAssetInfo().decimal),
              asset: this.getAssetInfo().asset,
              to: accountKey.pubkey.toBase58(),
            })
          } else if (preBalance > postBalance) {
            from.push({
              amount: baseAmount(preBalance - postBalance, this.getAssetInfo().decimal),
              asset: this.getAssetInfo().asset,
              from: accountKey.pubkey.toBase58(),
            })
          }
        }
      }
    })

    if (tx.meta?.preTokenBalances && tx.meta?.postTokenBalances) {
      for (let i = 0; i < tx.meta?.postTokenBalances.length; i++) {
        const postBalance = tx.meta.postTokenBalances[i]

        const preBalance = tx.meta.preTokenBalances.find(
          (preTokenBalance) => preTokenBalance.accountIndex === postBalance.accountIndex,
        )

        const postBalanceAmount = postBalance.uiTokenAmount.uiAmount || 0
        const preBalanceAmount = preBalance?.uiTokenAmount.uiAmount || 0

        if (preBalance !== null && postBalance !== null) {
          const assetDecimals = tx.meta.postTokenBalances[i].uiTokenAmount.decimals
          const mintAddress = tx.meta.postTokenBalances[i].mint
          const owner = tx.meta.postTokenBalances[i].owner

          try {
            for (const provider of this.providers) {
              const tokenMetadata = await fetchDigitalAsset(provider.umiProvider, publicKey(mintAddress))

              if (owner) {
                if (postBalanceAmount > preBalanceAmount) {
                  to.push({
                    amount: assetToBase(assetAmount(postBalanceAmount - preBalanceAmount, assetDecimals)),
                    asset: assetFromStringEx(
                      `SOL.${tokenMetadata.metadata.symbol.trim()}-${mintAddress}`,
                    ) as TokenAsset,
                    to: owner,
                  })
                } else if (preBalanceAmount > postBalanceAmount) {
                  from.push({
                    amount: assetToBase(assetAmount(preBalanceAmount - postBalanceAmount, assetDecimals)),
                    asset: assetFromStringEx(
                      `SOL.${tokenMetadata.metadata.symbol.trim()}-${mintAddress}`,
                    ) as TokenAsset,
                    from: owner,
                  })
                }
              }
            }
          } catch {}
        }
      }
    }

    return {
      asset: this.getAssetInfo().asset,
      date: new Date((tx.blockTime || 0) * 1000),
      type: TxType.Transfer,
      hash: tx.transaction.signatures[0],
      from,
      to,
    }
  }

  private async roundRobinGetBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    try {
      for (const provider of this.providers) {
        const balances: Balance[] = []

        const nativeBalance = await provider.solanaProvider.getBalance(new PublicKey(address))

        balances.push({
          asset: SOLAsset,
          amount: baseAmount(nativeBalance, SOL_DECIMALS),
        })

        const tokenBalances = await provider.solanaProvider.getParsedTokenAccountsByOwner(new PublicKey(address), {
          programId: TOKEN_PROGRAM_ID,
        })

        const tokensToRequest = !assets
          ? tokenBalances.value
          : tokenBalances.value.filter((tokenBalance) => {
              const tokenData = tokenBalance.account.data.parsed as TokenAssetData
              return (
                assets.findIndex((asset) => {
                  return asset.symbol.toLowerCase().includes(tokenData.info.mint.toLowerCase())
                }) !== -1
              )
            })

        const mintPublicKeys: UmiPubliKey[] = tokensToRequest.map((tokenBalance) => {
          const tokenData = tokenBalance.account.data.parsed as TokenAssetData
          return publicKey(tokenData.info.mint)
        })

        const assetsData = await fetchAllDigitalAsset(provider.umiProvider, mintPublicKeys)

        tokenBalances.value.forEach((balance) => {
          const parsedData = balance.account.data.parsed as TokenAssetData
          const assetData = assetsData.find((assetData) => assetData.publicKey.toString() === parsedData.info.mint)

          if (assetData) {
            balances.push({
              amount: baseAmount(parsedData.info.tokenAmount.amount, parsedData.info.tokenAmount.decimals),
              asset: assetFromStringEx(`SOL.${assetData.metadata.symbol.trim()}-${parsedData.info.mint}`) as TokenAsset,
            })
          }
        })

        return balances
      }
    } catch {}

    throw Error('No provider able to get balances.')
  }

  private async roundRobinGetFees(params: TxParams): Promise<Fees> {
    try {
      for (const provider of this.providers) {
        const sender = Keypair.generate()
        const toPubkey = new PublicKey(params.recipient)

        const transaction = new Transaction()

        transaction.recentBlockhash = await provider.solanaProvider
          .getLatestBlockhash()
          .then((block) => block.blockhash)
        transaction.feePayer = sender.publicKey

        let createAccountTxFee = 0
        if (!params.asset || eqAsset(params.asset, this.getAssetInfo().asset)) {
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: sender.publicKey,
              toPubkey,
              lamports: params.amount.amount().toNumber(),
            }),
          )
        } else {
          const mintAddress = new PublicKey(getContractAddressFromAsset(params.asset as TokenAsset))
          const associatedTokenAddress = getAssociatedTokenAddressSync(mintAddress, toPubkey, params.allowOwnerOffCurve)

          try {
            await getAccount(provider.solanaProvider, associatedTokenAddress, undefined, TOKEN_PROGRAM_ID)
            transaction.add(
              createTransferInstruction(
                sender.publicKey, // Should be Token account, but as it new KeyPair for estimation, sender public key
                associatedTokenAddress,
                sender.publicKey,
                params.amount.amount().toNumber(),
              ),
            )
          } catch (error: unknown) {
            if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
              // recipient token account has to be created

              const dataLength = 165 // Normally used for Token accounts
              createAccountTxFee = await provider.solanaProvider.getMinimumBalanceForRentExemption(dataLength)

              transaction.add(
                createTransferInstruction(
                  sender.publicKey, // Should be Token account, but as it new KeyPair for estimation, sender public key
                  toPubkey, // Should be Token account, but as recipient token account should be created, recipient public key
                  sender.publicKey,
                  params.amount.amount().toNumber(),
                ),
              )
            }
          }
        }

        if (params.memo) {
          transaction.add(
            new TransactionInstruction({
              keys: [{ pubkey: sender.publicKey, isSigner: true, isWritable: true }],
              data: Buffer.from(params.memo, 'utf-8'),
              programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            }),
          )
        }

        if (params.priorityFee) {
          transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
              microLamports: params.priorityFee.amount().toNumber() / 10 ** 3,
            }),
          )
        }

        if (params.limit) {
          transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({
              units: params.limit,
            }),
          )
        }

        const fee = (await transaction.getEstimatedFee(provider.solanaProvider)) || 0

        return {
          type: FeeType.FlatFee,
          [FeeOption.Average]: baseAmount(fee + createAccountTxFee, SOL_DECIMALS),
          [FeeOption.Fast]: baseAmount(fee + createAccountTxFee, SOL_DECIMALS),
          [FeeOption.Fastest]: baseAmount(fee + createAccountTxFee, SOL_DECIMALS),
        }
      }
    } catch {}
    throw Error('No provider able to get fees.')
  }

  private async roundRobinGetTransactionData(txId: string): Promise<ParsedTransactionWithMeta | null> {
    try {
      for (const provider of this.providers) {
        const transaction = await provider.solanaProvider.getParsedTransaction(txId, {
          maxSupportedTransactionVersion: 0,
        })
        return transaction
      }
    } catch {}
    throw Error('No provider able to get transaction data.')
  }

  private async roundRobinGetTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    try {
      for (const provider of this.providers) {
        const address = new PublicKey(params?.address || (await this.getAddressAsync()))
        const limit = params?.limit || 10
        const offset = params?.offset || 0

        // To support offset, fetch enough signatures to skip past the offset
        const fetchCount = offset + limit
        const allSignatures = await provider.solanaProvider.getSignaturesForAddress(address, {
          limit: fetchCount,
        })

        const signatures = allSignatures.slice(offset)

        if (signatures.length === 0) {
          return { txs: [], total: 0 }
        }

        const transactions = await provider.solanaProvider.getParsedTransactions(
          signatures.map(({ signature }) => signature),
          { maxSupportedTransactionVersion: 0 },
        )

        const results = await Promise.allSettled(
          transactions
            .filter((transaction) => !!transaction)
            .map((transaction) => this.parseTransaction(transaction as ParsedTransactionWithMeta)),
        )

        const txs: Tx[] = []

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            txs.push(result.value)
          }
        })

        return {
          txs,
          total: txs.length,
        }
      }
    } catch {}

    throw Error('No provider able to get transactions.')
  }

  private async roundRobinTransfer({
    walletIndex,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
    allowOwnerOffCurve,
  }: TxParams): Promise<string> {
    try {
      const senderKeyPair = this.getPrivateKeyPair(walletIndex || 0)
      const { rawUnsignedTx } = await this.prepareTx({
        sender: senderKeyPair.publicKey.toBase58(),
        recipient,
        asset,
        amount,
        memo,
        limit,
        priorityFee,
        allowOwnerOffCurve,
      })

      const transaction = Transaction.from(bs58.decode(rawUnsignedTx))

      transaction.sign(senderKeyPair)

      return this.broadcastTx(bs58.encode(transaction.serialize()))
    } catch {}

    throw Error('No provider able to transfer.')
  }

  private async roundRobinBroadcastTx(txHex: string): Promise<TxHash> {
    try {
      for (const provider of this.providers) {
        try {
          const transaction = Transaction.from(bs58.decode(txHex))
          return await provider.solanaProvider.sendRawTransaction(transaction.serialize())
        } catch (e: unknown) {
          if (e instanceof SendTransactionError) {
            console.log(await e.getLogs(provider.solanaProvider))
          }
          throw Error('Can not broadcast transaction. Unknown error')
        }
      }
    } catch {}

    throw Error('No provider able to broadcast transaction.')
  }

  private async roundRobinPrepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
    allowOwnerOffCurve,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    try {
      for (const provider of this.providers) {
        const transaction = new Transaction()
        const fromPubkey = new PublicKey(sender)
        const toPubkey = new PublicKey(recipient)

        transaction.recentBlockhash = await provider.solanaProvider
          .getLatestBlockhash()
          .then((block) => block.blockhash)
        transaction.feePayer = new PublicKey(sender)

        if (!asset || eqAsset(asset, this.getAssetInfo().asset)) {
          transaction.add(
            SystemProgram.transfer({
              fromPubkey,
              toPubkey,
              lamports: amount.amount().toNumber(),
            }),
          )
        } else {
          await this.addSplTransferInstructions(
            transaction,
            provider.solanaProvider,
            fromPubkey,
            toPubkey,
            asset as TokenAsset,
            amount,
            allowOwnerOffCurve,
          )
        }

        if (memo) {
          transaction.add(
            new TransactionInstruction({
              keys: [{ pubkey: fromPubkey, isSigner: true, isWritable: true }],
              data: Buffer.from(memo, 'utf-8'),
              programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            }),
          )
        }

        if (priorityFee) {
          transaction.add(
            ComputeBudgetProgram.setComputeUnitPrice({
              microLamports: priorityFee.amount().toNumber() / 10 ** 3,
            }),
          )
        }

        if (limit) {
          transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({
              units: limit,
            }),
          )
        }

        return { rawUnsignedTx: bs58.encode(transaction.serialize({ verifySignatures: false })) }
      }
    } catch (error) {
      console.log('prepareTx error', error)
    }

    throw Error('No provider able to prepare transaction')
  }

  // The recipient ATA is created in this transaction when it does not exist yet.
  protected async addSplTransferInstructions(
    transaction: Transaction,
    connection: Connection,
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    asset: TokenAsset,
    amount: BaseAmount,
    allowOwnerOffCurve?: boolean,
  ): Promise<void> {
    const mintAddress = new PublicKey(getContractAddressFromAsset(asset))
    const fromAssociatedAccount = getAssociatedTokenAddressSync(mintAddress, fromPubkey)
    let fromTokenAccount: Account
    try {
      fromTokenAccount = await getAccount(connection, fromAssociatedAccount)
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        throw Error('Can not find sender Token account')
      }
      throw error
    }

    const toAssociatedAccount = getAssociatedTokenAddressSync(mintAddress, toPubkey, allowOwnerOffCurve)
    try {
      await getAccount(connection, toAssociatedAccount)
    } catch (error) {
      if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
        transaction.add(createAssociatedTokenAccountInstruction(fromPubkey, toAssociatedAccount, toPubkey, mintAddress))
      } else {
        throw error
      }
    }

    transaction.add(
      createTransferInstruction(fromTokenAccount.address, toAssociatedAccount, fromPubkey, amount.amount().toNumber()),
    )
  }
}
