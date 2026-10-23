import {
  ACCOUNT_SIZE,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  AccountLayout,
  AccountState,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { TokenAsset, assetFromStringEx, baseAmount } from '@xchainjs/xchain-util'
import bs58 from 'bs58'

import { Client, defaultSolanaParams } from '../src'

const PHRASE = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const RECIPIENT = 'DkyQEQYdZ61vrRpPUHyyDNz9NBCcvVxSQjBqBcJvGdFT'
const MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB')
const BLOCKHASH = 'BPsS7ZC39SijJZowDUXg7c7j7aNQxCMkEKgcNge9iWpE'
const USDT = assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset

const tokenAccountInfo = () => {
  const data = Buffer.alloc(ACCOUNT_SIZE)
  AccountLayout.encode(
    {
      mint: MINT,
      owner: PublicKey.default,
      amount: BigInt(1),
      delegateOption: 0,
      delegate: PublicKey.default,
      state: AccountState.Initialized,
      isNativeOption: 0,
      isNative: BigInt(0),
      delegatedAmount: BigInt(0),
      closeAuthorityOption: 0,
      closeAuthority: PublicKey.default,
    },
    data,
  )
  return {
    data,
    executable: false,
    lamports: 1,
    owner: TOKEN_PROGRAM_ID,
    rentEpoch: 0,
  }
}

const connectionOf = (client: Client): Connection => {
  return (client as unknown as { providers: { solanaProvider: Connection }[] }).providers[0].solanaProvider
}

const stubRpc = (client: Client, recipientExists: boolean) => {
  const recipientAta = getAssociatedTokenAddressSync(MINT, new PublicKey(RECIPIENT))
  const connection = connectionOf(client)
  connection.getLatestBlockhash = async () => ({ blockhash: BLOCKHASH, lastValidBlockHeight: 1 })
  connection.getAccountInfo = async (address: PublicKey) => {
    if (!recipientExists && address.equals(recipientAta)) return null
    return tokenAccountInfo()
  }
  return recipientAta
}

describe('SPL transfer', () => {
  const createClient = (): Client => {
    return new Client({
      ...defaultSolanaParams,
      phrase: PHRASE,
    })
  }

  it('adds a recipient ATA create instruction when the account is missing', async () => {
    const client = createClient()
    const sender = await client.getAddressAsync()
    const recipientAta = stubRpc(client, false)

    const prepared = await client.prepareTx({
      sender,
      recipient: RECIPIENT,
      asset: USDT,
      amount: baseAmount(1000, 6),
    })

    const transaction = Transaction.from(bs58.decode(prepared.rawUnsignedTx))
    expect(transaction.instructions.map((instruction) => instruction.programId.toBase58())).toEqual([
      ASSOCIATED_TOKEN_PROGRAM_ID.toBase58(),
      TOKEN_PROGRAM_ID.toBase58(),
    ])
    expect(transaction.instructions[0].keys[2].pubkey.toBase58()).toBe(RECIPIENT)
    expect(transaction.instructions[1].keys[1].pubkey.equals(recipientAta)).toBe(true)
  })

  it('transfers to an existing recipient ATA without creating it', async () => {
    const client = createClient()
    const sender = await client.getAddressAsync()
    stubRpc(client, true)

    const prepared = await client.prepareTx({
      sender,
      recipient: RECIPIENT,
      asset: USDT,
      amount: baseAmount(1000, 6),
    })

    const transaction = Transaction.from(bs58.decode(prepared.rawUnsignedTx))
    expect(transaction.instructions.map((instruction) => instruction.programId.toBase58())).toEqual([
      TOKEN_PROGRAM_ID.toBase58(),
    ])
  })

  it('broadcasts the ATA create inside the keystore transfer', async () => {
    const client = createClient()
    stubRpc(client, false)
    const broadcast = jest.spyOn(client, 'broadcastTx').mockResolvedValue('sig')

    await client.transfer({
      recipient: RECIPIENT,
      asset: USDT,
      amount: baseAmount(1000, 6),
    })

    expect(broadcast).toHaveBeenCalledTimes(1)
    const transaction = Transaction.from(bs58.decode(broadcast.mock.calls[0][0]))
    expect(transaction.instructions[0].programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true)
    expect(transaction.instructions[1].programId.equals(TOKEN_PROGRAM_ID)).toBe(true)
  })
})
