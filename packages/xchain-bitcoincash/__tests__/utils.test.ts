import { Network } from '@xchainjs/xchain-client'
import { AssetBCH } from '@xchainjs/xchain-util'
import * as bchaddr from 'bchaddrjs'

import mockHaskoinApi from '../__mocks__/haskoin'
import * as utils from '../src/utils'

describe('Bitcoin Cash Utils Test', () => {
  beforeEach(() => {
    mockHaskoinApi.init()
  })
  afterEach(() => {
    mockHaskoinApi.restore()
  })

  const testnet_address = 'bchtest:qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
  const mainnet_address = 'bitcoincash:qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj'
  const haskoinUrl = 'https://haskoin.ninerealms.com/btctest'

  describe('stripPrefix', () => {
    it('get the right vault fee', () => {
      const memo = 'SWAP:THOR.RUNE'
      const fee = utils.calcFee(1, memo)
      expect(fee.amount().toNumber()).toEqual(103)
    })

    it('get the right normal fee', () => {
      const fee = utils.calcFee(1)
      expect(fee.amount().toNumber()).toEqual(78)
    })
  })

  describe('stripPrefix', () => {
    it('should strip out the prefix from the testnet address', () => {
      const strip_address = utils.stripPrefix(testnet_address)
      expect(strip_address).toEqual('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
    })

    it('should strip out the prefix from the testnet address', () => {
      const strip_address = utils.stripPrefix(mainnet_address)
      expect(strip_address).toEqual('qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj')
    })

    it('should leave unprefixed address intact', () => {
      const strip_address = utils.stripPrefix('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
      expect(strip_address).toEqual('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
    })
  })

  describe('toBCHAddressNetwork', () => {
    it('returns `bchaddr.Network.Mainnet` in case of `mainnet', () => {
      expect(utils.toBCHAddressNetwork(Network.Mainnet)).toEqual(bchaddr.Network.Mainnet)
    })
    it('returns `bchaddr.Network.Testnet` in case of `testnet', () => {
      expect(utils.toBCHAddressNetwork(Network.Testnet)).toEqual(bchaddr.Network.Testnet)
    })
  })

  describe('getBalance', () => {
    it('confirmed + unconfirmed', async () => {
      const address = 'qr20g55jd7x3dalp4qxjfgfvda0nwr8cfccrgxd0dw'
      const balance = await utils.getBalance({ address, haskoinUrl })
      expect(balance.length).toEqual(1)
      expect(balance[0]?.asset).toEqual(AssetBCH)
      expect(balance[0]?.amount.amount().toString()).toEqual('300000000')
    })
  })

  describe('broadcastTx', () => {
    it('returns txHash', async () => {
      const txHex = '0xdead'

      const txHash = await utils.broadcastTx({ txHex, haskoinUrl })
      expect(txHash).toEqual('mock-txid-haskoin')
    })
  })
})
