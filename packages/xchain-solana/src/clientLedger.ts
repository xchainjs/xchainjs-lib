import SolanaLedgerApp from '@ledgerhq/hw-app-solana'
import Transport from '@ledgerhq/hw-transport'
import bs58 from 'bs58'
import { ComputeBudgetProgram, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js'
import { Address, TokenAsset, eqAsset } from '@xchainjs/xchain-util'

import { Client } from './client'
import { defaultSolanaParams } from './const'
import { SOLClientParams, TxParams } from './types'

export type SOLClientLedgerParams = SOLClientParams & { transport: Transport }

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

  getAddress(): string {
    throw Error('Sync method not supported for Ledger')
  }

  getDerivationPath(index = 0): string {
    const derivationPath = this.getFullDerivationPath(index)
    return derivationPath.replace(/^m\//, '')
  }

  async getAddressAsync(index = 0, verify = false): Promise<Address> {
    const derivationPath = this.getDerivationPath(index)
    const result = await this.getApp().getAddress(derivationPath, verify)

    const publicKey = new PublicKey(Buffer.from(result.address))
    return publicKey.toBase58()
  }

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

        const derivationPath = this.getDerivationPath(walletIndex)
        const { signature } = await this.getApp().signTransaction(derivationPath, transaction.serializeMessage())

        if (!signature) {
          throw new Error('failed signing tx by ledger')
        }

        transaction.addSignature(new PublicKey(sender), Buffer.from(signature))

        // Optional sanity check.
        if (!transaction.verifySignatures()) {
          throw new Error('Signature verification failed')
        }

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
