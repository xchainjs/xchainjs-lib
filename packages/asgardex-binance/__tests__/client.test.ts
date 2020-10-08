require('dotenv').config()
import { Client as BinanceClient } from '../src/client'
import { AssetBNB } from '@thorchain/asgardex-util'
import { baseAmountToNumber, bigToBaseAmount, baseAmountToBig } from '../src/util'

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

describe('BinanceClient Test', () => {
  // Note: This phrase is created by https://iancoleman.io/bip39/ and will never been used in a real-world
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const bnbClient = new BinanceClient({ phrase, network: 'mainnet' })
  const mainnetaddress = 'bnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9e738vr'
  const testnetAddress = 'tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj'
  const transferFee = { type: 'base', average: 37500 }
  const multiSendFee = { type: 'base', average: 30000 }
  const freezeFee = { type: 'base', average: 500000 }
  const freezeAmount = 500000

  // tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7 is used for testing transaction.
  // it needs to have balances.
  const phraseForTX = 'wheel leg dune emerge sudden badge rough shine convince poet doll kiwi sleep labor hello'
  const testnetAddressForTx = 'tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7'

  // For API rate limit
  afterEach(async () => {
    await new Promise(res => setTimeout(res, 1000))
  })

  it('should start with empty wallet', async () => {
    const bnbClientEmptyMain = new BinanceClient({ phrase, network: 'mainnet' })
    const addressMain = bnbClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnetaddress)
    
    const bnbClientEmptyTest = new BinanceClient({ phrase, network: 'testnet' })
    const addressTest = bnbClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnetAddress)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new BinanceClient({ phrase: 'invalid phrase', network: 'mainnet' })
    }).toThrow()
  })

  it('should have right address', async () => {
    expect(bnbClient.getAddress()).toEqual(mainnetaddress)
  })

  it('should update net', () => {
    const client = new BinanceClient({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')
    expect(client.getAddress()).toEqual(testnetAddress)
  })

  it('setPhrase should return addres', () => {
    expect(bnbClient.setPhrase(phrase)).toEqual(mainnetaddress)

    bnbClient.setNetwork('testnet')
    expect(bnbClient.setPhrase(phrase)).toEqual(testnetAddress)
  })

  it('should generate phrase', () => {
    const client = new BinanceClient({ phrase, network: 'mainnet' })
    expect(client.getAddress()).toEqual(mainnetaddress)

    client.setPhrase(BinanceClient.generatePhrase())
    expect(client.getAddress()).toBeTruthy()
    expect(client.getAddress()).not.toEqual(mainnetaddress)
  })

  it('should validate address', () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('mainnet')
    bnbClient.setPhrase(phrase)
    expect(bnbClient.validateAddress(mainnetaddress)).toBeTruthy()

    bnbClient.setNetwork('testnet')
    expect(bnbClient.validateAddress(testnetAddress)).toBeTruthy()
  })

  it('has no balances', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('mainnet')
    bnbClient.setPhrase(phrase)

    const balances = await bnbClient.getBalance('bnb1v8cprldc948y7mge4yjept48xfqpa46mmcrpku')
    expect(balances).toEqual([])
  })

  it('has balances', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('testnet')
    bnbClient.setPhrase(phrase)

    const balances = await bnbClient.getBalance('tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj', AssetBNB)
    expect(balances.length).toEqual(1)

    const amount = balances[0].amount
    const frozenAmount = balances[0].frozenAmount
    expect(baseAmountToBig(amount)).toEqual('12.890875')
    expect(balances[0].frozenAmount).toBeTruthy()
    if (frozenAmount) {
      expect(baseAmountToBig(frozenAmount)).toEqual('0.1')
    }
  })

  it('fetches the transfer fees', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('mainnet')
    bnbClient.setPhrase(phrase)

    const fees = await bnbClient.getFees()
    expect(fees).toEqual(transferFee)
  })

  it('fetches the multisend fees', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('mainnet')
    bnbClient.setPhrase(phrase)

    const fees = await bnbClient.getMultiSendFees()
    expect(fees).toEqual(multiSendFee)
  })

  it('fetches the freeze fees', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('mainnet')
    bnbClient.setPhrase(phrase)

    const fees = await bnbClient.getFreezeFees()
    expect(fees).toEqual(freezeFee)
  })

  it('should broadcast a transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetAddressForTx)
    
    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)

    // feeRate should be optional
    const txHash = await client.transfer({ asset: AssetBNB, recipient: testnetAddressForTx, amount: bigToBaseAmount(0.001) })
    await delay(1000) //delay after transaction
    expect(txHash).toEqual(expect.any(String))

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)
    expect(baseAmountToNumber(afterTransfer[0].amount)).toEqual(baseAmountToNumber(beforeTransfer[0].amount) - transferFee.average)
  })

  it('should deposit', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetAddressForTx)

    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)
    
    // feeRate should be optional
    const txHash = await client.deposit({ asset: AssetBNB, recipient: testnetAddressForTx, amount: bigToBaseAmount(0.001) })
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)
    expect(baseAmountToNumber(afterTransfer[0].amount)).toEqual(baseAmountToNumber(beforeTransfer[0].amount) - transferFee.average)
  })

  it('should freeze token', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetAddressForTx)

    const beforeFreeze = await client.getBalance()
    expect(beforeFreeze.length).toEqual(1)

    const txHash = await client.freeze({ asset: AssetBNB, amount: bigToBaseAmount(freezeAmount / 1e8)})
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction

    const afterFreeze = await client.getBalance()
    expect(afterFreeze.length).toEqual(1)

    expect(baseAmountToNumber(afterFreeze[0].amount)).toEqual(baseAmountToNumber(beforeFreeze[0].amount) - freezeAmount - freezeFee.average)
    expect(afterFreeze[0].frozenAmount).toBeTruthy()
    if (beforeFreeze[0].frozenAmount && afterFreeze[0].frozenAmount) {
      expect(baseAmountToNumber(afterFreeze[0].frozenAmount)).toEqual(baseAmountToNumber(beforeFreeze[0].frozenAmount) + freezeAmount)
    }
  })

  it('should unfreeze token', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetAddressForTx)

    const beforeUnFreeze = await client.getBalance()
    expect(beforeUnFreeze.length).toEqual(1)

    const txHash = await client.unfreeze({ asset: AssetBNB, amount: bigToBaseAmount(freezeAmount / 1e8)})
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction
    
    const afterUnFreeze = await client.getBalance()
    expect(afterUnFreeze.length).toEqual(1)

    expect(baseAmountToNumber(afterUnFreeze[0].amount)).toEqual(baseAmountToNumber(beforeUnFreeze[0].amount) + freezeAmount - freezeFee.average)
    expect(afterUnFreeze[0].frozenAmount).toBeTruthy()
    if (beforeUnFreeze[0].frozenAmount && afterUnFreeze[0].frozenAmount) {
      expect(baseAmountToNumber(afterUnFreeze[0].frozenAmount)).toEqual(baseAmountToNumber(beforeUnFreeze[0].frozenAmount) - freezeAmount)
    }
  })

  it('should broadcast a multi transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetAddressForTx)
    
    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)

    const transactions = [
      {
        to: testnetAddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: bigToBaseAmount(0.001)
          }
        ]
      },
      {
        to: testnetAddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: bigToBaseAmount(0.001)
          }
        ]
      },
      {
        to: testnetAddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: bigToBaseAmount(0.001)
          }
        ]
      }
    ];
    const txHash = await client.multiSend({ transactions })

    await delay(1000) //delay after transaction
    expect(txHash).toEqual(expect.any(String))

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)
    expect(baseAmountToNumber(afterTransfer[0].amount)).toEqual(baseAmountToNumber(beforeTransfer[0].amount) - multiSendFee.average * transactions.length)
  })

  it('has an empty tx history', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('mainnet')
    bnbClient.setPhrase(phrase)

    const txArray = await bnbClient.getTransactions()
    expect(txArray).toEqual({ total: 0, txs: [] })
  })

  it('has tx history', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork('testnet')
    bnbClient.setPhrase(phrase)

    const txArray = await bnbClient.getTransactions({ address: testnetAddressForTx })
    expect(txArray.total).toBeTruthy()
    expect(txArray.txs.length).toBeTruthy()
  })
})
