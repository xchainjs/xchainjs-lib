import {
  TokenAsset,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
  baseToAsset,
} from '@xchainjs/xchain-util'

import { Client, defaultSolanaParams } from '../src'

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
})
