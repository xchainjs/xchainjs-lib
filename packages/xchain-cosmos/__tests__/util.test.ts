import { cosmosclient, proto } from '@cosmos-client/core'
import { baseAmount } from '@xchainjs/xchain-util'

import { APIQueryParam, RawTxResponse, TxResponse } from '../src/cosmos/types'
import { AssetAtom, AssetMuon } from '../src/types'
import { getAsset, getDenom, getQueryString, getTxsFromHistory, isMsgMultiSend, isMsgSend } from '../src/util'

describe('cosmos/util', () => {
  describe('Msg type guards', () => {
    const msgMultiSend = new proto.cosmos.bank.v1beta1.MsgMultiSend({
      inputs: [
        {
          address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
          coins: [
            {
              denom: 'uatom',
              amount: '100000',
            },
          ],
        },
        {
          address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
          coins: [
            {
              denom: 'uatom',
              amount: '300000',
            },
          ],
        },
      ],
      outputs: [
        {
          address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
          coins: [
            {
              denom: 'uatom',
              amount: '400000',
            },
          ],
        },
      ],
    })

    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
      to_address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
      amount: [
        {
          denom: 'uatom',
          amount: '100000',
        },
      ],
    })

    describe('isMsgMultiSend', () => {
      it('validates MsgMultiSend', () => {
        expect(isMsgMultiSend(msgMultiSend)).toBeTruthy()
      })
      it('invalidates MsgMultiSend', () => {
        expect(isMsgMultiSend(msgSend)).toBeFalsy()
      })
    })

    describe('isMsgSend', () => {
      it('validates MsgSend', () => {
        expect(isMsgSend(msgSend)).toBeTruthy()
      })
      it('invalidates MsgSend', () => {
        expect(isMsgSend(msgMultiSend)).toBeFalsy()
      })
    })
  })

  describe('Denom <-> Asset', () => {
    describe('getDenom', () => {
      it('get denom for AssetAtom', () => {
        expect(getDenom(AssetAtom)).toEqual('uatom')
      })

      it('get denom for AssetMuon', () => {
        expect(getDenom(AssetMuon)).toEqual('umuon')
      })
    })

    describe('getAsset', () => {
      it('get asset for umuon', () => {
        expect(getAsset('umuon')).toEqual(AssetMuon)
      })

      it('get asset for uatom', () => {
        expect(getAsset('uatom')).toEqual(AssetAtom)
      })

      it('get asset for unknown', () => {
        expect(getAsset('unknown')).toBeNull()
      })
    })
  })

  describe('parse Tx', () => {
    const from_address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'
    const to_address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'
    const msgSend = new proto.cosmos.bank.v1beta1.MsgSend({
      from_address,
      to_address,
      amount: [
        {
          denom: 'uatom',
          amount: '1000',
        },
      ],
    })
    const encodedMsg = cosmosclient.codec.packAnyFromCosmosJSON(msgSend)
    const txs: TxResponse[] = [
      {
        height: 0,
        txhash: '',
        data: '0A090A076465706F736974',
        raw_log: '',
        gas_wanted: '200000',
        gas_used: '35000',
        tx: {
          body: {
            messages: [encodedMsg, encodedMsg],
          },
        } as RawTxResponse,
        timestamp: new Date().toString(),
      },
      {
        height: 0,
        txhash: '',
        data: '0A090A076465706F736974',
        raw_log: '',
        gas_wanted: '200000',
        gas_used: '35000',
        tx: {
          body: {
            messages: [msgSend, msgSend],
          },
        } as RawTxResponse,
        timestamp: new Date().toString(),
      },
    ]

    it('parse Tx', () => {
      const parsed_txs = getTxsFromHistory(txs, AssetAtom)

      expect(parsed_txs.length).toEqual(2)

      expect(parsed_txs[0].asset).toEqual(AssetAtom)
      expect(parsed_txs[0].from.length).toEqual(1)
      expect(parsed_txs[0].from[0].from).toEqual(from_address)
      expect(parsed_txs[0].from[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
      expect(parsed_txs[0].to.length).toEqual(1)
      expect(parsed_txs[0].to[0].to).toEqual(to_address)
      expect(parsed_txs[0].to[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()

      expect(parsed_txs[1].asset).toEqual(AssetAtom)
      expect(parsed_txs[1].from.length).toEqual(1)
      expect(parsed_txs[1].from[0].from).toEqual(from_address)
      expect(parsed_txs[1].from[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
      expect(parsed_txs[1].to.length).toEqual(1)
      expect(parsed_txs[1].to[0].to).toEqual(to_address)
      expect(parsed_txs[1].to[0].amount.amount().isEqualTo(baseAmount(2000, 6).amount())).toBeTruthy()
    })
  })

  describe('get query string', () => {
    const queryParameter: APIQueryParam = {
      'message.Sender': 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg',
      page: '1',
      limit: '5',
    }

    it('get query string from query params', () => {
      expect(getQueryString(queryParameter)).toEqual(
        'message.Sender=cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg&page=1&limit=5',
      )
    })
  })
})
