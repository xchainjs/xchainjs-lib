import { AssetBNB } from '@xchainjs/xchain-binance'
import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase } from '@xchainjs/xchain-util'
// import nock from 'nock'

import { mockTendermintNodeInfo } from '../__mocks__/mayanode-api'
import { AssetCacao, AssetMaya, defaultExplorerUrls } from '../src/const'
import { ClientUrl } from '../src/types'
import {
  assetFromDenom,
  getChainId,
  getDenom,
  getDepositTxDataFromLogs,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getExplorerUrl,
  getPrefix,
  getTxType,
  isBroadcastSuccess,
} from '../src/utils'

describe('mayachain/util', () => {
  describe('Denom <-> Asset', () => {
    describe('getDenom', () => {
      it('get denom for AssetCacao', () => {
        expect(getDenom(AssetCacao)).toEqual('cacao')
      })
      it('get denom for AssetMaya', () => {
        expect(getDenom(AssetMaya)).toEqual('maya')
      })
      it('get denom for BNB synth', () => {
        expect(getDenom({ ...AssetBNB, synth: true })).toEqual('bnb/bnb')
      })
    })

    describe('getAsset', () => {
      it('cacao', () => {
        expect(assetFromDenom('maya.cacao')).toEqual(AssetCacao)
      })
      it('bnb/bnb', () => {
        expect(assetFromDenom('bnb/bnb')).toEqual({ ...AssetBNB, synth: true })
      })
    })
    describe('getTxType', () => {
      it('deposit', () => {
        expect(getTxType('CgkKB2RlcG9zaXQ=', 'base64')).toEqual('deposit')
      })

      it('set_observed_txin', () => {
        expect(getTxType('"ChMKEXNldF9vYnNlcnZlZF90eGlu', 'base64')).toEqual('set_observed_txin')
      })

      it('unknown', () => {
        expect(getTxType('"abc', 'base64')).toEqual('')
      })
    })

    describe('getPrefix', () => {
      it('should return the correct prefix based on network', () => {
        expect(getPrefix(Network.Mainnet) === 'maya')
        expect(getPrefix(Network.Stagenet) === 'smaya')
        expect(getPrefix(Network.Testnet) === 'tmaya')
      })
    })
  })

  describe('transaction util', () => {
    describe('getDepositTxDataFromLogs', () => {
      it('returns data for IN tx (SWAP CACAO -> BNB)', () => {
        const tx = require('../__mocks__/responses/txs/swap-653E03EC0FE53E5402E5CC6D3D8FAD14E2CDF2BED4A8948BA1B0120B479A9D3E.json')
        const data = getDepositTxDataFromLogs(tx.logs, 'tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')

        const { from, to, type } = data
        expect(from.length).toEqual(3)
        expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount('0.018')).amount().toString())
        expect(from[0].from).toEqual('tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')
        expect(to[0].to).toEqual('tmaya1dheycdevq39qlkxs2a6wuuzyn4aqxhve3qfhf7')
        expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount('0.002')).amount().toString())
        expect(from[1].from).toEqual('tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')
        expect(to[1].to).toEqual('tmaya1577sz8j7xnthm3cl3vgfvmdmkrp7dqrhfj6dsg')
        expect(type).toEqual('transfer')
      })

      it('returns data for SEND tx', () => {
        const tx = require('../__mocks__/responses/txs/send-B5A11572507A22A5267C1075761E7610AE5C8CBA6466C03B673694705F20428C.json')
        const data = getDepositTxDataFromLogs(tx.logs, 'tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')

        const { from, to, type } = data
        expect(from.length).toEqual(3)
        expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.018)).amount().toString())
        expect(from[0].from).toEqual('tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')
        expect(to[0].to).toEqual('tmaya1dheycdevq39qlkxs2a6wuuzyn4aqxhve3qfhf7')
        expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.002)).amount().toString())
        expect(from[1].from).toEqual('tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')
        expect(to[1].to).toEqual('tmaya1577sz8j7xnthm3cl3vgfvmdmkrp7dqrhfj6dsg')
        expect(type).toEqual('transfer')
      })

      it('getDepositTxDataFromLogs', () => {
        const tx = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
        const data = getDepositTxDataFromLogs(tx.logs, 'tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')

        const { from, to, type } = data
        expect(from.length).toEqual(2)
        expect(from[0].from).toEqual('tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')
        expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
        expect(from[1].from).toEqual('tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t')
        expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1)).amount().toString())
        expect(to.length).toEqual(2)
        expect(to[0].to).toEqual('tmaya1dheycdevq39qlkxs2a6wuuzyn4aqxhve3qfhf7')
        expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
        expect(to[1].to).toEqual('tmaya17gw75axcnr8747pkanye45pnrwk7p9c3uquyle')
        expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1)).amount().toString())
        expect(type).toEqual('transfer')
      })
    })

    describe('isBroadcastSuccess', () => {
      it('validates isBroadcastSuccess', () => {
        expect(isBroadcastSuccess({ logs: [] })).toBeTruthy()
      })
      it('invalidates isBroadcastSuccess', () => {
        expect(isBroadcastSuccess({})).toBeFalsy()
      })
    })
  })

  describe('explorer url', () => {
    it('should return valid explorer url', () => {
      expect(getExplorerUrl(defaultExplorerUrls, 'testnet' as Network)).toEqual(
        'https://explorer.mayachain.info?network=testnet',
      )

      expect(getExplorerUrl(defaultExplorerUrls, 'mainnet' as Network)).toEqual('https://explorer.mayachain.info')
    })

    it('should return valid explorer address url', () => {
      expect(
        getExplorerAddressUrl({ urls: defaultExplorerUrls, network: 'testnet' as Network, address: 'tthorabc' }),
      ).toEqual('https://explorer.mayachain.info/address/tthorabc?network=testnet')

      expect(
        getExplorerAddressUrl({ urls: defaultExplorerUrls, network: 'mainnet' as Network, address: 'thorabc' }),
      ).toEqual('https://explorer.mayachain.info/address/thorabc')
    })

    it('should return valid explorer tx url', () => {
      expect(getExplorerTxUrl({ urls: defaultExplorerUrls, network: 'testnet' as Network, txID: 'txhash' })).toEqual(
        'https://explorer.mayachain.info/tx/txhash?network=testnet',
      )

      expect(getExplorerTxUrl({ urls: defaultExplorerUrls, network: 'mainnet' as Network, txID: 'txhash' })).toEqual(
        'https://explorer.mayachain.info/tx/txhash',
      )
    })
  })
  const clientUrl: ClientUrl = {
    [Network.Testnet]: {
      node: '',
      rpc: '',
    },
    [Network.Stagenet]: {
      node: 'https://stagenet.mayanode.mayachain.info',
      rpc: 'https://stagenet.tendermint.mayachain.info',
    },
    [Network.Mainnet]: {
      node: 'https://mayanode.mayachain.info',
      rpc: 'https://tendermint.mayachain.info',
    },
  }

  describe('getChainId', () => {
    it('stagenet', async () => {
      const id = 'chain-id-stagenet'
      const url = clientUrl.stagenet.node
      // Mock chain id
      mockTendermintNodeInfo(url, {
        default_node_info: {
          network: id,
        },
      })
      const result = await getChainId(url)

      expect(result).toEqual(id)
    })

    it('mainnet', async () => {
      const id = 'chain-id-mainnet'
      const url = clientUrl.mainnet.node
      // Mock chain id
      mockTendermintNodeInfo(url, {
        default_node_info: {
          network: id,
        },
      })
      const result = await getChainId(url)

      expect(result).toEqual(id)
    })
  })
})
