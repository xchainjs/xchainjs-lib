import dashMocks from '../__mocks__/dash-mocks'
import * as utils from '../src/utils'

describe('Dash Utils Test', () => {
  beforeEach(() => {
    dashMocks.init()
  })
  afterEach(() => {
    dashMocks.restore()
  })

  it('should return a minimum fee of 1000', () => {
    const fee = utils.getFee(1, 1, Buffer.from('reallysmallopreturn', 'utf8'))
    expect(fee).toEqual(1000)
  })

  it('should calculate fees correctly', () => {
    const fee = utils.getFee(10, 2, Buffer.from('swap:bch.bch:qp3wjpa3tjlj042z2wv7hahsldgwhwy0rq9sywjpyy', 'utf8'))
    expect(fee).toEqual(3246)
  })

  it('calc fee', () => {
    const fee = utils.calcFee(50)
    expect(fee.amount().toNumber()).toEqual(19650)
  })

  it('should return default fees of a normal tx', async () => {
    const estimates = utils.getDefaultFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })
})
