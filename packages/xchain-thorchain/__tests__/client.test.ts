import nock from 'nock'

import { TxsPage } from '@xchainjs/xchain-client'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import { TxHistoryResponse, TxResponse } from '@xchainjs/xchain-cosmos'
import { BroadcastTxCommitResult, Coin, BaseAccount } from 'cosmos-client/api'
import { AssetRune } from '../src/types'
import { Client } from '../src/client'
import { DECIMAL } from '../src/util'

const mockAccountsAddress = (
  url: string,
  address: string,
  result: {
    height: number
    result: BaseAccount
  },
) => {
  nock(url).get(`/auth/accounts/${address}`).reply(200, result)
}

const mockAccountsBalance = (
  url: string,
  address: string,
  result: {
    height: number
    result: Coin[]
  },
) => {
  nock(url).get(`/bank/balances/${address}`).reply(200, result)
}

const assertTxsPost = (url: string, memo: undefined | string, result: BroadcastTxCommitResult): void => {
  nock(url)
    .post(`/txs`, (body) => {
      expect(body.tx.msg.length).toEqual(1)
      expect(body.tx.memo).toEqual(memo)
      return true
    })
    .reply(200, result)
}

const assertTxHstory = (url: string, address: string, result: TxHistoryResponse): void => {
  nock(url).get(`/txs?message.sender=${address}&limit=1`).reply(200, result)
}

const assertTxHashGet = (url: string, hash: string, result: TxResponse): void => {
  nock(url).get(`/txs/${hash}`).reply(200, result)
}

