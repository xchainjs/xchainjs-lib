import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { AssetThor } from '../src/thor/types'
import { isMsgMultiSend, isMsgSend, getDenom, getAsset } from '../src/util'

describe('thorchain/util', () => {
  describe('Msg type guards', () => {
    const msgMultiSend: MsgMultiSend = {
      inputs: [
        {
          address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
          coins: [
            {
              denom: 'uatom',
              amount: '100000',
            },
          ],
        },
        {
          address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
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
          address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
          coins: [
            {
              denom: 'uatom',
              amount: '400000',
            },
          ],
        },
      ],
    }

    const msgSend: MsgSend = MsgSend.fromJSON({
      from_address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
      to_address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
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
      it('get denom for AssetThor', () => {
        expect(getDenom(AssetThor)).toEqual('thor')
      })
    })

    describe('getAsset', () => {
      it('get asset for thor', () => {
        expect(getAsset('thor')).toEqual(AssetThor)
      })

      it('get asset for unknown', () => {
        expect(getAsset('unknown')).toBeNull()
      })
    })
  })
})
