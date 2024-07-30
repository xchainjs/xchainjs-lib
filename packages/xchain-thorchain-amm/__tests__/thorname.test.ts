import { assetToString } from '@xchainjs/xchain-util'

import mockMidgardApi from '../__mocks__/midgard-api'
import mockThornodeApi from '../__mocks__/thornode-api'
import { ThorchainAMM } from '../src'

describe('ThorchainAMM', () => {
  describe('THORName', () => {
    let thorchainAMM: ThorchainAMM

    beforeAll(() => {
      thorchainAMM = new ThorchainAMM()
    })

    beforeEach(() => {
      mockMidgardApi.init()
      mockThornodeApi.init()
    })

    afterEach(() => {
      mockMidgardApi.restore()
      mockThornodeApi.restore()
    })

    it('Should estimate registration', async () => {
      const estimated = await thorchainAMM.estimateTHORNameRegistration({
        name: 'thorname',
        owner: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
        chain: 'THOR',
        chainAddress: 'thor1s76zxv0kpr78za293kvj0eep4tfqljacknsjzc',
      })

      const splittedMemo = estimated.memo.split(':')
      expect(estimated.errors.length).toBe(0)
      expect(estimated.allowed).toBeTruthy()
      expect(splittedMemo[0]).toBe('~')
      expect(splittedMemo[1]).toBe('thorname')
      expect(splittedMemo[2]).toBe('THOR')
      expect(splittedMemo[3]).toBe('thor1s76zxv0kpr78za293kvj0eep4tfqljacknsjzc')
      expect(splittedMemo[4]).toBe('thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg')
      expect(splittedMemo[5]).toBe('')
      expect(splittedMemo[6]).toBe('11769725')
      expect(estimated.value.assetAmount.amount().toString()).toBe('11.07192')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should not estimate registration because of wrong owner address', async () => {
      const estimated = await thorchainAMM.estimateTHORNameRegistration({
        name: 'thorname',
        owner: 'thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23',
        chain: 'THOR',
        chainAddress: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
      })

      expect(estimated.errors.length).toBe(1)
      expect(estimated.errors[0]).toBe(
        'Invalid owner thor1kf4fgvwjfx74htkwh4qla2huw506dkf8tyg23 due it is not a THORChain address',
      )
      expect(estimated.allowed).toBeFalsy()
      expect(estimated.memo).toBe('')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should not estimate registration because of wrong alias', async () => {
      const estimated = await thorchainAMM.estimateTHORNameRegistration({
        name: 'thorname',
        owner: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
        chain: 'THOR',
        chainAddress: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7se',
      })

      expect(estimated.errors.length).toBe(1)
      expect(estimated.errors[0]).toBe('Invalid address thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7se for THOR chain')
      expect(estimated.allowed).toBeFalsy()
      expect(estimated.memo).toBe('')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should not register already registered THORName', async () => {
      const estimated = await thorchainAMM.estimateTHORNameRegistration({
        name: 'odin',
        owner: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
        chain: 'THOR',
        chainAddress: 'thor12fw3syyy4ff78llh3fvhrvdy7xnqlegvru7seg',
      })

      expect(estimated.errors.length).toBe(1)
      expect(estimated.errors[0]).toBe('Thorname already registered')
      expect(estimated.allowed).toBeFalsy()
      expect(estimated.memo).toBe('')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should estimate alias update', async () => {
      const estimated = await thorchainAMM.estimateTHORNameUpdate({
        name: 'odin',
        chain: 'THOR',
        chainAddress: 'thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5',
      })

      const splittedMemo = estimated.memo.split(':')
      expect(estimated.errors.length).toBe(0)
      expect(estimated.allowed).toBeTruthy()
      expect(splittedMemo[0]).toBe('~')
      expect(splittedMemo[1]).toBe('odin')
      expect(splittedMemo[2]).toBe('THOR')
      expect(splittedMemo[3]).toBe('thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0.02')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should not estimate alias update because of bad address', async () => {
      const estimated = await thorchainAMM.estimateTHORNameUpdate({
        name: 'odin',
        chain: 'THOR',
        chainAddress: 'thor1t2pfscuq3ct',
      })

      expect(estimated.allowed).toBeFalsy()
      expect(estimated.errors.length).toBe(1)
      expect(estimated.errors[0]).toBe('Invalid alias thor1t2pfscuq3ct for THOR chain')
      expect(estimated.memo).toBe('')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should estimate owner update', async () => {
      const estimated = await thorchainAMM.estimateTHORNameUpdate({
        name: 'odin',
        owner: 'thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5',
      })

      const splittedMemo = estimated.memo.split(':')
      expect(estimated.errors.length).toBe(0)
      expect(estimated.allowed).toBeTruthy()
      expect(splittedMemo[0]).toBe('~')
      expect(splittedMemo[1]).toBe('odin')
      expect(splittedMemo[2]).toBe('THOR')
      expect(splittedMemo[3]).toBe('thor1hhjupkzy3t6ccelhz7qw8epyx4rm8a06nlm5ce')
      expect(splittedMemo[4]).toBe('thor1t2pfscuq3ctgtf5h3x7p6zrjd7e0jcvuszyvt5')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0.02')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should not estimate owner update', async () => {
      const estimated = await thorchainAMM.estimateTHORNameUpdate({
        name: 'odin',
        owner: 'thor1t2pfscuq3ct',
      })

      expect(estimated.allowed).toBeFalsy()
      expect(estimated.errors.length).toBe(1)
      expect(estimated.errors[0]).toBe('Invalid owner thor1t2pfscuq3ct due it is not a THORChain address')
      expect(estimated.memo).toBe('')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })

    it('Should not estimate alias update because of bad address and bad owner', async () => {
      const estimated = await thorchainAMM.estimateTHORNameUpdate({
        name: 'odin',
        owner: 'thor1t2pfscuq3c',
        chain: 'THOR',
        chainAddress: 'thor1t2pfscuq3ct',
      })

      expect(estimated.allowed).toBeFalsy()
      expect(estimated.errors.length).toBe(2)
      expect(estimated.errors[0]).toBe('Invalid alias thor1t2pfscuq3ct for THOR chain')
      expect(estimated.errors[1]).toBe('Invalid owner thor1t2pfscuq3c due it is not a THORChain address')
      expect(estimated.memo).toBe('')
      expect(estimated.value.assetAmount.amount().toString()).toBe('0')
      expect(assetToString(estimated.value.asset)).toBe('THOR.RUNE')
    })
  })
})
