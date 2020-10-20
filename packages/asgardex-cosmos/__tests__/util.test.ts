import { Asset } from '@thorchain/asgardex-util'
import { MsgMultiSend, MsgSend } from 'cosmos-client/x/bank'
import { isMsgMultiSend, isMsgSend, getDenom, getAsset } from '../src/util'
import { AssetMuon, AssetAtom, CosmosChain } from '../src/cosmos/types'

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
        expect(getAsset('unknown')).toEqual({ chain: CosmosChain, symbol: 'unknown', ticker: 'unknown' } as Asset)
      })
    })
  })
})
