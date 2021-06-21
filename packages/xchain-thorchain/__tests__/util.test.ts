import { AssetRune } from '../src/types'
import {
  getDenom,
  getDenomWithChain,
  getAsset,
  getTxDataFromResponse,
  isBroadcastSuccess,
  getExplorerAddressUrl,
  getExplorerTxUrl,
  getExplorerUrl,
  getDefaultExplorerUrls,
  getDepositTxDataFromLogs,
  getTxType,
} from '../src/util'
import { assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import { RawTxResponse, TxResponse } from '@xchainjs/xchain-cosmos/src/cosmos/types'
import { Msg } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'
import { MsgSend } from 'cosmos-client/x/bank'
import { StdTxFee } from 'cosmos-client/api'

describe('thorchain/util', () => {
  describe('Denom <-> Asset', () => {
    describe('getDenom', () => {
      it('get denom for AssetRune', () => {
        expect(getDenom(AssetRune)).toEqual('rune')
      })
    })

    describe('getDenomWithChain', () => {
      it('get denom for AssetRune', () => {
        expect(getDenomWithChain(AssetRune)).toEqual('THOR.RUNE')
      })
    })

    describe('getAsset', () => {
      it('get asset for rune', () => {
        expect(getAsset('rune')).toEqual(AssetRune)
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
    describe('getTxDataFromResponse', () => {
      const fee: StdTxFee = {
        gas: '200000',
        amount: [],
      }
      const from_address = 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly'
      const to_address = 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly'

      const tx1: TxResponse = {
        height: 0,
        txhash: '',
        data: '0A060A0473656E64',
        raw_log: '',
        gas_wanted: '200000',
        gas_used: '35000',
        tx: {
          msg: [
            MsgSend.fromJSON({
              from_address,
              to_address,
              amount: [
                {
                  denom: 'rune',
                  amount: '1000',
                },
              ],
            }),
            MsgSend.fromJSON({
              from_address,
              to_address,
              amount: [
                {
                  denom: 'rune',
                  amount: '1000',
                },
              ],
            }),
          ] as Msg[],
          fee: fee,
          signatures: null,
          memo: '',
        } as StdTx,
        timestamp: new Date().toString(),
      }

      const tx2: TxResponse = {
        height: 0,
        txhash: '',
        data: '0A090A076465706F736974',
        raw_log: '',
        gas_wanted: '200000',
        gas_used: '35000',
        tx: {
          body: {
            messages: [
              MsgSend.fromJSON({
                from_address,
                to_address,
                amount: [
                  {
                    denom: 'rune',
                    amount: '1000',
                  },
                ],
              }),
              MsgSend.fromJSON({
                from_address,
                to_address,
                amount: [
                  {
                    denom: 'rune',
                    amount: '1000',
                  },
                ],
              }),
            ] as Msg[],
          },
        } as RawTxResponse,
        timestamp: new Date().toString(),
      }

      it('parses tx 1', () => {
        const result = getTxDataFromResponse(tx1, 'testnet')

        expect(result.from.length).toEqual(1)
        expect(result.from[0].from).toEqual(from_address)
        expect(result.from[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
        expect(result.to.length).toEqual(1)
        expect(result.to[0].to).toEqual(to_address)
        expect(result.to[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
      })
      it('parses tx 2', () => {
        const result = getTxDataFromResponse(tx2, 'testnet')

        expect(result.from.length).toEqual(1)
        expect(result.from[0].from).toEqual(from_address)
        expect(result.from[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
        expect(result.to.length).toEqual(1)
        expect(result.to[0].to).toEqual(to_address)
        expect(result.to[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
      })
    })

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
      expect(getExplorerUrl(getDefaultExplorerUrls(), 'testnet')).toEqual(
        'https://viewblock.io/thorchain?network=testnet',
      )

      expect(getExplorerUrl(getDefaultExplorerUrls(), 'mainnet')).toEqual('https://viewblock.io/thorchain')
    })

    it('should retrun valid explorer address url', () => {
      expect(
        getExplorerAddressUrl({ urls: getDefaultExplorerUrls(), network: 'testnet', address: 'tthorabc' }),
      ).toEqual('https://viewblock.io/thorchain/address/tthorabc?network=testnet')

      expect(getExplorerAddressUrl({ urls: getDefaultExplorerUrls(), network: 'mainnet', address: 'thorabc' })).toEqual(
        'https://viewblock.io/thorchain/address/thorabc',
      )
    })

    it('should retrun valid explorer tx url', () => {
      expect(getExplorerTxUrl({ urls: getDefaultExplorerUrls(), network: 'testnet', txID: 'txhash' })).toEqual(
        'https://viewblock.io/thorchain/tx/txhash?network=testnet',
      )

      expect(getExplorerTxUrl({ urls: getDefaultExplorerUrls(), network: 'mainnet', txID: 'txhash' })).toEqual(
        'https://viewblock.io/thorchain/tx/txhash',
      )
    })
  })
})
