import { assetToString } from '@xchainjs/xchain-util'

import { Client } from '../src/client'

const btcClient = new Client({})

describe('Bitcoin Integration Tests', () => {
  it('should fetch address balance', async () => {
    const balances = await btcClient.getBalance('bc1qd8jhw2m64r8lslzkx59h8jf3uhgw56grx5dqcf')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions', async () => {
    const address = 'bc1qd8jhw2m64r8lslzkx59h8jf3uhgw56grx5dqcf'
    const txHistory = await btcClient.getTransactions({ address })
    expect(txHistory.total).toBeGreaterThan(0)
  })
  it('should fetch btc tx data', async () => {
    const txId = '3b250bfd61e7f231a22c6e02f9927927ac33e40c8b343716e08fec29c509ab54'
    const tx = await btcClient.getTransactionData(txId)
    console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe('')
  })
})
