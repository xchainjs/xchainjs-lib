import { fetchAllDigitalAsset, fetchDigitalAsset, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey as UmiPubliKey, Umi, publicKey } from '@metaplex-foundation/umi'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { isAddress } from '@solana/addresses'
import {
  Account,
  TOKEN_PROGRAM_ID,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
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
  PreparedTx,
  TxHash,
  TxHistoryParams,
  TxType,
} from '@xchainjs/xchain-client'
import { getSeed } from '@xchainjs/xchain-crypto'
import {
  Address,
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  baseAmount,
  eqAsset,
  getContractAddressFromAsset,
} from '@xchainjs/xchain-util'
import bs58 from 'bs58'
import { HDKey } from 'micro-ed25519-hdkey'

import { SOLAsset, SOLChain, SOL_DECIMALS, defaultSolanaParams } from './const'
import { TokenAssetData } from './solana-types'
import { Balance, SOLClientParams, Tx, TxFrom, TxParams, TxTo, TxsPage } from './types'
import { getSolanaNetwork } from './utils'

export class Client extends BaseXChainClient {
  private explorerProviders: ExplorerProviders
  private connection: Connection
  private umi: Umi

  constructor(params: SOLClientParams = defaultSolanaParams) {
    super(SOLChain, {
      ...defaultSolanaParams,
      ...params,
    })
    this.explorerProviders = params.explorerProviders
    this.connection = new Connection(clusterApiUrl(getSolanaNetwork(this.getNetwork())))
    this.umi = createUmi(this.connection).use(mplTokenMetadata())
  }

