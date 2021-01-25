import {
  getTokenAddress,
  xchainNetworkToEths,
  ethNetworkToXchains,
  validateAddress,
  validateSymbol,
  getDefaultFees,
  ETH_DECIMAL,
  getPrefix,
  getTxFromTokenTransaction,
  getTxFromEthTransaction,
} from '../src/utils'
import { assetFromString, baseAmount, assetToString, AssetETH } from '@xchainjs/xchain-util'
import { Network } from '../src/types'

describe('ethereum/util', () => {
  describe('xchainNetworkToEths', () => {
    it('should return mainnet ', () => {
      expect(xchainNetworkToEths('mainnet')).toEqual(Network.MAIN)
    })
    it('should return testnet ', () => {
      expect(xchainNetworkToEths('testnet')).toEqual(Network.TEST)
    })
  })

  describe('ethNetworkToXchains', () => {
    it('should return mainnet ', () => {
      expect(ethNetworkToXchains(Network.MAIN)).toEqual('mainnet')
    })
    it('should return testnet ', () => {
      expect(ethNetworkToXchains(Network.TEST)).toEqual('testnet')
    })
  })

  describe('validateAddress', () => {
    it('should return true for valid address ', () => {
      expect(validateAddress('0x8d8ac01b3508ca869cb631bb2977202fbb574a0d')).toEqual(true)
    })
    it('should return false for invalid address ', () => {
      expect(validateAddress('invalid')).toEqual(false)
    })
  })

  describe('getTokenAddress', () => {
    it('should return the token address ', () => {
      const tokenAddress = getTokenAddress(assetFromString('ETH.USDT-0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'))
      expect(tokenAddress).toEqual('0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa')
    })
    it('should return null ', () => {
      const tokenAddress = getTokenAddress(assetFromString('ETH.ETH'))
      expect(tokenAddress).toBeNull()
    })
  })

  describe('validateSymbol', () => {
    it('should return true for valid symbol ', () => {
      expect(validateSymbol('USDT')).toEqual(true)
    })
    it('should return false for invalid symbol ', () => {
      expect(validateSymbol('')).toEqual(false)
    })
  })

  describe('getDefaultFees', () => {
    it('should return the default fee ', () => {
      const defaultFee = getDefaultFees()
      expect(defaultFee.type).toEqual('base')
      expect(defaultFee.average.amount().isEqualTo(baseAmount(30, ETH_DECIMAL).amount())).toBeTruthy()
      expect(defaultFee.fast.amount().isEqualTo(baseAmount(35, ETH_DECIMAL).amount())).toBeTruthy()
      expect(defaultFee.fastest.amount().isEqualTo(baseAmount(39, ETH_DECIMAL).amount())).toBeTruthy()
    })
  })

  describe('getPrefix', () => {
    it('should return the prefix ', () => {
      const prefix = getPrefix()
      expect(prefix).toEqual('0x')
    })
  })

  describe('getTxFromTokenTransaction', () => {
    it('should return the parsed transaction ', () => {
      const tx = getTxFromTokenTransaction({
        blockNumber: '7937097',
        timeStamp: '1611284549',
        hash: '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
        nonce: '11',
        blockHash: '0x460e054d7420823b4d6110045593d33ec82a040df8f1e47371bf3a52ab54910a',
        from: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
        contractAddress: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
        to: '0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa',
        value: '200000000000000000000',
        tokenName: 'ChainLink Token',
        tokenSymbol: 'LINK',
        tokenDecimal: '18',
        transactionIndex: '3',
        gas: '219318',
        gasPrice: '1000000000',
        gasUsed: '188808',
        cumulativeGasUsed: '680846',
        input: 'deprecated',
        confirmations: '11597',
      })

      expect(tx).toBeTruthy()

      if (tx) {
        expect(tx.hash).toEqual('0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e')
        expect(tx.asset.symbol).toEqual('LINK-0x01be23585060835e02b77ef475b0cc51aa1e0709')
        expect(tx.from[0].from).toEqual('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
        expect(tx.from[0].amount.amount().isEqualTo(baseAmount('200000000000000000000', 18).amount())).toBeTruthy()
        expect(tx.to[0].to).toEqual('0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa')
        expect(tx.to[0].amount.amount().isEqualTo(baseAmount('200000000000000000000', 18).amount())).toBeTruthy()
        expect(tx.type).toEqual('transfer')
      }
    })
    it('should return null for invalid symbol/address ', () => {
      const tx = getTxFromTokenTransaction({
        blockNumber: '7937097',
        timeStamp: '1611284549',
        hash: '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
        nonce: '11',
        blockHash: '0x460e054d7420823b4d6110045593d33ec82a040df8f1e47371bf3a52ab54910a',
        from: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
        contractAddress: '0x01be23585060835e02b77ef475b0cc51aa1e0709',
        to: '0x0d1e5112b7bf0595837f6e19a8233e8b918ef3aa',
        value: '200000000000000000000',
        tokenName: 'ChainLink Token',
        tokenSymbol: '',
        tokenDecimal: '18',
        transactionIndex: '3',
        gas: '219318',
        gasPrice: '1000000000',
        gasUsed: '188808',
        cumulativeGasUsed: '680846',
        input: 'deprecated',
        confirmations: '11597',
      })

      expect(tx).toBeNull()
    })
  })

  describe('getTxFromEthTransaction', () => {
    it('should return the parsed transaction ', () => {
      const tx = getTxFromEthTransaction({
        blockNumber: '7937085',
        timeStamp: '1611284369',
        hash: '0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4',
        from: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
        to: '0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e',
        value: '150023345036431545',
        contractAddress: '',
        input: '',
        type: 'call',
        gas: '0',
        gasUsed: '0',
        traceId: '0_1',
        isError: '0',
        errCode: '',
      })

      expect(tx.hash).toEqual('0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4')
      expect(assetToString(tx.asset)).toEqual(assetToString(AssetETH))
      expect(tx.from[0].from).toEqual('0x7a250d5630b4cf539739df2c5dacb4c659f2488d')
      expect(tx.from[0].amount.amount().isEqualTo(baseAmount('150023345036431545', ETH_DECIMAL).amount())).toBeTruthy()
      expect(tx.to[0].to).toEqual('0xb8c0c226d6fe17e5d9132741836c3ae82a5b6c4e')
      expect(tx.to[0].amount.amount().isEqualTo(baseAmount('150023345036431545', ETH_DECIMAL).amount())).toBeTruthy()
      expect(tx.type).toEqual('transfer')
    })
  })
})
