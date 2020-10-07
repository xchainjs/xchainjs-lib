require('dotenv').config()
import * as Bitcoin from 'bitcoinjs-lib'
import { Client, Network } from '../src/client'
import * as asgardexCrypto from '@thorchain/asgardex-crypto'
import { assetFromString, baseAmount } from '@thorchain/asgardex-util'

//Mocks
import mockApi, { responses } from '../__mocks__/blockChair'

const PHRASE = process.env.VAULT_PHRASE as string
const NODE_URL = 'https://api.blockchair.com/bitcoin/testnet'
const NODE_API_KEY = process.env.BLOCKCHAIR_API_KEY || ''

const makeWallet = (network: Network = 'testnet') => {
  const client = new Client(network, NODE_URL, NODE_API_KEY)
  const phrase = client.generatePhrase()
  client.setPhrase(phrase)
  const address = client.getAddress()
  return { phrase, address, network }
}

beforeEach(() => {
  mockApi.mockGetAddress()
  mockApi.mockBitcoinStats()
  mockApi.mockGetTx()
  mockApi.mockGetRawTx()
})

afterEach(() => {
  mockApi.restore()
})

describe('BitcoinClient Test', () => {
  const btcClient = new Client('mainnet', NODE_URL, NODE_API_KEY)
  let address: string
  const MEMO = 'SWAP:THOR.RUNE'
  // please don't touch the tBTC in these
  const phraseOne = 'cycle join secret hospital slim party write price myth okay long slight'
  const addyOne = 'tb1qvgn58ktpaacpzp6w8fdjgk9dfgv28gytvvhd5a'
  const phraseTwo = 'heavy spin someone rice laptop minor dice deal fever praise reject panic'
  const addyTwo = 'tb1qmyq44gzke8vzzj0npun6xla4anj92ghqn0g0qn'

  const testWallet = makeWallet()

  it('should have the correct bitcoin network right prefix', () => {
    const network = btcClient.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    expect(network.bech32).toEqual('bc')
  })

  it('should update net', () => {
    const net = 'testnet'
    btcClient.setNetwork(net)
    const network = btcClient.getNetwork() == 'testnet' ? Bitcoin.networks.testnet : Bitcoin.networks.bitcoin
    expect(network.bech32).toEqual('tb')
  })

  it('should generate a valid phrase', () => {
    const _phrase = btcClient.generatePhrase()
    const valid = asgardexCrypto.validatePhrase(_phrase)
    expect(valid).toBeTruthy()
  })

  it('set phrase should return correct address', () => {
    const result = btcClient.setPhrase(testWallet.phrase)
    expect(result).toEqual(testWallet.address)
  })

  it('should throw an error for setting a bad phrase', () => {
    expect(() => {
      btcClient.setPhrase('cat')
    }).toThrow()
  })

  it('should not throw an error for setting a good phrase', () => {
    expect(btcClient.setPhrase(PHRASE)).toBeUndefined
  })

  it('should validate the right address', () => {
    btcClient.setPhrase(testWallet.phrase)
    btcClient.setNetwork(testWallet.network)

    address = btcClient.getAddress()
    const valid = btcClient.validateAddress(address)
    expect(address).toEqual(testWallet.address)
    expect(valid).toBeTruthy()
  })

  it('should get the right balance', async () => {
    const expectedBalance = [
      {
        coin: 'BTC.BTC',
        amount: responses.getAddressResponse.address.balance,
      },
    ]
    btcClient.setPhrase(testWallet.phrase)
    const balance = await btcClient.getBalance()
    expect(balance.length).toEqual(expectedBalance.length)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance[0].amount)
  })

  it('should get the right balance when scanUTXOs is called twice', async () => {
    const expectedBalance = [
      {
        coin: 'BTC.BTC',
        amount: responses.getAddressResponse.address.balance,
      },
    ]
    btcClient.purgeClient()
    btcClient.setNetwork(testWallet.network)
    btcClient.setPhrase(testWallet.phrase)

    const balance = await btcClient.getBalance()
    expect(balance.length).toEqual(expectedBalance.length)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance[0].amount)

    const newBalance = await btcClient.getBalance()
    expect(newBalance.length).toEqual(expectedBalance.length)
    expect(newBalance[0].amount.amount().toNumber()).toEqual(expectedBalance[0].amount)
  })

  // it('should get the right history', async () => {
  //   const net = 'testnet'
  //   btcClient.purgeClient()
  //   btcClient.setNetwork(net)
  //   btcClient.setPhrase(PHRASE)
  //   address = btcClient.getAddress()
  //   const txArray = await btcClient.getTransactions(address)
  //   expect(txArray[1].txid).toEqual('7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8')
  // })

  it('should broadcast a normal transfer', async () => {
    btcClient.purgeClient()
    btcClient.setNetwork('testnet')
    btcClient.setPhrase(phraseOne)
    const asset = assetFromString('BTC.BTC')!
    const amount = baseAmount(2223)
    try {
      const txid = await btcClient.transfer({ asset, recipient: addyTwo, amount, feeRate: 1 })
      expect(txid).toEqual(expect.any(String))
    } catch (err) {
      console.log('ERR running test', err)
    }
  })

  it('should purge phrase and utxos', async () => {
    btcClient.purgeClient()
    expect(() => {
      btcClient.getAddress()
    }).toThrow('Phrase not set')
    expect(async () => {
      await btcClient.getBalance()
    }).rejects.toThrow('Phrase not set')
  })

  it('should do broadcast a vault transfer with a memo', async () => {
    const net = 'testnet'
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phraseTwo)

    const asset = assetFromString('BTC.BTC')!
    const amount = baseAmount(2223)
    try {
      const txid = await btcClient.transfer({
        asset,
        recipient: addyOne,
        amount,
        memo: MEMO,
        feeRate: 1,
      })
      expect(txid).toEqual(expect.any(String))
    } catch (err) {
      console.log('ERR running test', err)
    }
  })

  it('should get the balance of an address without phrase', async () => {
    const expectedBalance = [
      {
        coin: 'BTC.BTC',
        amount: responses.getAddressResponse.address.balance,
      },
    ]
    const balance = await btcClient.getBalance(address)
    expect(balance.length).toEqual(expectedBalance.length)
    expect(balance[0].amount.amount().toNumber()).toEqual(expectedBalance[0].amount)
  })

  it('should prevent a tx when fees and valueOut exceed balance', async () => {
    mockApi.restore()
    const net = 'testnet'
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(phraseOne)

    const asset = assetFromString('BTC.BTC')!
    const amount = baseAmount(9999999999)
    expect(async () => await btcClient.transfer({ asset, recipient: addyTwo, amount, feeRate: 1 })).rejects.toThrow(
      'Balance insufficient for transaction',
    )
  })

  it('should return estimated fees of a normal tx', async () => {
    const net = 'testnet'
    btcClient.setNetwork(net)
    btcClient.setPhrase(PHRASE)
    const estimates = await btcClient.getFees()
    expect(estimates.fast).toEqual(expect.any(Number))
    expect(estimates.fastest).toEqual(expect.any(Number))
    expect(estimates.average).toEqual(expect.any(Number))
  })

  it('should return estimated fees of a vault tx that are more expensive than a normal tx', async () => {
    const net = 'testnet'
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(PHRASE)
    const normalTx = await btcClient.getFees()
    const vaultTx = await btcClient.getFeesWithMemo(MEMO)
    expect(vaultTx.fast!).toBeGreaterThan(normalTx.fast!)
  })

  // it('should calculate average block publish time', async () => {
  //   const blockTimes = await btcClient.getBlockTime()
  //   expect(blockTimes).toBeGreaterThan(1)
  // })

  it('should error when an invalid address is provided', async () => {
    const net = 'testnet'
    btcClient.purgeClient()
    btcClient.setNetwork(net)
    btcClient.setPhrase(PHRASE)
    const invalidAddress = 'error_address'

    const asset = assetFromString('BTC.BTC')!
    const amount = baseAmount(99000)
    expect(async () => await btcClient.getBalance(invalidAddress)).rejects.toThrow('Invalid address')
    // expect(async () => await btcClient.getTransactions(invalidAddress)).rejects.toThrow('Invalid address')
    expect(
      async () => await btcClient.transfer({ asset, recipient: invalidAddress, amount, feeRate: 1 }),
    ).rejects.toThrow('Invalid address')
  })
})
