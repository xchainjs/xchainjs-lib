import BigNumber from 'bignumber.js'
import { SerializedTransaction } from 'haven-core-js'

import { HavenCoreClient } from '../src/haven/haven-core-client'
import { HavenBalance, NetTypes } from '../src/haven/types'

const mnenomonic = `haggled rekindle pimple pebbles dozen zippers perfect olympics
popular frying goblet gemstone snug dads factual loyal
balding annoyed lumber vary welders navy laboratory maverick olympics`

//const secretViewkey = '34975f014cde57cf52f6aec3e91aab35af427f4a8a2002acebe7b45e634d7304'
// const publicViewkey = '770a38f508ae11fd50d74cc00aa3eeb947c4eca3f5d7b4664100e76847977d95'

const address = 'hvta6D5QfukiUdeidKdRw4AQ9Ddvt4o9e5jPg2CzkGhdeQGkZkU4RKDW7hajbbBLwsURMLu3S3DH6d5c8QYVYYSA6jy6XRzfPv'

const client = new HavenCoreClient()

describe('Haven Core Client Tests', () => {
  let balance: HavenBalance

  it('init haven core client', async () => {
    const response = await client.init(mnenomonic, NetTypes.testnet)
    expect(response).toBeTruthy()
  })

  it('get correct address', async () => {
    const response = await client.getAddress()
    expect(response).toBe(address)
  })

  it('get balance', async () => {
    balance = await client.getBalance()
    expect(new BigNumber(balance.XUSD.balance).isGreaterThan(0))
  })

  it('get transaction', async () => {
    const transactions: SerializedTransaction[] = await client.getTransactions()
    expect(transactions.length).toBeGreaterThan(0)
  })

  it('transfers funds', async () => {
    // is equal to 0.1 XHV
    const transferAmount = new BigNumber(10).exponentiatedBy(12).dividedBy(100)

    const hasEnoughBalance = new BigNumber(balance.XHV.unlockedBalance).isGreaterThan(transferAmount)
    expect(hasEnoughBalance).toBeTruthy()
    if (!hasEnoughBalance) return
    const response = await client.transfer(transferAmount.toString(), 'XHV', address)
    console.log(response)
    expect(typeof response).toBe('string')
    expect(response).not.toBe('')
  })
})
