import { SendData } from '@binance-chain/javascript-sdk/lib/types'
import * as crypto from '@binance-chain/javascript-sdk/lib/crypto'
import {
  getHashFromTransfer,
  getTxHashFromMemo,
  isFee,
  isTransferFee,
  isDexFees,
  isFreezeFee,
  parseTxBytes,
  parseTx,
} from '../src/util'
import { TransferEvent, Transfer } from '../src/types/binance-ws'
import { DexFees, Fee, TransferFee, Tx as BinanceTx } from '../src/types/binance'

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

  describe('parseTxBytes', () => {
    it('should parse tx bytes', () => {
      const tx = parseTxBytes(
        Buffer.from(
          'D001F0625DEE0A582A2C87FA0A280A1491937520F40458F5B414D267961B46C19789DD7012100A08555344542D36443810A0E490ED0112280A14C2A857480C89F80CB6F7E2422F5FBD9025C7AE8B12100A08555344542D36443810A0E490ED0112700A26EB5AE987210356E0A580389A6FD2CC91CD525C6D5A4D8054AF70DF17484E58678F9F574A0B4D1240326D9DCA08DC93DBD0134ABED66C70F06821ADA08493CCCBC28E6FD94D52857859F7FF247FE98133C994D556574219596E68835F094EA83E60BAFC0B8E144B3D183320D9923F',
          'hex',
        ),
      )

      expect(tx.length).toEqual(1)

      const msg = tx[0] as SendData
      expect(crypto.encodeAddress(msg.inputs[0].address, 'bnb')).toEqual('bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m')
      expect(crypto.encodeAddress(msg.outputs[0].address, 'bnb')).toEqual('bnb1c259wjqv38uqedhhufpz7haajqju0t5thass5v')
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
