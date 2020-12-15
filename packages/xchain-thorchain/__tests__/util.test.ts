import { AssetRune } from '../src/types'
import {
  getDenom,
  getDenomWithChain,
  getAsset,
  getTxsFromHistory,
  isTransferEvent,
  isRecipient,
  isSender,
  isAmount,
  parseAmountString,
  DECIMAL,
  isBroadcastSuccess,
} from '../src/util'
import { TxEventAttribute } from '@xchainjs/xchain-cosmos'
import { baseAmount } from '@xchainjs/xchain-util'

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
  })

  describe('type guards', () => {
    describe('isTransferEvent', () => {
      it('validates isTransferEvent', () => {
        expect(
          isTransferEvent({
            type: 'transfer',
            attributes: [],
          }),
        ).toBeTruthy()
      })
      it('invalidates a isTransferEvent', () => {
        expect(
          isTransferEvent({
            type: 'message',
            attributes: [],
          }),
        ).toBeFalsy()
      })
    })

    const recipientAttribute: TxEventAttribute = {
      key: 'recipient',
      value: 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4',
    }
    const senderAttribute: TxEventAttribute = {
      key: 'sender',
      value: 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4',
    }
    const amountAttribute: TxEventAttribute = {
      key: 'amount',
      value: '100rune',
    }
    describe('isRecipient', () => {
      it('validates isRecipient', () => {
        expect(isRecipient(recipientAttribute)).toBeTruthy()
      })
      it('invalidates isRecipient', () => {
        expect(isRecipient(senderAttribute)).toBeFalsy()
      })
    })
    describe('isSender', () => {
      it('validates isSender', () => {
        expect(isSender(senderAttribute)).toBeTruthy()
      })
      it('invalidates isSender', () => {
        expect(isSender(recipientAttribute)).toBeFalsy()
      })
    })
    describe('isAmount', () => {
      it('validates isAmount', () => {
        expect(isAmount(amountAttribute)).toBeTruthy()
      })
      it('invalidates isAmount', () => {
        expect(isAmount(recipientAttribute)).toBeFalsy()
      })
    })
  })

  describe('transaction util', () => {
    describe('parseAmountString', () => {
      it('should parse amount string', () => {
        const amount = parseAmountString('1000rune')
        expect(amount?.asset).toEqual(AssetRune)
        expect(amount?.amount.amount().isEqualTo(baseAmount(1000, DECIMAL).amount())).toBeTruthy()
      })
    })
    describe('getTxsFromHistory', () => {
      const transactions = [
        {
          height: 1047,
          txhash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
          raw_log: 'transaction logs',
          logs: [
            {
              msg_index: 0,
              log: '',
              events: [
                {
                  type: 'message',
                  attributes: [
                    {
                      key: 'action',
                      value: 'native_tx',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                  ],
                },
                {
                  type: 'transfer',
                  attributes: [
                    {
                      key: 'recipient',
                      value: 'tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                    {
                      key: 'amount',
                      value: '100000000rune',
                    },
                    {
                      key: 'recipient',
                      value: 'tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                    {
                      key: 'amount',
                      value: '200000000000rune',
                    },
                  ],
                },
              ],
            },
          ],
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          timestamp: '2020-09-25T06:09:15Z',
        },
      ]
      it('should parse transations', () => {
        const history = getTxsFromHistory(transactions, AssetRune)
        expect(history.length).toEqual(1)
        expect(history[0].asset).toEqual(AssetRune)
        expect(history[0].from[0].from).toEqual('tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly')
        expect(history[0].from[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
        expect(history[0].from[1].from).toEqual('tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly')
        expect(history[0].from[1].amount.amount().isEqualTo(baseAmount(200000000000, DECIMAL).amount())).toEqual(true)
        expect(history[0].to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
        expect(history[0].to[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
        expect(history[0].to[1].to).toEqual('tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2')
        expect(history[0].to[1].amount.amount().isEqualTo(baseAmount(200000000000, DECIMAL).amount())).toEqual(true)
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
  })
})
