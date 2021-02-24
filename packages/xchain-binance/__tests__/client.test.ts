import nock from 'nock'

import { Client as BinanceClient } from '../src/client'
import { AssetBNB, baseAmount } from '@xchainjs/xchain-util'
import { Account, Fees, TransactionResult, TxPage } from '../src/types/binance'

const mockGetAccount = (url: string, address: string, result: Account, ntimes = 1, status = 200) => {
  nock(url).get(`/api/v1/account/${address}`).times(ntimes).reply(status, result)
}

const mockGetFees = (url: string, result: Fees) => {
  nock(url).get('/api/v1/fees').reply(200, result)
}

const mockTxHash = (url: string, hash: string, result: TransactionResult) => {
  nock(url).get(`/api/v1/tx/${hash}?format=json`).reply(200, result)
}

const mockSearchTransactions = (url: string, result: TxPage) => {
  nock(url)
    .get(`/api/v1/transactions`)
    .query((_) => true)
    .reply(200, result)
}

const mockNodeInfo = (url: string) => {
  nock(url)
    .get('/api/v1/node-info')
    .reply(200, {
      node_info: {
        network: 'Binance-Chain-Ganges',
      },
    })
}

const mockTxSend = (url: string) => {
  nock(url)
    .post('/api/v1/broadcast?sync=true')
    .reply(200, [
      {
        code: 0,
        hash: '90F7F45652D05800EED577CBA805A6858C3867E08A07D627BECC0D6304E52A31',
        log: 'Msg 0: ',
        ok: true,
      },
    ])
}

