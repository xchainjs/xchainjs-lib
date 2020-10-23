import nock from 'nock'

import { TxsPage } from '@xchainjs/xchain-client'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import { BroadcastTxCommitResult, Coin } from 'cosmos-client/api'
import { AssetThor, TxHistoryResponse } from '../src/thor/types'
import { Client } from '../src/client'
import { getDenom } from '../src/util'

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
      expect(body.tx.msg[0].type).toEqual('thorchain/MsgSend')
      expect(body.tx.msg[0].value.from_address).toEqual(from_address)
      expect(body.tx.msg[0].value.to_address).toEqual(to_address)
      expect(body.tx.msg[0].value.amount).toEqual(send_amount)
      expect(body.tx.memo).toEqual(memo)
      return true
    })
    .reply(200, result)
}

const assertTxHstory = (url: string, address: string, result: TxHistoryResponse) => {
  nock(url).get(`/txs?message.sender=${address}`).reply(200, result)
}

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

  it('has no balances', async () => {
    thorClient.setNetwork('testnet')
    const result = await thorClient.getBalance()
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    const balances = await thorClient.getBalance('thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5')
    expect(balances.length).toBeGreaterThan(0)
    const expected = balances[0].amount.amount().isGreaterThan(baseAmount(0, 6).amount())
    expect(expected).toBeTruthy()
    expect(balances[0].asset).toEqual(AssetThor)
  })

  it('has an empty tx history', async () => {
    const expected: TxsPage = {
      total: 0,
      txs: [],
    }

    const transactions = await thorClient.getTransactions()
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    assertTxHstory(thorClient.getClientUrl(), mainnet_address, {
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
          gas_wanted: '5000000000000000',
          gas_used: '148996',
          tx: {
            body: {
              messages: [
                {
                  type: 'thorchain/MsgSend',
                  value: {
                    from_address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
                    to_address: 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws',
                    amount: [
                      {
                        denom: 'thor',
                        amount: 1000000,
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

    const transactions = await thorClient.getTransactions()
    expect(transactions.total).toEqual(1)
  })

  it('transfer', async () => {
    thorClient.setNetwork('testnet')

    const to_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result: BroadcastTxCommitResult = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
    }

    assertTxsPost(
      thorClient.getClientUrl(),
      thorClient.getAddress(),
      to_address,
      [
        {
          denom: getDenom(AssetThor),
          amount: send_amount.amount().toString(),
        },
      ],
      memo,
      expected_txsPost_result,
    )

    const result = await thorClient.transfer({
      asset: AssetThor,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('deposit', async () => {
    thorClient.setNetwork('testnet')

    const to_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'deposit'

    const expected_txsPost_result: BroadcastTxCommitResult = {
      check_tx: {},
      deliver_tx: {},
      txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
      height: 0,
    }

    assertTxsPost(
      thorClient.getClientUrl(),
      thorClient.getAddress(),
      to_address,
      [
        {
          denom: getDenom(AssetThor),
          amount: send_amount.amount().toString(),
        },
      ],
      memo,
      expected_txsPost_result,
    )

    const result = await thorClient.deposit({
      asset: AssetThor,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })
})
