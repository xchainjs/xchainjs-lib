import cosmosClientCore from '@cosmos-client/core'
import { baseAmount, eqAsset } from '@xchainjs/xchain-util'

import { AssetATOM, COSMOS_DECIMAL } from '../src/const'
import { APIQueryParam, RawTxResponse, TxResponse } from '../src/cosmos/types'
import { getAsset, getDenom, getQueryString, getTxsFromHistory, isMsgMultiSend, isMsgSend } from '../src/utils'

describe('cosmos/util', () => {
  describe('Msg type guards', () => {
    const msgMultiSend = new cosmosClientCore.proto.cosmos.bank.v1beta1.MsgMultiSend({
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

    const msgSend = new cosmosClientCore.proto.cosmos.bank.v1beta1.MsgSend({
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
      it('get denom for AssetATOM', () => {
        expect(getDenom(AssetATOM)).toEqual('uatom')
      })
    })

    describe('getAsset', () => {
      it('get asset for uatom', () => {
        const asset = getAsset('uatom')
        const result = asset !== null && eqAsset(asset, AssetATOM)
        expect(result).toBeTruthy()
      })

      it('get asset for ibc asset (BTSG - Bitsong)', () => {
        // see https://github.com/bitsongofficial/docs.bitsong.io/blob/main/relayer.md#official-bitsong-ibc-channels
        const denom = 'ibc/E7D5E9D0E9BF8B7354929A817DD28D4D017E745F638954764AA88522A7A409EC'
        const asset = getAsset(denom)
        const expected = { ...AssetATOM, symbol: denom, ticker: '' }
        expect(asset !== null && eqAsset(asset, expected)).toBeTruthy()
      })
    })
  })

  describe('parse Tx', () => {
    const from_address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'
    const to_address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'
    const msgSend = new cosmosClientCore.proto.cosmos.bank.v1beta1.MsgSend({
      from_address,
      to_address,
      amount: [
        {
          denom: 'uatom',
          amount: '1000',
        },
      ],
    })
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
            messages: [msgSend, msgSend],
            memo: '',
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
            memo: '',
          },
        } as RawTxResponse,
        timestamp: new Date().toString(),
      },
    ]

    it('parse Tx', () => {
      const parsed_txs = getTxsFromHistory(txs, AssetATOM)

      expect(parsed_txs.length).toEqual(2)

      expect(parsed_txs[0].asset).toEqual(AssetATOM)
      expect(parsed_txs[0].from.length).toEqual(1)
      expect(parsed_txs[0].from[0].from).toEqual(from_address)
      expect(parsed_txs[0].from[0].amount.amount().isEqualTo(baseAmount(2000, COSMOS_DECIMAL).amount())).toBeTruthy()
      expect(parsed_txs[0].to.length).toEqual(1)
      expect(parsed_txs[0].to[0].to).toEqual(to_address)
      expect(parsed_txs[0].to[0].amount.amount().isEqualTo(baseAmount(2000, COSMOS_DECIMAL).amount())).toBeTruthy()

      expect(parsed_txs[1].asset).toEqual(AssetATOM)
      expect(parsed_txs[1].from.length).toEqual(1)
      expect(parsed_txs[1].from[0].from).toEqual(from_address)
      expect(parsed_txs[1].from[0].amount.amount().isEqualTo(baseAmount(2000, COSMOS_DECIMAL).amount())).toBeTruthy()
      expect(parsed_txs[1].to.length).toEqual(1)
      expect(parsed_txs[1].to[0].to).toEqual(to_address)
      expect(parsed_txs[1].to[0].amount.amount().isEqualTo(baseAmount(2000, COSMOS_DECIMAL).amount())).toBeTruthy()
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