describe('BinanceClient Test', () => {
  let bnbClient: BinanceClient

  // Note: This phrase is created by https://iancoleman.io/bip39/ and will never been used in a real-world
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnetaddress = 'bnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9e738vr'
  const testnetaddress = 'tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj'

  const singleTxFee = baseAmount(37500)
  const transferFee = { type: 'base', average: singleTxFee, fast: singleTxFee, fastest: singleTxFee }
  const multiTxFee = baseAmount(30000)
  const multiSendFee = { type: 'base', average: multiTxFee, fast: multiTxFee, fastest: multiTxFee }

  const transferAmount = baseAmount(1000000)

  const phraseForTX = 'wheel leg dune emerge sudden badge rough shine convince poet doll kiwi sleep labor hello'
  const testnetaddressForTx = 'tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7'

  const mainnetClientURL = 'https://dex.binance.org'
  const testnetClientURL = 'https://testnet-dex.binance.org'

  beforeEach(async () => {
    bnbClient = new BinanceClient({ phrase, network: 'mainnet' })
  })

  afterEach(async () => {
    bnbClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const bnbClientEmptyMain = new BinanceClient({ phrase, network: 'mainnet' })
    const addressMain = bnbClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnetaddress)

    const bnbClientEmptyTest = new BinanceClient({ phrase, network: 'testnet' })
    const addressTest = bnbClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnetaddress)
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
    expect(client.getAddress()).toEqual(testnetaddress)
  })

  it('setPhrase should return addres', () => {
    expect(bnbClient.setPhrase(phrase)).toEqual(mainnetaddress)

    bnbClient.setNetwork('testnet')
    expect(bnbClient.setPhrase(phrase)).toEqual(testnetaddress)
  })

  it('should validate address', () => {
    expect(bnbClient.validateAddress(mainnetaddress)).toBeTruthy()

    bnbClient.setNetwork('testnet')
    expect(bnbClient.validateAddress(testnetaddress)).toBeTruthy()
  })

  it('has no balances', async () => {
    mockGetAccount(mainnetClientURL, 'bnb1v8cprldc948y7mge4yjept48xfqpa46mmcrpku', {
      account_number: 0,
      address: 'bnb1v8cprldc948y7mge4yjept48xfqpa46mmcrpku',
      balances: [],
      public_key: [],
      sequence: 0,
    })
    let balances = await bnbClient.getBalance('bnb1v8cprldc948y7mge4yjept48xfqpa46mmcrpku')
    expect(balances).toEqual([])

    mockGetAccount(
      mainnetClientURL,
      'bnb1ja07feunxx6z9kue3fn05dazt0gpn4y9e5t8rn',
      {
        account_number: 0,
        address: '',
        balances: [],
        public_key: [],
        sequence: 0,
      },
      1,
      404,
    )
    balances = await bnbClient.getBalance('bnb1ja07feunxx6z9kue3fn05dazt0gpn4y9e5t8rn')
    expect(balances).toEqual([])
  })

  it('has balances', async () => {
    bnbClient.setNetwork('testnet')

    mockGetAccount(testnetClientURL, 'tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj', {
      account_number: 29408,
      address: 'tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj',
      balances: [
        {
          free: '12.89087500',
          frozen: '0.10000000',
          locked: '0.00000000',
          symbol: 'BNB',
        },
      ],
      public_key: [],
      sequence: 5,
    })

    const balances = await bnbClient.getBalance('tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj', [AssetBNB])
    expect(balances.length).toEqual(1)

    const amount = balances[0].amount

    expect(amount.amount().isEqualTo(1289087500)).toBeTruthy()
  })

  it('fetches the transfer fees', async () => {
    mockGetFees(mainnetClientURL, [
      {
        msg_type: 'tokensFreeze',
        fee: 500000,
        fee_for: 1,
      },
      {
        fixed_fee_params: {
          msg_type: 'send',
          fee: 37500,
          fee_for: 1,
        },
        multi_transfer_fee: 30000,
        lower_limit_as_multi: 2,
      },
    ])

    const fees = await bnbClient.getFees()
    expect(fees.type).toEqual(transferFee.type)
    expect(fees.average.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
    expect(fees.fast.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
    expect(fees.fastest.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
  })

  it('fetches the multisend fees', async () => {
    mockGetFees(mainnetClientURL, [
      {
        msg_type: 'tokensFreeze',
        fee: 500000,
        fee_for: 1,
      },
      {
        fixed_fee_params: {
          msg_type: 'send',
          fee: 37500,
          fee_for: 1,
        },
        multi_transfer_fee: 30000,
        lower_limit_as_multi: 2,
      },
    ])

    const fees = await bnbClient.getMultiSendFees()
    expect(fees.type).toEqual(multiSendFee.type)
    expect(fees.average.amount().isEqualTo(multiTxFee.amount())).toBeTruthy()
    expect(fees.fast.amount().isEqualTo(multiTxFee.amount())).toBeTruthy()
    expect(fees.fastest.amount().isEqualTo(multiTxFee.amount())).toBeTruthy()
  })

  it('fetches single and multi fees', async () => {
    mockGetFees(mainnetClientURL, [
      {
        msg_type: 'tokensFreeze',
        fee: 500000,
        fee_for: 1,
      },
      {
        fixed_fee_params: {
          msg_type: 'send',
          fee: 37500,
          fee_for: 1,
        },
        multi_transfer_fee: 30000,
        lower_limit_as_multi: 2,
      },
    ])

    const { single, multi } = await bnbClient.getSingleAndMultiFees()
    expect(single.type).toEqual(transferFee.type)
    expect(single.average.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
    expect(single.fast.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()
    expect(single.fastest.amount().isEqualTo(singleTxFee.amount())).toBeTruthy()

    expect(multi.type).toEqual(multiSendFee.type)
    expect(multi.average.amount().isEqualTo(multiTxFee.amount())).toBeTruthy()
    expect(multi.fast.amount().isEqualTo(multiTxFee.amount())).toBeTruthy()
    expect(multi.fastest.amount().isEqualTo(multiTxFee.amount())).toBeTruthy()
  })

  it('should broadcast a transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)

    mockGetAccount(
      testnetClientURL,
      testnetaddressForTx,
      {
        account_number: 0,
        address: testnetaddressForTx,
        balances: [
          {
            free: '1.00037500',
            frozen: '0.10000000',
            locked: '0.00000000',
            symbol: 'BNB',
          },
        ],
        public_key: [],
        sequence: 0,
      },
      3,
    )

    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)

    mockNodeInfo(testnetClientURL)
    mockTxSend(testnetClientURL)

    const txHash = await client.transfer({ asset: AssetBNB, recipient: testnetaddressForTx, amount: transferAmount })
    expect(txHash).toEqual(expect.any(String))

    mockGetAccount(testnetClientURL, testnetaddressForTx, {
      account_number: 0,
      address: testnetaddressForTx,
      balances: [
        {
          free: '1.00000000',
          frozen: '0.10000000',
          locked: '0.00000000',
          symbol: 'BNB',
        },
      ],
      public_key: [],
      sequence: 0,
    })

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)

    const expected = beforeTransfer[0].amount
      .amount()
      .minus(transferFee.average.amount())
      .isEqualTo(afterTransfer[0].amount.amount())
    expect(expected).toBeTruthy()
  })

  it('should broadcast a multi transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)

    mockGetAccount(
      testnetClientURL,
      testnetaddressForTx,
      {
        account_number: 0,
        address: testnetaddressForTx,
        balances: [
          {
            free: '1.00090000',
            frozen: '0.10000000',
            locked: '0.00000000',
            symbol: 'BNB',
          },
        ],
        public_key: [],
        sequence: 0,
      },
      3,
    )

    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)

    const transactions = [
      {
        to: testnetaddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: transferAmount,
          },
        ],
      },
      {
        to: testnetaddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: transferAmount,
          },
        ],
      },
      {
        to: testnetaddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: transferAmount,
          },
        ],
      },
    ]

    mockNodeInfo(testnetClientURL)
    mockTxSend(testnetClientURL)

    const txHash = await client.multiSend({ transactions })
    expect(txHash).toEqual(expect.any(String))

    mockGetAccount(testnetClientURL, testnetaddressForTx, {
      account_number: 0,
      address: testnetaddressForTx,
      balances: [
        {
          free: '1.00000000',
          frozen: '0.10000000',
          locked: '0.00000000',
          symbol: 'BNB',
        },
      ],
      public_key: [],
      sequence: 0,
    })

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)

    const expected = beforeTransfer[0].amount
      .amount()
      .minus(multiSendFee.average.amount().multipliedBy(transactions.length))
      .isEqualTo(afterTransfer[0].amount.amount())
    expect(expected).toBeTruthy()
  })

  it('has an empty tx history', async () => {
    const bnbClientEmptyMain = new BinanceClient({
      phrase: 'nose link choose blossom social craft they better render provide escape talk',
      network: 'mainnet',
    })

    mockSearchTransactions(mainnetClientURL, {
      total: 0,
      tx: [],
    })

    const txArray = await bnbClientEmptyMain.getTransactions()
    expect(txArray).toEqual({ total: 0, txs: [] })
  })

  it('has tx history', async () => {
    bnbClient.setNetwork('testnet')

    mockSearchTransactions(testnetClientURL, {
      total: 1,
      tx: [
        {
          txHash: 'A9E8E05603658BF3A295F04C856FE69E79EDA7375A307369F37411939BC321BB',
          blockHeight: 85905063,
          txType: 'TRANSFER',
          timeStamp: '2020-11-06T12:38:42.889Z',
          fromAddr: testnetaddressForTx,
          toAddr: 'bnb14qsnqxrjg68k5w6duq4fseap6fkg9m8fspz8f2',
          value: '1000',
          txAsset: 'BNB',
          txFee: '0.00000000',
          proposalId: null,
          txAge: 10,
          orderId: 'EB54F541FAA756D3666DC8C9B9931FAC1D19CAC3-192151',
          code: 0,
          data: '',
          confirmBlocks: 0,
          memo: '',
          source: 100,
          sequence: 192150,
        },
      ],
    })

    const txArray = await bnbClient.getTransactions({ address: testnetaddressForTx })
    expect(txArray.total).toBeTruthy()
    expect(txArray.txs.length).toBeTruthy()
  })

  it('get transaction data', async () => {
    mockTxHash(mainnetClientURL, 'A9E8E05603658BF3A295F04C856FE69E79EDA7375A307369F37411939BC321BB', {
      hash: 'A9E8E05603658BF3A295F04C856FE69E79EDA7375A307369F37411939BC321BB',
      log: 'Msg 0: ',
      height: '85905063',
      code: 0,
      tx: {
        type: 'auth/StdTx',
        value: {
          data: null,
          memo: 'SWAP:THOR.RUNE',
          msg: [
            {
              type: 'cosmos-sdk/Send',
              value: {
                inputs: [
                  {
                    address: 'bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m',
                    coins: [
                      {
                        amount: 107167590000000,
                        denom: 'BNB',
                      },
                    ],
                  },
                ],
                outputs: [
                  {
                    address: 'bnb1fm4gqjxkrdfk8f23xjv6yfx3k7vhrdck8qp6a6',
                    coins: [
                      {
                        amount: 107167590000000,
                        denom: 'BNB',
                      },
                    ],
                  },
                ],
              },
            },
          ],
          signatures: [
            {
              account_number: 496097,
              pub_key: Buffer.from(''),
              sequence: 0,
              signature: Buffer.from(''),
            },
          ],
          source: 0,
        },
      },
    })
    mockSearchTransactions(mainnetClientURL, {
      total: 0,
      tx: [
        {
          txHash: 'A9E8E05603658BF3A295F04C856FE69E79EDA7375A307369F37411939BC321BB',
          blockHeight: 85905063,
          txType: 'TRANSFER',
          timeStamp: '2020-11-06T12:38:42.889Z',
          fromAddr: 'bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m',
          toAddr: 'bnb1fm4gqjxkrdfk8f23xjv6yfx3k7vhrdck8qp6a6',
          value: '1071675.9',
          txAsset: 'BNB',
          txFee: '0.00000000',
          proposalId: null,
          txAge: 10,
          orderId: 'EB54F541FAA756D3666DC8C9B9931FAC1D19CAC3-192151',
          code: 0,
          data: '',
          confirmBlocks: 0,
          memo: '',
          source: 100,
          sequence: 192150,
        },
      ],
    })
    const tx = await bnbClient.getTransactionData('A9E8E05603658BF3A295F04C856FE69E79EDA7375A307369F37411939BC321BB')
    expect(tx.hash).toEqual('A9E8E05603658BF3A295F04C856FE69E79EDA7375A307369F37411939BC321BB')
    expect(tx.from[0].from).toEqual('bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m')
    expect(tx.from[0].amount.amount().isEqualTo(baseAmount(107167590000000, 8).amount())).toBeTruthy()
    expect(tx.to[0].to).toEqual('bnb1fm4gqjxkrdfk8f23xjv6yfx3k7vhrdck8qp6a6')
    expect(tx.to[0].amount.amount().isEqualTo(baseAmount(107167590000000, 8).amount())).toBeTruthy()
  })

  it('should return valid explorer url', () => {
    // Client created with network === 'mainnet'
    expect(bnbClient.getExplorerUrl()).toEqual('https://explorer.binance.org')

    bnbClient.setNetwork('testnet')
    expect(bnbClient.getExplorerUrl()).toEqual('https://testnet-explorer.binance.org')
  })

  it('should retrun valid explorer address url', () => {
    expect(bnbClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://explorer.binance.org/address/anotherTestAddressHere',
    )

    bnbClient.setNetwork('testnet')
    expect(bnbClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://testnet-explorer.binance.org/address/testAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    expect(bnbClient.getExplorerTxUrl('anotherTestTxHere')).toEqual('https://explorer.binance.org/tx/anotherTestTxHere')

    bnbClient.setNetwork('testnet')
    expect(bnbClient.getExplorerTxUrl('testTxHere')).toEqual('https://testnet-explorer.binance.org/tx/testTxHere')
  })
})
