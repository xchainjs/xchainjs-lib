import nock from 'nock'

import { TxsPage } from '@xchainjs/xchain-client'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import { BroadcastTxCommitResult, Coin } from 'cosmos-client/api'
import { AssetMuon } from '../src/cosmos/types'
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
      expect(body.tx.msg[0].type).toEqual('cosmos-sdk/MsgSend')
      expect(body.tx.msg[0].value.from_address).toEqual(from_address)
      expect(body.tx.msg[0].value.to_address).toEqual(to_address)
      expect(body.tx.msg[0].value.amount).toEqual(send_amount)
      expect(body.tx.memo).toEqual(memo)
      return true
    })
    .reply(200, result)
}

describe('Client Test', () => {
  let cosmosClient: Client

  const phrase = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  const address = 'cosmos16mzuy68a9xzqpsp88dt4f2tl0d49drhepn68fg'

  beforeEach(() => {
    cosmosClient = new Client({ phrase, network: 'mainnet' })
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

    cosmosClient.setNetwork('testnet')
    expect(cosmosClient.validateAddress(cosmosClient.getAddress())).toEqual(true)
  })

  it('has no balances', async () => {
    const result = await cosmosClient.getBalance()
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    cosmosClient.setNetwork('testnet')

    const balances = await cosmosClient.getBalance('cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv')
    const expected = balances[0].amount.amount().isEqualTo(baseAmount(75000000, 6).amount())
    expect(expected).toBeTruthy()
    expect(balances[0].asset).toEqual(AssetMuon)
  })

  it('has an empty tx history', async () => {
    const expected: TxsPage = {
      total: 0,
      txs: [],
    }

    const transactions = await cosmosClient.getTransactions()
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    let transactions = await cosmosClient.getTransactions({ address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z' })
    expect(transactions.total).toBeGreaterThan(0)

    cosmosClient.setNetwork('testnet')
    transactions = await cosmosClient.getTransactions({ address: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2' })
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

    cosmosClient.setNetwork('testnet')
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

    cosmosClient.setNetwork('testnet')
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
})
