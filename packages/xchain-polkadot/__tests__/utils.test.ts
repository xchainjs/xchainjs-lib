import { baseAmount } from '@xchainjs/xchain-util'

import { getDefaultFees } from '../src/util'

describe('Utils Test', () => {
  it('get default fees', async () => {
    const fees = await getDefaultFees('testnet')

    expect(fees.type).toEqual('byte')
    expect(fees.average.amount().isEqualTo(baseAmount('15000000000', 12).amount())).toBeTruthy()
    expect(fees.fast.amount().isEqualTo(baseAmount('15000000000', 12).amount())).toBeTruthy()
    expect(fees.fastest.amount().isEqualTo(baseAmount('15000000000', 12).amount())).toBeTruthy()
  })
})
