import {
  getDefaultFees,
  getHashFromTransfer,
  getTxHashFromMemo,
  isFee,
  isTransferFee,
  isDexFees,
  parseTx,
} from '../src/util'
import { TransferEvent, Transfer } from '../src/types/binance-ws'
import { DexFees, Fee, TransferFee, Tx as BinanceTx } from '../src/types/binance'
import { baseAmount } from '@xchainjs/xchain-util'

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

  describe('parseTx', () => {
    it('should parse tx', () => {
      const origin_tx: BinanceTx = {
        txHash: '0C6B721844BB5751311EC8910ED17F6E950E7F2D3D404145DBBA4E8B6428C3F1',
        blockHeight: 123553830,
        txType: 'TRANSFER',
        timeStamp: '2020-11-03T17:21:34.152Z',
        fromAddr: 'bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m',
        toAddr: 'bnb1c259wjqv38uqedhhufpz7haajqju0t5thass5v',
        value: '4.97300000',
        txAsset: 'USDT-6D8',
        txFee: '0.00037500',
        proposalId: null,
        txAge: 58638,
        orderId: null,
        code: 0,
        data: null,
        confirmBlocks: 0,
        memo: '',
        source: 0,
        sequence: 1034585,
      }
      const tx = parseTx(origin_tx)

      expect(tx).toBeTruthy()
      expect(tx && tx.from[0].from).toEqual('bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m')
      expect(tx && tx.to[0].to).toEqual('bnb1c259wjqv38uqedhhufpz7haajqju0t5thass5v')
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

    describe('fetches default fees', async () => {
      const singleTxFee = baseAmount(37500)
      const transferFee = { type: 'base', average: singleTxFee, fast: singleTxFee, fastest: singleTxFee }
      const fees = await getDefaultFees()
      expect(fees.type).toEqual(transferFee.type)
      expect(fees.average.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
      expect(fees.fast.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
      expect(fees.fastest.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
    })
  })
})
