import { assetToString } from '@xchainjs/xchain-util'

import { Client } from '../src/client'

const dogeClient = new Client({ sochainApiKey: process.env.SOCHAIN_API_KEY || '' })

describe('Dogecoin Integration Tests', () => {
  it('should fetch address balance', async () => {
    const balances = await dogeClient.getBalance('D8ZEVbgf4yPs3MK8dMJJ7PpSyBKsbd66TX')
    balances.forEach((bal) => {
      console.log(`${assetToString(bal.asset)} = ${bal.amount.amount()}`)
    })
    expect(balances.length).toBeGreaterThan(0)
  })
  it('should fetch previous transactions', async () => {
    const address = 'D8ZEVbgf4yPs3MK8dMJJ7PpSyBKsbd66TX'
    const txHistory = await dogeClient.getTransactions({ address })
    for (const tx of txHistory.txs) {
      console.log(tx.hash, tx.date)
      console.log(tx.from[0].from, tx.from[0].amount.amount().toFixed())
      console.log(tx.to[0].to, tx.to[0].amount.amount().toFixed())
      // console.log(JSON.stringify(txHistory, null, 2))
    }

    expect(txHistory.total).toBeGreaterThan(0)
  })
  it('should fetch btc tx data', async () => {
    const txId = '9aad92e74a02d04abc214ed3878521d0b1bb57fda83927e322b72b3553834795'
    const tx = await dogeClient.getTransactionData(txId)
    //console.log(JSON.stringify(tx, null, 2))
    expect(tx.hash).toBe(txId)
  })
})
