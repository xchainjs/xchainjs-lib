import { Network } from '@xchainjs/xchain-client'
import * as bchaddr from 'bchaddrjs'

import mockHaskoinApi from '../__mocks__/haskoin'
import * as Utils from '../src/utils'

describe('Bitcoin Cash Utils Test', () => {
  beforeEach(() => {
    mockHaskoinApi.init()
  })
  afterEach(() => {
    mockHaskoinApi.restore()
  })

  const testnet_address = 'bchtest:qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g'
  const mainnet_address = 'bitcoincash:qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj'

  describe('stripPrefix', () => {
    it('should strip out the prefix from the testnet address', () => {
      const strip_address = Utils.stripPrefix(testnet_address)
      expect(strip_address).toEqual('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
    })

    it('should strip out the prefix from the testnet address', () => {
      const strip_address = Utils.stripPrefix(mainnet_address)
      expect(strip_address).toEqual('qp4kjpk684c3d9qjk5a37vl2xn86wxl0f5j2ru0daj')
    })

    it('should leave unprefixed address intact', () => {
      const strip_address = Utils.stripPrefix('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
      expect(strip_address).toEqual('qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g')
    })
  })

  describe('toBCHAddressNetwork', () => {
    it('returns `bchaddr.Network.Mainnet` in case of `mainnet', () => {
      expect(Utils.toBCHAddressNetwork(Network.Mainnet)).toEqual(bchaddr.Network.Mainnet)
    })
    it('returns `bchaddr.Network.Testnet` in case of `testnet', () => {
      expect(Utils.toBCHAddressNetwork(Network.Testnet)).toEqual(bchaddr.Network.Testnet)
    })
  })
})
