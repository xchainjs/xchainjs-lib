import { Client } from '../src/client'

describe('Client Test', () => {
  let thorClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address = 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws'
  const testnet_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'

  beforeEach(() => {
    thorClient = new Client({ phrase, network: 'mainnet' })
  })
  
  afterEach(() => {
    thorClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const thorClientEmptyMain = new Client({ phrase, network: 'mainnet' })
    const addressMain = await thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address)

    const thorClientEmptyTest = new Client({ phrase, network: 'testnet' })
    const addressTest = await thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnet_address)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new Client({ phrase: 'invalid phrase', network: 'mainnet' })
    }).toThrow()

    expect(() => {
      new Client({ phrase: 'invalid phrase', network: 'testnet' })
    }).toThrow()
  })

  it('should have right address', async () => {
    expect(await thorClient.getAddress()).toEqual(mainnet_address)
  })

  it('should update net', async () => {
    const client = new Client({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')

    const address = await client.getAddress()
    expect(address).toEqual(testnet_address)
  })

  it('should generate phrase', () => {
    const phrase_ = Client.generatePhrase()
    const valid = Client.validatePhrase(phrase_)
    expect(valid).toBeTruthy()
  })

  it('should validate phrase', () => {
    const valid = Client.validatePhrase(phrase)
    expect(valid).toBeTruthy()
  })

  it('should init, should have right prefix', async () => {
    expect(thorClient.validateAddress(thorClient.getAddress())).toEqual(true)

    thorClient.setNetwork('testnet')
    expect(thorClient.validateAddress(thorClient.getAddress())).toEqual(true)
  })
})
