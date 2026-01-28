import SolanaLedgerApp from '@ledgerhq/hw-app-solana'
import Transport from '@ledgerhq/hw-transport'
import bs58 from 'bs58'
import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import {
  Account,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'

import { Address, TokenAsset, eqAsset, getContractAddressFromAsset } from '@xchainjs/xchain-util'

import { Client } from './client'
import { defaultSolanaParams } from './const'
import { SOLClientParams, TxParams } from './types'

export type SOLClientLedgerParams = SOLClientParams & { transport: Transport }

/**
 * Custom Tron Ledger client extending the base Tron client
 */
class ClientLedger extends Client {
  private transport: Transport
  private ledgerApp: SolanaLedgerApp | undefined

  constructor(params: SOLClientLedgerParams) {
    const clientParams = { ...defaultSolanaParams, ...params }

    super(clientParams)

    this.transport = params.transport
    this.ledgerApp = new SolanaLedgerApp(this.transport)
  }

  getApp(): SolanaLedgerApp {
    if (this.ledgerApp) return this.ledgerApp

    this.ledgerApp = new SolanaLedgerApp(this.transport)
    return this.ledgerApp
  }

  // Get the current address synchronously - not supported for Ledger Client
  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  // get derivation path for ledger
  getDerivationPath(index = 0): string {
    const derivationPath = this.getFullDerivationPath(index)
    return derivationPath.replace(/^m\//, '')
  }

  // Get the current address asynchronously
  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const derivationPath = this.getDerivationPath(index)
    const result = await this.getApp().getAddress(derivationPath, verify)

    const publicKey = new PublicKey(Buffer.from(result.address))
    return publicKey.toBase58() // return base58 solana address format
  }

  /**
   * Transfers SOL or Solana token using ledger
   *
   * @param {TxParams} params The transfer options.
   * @returns {TxHash} The transaction hash.
   */
  public async transfer({
    walletIndex = 0,
    recipient,
    asset,
    amount,
    memo,
    limit,
    priorityFee,
    allowOwnerOffCurve,
  }: TxParams): Promise<string> {
    const sender = await this.getAddressAsync(walletIndex)

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
            fromTokenAccount = await getAccount(provider.solanaProvider, fromAssociatedAccount)
          } catch (error) {
            if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
              throw Error('Can not find sender Token account')
            }
            throw error
          }

          const toAssociatedAccount = getAssociatedTokenAddressSync(mintAddress, toPubkey, allowOwnerOffCurve)
          let toTokenAccount: Account
          try {
            toTokenAccount = await getAccount(provider.solanaProvider, toAssociatedAccount)
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

        const derivationPath = this.getDerivationPath(walletIndex)
        const { signature } = await this.getApp().signTransaction(derivationPath, transaction.serializeMessage())

        if (!signature) {
          throw new Error('failed signing tx by ledger')
        }

        // Attach Ledger signature
        transaction.addSignature(new PublicKey(sender), Buffer.from(signature))

        // Verify it's valid (optional, sanity check)
        if (!transaction.verifySignatures()) {
          throw new Error('Signature verification failed')
        }

        // Serialize the signed transaction
        const signedTx = transaction.serialize()

        return this.broadcastTx(bs58.encode(signedTx))
      }
    } catch (error) {
      console.log('Transfer error', error)
    }

    throw Error('No provider able to transfer.')
  }
}

export { ClientLedger }
