import * as Utils from '../src/utils'
import * as Bitcoin from 'bitcoinjs-lib'

let UTXO: Utils.UTXO[]

describe('Bitcoin Utils Test', () => {
  const witness = {
    script: Buffer.from('0014123f6562aa047dae2d38537327596cd8e9e21932'),
    value: 10000,
  }

  UTXO = []
  const utxo = {
    hash: '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8',
    index: 0,
    witnessUtxo: witness,
  }
  UTXO.push(utxo)
  const memo = 'SWAP:THOR.RUNE'
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  const OP_RETURN = Bitcoin.script.compile([Bitcoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script

  it('get the right vault fee', () => {
    const fee = Utils.getVaultFee(UTXO, OP_RETURN, 1)
    expect(fee).toEqual(188)
  })

  it('get the right normal fee', () => {
    const fee = Utils.getNormalFee(UTXO, 1)
    expect(fee).toEqual(163)
  })
})