describe('Client Test', () => {
  let thorClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address = 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws'
  const testnet_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'

  beforeEach(() => {
    thorClient = new Client({ phrase, network: 'testnet' })
  })

  afterEach(() => {
    thorClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const thorClientEmptyMain = new Client({ phrase, network: 'mainnet' })
    const addressMain = thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address)

    const thorClientEmptyTest = new Client({ phrase, network: 'testnet' })
    const addressTest = thorClientEmptyTest.getAddress()
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
    expect(thorClient.getAddress()).toEqual(testnet_address)

    thorClient.setNetwork('mainnet')
    expect(thorClient.getAddress()).toEqual(mainnet_address)
  })

  it('should update net', async () => {
    const client = new Client({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')

    const address = await client.getAddress()
    expect(address).toEqual(testnet_address)
  })

  it('should init, should have right prefix', async () => {
    expect(thorClient.validateAddress(thorClient.getAddress())).toEqual(true)

    thorClient.setNetwork('mainnet')
    expect(thorClient.validateAddress(thorClient.getAddress())).toEqual(true)
  })

  it('should have right client url', async () => {
    expect(thorClient.getClientUrlByNetwork('mainnet')).toEqual('http://138.68.125.107:1317')
    expect(thorClient.getClientUrlByNetwork('testnet')).toEqual('https://testnet.thornode.thorchain.info')

    thorClient.setClientUrl({
      mainnet: 'new mainnet client',
      testnet: 'new testnet client',
    })

    expect(thorClient.getClientUrlByNetwork('mainnet')).toEqual('new mainnet client')
    expect(thorClient.getClientUrlByNetwork('testnet')).toEqual('new testnet client')

    thorClient.setNetwork('mainnet')
    expect(thorClient.getClientUrl()).toEqual('new mainnet client')

    thorClient.setNetwork('testnet')
    expect(thorClient.getClientUrl()).toEqual('new testnet client')
  })

  it('has no balances', async () => {
    mockAccountsBalance(thorClient.getClientUrl(), testnet_address, {
      height: 0,
      result: [],
    })
    const result = await thorClient.getBalance()
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    thorClient.setNetwork('mainnet')
    mockAccountsBalance(thorClient.getClientUrl(), 'thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5', {
      height: 0,
      result: [
        {
          denom: 'rune',
          amount: '100',
        },
      ],
    })
    const balances = await thorClient.getBalance('thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5')
    expect(balances.length).toEqual(1)
    expect(balances[0].asset).toEqual(AssetRune)
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
  })

  it('has an empty tx history', async () => {
    const expected: TxsPage = {
      total: 0,
      txs: [],
    }
    assertTxHstory(thorClient.getClientUrl(), testnet_address, {
      count: 0,
      limit: 30,
      page_number: 1,
      page_total: 1,
      total_count: 0,
      txs: [],
    })

    const transactions = await thorClient.getTransactions()
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    assertTxHstory(thorClient.getClientUrl(), testnet_address, {
      count: 1,
      limit: 30,
      page_number: 1,
      page_total: 1,
      total_count: 1,
      txs: [
        {
          height: 1047,
          txhash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
          raw_log: 'transaction logs',
          logs: [
            {
              msg_index: 0,
              log: '',
              events: [
                {
                  type: 'message',
                  attributes: [
                    {
                      key: 'action',
                      value: 'native_tx',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                  ],
                },
                {
                  type: 'transfer',
                  attributes: [
                    {
                      key: 'recipient',
                      value: 'tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                    {
                      key: 'amount',
                      value: '100000000rune',
                    },
                    {
                      key: 'recipient',
                      value: 'tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2',
                    },
                    {
                      key: 'sender',
                      value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                    },
                    {
                      key: 'amount',
                      value: '200000000000rune',
                    },
                  ],
                },
              ],
            },
          ],
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          timestamp: '2020-09-25T06:09:15Z',
        },
      ],
    })

    const transactions = await thorClient.getTransactions()
    expect(transactions.total).toEqual(1)
    expect(transactions.txs[0].asset).toEqual(AssetRune)
    expect(transactions.txs[0].from[0].from).toEqual('tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly')
    expect(transactions.txs[0].from[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
    expect(transactions.txs[0].from[1].from).toEqual('tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly')
    expect(transactions.txs[0].from[1].amount.amount().isEqualTo(baseAmount(200000000000, DECIMAL).amount())).toEqual(
      true,
    )
    expect(transactions.txs[0].to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
    expect(transactions.txs[0].to[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
    expect(transactions.txs[0].to[1].to).toEqual('tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2')
    expect(transactions.txs[0].to[1].amount.amount().isEqualTo(baseAmount(200000000000, DECIMAL).amount())).toEqual(
      true,
    )
  })

  it('transfer', async () => {
    const to_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
      logs: [],
    }

    mockAccountsAddress(thorClient.getClientUrl(), testnet_address, {
      height: 0,
      result: {
        coins: [
          {
            denom: 'rune',
            amount: '210000000',
          },
        ],
        account_number: '0',
        sequence: '0',
      },
    })
    mockAccountsBalance(thorClient.getClientUrl(), testnet_address, {
      height: 0,
      result: [
        {
          denom: 'rune',
          amount: '210000000',
        },
      ],
    })
    assertTxsPost(thorClient.getClientUrl(), memo, expected_txsPost_result)

    const result = await thorClient.transfer({
      asset: AssetRune,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('deposit', async () => {
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'swap:BNB.BNB:tbnb1ftzhmpzr4t8ta3etu4x7nwujf9jqckp3th2lh0'

    const expected_txsPost_result = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
      logs: [],
    }

    mockAccountsAddress(thorClient.getClientUrl(), testnet_address, {
      height: 0,
      result: {
        coins: [
          {
            denom: 'rune',
            amount: '210000000',
          },
        ],
        account_number: '0',
        sequence: '0',
      },
    })
    mockAccountsBalance(thorClient.getClientUrl(), testnet_address, {
      height: 0,
      result: [
        {
          denom: 'rune',
          amount: '210000000',
        },
      ],
    })
    assertTxsPost(thorClient.getClientUrl(), '', expected_txsPost_result)

    const result = await thorClient.deposit({
      asset: AssetRune,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('get transaction data', async () => {
    thorClient.setNetwork('mainnet')
    assertTxHashGet(thorClient.getClientUrl(), '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066', {
      height: 1047,
      txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
      raw_log: 'transaction logs',
      logs: [
        {
          msg_index: 0,
          log: '',
          events: [
            {
              type: 'message',
              attributes: [
                {
                  key: 'action',
                  value: 'native_tx',
                },
                {
                  key: 'sender',
                  value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                },
                {
                  key: 'sender',
                  value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                },
              ],
            },
            {
              type: 'transfer',
              attributes: [
                {
                  key: 'recipient',
                  value: 'tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw',
                },
                {
                  key: 'sender',
                  value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                },
                {
                  key: 'amount',
                  value: '100000000rune',
                },
                {
                  key: 'recipient',
                  value: 'tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2',
                },
                {
                  key: 'sender',
                  value: 'tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly',
                },
                {
                  key: 'amount',
                  value: '200000000000rune',
                },
              ],
            },
          ],
        },
      ],
      gas_wanted: '5000000000000000',
      gas_used: '148996',
      timestamp: '2020-09-25T06:09:15Z',
    })
    const tx = await thorClient.getTransactionData('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.type).toEqual('transfer')
    expect(tx.hash).toEqual('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.asset).toEqual(AssetRune)
    expect(tx.from[0].from).toEqual('tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly')
    expect(tx.from[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
    expect(tx.from[1].from).toEqual('tthor1dspn8ucrqfrnuxrgd5ljuc4elarurt0gkwxgly')
    expect(tx.from[1].amount.amount().isEqualTo(baseAmount(200000000000, DECIMAL).amount())).toEqual(true)
    expect(tx.to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
    expect(tx.to[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
    expect(tx.to[1].to).toEqual('tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2')
    expect(tx.to[1].amount.amount().isEqualTo(baseAmount(200000000000, DECIMAL).amount())).toEqual(true)
  })

  it('should return valid explorer url', () => {
    expect(thorClient.getExplorerUrl()).toEqual('https://thorchain.net')

    thorClient.setNetwork('mainnet')
    expect(thorClient.getExplorerUrl()).toEqual('https://thorchain.net')
  })

  it('should retrun valid explorer address url', () => {
    expect(thorClient.getExplorerAddressUrl('anotherTestAddressHere')).toEqual(
      'https://thorchain.net/addresses/anotherTestAddressHere',
    )

    thorClient.setNetwork('mainnet')
    expect(thorClient.getExplorerAddressUrl('testAddressHere')).toEqual(
      'https://thorchain.net/addresses/testAddressHere',
    )
  })

  it('should retrun valid explorer tx url', () => {
    expect(thorClient.getExplorerTxUrl('anotherTestTxHere')).toEqual('https://thorchain.net/txs/anotherTestTxHere')

    thorClient.setNetwork('mainnet')
    expect(thorClient.getExplorerTxUrl('testTxHere')).toEqual('https://thorchain.net/txs/testTxHere')
  })
})
