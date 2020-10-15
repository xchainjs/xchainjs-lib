import { Client } from '../src/client'
import { TxsPage } from '@asgardex-clients/asgardex-client'

describe('Client Test', () => {
  let cosmosClient: Client
  const phrase = 'foster blouse cattle fiction deputy social brown toast various sock awkward print'
  const mainnet_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'
  const testnet_address = 'cosmos1gehrq0pr5d79q8nxnaenvqh09g56jafm82thjv'

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
    cosmosClient.setNetwork('testnet')

    const transactions = await cosmosClient.getTransactions({address: 'cosmos1xvt4e7xd0j9dwv2w83g50tpcltsl90h52003e2'})
    expect(transactions.total).toBeGreaterThan(0)
  })

  // it('transfer', async () => {
  //   const from_address = mainnet_address
  //   const to_address = 'thor1vr2qu5a64tqq9m6mh3d0ghe8yxwzxhfqahkxwa'
  //   const send_amount: Coin[] = [
  //     {
  //       denom: 'thor',
  //       amount: '100',
  //     },
  //   ]
  //   const transferAmount = baseAmount(1000000)
  //   const memo = 'transfer'

  //   mock_accountsAddressGet_api(cosmosClient.getClientUrl(), mainnet_address, {
  //     height: 0,
  //     result: {
  //       coins: [
  //         {
  //           denom: 'thor',
  //           amount: '21000',
  //         },
  //       ],
  //       account_number: 0,
  //       sequence: 0,
  //     },
  //   })

  //   mock_accountsAddressTransfersPost_api(
  //     cosmosClient.getClientUrl(),
  //     from_address,
  //     to_address,
  //     send_amount,
  //     {
  //       gas: '1000',
  //       amount: [],
  //     },
  //     memo,
  //   )

  //   const expected_txsPost_result: BroadcastTxCommitResult = {
  //     check_tx: {},
  //     deliver_tx: {},
  //     txhash: '',
  //     height: 0,
  //   }
  //   mock_txsPost_api(cosmosClient.getClientUrl(), from_address, to_address, send_amount, memo, expected_txsPost_result)

  //   const result = await cosmosClient.transfer({
  //     asset: AssetRuneNative,
  //     recipient: to_address,
  //     amount: transferAmount,
  //   })
  //   expect(result).toEqual(expected_txsPost_result)
  // })
})
