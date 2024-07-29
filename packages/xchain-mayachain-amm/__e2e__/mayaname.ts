import { Network } from '@xchainjs/xchain-client'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { assetToString } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import { MayachainAMM } from '../src'

describe('MayachainAmm e2e tests', () => {
  describe('MAYAName', () => {
    let mayachainAmm: MayachainAMM
    let wallet: Wallet

    beforeAll(() => {
      const mayaChainQuery = new MayachainQuery()
      const phrase = process.env.MAINNET_PHRASE
      wallet = new Wallet({
        MAYA: new MayaClient({ phrase, network: Network.Mainnet }),
      })
      mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
    })

    it('Should estimate MAYAName registration', async () => {
      const estimated = await mayachainAmm.estimateMAYANameRegistration({
        name: 'mayaname',
        chain: 'MAYA',
        chainAddress: await wallet.getAddress('MAYA'),
        owner: await wallet.getAddress('MAYA'),
      })

      console.log({
        allowed: estimated.allowed,
        memo: estimated.memo,
        cost: `${estimated.value.assetAmount.amount().toString()} ${assetToString(estimated.value.asset)}`,
      })
    })

    it('Should register MAYAName', async () => {
      const txSubmitted = await mayachainAmm.registerMAYAName({
        name: 'mayaname',
        chain: 'MAYA',
        chainAddress: await wallet.getAddress('MAYA'),
        owner: await wallet.getAddress('MAYA'),
      })

      console.log(txSubmitted)
    })

    it('Should estimate MAYAName alias update', async () => {
      const estimated = await mayachainAmm.estimateMAYANameUpdate({
        name: 'mayaname',
        chain: 'BTC',
        chainAddress: await wallet.getAddress('BTC'),
      })

      console.log({
        allowed: estimated.allowed,
        memo: estimated.memo,
        cost: `${estimated.value.assetAmount.amount().toString()} ${assetToString(estimated.value.asset)}`,
      })
    })

    it('Should update MAYAName alias', async () => {
      const txSubmitted = await mayachainAmm.updateMAYAName({
        name: 'mayaname',
        chain: 'BTC',
        chainAddress: await wallet.getAddress('BTC'),
      })

      console.log(txSubmitted)
    })

    it('Should estimate MAYAName expiry update', async () => {
      const estimated = await mayachainAmm.estimateMAYANameUpdate({
        name: 'mayaname',
        expiry: new Date(1740137503000),
      })

      console.log({
        allowed: estimated.allowed,
        memo: estimated.memo,
        cost: `${estimated.value.assetAmount.amount().toString()} ${assetToString(estimated.value.asset)}`,
      })
    })

    it('Should update MAYAName expiry', async () => {
      const txSubmitted = await mayachainAmm.updateMAYAName({
        name: 'mayaname',
        expiry: new Date(1740137503000),
      })

      console.log(txSubmitted)
    })
  })
})
