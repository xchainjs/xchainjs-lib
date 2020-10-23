import { trimZeros } from './string'

describe('trimZeros', () => {
  it('removes leading zeros', () => {
    expect(trimZeros('000001.01')).toEqual('1.01')
  })
  it('removes trailing zeros', () => {
    expect(trimZeros('1.010000')).toEqual('1.01')
  })
  it('does not change a zero', () => {
    expect(trimZeros('0')).toEqual('0')
  })
  it('removes decimal if no trailing zeros', () => {
    expect(trimZeros('0.')).toEqual('0')
  })
  it('trims zeros from "0.0"', () => {
    expect(trimZeros('0.0')).toEqual('0')
  })
  it('trims zeros from "0.001"', () => {
    expect(trimZeros('0.001')).toEqual('0.001')
  })
  it('does not trim zeros', () => {
    expect(trimZeros('10.01')).toEqual('10.01')
  })
})