  /**
   * Get information about the native asset of the Solana.
   *
   * @returns {AssetInfo} Information about the native asset.
   */
  public getAssetInfo(): AssetInfo {
    return {
      asset: SOLAsset,
      decimal: SOL_DECIMALS,
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
   * Get the current address asynchronously.
   *
   * @param {number} index The index of the address.
   * @returns {Address} The Solana address related to the index provided.
   * @throws {"Phrase must be provided"} Thrown if the phrase has not been set before.
   */
  public async getAddressAsync(index?: number): Promise<string> {
    return this.getPrivateKeyPair(index || 0).publicKey.toBase58()
  }

  /**
   * Get the current address synchronously.
   * @deprecated
   */
  public getAddress(): string {
    throw Error('Sync method not supported')
  }

  /**
   * Validate the given Solana address.
   * @param {string} address Solana address to validate.
   * @returns {boolean} `true` if the address is valid, `false` otherwise.
   */
  public validateAddress(address: Address): boolean {
    return isAddress(address)
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
   * Retrieves the balance of a given address.
   * @param {Address} address - The address to retrieve the balance for.
   * @param {TokenAsset[]} assets - Assets to retrieve the balance for (optional).
   * @returns {Promise<Balance[]>} An array containing the balance of the address.
   */
  public async getBalance(address: Address, assets?: TokenAsset[]): Promise<Balance[]> {
    const balances: Balance[] = []

    const nativeBalance = await this.connection.getBalance(new PublicKey(address))

    balances.push({
      asset: SOLAsset,
      amount: baseAmount(nativeBalance, SOL_DECIMALS),
    })

    const tokenBalances = await this.connection.getParsedTokenAccountsByOwner(new PublicKey(address), {
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

    const assetsData = await fetchAllDigitalAsset(this.umi, mintPublicKeys)

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

  /**
   * Get transaction fees.
   *
   * @param {TxParams} params - The transaction parameters.
   * @returns {Fees} The average, fast, and fastest fees.
   * @throws {"Params need to be passed"} Thrown if parameters are not provided.
   */
  public async getFees(params?: TxParams): Promise<Fees> {
    if (!params) throw new Error('Params need to be passed')

    const sender = Keypair.generate()
    const toPubkey = new PublicKey(params.recipient)

    const transaction = new Transaction()

    transaction.recentBlockhash = await this.connection.getLatestBlockhash().then((block) => block.blockhash)
    transaction.feePayer = sender.publicKey

    let createAccountTxFee = 0
    if (!params.asset || eqAsset(params.asset, this.getAssetInfo().asset)) {
      // Native transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: sender.publicKey,
          toPubkey,
          lamports: params.amount.amount().toNumber(),
        }),
      )
    } else {
      // Token transfer
      const mintAddress = new PublicKey(getContractAddressFromAsset(params.asset as TokenAsset))
      const associatedTokenAddress = getAssociatedTokenAddressSync(mintAddress, toPubkey)

      try {
        await getAccount(this.connection, associatedTokenAddress, undefined, TOKEN_PROGRAM_ID)
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
          createAccountTxFee = await this.connection.getMinimumBalanceForRentExemption(dataLength)

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

    const fee = (await transaction.getEstimatedFee(this.connection)) || 0

    return {
      type: FeeType.FlatFee,
      [FeeOption.Average]: baseAmount(fee + createAccountTxFee, SOL_DECIMALS),
      [FeeOption.Fast]: baseAmount(fee + createAccountTxFee, SOL_DECIMALS),
      [FeeOption.Fastest]: baseAmount(fee + createAccountTxFee, SOL_DECIMALS),
    }
  }

  /**
   * Get the transaction details of a given transaction ID.
   *
   * @param {string} txId The transaction ID.
   * @returns {Tx} The transaction details.
   */
  public async getTransactionData(txId: string): Promise<Tx> {
    const transaction = await this.connection.getParsedTransaction(txId)
    if (!transaction) throw Error('Can not find transaction')

    return this.parseTransaction(transaction)
  }

  public async getTransactions(params?: TxHistoryParams): Promise<TxsPage> {
    const signatures = await this.connection.getSignaturesForAddress(
      new PublicKey(params?.address || (await this.getAddressAsync())),
    )

    const transactions = await this.connection.getParsedTransactions(signatures.map(({ signature }) => signature))

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

  /**
   * Transfers SOL or Solana token
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  public async transfer({
    walletIndex,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
  }: TxParams): Promise<string> {
    const senderKeyPair = this.getPrivateKeyPair(walletIndex || 0)

    if (asset && !eqAsset(asset, this.getAssetInfo().asset)) {
      // Check if receipt token account is created, otherwise, create it
      const mintAddress = new PublicKey(getContractAddressFromAsset(asset as TokenAsset))
      await getOrCreateAssociatedTokenAccount(this.connection, senderKeyPair, mintAddress, new PublicKey(recipient))
    }

    const { rawUnsignedTx } = await this.prepareTx({
      sender: senderKeyPair.publicKey.toBase58(),
      recipient,
      asset,
      amount,
      memo,
      limit,
      priorityFee,
    })

    const transaction = Transaction.from(bs58.decode(rawUnsignedTx))

    transaction.sign(senderKeyPair)

    return this.broadcastTx(bs58.encode(transaction.serialize()))
  }

  /**
   * Broadcast a transaction to the network
   * @param {string} txHex Raw transaction to broadcast
   * @returns {TxHash} The hash of the transaction broadcasted
   */
  public async broadcastTx(txHex: string): Promise<TxHash> {
    try {
      const transaction = Transaction.from(bs58.decode(txHex))
      return await this.connection.sendRawTransaction(transaction.serialize())
    } catch (e: unknown) {
      if (e instanceof SendTransactionError) {
        console.log(await e.getLogs(this.connection))
      }
      throw Error('Can not broadcast transaction. Unknown error')
    }
  }

  /**
   * Prepares a transaction for transfer.
   *
   * @param {TxParams&Address} params - The transfer options.
   * @returns {Promise<PreparedTx>} The raw unsigned transaction.
   */
  public async prepareTx({
    sender,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
  }: TxParams & { sender: Address }): Promise<PreparedTx> {
    const transaction = new Transaction()

    const fromPubkey = new PublicKey(sender)
    const toPubkey = new PublicKey(recipient)

    transaction.recentBlockhash = await this.connection.getLatestBlockhash().then((block) => block.blockhash)
    transaction.feePayer = new PublicKey(sender)

    if (!asset || eqAsset(asset, this.getAssetInfo().asset)) {
      // Native transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount.amount().toNumber(),
        }),
      )
    } else {
      // Token transfer
      const mintAddress = new PublicKey(getContractAddressFromAsset(asset as TokenAsset))

      const fromAssociatedAccount = getAssociatedTokenAddressSync(mintAddress, fromPubkey)
      let fromTokenAccount: Account
      try {
        fromTokenAccount = await getAccount(this.connection, fromAssociatedAccount)
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
          throw Error('Can not find sender Token account')
        }
        throw error
      }

      const toAssociatedAccount = getAssociatedTokenAddressSync(mintAddress, toPubkey)
      let toTokenAccount: Account
      try {
        toTokenAccount = await getAccount(this.connection, toAssociatedAccount)
      } catch (error) {
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
          throw Error('Can not find recipient Token account. Create it first')
        }
        throw error
      }

      transaction.add(
        createTransferInstruction(
          fromTokenAccount.address,
          toTokenAccount.address,
          fromPubkey,
          amount.amount().toNumber(),
        ),
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

  private getPrivateKeyPair(index: number): Keypair {
    if (!this.phrase) throw new Error('Phrase must be provided')

    const seed = getSeed(this.phrase)
    const hd = HDKey.fromMasterSeed(seed.toString('hex'))

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

    // Tokens transfer
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

          const tokenMetadata = await fetchDigitalAsset(this.umi, publicKey(mintAddress))

          if (owner) {
            if (postBalanceAmount > preBalanceAmount) {
              to.push({
                amount: assetToBase(assetAmount(postBalanceAmount - preBalanceAmount, assetDecimals)),
                asset: assetFromStringEx(`SOL.${tokenMetadata.metadata.symbol.trim()}-${mintAddress}`) as TokenAsset,
                to: owner,
              })
            } else if (preBalanceAmount > postBalanceAmount) {
              from.push({
                amount: assetToBase(assetAmount(preBalanceAmount - postBalanceAmount, assetDecimals)),
                asset: assetFromStringEx(`SOL.${tokenMetadata.metadata.symbol.trim()}-${mintAddress}`) as TokenAsset,
                from: owner,
              })
            }
          }
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
}
