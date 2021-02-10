import * as Utils from '../src/utils'
import * as Bitcoin from 'bitcoinjs-lib'
import { UTXOs } from '../src/types/common'

let utxos: UTXOs

describe('Bitcoin Utils Test', () => {
  const witness = {
    script: Buffer.from('0014123f6562aa047dae2d38537327596cd8e9e21932'),
    value: 10000,
  }

  utxos = []
  const utxo = {
    hash: '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8',
    index: 0,
    witnessUtxo: witness,
    txHex:
      '01000000000101233b5e27c30135274523c69c68558dddd265e63d9f2db1953e59c6ba6dc4912e0100000000ffffffff01dc410f0000000000160014ea0b3a147753eaf29d8aa820b335876daa0d61cb02483045022100c324931915f3215cbc4175e196a78b11333dcb08bc929c417bc98645acd638fc022028bb7bbb5da72f630aeba29a76a763407c3a98a7e8809c78ffab02f2d2a4eb0e012102dbc2fa9261379482e9ed484dc2c8b8a3ca7543391de90159a51e1791c4d2271b00000000',
  }
  utxos.push(utxo)
  const memo = 'SWAP:THOR.RUNE'
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  const OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script

  it('get the right vault fee', () => {
    const fee = Utils.getFee(utxos, 10, OP_RETURN)
    expect(fee).toEqual(1890)
  })

  it('get the right normal fee', () => {
    const fee = Utils.getFee(utxos, 10, null)
    expect(fee).toEqual(1640)
  })

  it('should return a minimum fee of 1000', () => {
    const fee = Utils.getFee(utxos, 1)
    expect(fee).toEqual(1000)
  })

  it('should return default fees of a normal tx', async () => {
    const estimates = Utils.getDefaultFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })
})
