require('dotenv').config()
import { Client as BinanceClient } from '../src/client'
import { Balances, Fee, TransferFee } from '../src/types/binance'
import { isTransferFee } from '../src/util'

describe('BinanceClient Test', () => {
  let bnbClient: BinanceClient
  // Note: This phrase is created by https://iancoleman.io/bip39/ and will never been used in a real-world
  const phrase = 'wheel leg dune emerge sudden badge rough shine convince poet doll kiwi sleep labor hello'
  const testnetAddress = 'bnb1t95kjgmjc045l2a728z02textadd98ytlyvkk0'
  beforeEach(() => {
    bnbClient = new BinanceClient({ phrase, network: 'mainnet' })
  })

  it('should start with empty wallet', async () => {
    const phraseEmpty = 'rural bright ball negative already grass good grant nation screen model pizza'
    const bnbClientEmptyMain = new BinanceClient({ phrase: phraseEmpty, network: 'mainnet' })
    const addressMain = bnbClientEmptyMain.getAddress()
    expect(addressMain).toEqual('bnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9e738vr')
    const bnbClientEmptyTest = new BinanceClient({ phrase: phraseEmpty, network: 'testnet' })
    const addressTest = bnbClientEmptyTest.getAddress()
    expect(addressTest).toEqual('tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj')
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new BinanceClient({ phrase: 'invalid phrase', network: 'mainnet' })
    }).toThrow()
  })

  it('should have right address', async () => {
    const address = bnbClient.getAddress()
    expect(address).toEqual(testnetAddress)
  })

  it('should update net', () => {
    const client = new BinanceClient({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')

    const address = bnbClient.getAddress()
    expect(address).toEqual(testnetAddress)
  })

  it('should generate phrase', () => {
    const phrase_ = BinanceClient.generatePhrase()
    const valid = BinanceClient.validatePhrase(phrase_)
    expect(valid).toBeTruthy()
  })

  it('should validate phrase', () => {
    const valid = BinanceClient.validatePhrase(phrase)
    expect(valid).toBeTruthy()
  })

  it('it should init should have right prefix', async () => {
    let prefix = bnbClient.getPrefix()
    expect(prefix).toEqual('bnb')
    bnbClient.setNetwork('testnet')
    prefix = bnbClient.getPrefix()
    expect(prefix).toEqual('tbnb')
  })

  it('has no balances', async () => {
    const emptyBalances: Balances = []
    const result = await bnbClient.getBalance()
    expect(result).toEqual(emptyBalances)
  })

  it('has an empty tx history', async () => {
    const txArray = await bnbClient.getTransactions()
    expect(txArray).toEqual({ total: 0, tx: [] })
  })

  it('fetches the fees', async () => {
    const feesArray = await bnbClient.getFees()
    const submitProposalFee = feesArray[0] as Fee

    expect(submitProposalFee.msg_type).toEqual('submit_proposal')
    expect(submitProposalFee.fee).toBeGreaterThan(0)
    expect(submitProposalFee.fee_for).toBeGreaterThan(0)

    const sendFee: TransferFee | undefined = feesArray.find(isTransferFee)
    expect(sendFee).toBeDefined()
    expect(sendFee?.fixed_fee_params?.fee).toBeGreaterThan(0)
  })
})
