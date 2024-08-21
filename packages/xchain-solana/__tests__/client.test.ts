import { Client } from '../src'

describe('Solana client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      phrase: process.env.PHRASE_MAINNET,
    })
  })

  it('Should validate address as valid', () => {
    expect(client.validateAddress('G72oBA9cRYUzR8Q9oLvJcNRx5ovcDGFvHsbZKp1BT75W')).toBeTruthy()
  })

  it('Should validate address as invalid', () => {
    expect(client.validateAddress('fakeAddress')).toBeFalsy()
  })
})
