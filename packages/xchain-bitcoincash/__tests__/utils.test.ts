import { UTXOs } from '../src/types'
import * as utils from '../src/utils'

let utxos: UTXOs

describe('Bitcoin Utils Test', () => {
  utxos = []
  utxos.push({
    address: 'bchtest:qpd7jmj0hltgxux06v9d9u6933vq7zd0kyjlapya0g',
    hash: '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8',
    index: 0,
    value: 1000,
    witnessUtxo: {
      value: 1000,
      script: Buffer.from('0014123f6562aa047dae2d38537327596cd8e9e21932', 'hex'),
    },
    txHex:
      '02000000010913175382c5014e69c174377320717629c736370d29e8d19e31c27609a03053010000006a4730440220748b74d61e2e0bbec73a5a9e7e475b502029606cf7affea499a3246d6011e155022056c4f2979df51e15e1745b614eb2e5ecd2a2353be9211a0beddbbf2a344ce8434121027887b7dbccb26dc0b7e3e4174b986cbb5011ade42654d3a92f7bdba3bd08c8f9ffffffff0264000000000000001976a91497a808f1d39ae863ed78500504780e2ca0c21b7288ace7260f00000000001976a9145be96e4fbfd68370cfd30ad2f3458c580f09afb188ac00000000',
  })
  const memo = 'SWAP:THOR.RUNE'

  it('get the right vault fee', () => {
    const fee = utils.calcFee(1, memo)
    expect(fee.amount().toNumber()).toEqual(103)
  })

  it('get the right normal fee', () => {
    const fee = utils.calcFee(1)
    expect(fee.amount().toNumber()).toEqual(78)
  })
})
