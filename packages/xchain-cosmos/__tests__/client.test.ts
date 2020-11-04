import nock from 'nock'

import { TxsPage } from '@xchainjs/xchain-client'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import { BroadcastTxCommitResult, Coin } from 'cosmos-client/api'
import { AssetMuon } from '../src/types'
import { Client } from '../src/client'
import { getDenom } from '../src/util'
import { TxHistoryResponse, TxResponse } from '../src/cosmos/types'

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

const assertTxsPost = (
  url: string,
  from_address: string,
  to_address: string,
  send_amount: Coin[],
  memo: undefined | string,
  result: BroadcastTxCommitResult,
) => {
  nock(url, { allowUnmocked: true })
    .post(`/txs`, (body) => {
      expect(body.tx.msg.length).toEqual(1)
      expect(body.tx.msg[0].type).toEqual('cosmos-sdk/MsgSend')
      expect(body.tx.msg[0].value.from_address).toEqual(from_address)
      expect(body.tx.msg[0].value.to_address).toEqual(to_address)
      expect(body.tx.msg[0].value.amount).toEqual(send_amount)
      expect(body.tx.memo).toEqual(memo)
      return true
    })
    .reply(200, result)
}

const assertTxHstory = (url: string, address: string, result: TxHistoryResponse): void => {
  nock(url).get(`/txs?message.sender=${address}`).reply(200, result)
}

const assertTxHashGet = (url: string, hash: string, result: TxResponse): void => {
  nock(url).get(`/txs/${hash}`).reply(200, result)
}

describe('Client Test', () => {
  let cosmosClient: Client

  const phrase = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  const address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'

  beforeEach(() => {
    cosmosClient = new Client({ phrase, network: 'testnet' })
  })

  afterEach(() => {
    cosmosClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const cosmosClientEmptyMain = new Client({ phrase, network: 'mainnet' })
    const addressMain = await cosmosClientEmptyMain.getAddress()
    expect(addressMain).toEqual(address)

    const cosmosClientEmptyTest = new Client({ phrase, network: 'testnet' })
    const addressTest = await cosmosClientEmptyTest.getAddress()
    expect(addressTest).toEqual(address)
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
    expect(await cosmosClient.getAddress()).toEqual(address)
  })

  it('should update net', async () => {
    const client = new Client({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')

    const address = await client.getAddress()
    expect(address).toEqual(address)
  })

  it('should generate phrase', () => {
    const generated_phase = Client.generatePhrase()
    const valid = Client.validatePhrase(generated_phase)
    expect(valid).toBeTruthy()
  })

  it('should validate phrase', () => {
    const valid = Client.validatePhrase(phrase)
    expect(valid).toBeTruthy()
  })

  it('should init, should have right prefix', async () => {
    expect(cosmosClient.validateAddress(cosmosClient.getAddress())).toEqual(true)

    cosmosClient.setNetwork('mainnet')
    expect(cosmosClient.validateAddress(cosmosClient.getAddress())).toEqual(true)
  })

  it('has no balances', async () => {
    cosmosClient.setNetwork('mainnet')

    mockAccountsBalance(cosmosClient.getClientUrl(), address, {
      height: 0,
      result: [],
    })

    const result = await cosmosClient.getBalance()
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    const balances = await cosmosClient.getBalance('cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv')
    const expected = balances[0].amount.amount().isEqualTo(baseAmount(75000000, 6).amount())
    expect(expected).toBeTruthy()
    expect(balances[0].asset).toEqual(AssetMuon)
  })

  it('has an empty tx history', async () => {
    cosmosClient.setNetwork('mainnet')

    const expected: TxsPage = {
      total: 0,
      txs: [],
    }
    assertTxHstory(cosmosClient.getClientUrl(), address, {
      count: 0,
      limit: 30,
      page_number: 1,
      page_total: 1,
      total_count: 0,
      txs: [],
    })

    const transactions = await cosmosClient.getTransactions()
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    let transactions = await cosmosClient.getTransactions({ address: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2' })
    expect(transactions.total).toBeGreaterThan(0)

    cosmosClient.setNetwork('mainnet')

    assertTxHstory(cosmosClient.getClientUrl(), 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z', {
      count: 1,
      limit: 30,
      page_number: 1,
      page_total: 1,
      total_count: 1,
      txs: [
        {
          height: 1047,
          txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
          raw_log: 'transaction logs',
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          tx: {
            body: {
              messages: [
                {
                  type: 'cosmos-sdk/MsgSend',
                  value: {
                    from_address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z',
                    to_address: 'cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr',
                    amount: [
                      {
                        denom: 'uatom',
                        amount: 4318994970,
                      },
                    ],
                  },
                },
              ],
            },
          },
          timestamp: '2020-09-25T06:09:15Z',
        },
      ],
    })

    transactions = await cosmosClient.getTransactions({ address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z' })
    expect(transactions.total).toBeGreaterThan(0)
  })

  it('transfer', async () => {
    const to_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result: BroadcastTxCommitResult = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
    }

    assertTxsPost(
      cosmosClient.getClientUrl(),
      cosmosClient.getAddress(),
      to_address,
      [
        {
          denom: getDenom(AssetMuon),
          amount: send_amount.amount().toString(),
        },
      ],
      memo,
      expected_txsPost_result,
    )

    const result = await cosmosClient.transfer({
      asset: AssetMuon,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('deposit', async () => {
    const to_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result: BroadcastTxCommitResult = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
    }

    assertTxsPost(
      cosmosClient.getClientUrl(),
      cosmosClient.getAddress(),
      to_address,
      [
        {
          denom: getDenom(AssetMuon),
          amount: send_amount.amount().toString(),
        },
      ],
      memo,
      expected_txsPost_result,
    )

    const result = await cosmosClient.deposit({
      asset: AssetMuon,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('get transaction data', async () => {
    cosmosClient.setNetwork('mainnet')

    assertTxHashGet(cosmosClient.getClientUrl(), '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066', {
      height: 1047,
      txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
      raw_log: 'transaction logs',
      gas_wanted: '5000000000000000',
      gas_used: '148996',
      tx: {
        body: {
          messages: [
            {
              type: 'cosmos-sdk/MsgSend',
              value: {
                from_address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z',
                to_address: 'cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr',
                amount: [
                  {
                    denom: 'uatom',
                    amount: 4318994970,
                  },
                ],
              },
            },
          ],
        },
      },
      timestamp: '2020-09-25T06:09:15Z',
    })

    const tx = await cosmosClient.getTransactionData('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.type).toEqual('transfer')
    expect(tx.hash).toEqual('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.from[0].from).toEqual('cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z')
    expect(tx.from[0].amount.amount().isEqualTo(baseAmount(4318994970, 6).amount())).toBeTruthy()
    expect(tx.to[0].to).toEqual('cosmos155svs6sgxe55rnvs6ghprtqu0mh69kehrn0dqr')
    expect(tx.to[0].amount.amount().isEqualTo(baseAmount(4318994970, 6).amount())).toBeTruthy()
  })
})
