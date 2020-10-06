require('dotenv').config()
import { Client as BinanceClient, Network, Balance, Path } from '../src/client'

describe('BinanceClient Test', () => {
  // Note: This phrase is created by https://iancoleman.io/bip39/ and will never been used in a real-world
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const bnbClient = new BinanceClient({ phrase, network: Network.MAIN })
  const mainnetaddress = 'bnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9e738vr'
  const testnetAddress = 'tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj'
  const transferFee = { average: 37500 }
  const freezeFee = 500000
  const freezeAmount = 500000
  const testnetBNBBalance: Balance = {
    coin: 'BNB',
    amount: 1088887500,
    frozenAmount: 10000000,
  }

  // tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7 is used for testing transaction.
  // it needs to have balances.
  const phraseForTX = 'wheel leg dune emerge sudden badge rough shine convince poet doll kiwi sleep labor hello'
  const testnetAddressForTx = 'tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7'

  it('should start with empty wallet', async () => {
    const bnbClientEmptyMain = new BinanceClient({ phrase, network: Network.MAIN })
    const addressMain = bnbClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnetaddress)
    
    const bnbClientEmptyTest = new BinanceClient({ phrase, network: Network.TEST })
    const addressTest = bnbClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnetAddress)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new BinanceClient({ phrase: 'invalid phrase', network: Network.MAIN })
    }).toThrow()
  })

  it('should have right address', async () => {
    expect(bnbClient.getAddress()).toEqual(mainnetaddress)
  })

  it('should update net', () => {
    const client = new BinanceClient({ phrase, network: Network.MAIN })
    client.setNetwork(Network.TEST)
    expect(client.getNetwork()).toEqual(Network.TEST)
    expect(client.getAddress()).toEqual(testnetAddress)
  })

  it('setPhrase should return addres', () => {
    expect(bnbClient.setPhrase(phrase)).toEqual(mainnetaddress)

    bnbClient.setNetwork(Network.TEST)
    expect(bnbClient.setPhrase(phrase)).toEqual(testnetAddress)
  })

  it('should generate phrase', () => {
    const client = new BinanceClient({ phrase, network: Network.MAIN })
    expect(client.getAddress()).toEqual(mainnetaddress)

    client.setPhrase(BinanceClient.generatePhrase())
    expect(client.getAddress()).toBeTruthy()
    expect(client.getAddress()).not.toEqual(mainnetaddress)
  })

  it('should validate address', () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork(Network.MAIN)
    bnbClient.setPhrase(phrase)
    expect(bnbClient.validateAddress(mainnetaddress)).toBeTruthy()

    bnbClient.setNetwork(Network.TEST)
    expect(bnbClient.validateAddress(testnetAddress)).toBeTruthy()
  })

  it('should return explorer URL for mainnet', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork(Network.MAIN)
    bnbClient.setPhrase(phrase)

    const addressURL = await bnbClient.getExplorerUrl(Path.address, mainnetaddress)
    expect(addressURL).toEqual(`https://explorer.binance.org/address/${mainnetaddress}`)
    const txURL = await bnbClient.getExplorerUrl(Path.tx, 'D95CC7F92C2B494885F37C7CEFEB4F7127605908C8A65FA421D4B31DD2994D6B')
    expect(txURL).toEqual('https://explorer.binance.org/tx/D95CC7F92C2B494885F37C7CEFEB4F7127605908C8A65FA421D4B31DD2994D6B')
  })

  it('should return explorer URL for testnet', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork(Network.TEST)
    bnbClient.setPhrase(phrase)
    
    const addressURL = await bnbClient.getExplorerUrl(Path.address, testnetAddress)
    expect(addressURL).toEqual(`https://testnet-explorer.binance.org/address/${testnetAddress}`)
    const txURL = await bnbClient.getExplorerUrl(Path.tx, 'D95CC7F92C2B494885F37C7CEFEB4F7127605908C8A65FA421D4B31DD2994D6B')
    expect(txURL).toEqual('https://testnet-explorer.binance.org/tx/D95CC7F92C2B494885F37C7CEFEB4F7127605908C8A65FA421D4B31DD2994D6B')
  })

  it('has no balances', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork(Network.MAIN)
    bnbClient.setPhrase(phrase)

    const emptyBalances: Balance[] = []
    expect(await bnbClient.getBalance('bnb1v8cprldc948y7mge4yjept48xfqpa46mmcrpku')).toEqual(emptyBalances)
  })

  it('has balances', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork(Network.TEST)
    bnbClient.setPhrase(phrase)

    expect(await bnbClient.getBalance('tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj', 'BNB')).toEqual([testnetBNBBalance])
  })

  // it('has an empty tx history', async () => {
  //   const txArray = await bnbClient.getTransactions()
  //   expect(txArray).toEqual({ total: 0, tx: [] })
  // })

  it('fetches the fees', async () => {
    bnbClient.purgeClient()
    bnbClient.setNetwork(Network.MAIN)
    bnbClient.setPhrase(phrase)

    const fees = await bnbClient.getFees()
    expect(fees).toEqual(transferFee)
  })

  it('should broadcast a transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: Network.TEST })
    expect(client.getAddress()).toEqual(testnetAddressForTx)
    
    const beforeTransfer = await client.getBalance()

    // feeRate should be optional
    const txHash = await client.transfer({ asset: 'BNB', recipient: 'tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7', amount: 1, feeRate: 0 })
    expect(txHash).toEqual(expect.any(String))

    const afterTransfer = await client.getBalance()
    expect(afterTransfer[0].amount).toEqual(beforeTransfer[0].amount - transferFee.average)
  })

  it('should deposit', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: Network.TEST })
    expect(client.getAddress()).toEqual(testnetAddressForTx)

    const beforeTransfer = await client.getBalance()
    
    // feeRate should be optional
    const txHash = await client.deposit({ asset: 'BNB', recipient: 'tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7', amount: 1, feeRate: 0 })
    expect(txHash).toEqual(expect.any(String))

    const afterTransfer = await client.getBalance()
    expect(afterTransfer[0].amount).toEqual(beforeTransfer[0].amount - transferFee.average)
  })

  it('should freeze/unfreeze token', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: Network.TEST })
    expect(client.getAddress()).toEqual(testnetAddressForTx)

    const beforeFreeze = await client.getBalance()

    let txHash = await client.freeze({ asset: 'BNB', amount: freezeAmount})
    expect(txHash).toEqual(expect.any(String))

    const afterFreeze = await client.getBalance()

    txHash = await client.unfreeze({ asset: 'BNB', amount: freezeAmount})
    expect(txHash).toEqual(expect.any(String))
    
    const afterUnFreeze = await client.getBalance()

    expect(afterFreeze[0].amount).toEqual(beforeFreeze[0].amount - freezeAmount - freezeFee)
    expect(afterFreeze[0].frozenAmount).toEqual(freezeAmount)

    expect(afterUnFreeze[0].amount).toEqual(beforeFreeze[0].amount - freezeFee * 2)
    expect(afterUnFreeze[0].frozenAmount).toEqual(0)
  })
})
