import * as utils from '../src/utils'
import * as bitcash from 'bitcore-lib-cash'

let utxos: bitcash.Transaction.UnspentOutput[]

describe('Bitcoin Utils Test', () => {
  utxos = []
  utxos.push(
    bitcash.Transaction.UnspentOutput.fromObject({
      address: 'bchtest:qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g',
      txId: '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8',
      outputIndex: 0,
      script: bitcash.Script.fromHex('0014123f6562aa047dae2d38537327596cd8e9e21932'),
      satoshis: 1000,
    }),
  )
  const memo = 'SWAP:THOR.RUNE'

  it('get the right vault fee', () => {
    const fee = utils.calcFee(10, memo)
    expect(fee.amount().toNumber()).toEqual(850)
  })

  it('get the right normal fee', () => {
    const fee = utils.calcFee(10)
    expect(fee.amount().toNumber()).toEqual(600)
  })
})
