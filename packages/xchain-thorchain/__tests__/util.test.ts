import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { isMsgMultiSend, isMsgSend } from '../src/util'

describe('cosmos/util', () => {
  describe('Msg type guards', () => {
    const msgMultiSend: MsgMultiSend = {
      inputs: [
        {
          address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
          coins: [
            {
              denom: 'uatom',
              amount: '100000',
            }
          ]
        },
        {
          address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
          coins: [
            {
              denom: 'uatom',
              amount: '300000',
            }
          ]
        },
      ],
      outputs: [
        {
          address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
          coins: [
            {
              denom: 'uatom',
              amount: '400000',
            }
          ]
        },
      ],
    }

    const msgSend: MsgSend = MsgSend.fromJSON({
      from_address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
      to_address: 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv',
      amount: [
        {
          denom: 'uatom',
          amount: '100000',
        }
      ]
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
})
