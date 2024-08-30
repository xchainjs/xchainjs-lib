import {
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'

import { Client, Tx, defaultSolanaParams } from '../src'

const printTx = (tx: Tx) => {
  console.log({
    type: tx.type,
    hash: tx.hash,
    date: tx.date.toDateString(),
    asset: assetToString(tx.asset),
    from: tx.from.map((i) => {
      return {
        from: i.from,
        asset: i.asset ? assetToString(i.asset) : 'Unknown',
        amount: baseToAsset(i.amount).amount().toString(),
      }
    }),
    to: tx.to.map((o) => {
      return {
        from: o.to,
        asset: o.asset ? assetToString(o.asset) : 'Unknown',
        amount: baseToAsset(o.amount).amount().toString(),
      }
    }),
  })
}

describe('Solana client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      ...defaultSolanaParams,
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should get address with no index', async () => {
    const address = await client.getAddressAsync()
    console.log(address)
  })

  it('Should get address with index 1', async () => {
    const address = await client.getAddressAsync(1)
    console.log(address)
  })

  it('Should get address with index 2', async () => {
    const address = await client.getAddressAsync(2)
    console.log(address)
  })

  it('Should get all address balances', async () => {
    const balances = await client.getBalance(await client.getAddressAsync())

    balances.forEach((balance) => {
      console.log(`${assetToString(balance.asset)}: ${baseToAsset(balance.amount).amount().toString()}`)
    })
  })

  it('Should get address balance filtering tokens', async () => {
    const balances = await client.getBalance('94bPUbh8iazbg2UgUDrmMkgWoZz9Q1H813JZifZRB35v', [
      assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    ])

    balances.forEach((balance) => {
      console.log(`${assetToString(balance.asset)}: ${baseToAsset(balance.amount).amount().toString()}`)
    })
  })

  it('Should estimate simple transaction fee', async () => {
    const fees = await client.getFees({
      recipient: await client.getAddressAsync(),
      amount: assetToBase(assetAmount(1, 9)),
    })

    console.log({
      type: fees.type,
      average: fees.average.amount().toString(),
      fast: fees.fast.amount().toString(),
      fastest: fees.fastest.amount().toString(),
    })
  })

  it('Should estimate transaction fee with memo', async () => {
    const fees = await client.getFees({
      recipient: await client.getAddressAsync(),
      amount: assetToBase(assetAmount(1, 9)),
      memo: 'Example of memo',
    })

    console.log({
      type: fees.type,
      average: fees.average.amount().toString(),
      fast: fees.fast.amount().toString(),
      fastest: fees.fastest.amount().toString(),
    })
  })

  it('Should estimate token transaction fee', async () => {
    const fees = await client.getFees({
      recipient: await client.getAddressAsync(2),
      amount: assetToBase(assetAmount(1, 9)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log({
      type: fees.type,
      average: fees.average.amount().toString(),
      fast: fees.fast.amount().toString(),
      fastest: fees.fastest.amount().toString(),
    })
  })

  it('Should estimate transaction fee with priority fee', async () => {
    const fees = await client.getFees({
      recipient: await client.getAddressAsync(4),
      amount: assetToBase(assetAmount(1, 9)),
      priorityFee: baseAmount(1000, 9),
    })

    console.log({
      type: fees.type,
      average: fees.average.amount().toString(),
      fast: fees.fast.amount().toString(),
      fastest: fees.fastest.amount().toString(),
    })
  })

  it('Should estimate transaction fee with limit', async () => {
    const fees = await client.getFees({
      recipient: await client.getAddressAsync(4),
      amount: assetToBase(assetAmount(1, 9)),
      limit: 30000,
    })

    console.log({
      type: fees.type,
      average: fees.average.amount().toString(),
      fast: fees.fast.amount().toString(),
      fastest: fees.fastest.amount().toString(),
    })
  })

  it('Should estimate transaction with all params', async () => {
    const fees = await client.getFees({
      recipient: await client.getAddressAsync(4),
      amount: assetToBase(assetAmount(1, 9)),
      limit: 30000,
      priorityFee: baseAmount(3000000, 9),
      memo: 'fsdfsdfsdfds',
    })

    console.log({
      type: fees.type,
      average: fees.average.amount().toString(),
      fast: fees.fast.amount().toString(),
      fastest: fees.fastest.amount().toString(),
    })
  })

  it('Should get native transaction data', async () => {
    const tx = await client.getTransactionData(
      '34JB9k8JKBvuV4WeePbGNfz8i935d9dSiZGG9zTXx1gVE3fbh8YesQxpUEMXKiTFM4bJtwN48DuNKHBsB51j3ukC',
    )
    printTx(tx)
  })

  it('Should get token transaction data', async () => {
    const tx = await client.getTransactionData(
      '5gosCpsgg7tDx4d9yCYK4ngfRSPP2jbxe82fKGhUQPJPDjSKn93QjiqKUPWjF1LEbNaDL5RkkjGW7gV8M2PLBMoC',
    )
    printTx(tx)
  })

  it('Should get transaction history', async () => {
    const { txs } = await client.getTransactions({ address: await client.getAddressAsync() })
    txs.forEach((tx: Tx) => printTx(tx))
  })

  it('Should prepare native transaction', async () => {
    const { rawUnsignedTx } = await client.prepareTx({
      sender: await client.getAddressAsync(0),
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.005, 9)),
    })

    console.log(rawUnsignedTx)
  })

  it('Should send native transaction', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(0.005, 9)),
    })

    console.log(hash)
  })

  it('Should prepare token transaction', async () => {
    const { rawUnsignedTx } = await client.prepareTx({
      sender: await client.getAddressAsync(0),
      recipient: await client.getAddressAsync(0),
      amount: assetToBase(assetAmount(1, 6)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log(rawUnsignedTx)
  })

  it('Should not prepare token transaction', async () => {
    const { rawUnsignedTx } = await client.prepareTx({
      sender: await client.getAddressAsync(0),
      recipient: await client.getAddressAsync(2), // Or address with token account created
      amount: assetToBase(assetAmount(1, 6)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log(rawUnsignedTx)
  })

  it('Should do token transaction with no Token account creation transfer', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(1),
      amount: assetToBase(assetAmount(1, 6)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log(hash)
  })

  it('Should do token transaction with Token account creation transfer', async () => {
    const hash = await client.transfer({
      recipient: await client.getAddressAsync(2),
      amount: assetToBase(assetAmount(1, 6)),
      asset: assetFromStringEx('SOL.USDT-Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB') as TokenAsset,
    })

    console.log(hash)
  })
})
