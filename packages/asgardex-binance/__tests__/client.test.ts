require('dotenv').config()
import { Client as BinanceClient } from '../src/client'
import { Network, Balance } from '../src/types/binance'

describe('BinanceClient Test', () => {
  const balance = [
    {
      free: '0.00010000',
      frozen: '0.00000000',
      locked: '0.00000000',
      symbol: 'BNB',
    } as Balance,
  ]
  const net = Network.MAINNET
  const phrase = process.env.VAULT_PHRASE
  const bnbClient = new BinanceClient(net, phrase)

  it('should have right prefix', async () => {
    await bnbClient.init()
    const prefix = bnbClient.getPrefix()
    expect(prefix).toEqual('bnb')
  })

  it('should have right address', async () => {
    if (phrase) {
      const address = bnbClient.getAddress()
      expect(address).toEqual('bnb14qsnqxrjg68k5w6duq4fseap6fkg9m8fspz8f2')
    }
  })

  it('should update net', () => {
    const net_ = Network.TESTNET
    bnbClient.setNetwork(net_)
    expect(bnbClient.getNetwork()).toEqual('testnet')
    const prefix = bnbClient.getPrefix()
    expect(prefix).toEqual('tbnb')
    if (phrase) {
      const address = bnbClient.getAddress()
      expect(address).toEqual('tbnb14qsnqxrjg68k5w6duq4fseap6fkg9m8f75trfm')
    }
  })

  it('should generate phrase', () => {
    const phrase_ = BinanceClient.generatePhrase()
    const valid = BinanceClient.validatePhrase(phrase_)
    expect(valid).toBeTruthy()
  })

  it('should validate phrase', () => {
    if (phrase) {
      const valid = BinanceClient.validatePhrase(phrase)
      expect(valid).toBeTruthy()
    }
  })

  it('should get the right balance', async () => {
    const balance_ = await bnbClient.getBalance()
    expect(balance).toEqual(balance_)
  })

  it('should get the right history', async () => {
    const date = new Date()
    const dateNumber = date.setMonth(date.getMonth() - 3)
    const address = bnbClient.getAddress()
    const txArray = await bnbClient.getTransactions(dateNumber, address)
    expect(txArray[0].txHash).toEqual('0F7883A839A6E056D69AB6128967C134624635ABE0FCFEBF800F85792167F425')
  })
})
