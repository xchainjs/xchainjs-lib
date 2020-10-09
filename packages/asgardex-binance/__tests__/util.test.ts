import { getHashFromTransfer, getTxHashFromMemo, isFee, isTransferFee, isDexFees, isFreezeFee } from '../src/util'
import { TransferEvent, Transfer } from '../src/types/binance-ws'
import { DexFees, Fee, TransferFee } from '../src/types/binance'

describe('binance/util', () => {
  describe('getHashFromTransfer', () => {
    it('should return hash of a partial `TransferEvent` object ', () => {
      const hash = '165AC5FFA435C9D2F99A60469801A5153346F107CBB9A124148439FAE6AD8FED'
      const mockData = {
        data: {
          H: hash,
        },
      }
      const result = getHashFromTransfer(mockData)
      expect(result).toEqual(hash)
    })

    it('should return hash from `TransferEvent` ', () => {
      const hash = '165AC5FFA435C9D2F99A60469801A5153346F107CBB9A124148439FAE6AD8FED'
      const mockData = {
        stream: '',
        data: {
          E: 0,
          e: 'e',
          H: hash,
          M: 'M',
          f: 'bnb1abc',
          t: [],
        },
      } as TransferEvent
      const result = getHashFromTransfer(mockData)
      expect(result).toEqual(hash)
    })
  })

  describe('getTxHashFromMemo', () => {
    it('should parse a tx hash from memo ', () => {
      const tx: TransferEvent = {
        stream: '',
        data: {
          M: 'OUTBOUND:AB0EABDDD2922FB82C38754E5F6AB35F249146F2C83B7E17CA6B156144A74C6F',
        } as Transfer,
      }
      const result = getTxHashFromMemo(tx)
      expect(result).toEqual('AB0EABDDD2922FB82C38754E5F6AB35F249146F2C83B7E17CA6B156144A74C6F')
    })

    it('could not parse a tx hash from invalid memo ', () => {
      const tx: TransferEvent = {
        stream: '',
        data: { M: 'anything' } as Transfer,
      }
      const result = getTxHashFromMemo(tx)
      expect(result).toBeUndefined()
    })
  })

  describe('fee type guards', () => {
    const fee: Fee = {
      msg_type: 'submit_proposal',
      fee: 500000000,
      fee_for: 1,
    }

    const dexFees: DexFees = {
      dex_fee_fields: [
        {
          fee_name: 'ExpireFee',
          fee_value: 25000,
        },
      ],
    }

    const transferFee: TransferFee = {
      fixed_fee_params: {
        msg_type: 'send',
        fee: 37500,
        fee_for: 1,
      },
      multi_transfer_fee: 30000,
      lower_limit_as_multi: 2,
    }

    const freezeFee: Fee = {
      msg_type: 'tokensFreeze',
      fee: 500000,
      fee_for: 1,
    }

    describe('isFee', () => {
      it('validates Fee', () => {
        expect(isFee(fee)).toBeTruthy()
      })
      it('invalidates a Fee', () => {
        expect(isFee(dexFees)).toBeFalsy()
      })
    })

    describe('isTransferFee', () => {
      it('validates TransferFee', () => {
        expect(isTransferFee(transferFee)).toBeTruthy()
      })
      it('invalidates a TransferFee', () => {
        expect(isTransferFee(fee)).toBeFalsy()
      })
    })

    describe('isDexFees', () => {
      it('validates DexFees', () => {
        expect(isDexFees(dexFees)).toBeTruthy()
      })
      it('invalidates a DexFees', () => {
        expect(isDexFees(fee)).toBeFalsy()
      })
    })

    describe('isFreezeFee', () => {
      it('validates FreezeFee', () => {
        expect(isFreezeFee(freezeFee)).toBeTruthy()
      })
      it('invalidates a FreezeFee', () => {
        expect(isFreezeFee(dexFees)).toBeFalsy()
      })
    })
  })
})
