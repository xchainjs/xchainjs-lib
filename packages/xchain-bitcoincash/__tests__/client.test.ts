import { Client } from '../src/client'
import { mock_getBalance } from '../__mocks__/api'

const bchClient = new Client({ network: 'mainnet' })

describe('BCHClient Test', () => {
  beforeEach(() => bchClient.purgeClient())
  afterEach(() => bchClient.purgeClient())

  const phrase = 'atom green various power must another rent imitate gadget creek fat then'
  const testnet_address = 'bchtest:qpgxmhllgd8fn2flps84537s6uj8mywd4s0w0up43e'
  const mainnet_address = 'bitcoincash:qrqwc4dxav4dzltr97q8u2245rz7wlxu3ye8c6x99u'

  it('set phrase should return correct address', () => {
    bchClient.setNetwork('testnet')
    expect(bchClient.setPhrase(phrase)).toEqual(testnet_address)

    bchClient.setNetwork('mainnet')
    expect(bchClient.setPhrase(phrase)).toEqual(mainnet_address)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => bchClient.setPhrase('cat')).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(bchClient.setPhrase(phrase)).toBeUndefined
  })

  it('should validate the right address', () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)
    expect(bchClient.getAddress()).toEqual(testnet_address)
    expect(bchClient.validateAddress(testnet_address)).toBeTruthy()
    expect(bchClient.validateAddress(mainnet_address)).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerUrl()).toEqual('https://explorer.bitcoin.com/bch')

    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerUrl()).toEqual('https://explorer.bitcoin.com/tbch')
  })

  it('should retrun valid explorer address url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://explorer.bitcoin.com/bch/address/testAddressHere',
    )
    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://explorer.bitcoin.com/tbch/address/anotherTestAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    bchClient.setNetwork('mainnet')
    expect(bchClient.getExplorerTxUrl('testTxHere')).toEqual('https://explorer.bitcoin.com/bch/tx/testTxHere')
    bchClient.setNetwork('testnet')
    expect(bchClient.getExplorerTxUrl('anotherTestTxHere')).toEqual(
      'https://explorer.bitcoin.com/tbch/tx/anotherTestTxHere',
    )
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getClientURL(), bchClient.getAddress(), {
      balance: 0,
      balanceSat: 0,
      totalReceived: 0,
      totalReceivedSat: 0,
      totalSent: 0,
      totalSentSat: 0,
      unconfirmedBalance: 0,
      unconfirmedBalanceSat: 0,
      unconfirmedTxApperances: 0,
      txApperances: 1343,
      transactions: [
        '62a482c869567a43981efbb3a71aeee06e4c94d6bfd297e3f745f129fc2c4ac0',
        'dc73dd65f51adc99dc9950938619649b8727629c94217b36a08fcbf9f213ee34',
      ],
      legacyAddress: 'mvQPGnzRT6gMWASZBMg7NcT3vmvsSKSQtf',
      cashAddress: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      slpAddress: 'slptest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2shlcycvd5',
      currentPage: 0,
      pagesTotal: 2
    })
    const balance = await bchClient.getBalance()
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().toNumber()).toEqual(0)
  })

  it('should get the right balance', async () => {
    bchClient.setNetwork('testnet')
    bchClient.setPhrase(phrase)

    mock_getBalance(bchClient.getClientURL(), 'qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf', {
      balance: 1238.17511737,
      balanceSat: 123817511737,
      totalReceived: 1244.42748213,
      totalReceivedSat: 124442748213,
      totalSent: 6.25236476,
      totalSentSat: 625236476,
      unconfirmedBalance: 0,
      unconfirmedBalanceSat: 0,
      unconfirmedTxApperances: 0,
      txApperances: 1343,
      transactions: [
        '62a482c869567a43981efbb3a71aeee06e4c94d6bfd297e3f745f129fc2c4ac0',
        'dc73dd65f51adc99dc9950938619649b8727629c94217b36a08fcbf9f213ee34',
      ],
      legacyAddress: 'mvQPGnzRT6gMWASZBMg7NcT3vmvsSKSQtf',
      cashAddress: 'bchtest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf',
      slpAddress: 'slptest:qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2shlcycvd5',
      currentPage: 0,
      pagesTotal: 2
    })
    const balance = await bchClient.getBalance('qz35h5mfa8w2pqma2jq06lp7dnv5fxkp2svtllzmlf')
    expect(balance.length).toEqual(1)
    expect(balance[0].amount.amount().isEqualTo('123817511737')).toBeTruthy()
  })
})
