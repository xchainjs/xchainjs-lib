import { Network } from '@xchainjs/xchain-client'
import { AssetRuneNative, assetAmount, assetToBase } from '@xchainjs/xchain-util'

import {
  getAsset,
  getDefaultExplorerUrls,
  getDenom,
  getDenomWithChain,
  getDepositTxDataFromLogs,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getExplorerUrl,
  getTxType,
  isBroadcastSuccess,
} from '../src/util'

describe('thorchain/util', () => {
  describe('Denom <-> Asset', () => {
    describe('getDenom', () => {
      it('get denom for AssetRune', () => {
        expect(getDenom(AssetRuneNative)).toEqual('rune')
      })
    })

    describe('getDenomWithChain', () => {
      it('get denom for AssetRune', () => {
        expect(getDenomWithChain(AssetRuneNative)).toEqual('THOR.RUNE')
      })
    })

    describe('getAsset', () => {
      it('get asset for rune', () => {
        expect(getAsset('rune')).toEqual(AssetRuneNative)
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
  })

  describe('transaction util', () => {
    describe('getDepositTxDataFromLogs', () => {
      it('returns data for IN tx (SWAP RUNE -> BTC)', () => {
        const tx = require('../__mocks__/responses/txs/swap-1C10434D59A460FD0BE76C46A333A583B8C7761094E26C0B2548D07A5AF28356.json')
        const data = getDepositTxDataFromLogs(tx.logs, 'thor1g3nvdxgmdte8cfhl8592lz5tuzjd9hjsglazhr')

        const { from, to, type } = data
        expect(from.length).toEqual(2)
        expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount('0.02')).amount().toString())
        expect(from[0].from).toEqual('thor1g3nvdxgmdte8cfhl8592lz5tuzjd9hjsglazhr')
        expect(to[0].to).toEqual('thor1dheycdevq39qlkxs2a6wuuzyn4aqxhve4qxtxt')
        expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount('36000')).amount().toString())
        expect(from[1].from).toEqual('thor1g3nvdxgmdte8cfhl8592lz5tuzjd9hjsglazhr')
        expect(to[1].to).toEqual('thor1g98cy3n9mmjrpn0sxmn63lztelera37n8n67c0')
        expect(type).toEqual('transfer')
      })

      it('returns data for SEND tx', () => {
        const tx = require('../__mocks__/responses/txs/send-AB7DDB79CAFBB402B2E75D03FB15BB2E449B9A8A59563C74090D20D6A3F73627.json')
        const data = getDepositTxDataFromLogs(tx.logs, 'thor1ws0sltg9ayyxp2777xykkqakwv2hll5ywuwkzl')

        const { from, to, type } = data
        expect(from.length).toEqual(2)
        expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
        expect(from[0].from).toEqual('thor1ws0sltg9ayyxp2777xykkqakwv2hll5ywuwkzl')
        expect(to[0].to).toEqual('thor1dheycdevq39qlkxs2a6wuuzyn4aqxhve4qxtxt')
        expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(5)).amount().toString())
        expect(from[1].from).toEqual('thor1ws0sltg9ayyxp2777xykkqakwv2hll5ywuwkzl')
        expect(to[1].to).toEqual('thor1mryx88xxhvwu9yepmg968zcdaza2nzz4rltjcp')
        expect(type).toEqual('transfer')
      })

      it('getDepositTxDataFromLogs', () => {
        const tx = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
        const data = getDepositTxDataFromLogs(tx.logs, 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f')

        const { from, to, type } = data
        expect(from.length).toEqual(2)
        expect(from[0].from).toEqual('tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f')
        expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
        expect(from[1].from).toEqual('tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f')
        expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
        expect(to.length).toEqual(2)
        expect(to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
        expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
        expect(to[1].to).toEqual('tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff')
        expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
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
      expect(getExplorerUrl(getDefaultExplorerUrls(), 'testnet' as Network)).toEqual(
        'https://viewblock.io/thorchain?network=testnet',
      )

      expect(getExplorerUrl(getDefaultExplorerUrls(), 'mainnet' as Network)).toEqual('https://viewblock.io/thorchain')
    })

    it('should retrun valid explorer address url', () => {
      expect(
        getExplorerAddressUrl({ urls: getDefaultExplorerUrls(), network: 'testnet' as Network, address: 'tthorabc' }),
      ).toEqual('https://viewblock.io/thorchain/address/tthorabc?network=testnet')

      expect(
        getExplorerAddressUrl({ urls: getDefaultExplorerUrls(), network: 'mainnet' as Network, address: 'thorabc' }),
      ).toEqual('https://viewblock.io/thorchain/address/thorabc')
    })

    it('should retrun valid explorer tx url', () => {
      expect(
        getExplorerTxUrl({ urls: getDefaultExplorerUrls(), network: 'testnet' as Network, txID: 'txhash' }),
      ).toEqual('https://viewblock.io/thorchain/tx/txhash?network=testnet')

      expect(
        getExplorerTxUrl({ urls: getDefaultExplorerUrls(), network: 'mainnet' as Network, txID: 'txhash' }),
      ).toEqual('https://viewblock.io/thorchain/tx/txhash')
    })
  })
})
