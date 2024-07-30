import { Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { assetToString } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import mayanodeApi from '../__mocks__/mayanode-api/mayanode-api'
import midgarApi from '../__mocks__/midgard-api/midgard-api'
import { MayachainAMM } from '../src'

describe('MayachainAMM', () => {
  describe('MAYAName', () => {
    let mayachainAmm: MayachainAMM

    beforeAll(() => {
      const mayaChainQuery = new MayachainQuery()
      const wallet = new Wallet({
        BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
        ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
        DASH: new DashClient({ ...defaultDashParams, network: Network.Mainnet }),
        KUJI: new KujiraClient({ ...defaultKujiParams, network: Network.Mainnet }),
        THOR: new ThorClient({ network: Network.Mainnet }),
        MAYA: new MayaClient({ network: Network.Mainnet }),
      })
      mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
    })

    beforeEach(() => {
      mayanodeApi.init()
      midgarApi.init()
    })

    afterEach(() => {
      mayanodeApi.restore()
      midgarApi.restore()
    })

    it('Should get MAYAName details', async () => {
      const details = await mayachainAmm.getMAYANameDetails('eld')
      expect(details).toBeTruthy()
      expect(details?.name).toBe('eld')
      expect(details?.expireBlockHeight).toBe(66751601)
      expect(details?.owner).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
      expect(details?.aliases.length).toBe(6)
      expect(details?.aliases[0].address).toBe('bc1qdjqcm3fsadjn9zth9wk30gy5su6hkwkhfr0re9')
      expect(details?.aliases[0].chain).toBe('BTC')
      expect(details?.aliases[1].address).toBe('XiKv7A7vVQmYwNUp4TjCq8ZamkjB8zZtsL')
      expect(details?.aliases[1].chain).toBe('DASH')
      expect(details?.aliases[2].address).toBe('0x1509b1fe69be4d508a62ce8109635e1d1cf29a4f')
      expect(details?.aliases[2].chain).toBe('ETH')
      expect(details?.aliases[3].address).toBe('kujira1mg9jt63eeww5ptnkw963z2sw6jzezxw0trns50')
      expect(details?.aliases[3].chain).toBe('KUJI')
      expect(details?.aliases[4].address).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
      expect(details?.aliases[4].chain).toBe('MAYA')
      expect(details?.aliases[5].address).toBe('thor1gnehec7mf4uytuw3wj4uwpptvkyvzclgqap7e4')
      expect(details?.aliases[5].chain).toBe('THOR')
    })

    it('Should get the MAYAnames owned by an address', async () => {
      const mayaNames = await mayachainAmm.getMAYANamesByOwner('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
      expect(mayaNames.length).toBe(1)
      expect(mayaNames[0]?.name).toBe('eld')
      expect(mayaNames[0]?.expireBlockHeight).toBe(66751601)
      expect(mayaNames[0]?.owner).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
      expect(mayaNames[0]?.aliases.length).toBe(6)
      expect(mayaNames[0]?.aliases[0].address).toBe('bc1qdjqcm3fsadjn9zth9wk30gy5su6hkwkhfr0re9')
      expect(mayaNames[0]?.aliases[0].chain).toBe('BTC')
      expect(mayaNames[0]?.aliases[1].address).toBe('XiKv7A7vVQmYwNUp4TjCq8ZamkjB8zZtsL')
      expect(mayaNames[0]?.aliases[1].chain).toBe('DASH')
      expect(mayaNames[0]?.aliases[2].address).toBe('0x1509b1fe69be4d508a62ce8109635e1d1cf29a4f')
      expect(mayaNames[0]?.aliases[2].chain).toBe('ETH')
      expect(mayaNames[0]?.aliases[3].address).toBe('kujira1mg9jt63eeww5ptnkw963z2sw6jzezxw0trns50')
      expect(mayaNames[0]?.aliases[3].chain).toBe('KUJI')
      expect(mayaNames[0]?.aliases[4].address).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
      expect(mayaNames[0]?.aliases[4].chain).toBe('MAYA')
      expect(mayaNames[0]?.aliases[5].address).toBe('thor1gnehec7mf4uytuw3wj4uwpptvkyvzclgqap7e4')
      expect(mayaNames[0]?.aliases[5].chain).toBe('THOR')
    })

    it('Should estimate MAYAName registration', async () => {
      const estimated = await mayachainAmm.estimateMAYANameRegistration({
        name: 'pg',
        chain: 'BTC',
        chainAddress: 'bc1qslx5546zjfqa027ate6j0seg8lla5k9z278g86',
        owner: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      })

      const splittedMemo = estimated.memo.split(':')
      expect(estimated.allowed).toBeTruthy()
      expect(estimated.errors.length).toBe(0)
      expect(splittedMemo[0] ?? splittedMemo[0]).toBe('~')
      expect(splittedMemo[1] ?? splittedMemo[1]).toBe('pg')
      expect(splittedMemo[2] ?? splittedMemo[2]).toBe('BTC')
      expect(splittedMemo[3] ?? splittedMemo[3]).toBe('bc1qslx5546zjfqa027ate6j0seg8lla5k9z278g86')
      expect(splittedMemo[4] ?? splittedMemo[4]).toBe('maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz')
      expect(splittedMemo[5] ?? splittedMemo[5]).toBe('MAYA.CACAO')
      expect(assetToString(estimated.value.asset)).toBe('MAYA.CACAO')
      expect(estimated.value.assetAmount.amount().toString()).toBe('11.5512')
    })

    it('Should not estimate register over already registered MAYAName', async () => {
      const estimated = await mayachainAmm.estimateMAYANameRegistration({
        name: 'eld',
        chain: 'BTC',
        chainAddress: 'bc1qslx5546zjfqa027ate6j0seg8lla5k9z278g86',
        owner: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      })

      expect(estimated.allowed).toBeFalsy()
      expect(estimated.errors.length).toBe(1)
      expect(estimated.errors[0]).toBe('MAYAName already registered')
      expect(estimated.memo).toBe('')
      expect(assetToString(estimated.value.asset)).toBe('MAYA.CACAO')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
    })

    it('Should estimate new MAYAName alias', async () => {
      const estimated = await mayachainAmm.estimateMAYANameUpdate({
        name: 'eld',
        chain: 'BTC',
        chainAddress: 'bc1qslx5546zjfqa027ate6j0seg8lla5k9z278g86',
      })

      expect(estimated.allowed).toBeTruthy()
      expect(estimated.errors.length).toBe(0)
      expect(estimated.memo).toBe(
        '~:eld:BTC:bc1qslx5546zjfqa027ate6j0seg8lla5k9z278g86:maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09:MAYA.CACAO',
      )
      expect(assetToString(estimated.value.asset)).toBe('MAYA.CACAO')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0.5')
    })

    it('Should update expiry', async () => {
      const estimated = await mayachainAmm.estimateMAYANameUpdate({
        name: 'eld',
        expiry: new Date(1921137503000),
      })

      expect(estimated.allowed).toBeTruthy()
      expect(estimated.errors.length).toBe(0)
      expect(estimated.memo).toBe(
        '~:eld:BTC:bc1qdjqcm3fsadjn9zth9wk30gy5su6hkwkhfr0re9:maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09:MAYA.CACAO',
      )
      expect(assetToString(estimated.value.asset)).toBe('MAYA.CACAO')
    })
  })
})
