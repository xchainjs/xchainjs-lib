import { Network } from '@xchainjs/xchain-client'
import { AssetETH, ETHChain, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { ethers, providers } from 'ethers'
import nock from 'nock'

import { mock_etherscan_api } from '../__mocks__/etherscan-api'
import erc20ABI from '../src/data/erc20.json'
import { EthNetwork } from '../src/types'
import {
  ETH_DECIMAL,
  MAX_APPROVAL,
  estimateApprove,
  estimateCall,
  ethNetworkToXchains,
  filterSelfTxs,
  getApprovalAmount,
  getDecimal,
  getDefaultFees,
  getPrefix,
  getTokenAddress,
  getTokenBalances,
  getTxFromEthTransaction,
  getTxFromEthplorerEthTransaction,
  getTxFromEthplorerTokenOperation,
  getTxFromTokenTransaction,
  isApproved,
  strip0x,
  validateAddress,
  validateSymbol,
  xchainNetworkToEths,
} from '../src/utils'

describe('ethereum/util', () => {
  describe('xchainNetworkToEths', () => {
    it('should return mainnet ', () => {
      expect(xchainNetworkToEths('mainnet' as Network)).toEqual(EthNetwork.Main)
    })
    it('should return testnet ', () => {
      expect(xchainNetworkToEths('testnet' as Network)).toEqual(EthNetwork.Test)
    })
  })

  describe('ethNetworkToXchains', () => {
    it('should return mainnet ', () => {
      expect(ethNetworkToXchains(EthNetwork.Main)).toEqual('mainnet' as Network)
    })
    it('should return testnet ', () => {
      expect(ethNetworkToXchains(EthNetwork.Test)).toEqual('testnet' as Network)
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
      const tokenAddress1 = getTokenAddress({
        chain: ETHChain,
        symbol: 'USDT-0X4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        ticker: 'USDT',
        synth: false,
      })
      expect(tokenAddress1).toEqual('0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa')

      const tokenAddress2 = getTokenAddress({
        chain: ETHChain,
        symbol: 'USDT-0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
        ticker: 'USDT',
        synth: false,
      })
      expect(tokenAddress2).toEqual('0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa')
    })
    it('should return null ', () => {
      const tokenAddress = getTokenAddress({
        chain: ETHChain,
        symbol: 'ETH',
        ticker: 'ETH',
        synth: false,
      })
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
      expect(defaultFee.type).toEqual('byte')
      expect(defaultFee.average.amount().isEqualTo(baseAmount('1050000000000000', ETH_DECIMAL).amount())).toBeTruthy()
      expect(defaultFee.fast.amount().isEqualTo(baseAmount('2100000000000000', ETH_DECIMAL).amount())).toBeTruthy()
      expect(defaultFee.fastest.amount().isEqualTo(baseAmount('3150000000000000', ETH_DECIMAL).amount())).toBeTruthy()
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

  describe('getTxFromEthplorerEthTransaction', () => {
    it('should return the parsed transaction ', () => {
      const tx = getTxFromEthplorerEthTransaction({
        hash: '0x9a5a33ba8d305d1374a6bc1a6f8f0d177302adc83670a046637ece987ac4eae2',
        timestamp: 1600708720,
        blockNumber: 10907123,
        confirmations: 1272745,
        success: true,
        from: '0xd551234ae421e3bcba99a0da6d736074f22192ff',
        to: '0x5cb8245d6543d234d3ca146880366f4fd46801e7',
        value: 0.5,
        input: '0x',
        gasLimit: 21000,
        gasUsed: 21000,
        logs: [],
      })

      expect(tx.hash).toEqual('0x9a5a33ba8d305d1374a6bc1a6f8f0d177302adc83670a046637ece987ac4eae2')
      expect(assetToString(tx.asset)).toEqual(assetToString(AssetETH))
      expect(tx.from[0].from).toEqual('0xd551234ae421e3bcba99a0da6d736074f22192ff')
      expect(tx.from[0].amount.amount().isEqualTo(baseAmount('500000000000000000', ETH_DECIMAL).amount())).toBeTruthy()
      expect(tx.to[0].to).toEqual('0x5cb8245d6543d234d3ca146880366f4fd46801e7')
      expect(tx.to[0].amount.amount().isEqualTo(baseAmount('500000000000000000', ETH_DECIMAL).amount())).toBeTruthy()
      expect(tx.type).toEqual('transfer')
    })
  })

  describe('getTxFromEthplorerTokenOperation', () => {
    it('should return the parsed transaction ', () => {
      const tx = getTxFromEthplorerTokenOperation({
        timestamp: 1481694781,
        transactionHash: '0x6aa670c983425eba23314459c48ae89b3b8d0e1089397c56400ce2da5ece9d26',
        value: '50000',
        intValue: 50000,
        type: 'transfer',
        priority: 3,
        from: '0x0347c7fe704384c7e32073d35b7661788e7071ff',
        to: '0x06758b9a8a7970e59f7e6487f80f4cb1069df878',
        addresses: ['0x0347c7fe704384c7e32073d35b7661788e7071ff', '0x06758b9a8a7970e59f7e6487f80f4cb1069df878'],
        isEth: false,
        usdPrice: 0.028043505572805424,
        tokenInfo: {
          address: '0xff71cb760666ab06aa73f34995b42dd4b85ea07b',
          name: 'THBEX',
          decimals: '4',
          symbol: 'THBEX',
          totalSupply: '9020000000',
          owner: '0x2cfc4e293e82d48a2c04bf89baaa98572c01c172',
          lastUpdated: 1575974898,
          issuancesCount: 4,
          holdersCount: 208,
          image: '/images/everex.png',
          description:
            "THBEX is the original test version of electronic digital currency (eTHB) that represents one unit of the Thailand national currency, Baht (THB). THBEX is issued on Ethereum blockchain in the form of ERC20 digital token and governed by secured smart contract.\r\n\r\nTHBEX has indefinite pegged exchange rate of 1:1 to THB.\r\n\r\nTHBEX is underwritten by licensed financial institutions in Thailand and is guaranteed 100% by physical currency reserves, surety bonds, or the underwriters' own capital.\r\n\r\nFinancial guarantee and proof of funds documentation is available in specific issuance records.",
          website: 'https://everex.io',
          ethTransfersCount: 0,
          price: {
            rate: 0.03185727938834024,
            diff: -0.0001018129734366921,
            ts: 1617627907,
            onlyPrice: 1,
            currency: 'USD',
          },
          publicTags: ['Stablecoins'],
        },
      })

      expect(tx).toBeTruthy()

      if (tx) {
        expect(tx.hash).toEqual('0x6aa670c983425eba23314459c48ae89b3b8d0e1089397c56400ce2da5ece9d26')
        expect(tx.asset.symbol).toEqual('THBEX-0xff71cb760666ab06aa73f34995b42dd4b85ea07b')
        expect(tx.from[0].from).toEqual('0x0347c7fe704384c7e32073d35b7661788e7071ff')
        expect(tx.from[0].amount.amount().isEqualTo(baseAmount('50000', 18).amount())).toBeTruthy()
        expect(tx.to[0].to).toEqual('0x06758b9a8a7970e59f7e6487f80f4cb1069df878')
        expect(tx.to[0].amount.amount().isEqualTo(baseAmount('50000', 18).amount())).toBeTruthy()
        expect(tx.type).toEqual('transfer')
      }
    })
    it('should return null for invalid symbol/address ', () => {
      const tx = getTxFromEthplorerTokenOperation({
        timestamp: 1481694781,
        transactionHash: '0x6aa670c983425eba23314459c48ae89b3b8d0e1089397c56400ce2da5ece9d26',
        value: '50000',
        intValue: 50000,
        type: 'transfer',
        priority: 3,
        from: '0x0347c7fe704384c7e32073d35b7661788e7071ff',
        to: '0x06758b9a8a7970e59f7e6487f80f4cb1069df878',
        addresses: ['0x0347c7fe704384c7e32073d35b7661788e7071ff', '0x06758b9a8a7970e59f7e6487f80f4cb1069df878'],
        isEth: false,
        usdPrice: 0.028043505572805424,
        tokenInfo: {
          address: '0xff71cb760666ab06aa73f34995b42dd4b85ea07b',
          name: 'THBEX',
          decimals: '4',
          symbol: '',
          totalSupply: '9020000000',
          owner: '0x2cfc4e293e82d48a2c04bf89baaa98572c01c172',
          lastUpdated: 1575974898,
          issuancesCount: 4,
          holdersCount: 208,
          image: '/images/everex.png',
          description:
            "THBEX is the original test version of electronic digital currency (eTHB) that represents one unit of the Thailand national currency, Baht (THB). THBEX is issued on Ethereum blockchain in the form of ERC20 digital token and governed by secured smart contract.\r\n\r\nTHBEX has indefinite pegged exchange rate of 1:1 to THB.\r\n\r\nTHBEX is underwritten by licensed financial institutions in Thailand and is guaranteed 100% by physical currency reserves, surety bonds, or the underwriters' own capital.\r\n\r\nFinancial guarantee and proof of funds documentation is available in specific issuance records.",
          website: 'https://everex.io',
          ethTransfersCount: 0,
          price: {
            rate: 0.03185727938834024,
            diff: -0.0001018129734366921,
            ts: 1617627907,
            onlyPrice: 1,
            currency: 'USD',
          },
          publicTags: ['Stablecoins'],
        },
      })

      expect(tx).toBeNull()
    })
  })

  describe('getTokenBalances', () => {
    it('Should parst token balances', () => {
      const balances = getTokenBalances([
        {
          tokenInfo: {
            address: '0x98976a6dfaaf97b16a4bb06035cc84be12e79110',
            name: 'MYOUToken',
            decimals: '18',
            symbol: 'MYOU',
            totalSupply: '999999999000000000000000000',
            owner: '0x',
            lastUpdated: 1602678250,
            issuancesCount: 0,
            holdersCount: 8717,
            ethTransfersCount: 0,
            price: false,
          },
          balance: 100000000000000000,
          totalIn: 0,
          totalOut: 0,
        },
      ])

      expect(balances.length).toEqual(1)
      expect(balances[0].asset.chain).toEqual(ETHChain)
      expect(balances[0].asset.symbol).toEqual('MYOU-0x98976A6dFaAf97B16a4Bb06035cC84be12e79110')
      expect(balances[0].asset.ticker).toEqual('MYOU')
      expect(balances[0].amount.amount().eq('100000000000000000')).toBeTruthy()
    })
  })

  describe('filterSelfTxs', () => {
    it('should return filtered transactions', () => {
      const txs = filterSelfTxs([
        {
          blockNumber: '7937085',
          timeStamp: '1611284369',
          hash: '0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4',
          from: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
          to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
          value: '150023345036431545',
          contractAddress: '',
          input: '',
          type: 'call',
          gas: '0',
          gasUsed: '0',
          traceId: '0_1',
          isError: '0',
          errCode: '',
        },
        {
          blockNumber: '7937085',
          timeStamp: '1611284369',
          hash: '0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4',
          from: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
          to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
          value: '150023345036431545',
          contractAddress: '',
          input: '',
          type: 'call',
          gas: '0',
          gasUsed: '0',
          traceId: '0_1',
          isError: '0',
          errCode: '',
        },
        {
          blockNumber: '7937085',
          timeStamp: '1611284369',
          hash: '0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e',
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
        },
      ])

      expect(txs.length).toEqual(2)
      expect(txs[0].hash).toEqual('0x84f28d86da01417a35e448f62248b9dee40261be82496275495bb0f0de6c8a1e')
      expect(txs[1].hash).toEqual('0x40565f6d4cbe1c339decce9769fc94fcc868be98faba4429b79aa4ad2bb26ab4')
    })
  })

  describe('getDecimal', () => {
    it('ETH - testnet', async () => {
      const provider = new providers.EtherscanProvider(xchainNetworkToEths(Network.Testnet))

      const decimal = await getDecimal(AssetETH, provider)
      expect(decimal).toEqual(ETH_DECIMAL)
    })

    it('USDT - testnet', async () => {
      nock.disableNetConnect()
      mock_etherscan_api(
        'https://api-ropsten.etherscan.io',
        'eth_call',
        '0x0000000000000000000000000000000000000000000000000000000000000006', // 6
      )

      const provider = new providers.EtherscanProvider(xchainNetworkToEths(Network.Testnet))

      const decimal = await getDecimal(
        {
          chain: ETHChain,
          ticker: 'USDT',
          symbol: 'USDT-0x6EE856Ae55B6E1A249f04cd3b947141bc146273c',
          synth: false,
        },
        provider,
      )
      expect(decimal).toEqual(6)

      nock.cleanAll()
    })
  })

  describe('strip0x', () => {
    it('removes 0x', () => {
      expect(strip0x('0xabc123')).toEqual('abc123')
    })
    it('removes 0X', () => {
      expect(strip0x('0Xabc123')).toEqual('abc123')
    })
    it('does not remove anything', () => {
      expect(strip0x('abc123')).toEqual('abc123')
    })
  })

  describe('isApproved', () => {
    const fromAddress = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E' // wallet address (as same address as in `client.testnet.test.ts`)
    const contractAddress = '0xA3910454bF2Cb59b8B3a401589A3bAcC5cA42306' // USDT
    const spenderAddress = '0xeB005a0aa5027F66c8D195C77f7B01324C48501C' // router
    const provider = new providers.EtherscanProvider(xchainNetworkToEths(Network.Testnet))

    beforeEach(() => {
      nock.disableNetConnect()
      mock_etherscan_api(
        'https://api-ropsten.etherscan.io',
        'eth_call',
        '0x0000000000000000000000000000000000000000000000000000000000000064', // 100
      )
    })

    afterEach(() => {
      nock.cleanAll()
    })

    it('is approved', async () => {
      const result = await isApproved({
        provider,
        fromAddress,
        contractAddress,
        spenderAddress,
        amount: baseAmount(100, 6),
      })
      expect(result).toBeTruthy()
    })

    it('is not approved', async () => {
      const result = await isApproved({
        provider,
        fromAddress,
        contractAddress,
        spenderAddress,
        amount: baseAmount(101, 6),
      })
      expect(result).toBeFalsy()
    })
  })

  describe('estimateCall', () => {
    it('estimate transfer', async () => {
      mock_etherscan_api('https://api-ropsten.etherscan.io', 'eth_estimateGas', '0x5208') // 2100

      const provider = new providers.EtherscanProvider(xchainNetworkToEths(Network.Testnet))
      const fromAddress = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E'
      const contractAddress = '0xd15ffaef3112460bf3bcd81087fcbbce394e2ae7'

      const gas: ethers.BigNumber = await estimateCall({
        provider,
        contractAddress,
        abi: erc20ABI,
        funcName: 'transfer',
        funcParams: [
          '0x8c2a90d36ec9f745c9b28b588cba5e2a978a1656',
          ethers.BigNumber.from(baseAmount('10000000000000', ETH_DECIMAL).amount().toString()),
          {
            from: fromAddress,
          },
        ],
      })

      expect(gas.toString()).toEqual('21000')

      nock.cleanAll()
    })
  })

  describe('estimateApprove', () => {
    it('estimate transfer', async () => {
      mock_etherscan_api('https://api-ropsten.etherscan.io', 'eth_estimateGas', '0x5208') // 2100

      const provider = new providers.EtherscanProvider(xchainNetworkToEths(Network.Testnet))
      const fromAddress = '0xb8c0c226d6FE17E5d9132741836C3ae82A5B6C4E'
      const contractAddress = '0xA3910454bF2Cb59b8B3a401589A3bAcC5cA42306' // USDT
      const spenderAddress = '0xeB005a0aa5027F66c8D195C77f7B01324C48501C' // router

      const gas: ethers.BigNumber = await estimateApprove({
        provider,
        contractAddress,
        spenderAddress,
        abi: erc20ABI,
        fromAddress,
        amount: baseAmount(100, ETH_DECIMAL),
      })

      expect(gas.toString()).toEqual('21000')

      nock.cleanAll()
    })
  })

  describe('getApprovalAmount', () => {
    it('10', () => {
      const result = getApprovalAmount(baseAmount(100, ETH_DECIMAL))
      const expected = ethers.BigNumber.from('100')
      expect(result.toString()).toEqual('100')
      expect(result.eq(expected)).toBeTruthy()
    })
    it('max (amount not set)', () => {
      const result = getApprovalAmount()
      expect(result.eq(MAX_APPROVAL)).toBeTruthy()
    })
    it('max (amount is zero)', () => {
      const result = getApprovalAmount(baseAmount(0, ETH_DECIMAL))
      expect(result.eq(MAX_APPROVAL)).toBeTruthy()
    })
  })
})
