import nock from 'nock'

import { Client } from '../src/client'
import { TxsPage } from '@asgardex-clients/asgardex-client'
import { AssetMuon } from '../src/cosmos/types'
import { baseAmount, BaseAmount } from '@thorchain/asgardex-util'
import { BroadcastTxCommitResult, Coin } from 'cosmos-client/api'

const mock_txsPost_api = (
  url: string,
  from_address: string,
  to_address: string,
  send_amount: Coin[],
  memo: undefined | string,
  result: any,
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
  // For gaia-13007
  // const phrase = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  // const mainnet_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'
  // const testnet_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'

  // For stargate-3a
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address = 'cosmos1xkc5syzd8mmsr5yjg0nrrwkyj7r9r5ta5dp59t'
  const testnet_address = 'cosmos1xkc5syzd8mmsr5yjg0nrrwkyj7r9r5ta5dp59t'

  beforeEach(() => {
    cosmosClient = new Client({ phrase, network: 'mainnet' })
  })
  
  afterEach(() => {
    cosmosClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const cosmosClientEmptyMain = new Client({ phrase, network: 'mainnet' })
    const addressMain = await cosmosClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address)

    const cosmosClientEmptyTest = new Client({ phrase, network: 'testnet' })
    const addressTest = await cosmosClientEmptyTest.getAddress()
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
    expect(await cosmosClient.getAddress()).toEqual(mainnet_address)
  })

  it('should update net', async () => {
    const client = new Client({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')

    const address = await client.getAddress()
    expect(address).toEqual(testnet_address)
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
    let result = await cosmosClient.getBalance()
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    cosmosClient.setNetwork('testnet')

    const balances = await cosmosClient.getBalance()
    const expected = balances[0].amount.amount().isGreaterThan(0)
    expect(expected).toBeTruthy()
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
    let transactions = await cosmosClient.getTransactions({address: 'cosmos1pjkpqxmvz47a5aw40l98fyktlg7k6hd9heq95z'})
    expect(transactions.total).toBeGreaterThan(0)

    cosmosClient.setNetwork('testnet')
    // const transactions = await cosmosClient.getTransactions({address: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2'})
    transactions = await cosmosClient.getTransactions({address: 'cosmos1h2gacd88hkvlmz5g04md87r54kjf0klnwt25n9'})
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
    mock_txsPost_api(cosmosClient.getClientUrl(), cosmosClient.getAddress(), to_address, [
      {
        denom: AssetMuon.symbol,
        amount: send_amount.amount().toString(),
      }
    ], memo, expected_txsPost_result)

    const result = await cosmosClient.transfer({
      asset: AssetMuon,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })
})
