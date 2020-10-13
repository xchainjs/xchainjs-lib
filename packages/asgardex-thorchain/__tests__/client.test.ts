import { Client } from '../src/client'
// import nock from 'nock'
// import { Coin, PaginatedQueryTxs, BroadcastTxCommitResult, StdTxFee } from 'cosmos-client/api'
// import { AssetRuneNative, baseAmount } from '@thorchain/asgardex-util'

// // http://13.250.144.124:1317/auth/accounts/thor1mhrfyf2hyrfclauv3gw4t9gnasc6axxypek0ug
// const mock_accountsAddressGet_api = (url: string, address: string, result: any) => {
//   nock(url).get(`/auth/accounts/${address}`).reply(200, result)
// }

// // http://13.250.144.124:1317/txs?message.sender=thor1xkc5syzd8mmsr5yjg0nrrwkyj7r9r5taj2c0s5
// const mock_txsGet_api = (url: string, address: string, result: any) => {
//   nock(url).get(`/txs?message.sender=${address}`).reply(200, result)
// }

// // http://13.250.144.124:1317/bank/accounts/thor1vr2qu5a64tqq9m6mh3d0ghe8yxwzxhfqahkxwa/transfers
// const mock_accountsAddressTransfersPost_api = (
//   url: string,
//   from_address: string,
//   to_address: string,
//   send_amount: Coin[],
//   fee: StdTxFee,
//   memo: undefined | string,
// ) => {
//   const result = {
//     type: 'cosmos-sdk/StdTx',
//     value: {
//       msg: [
//         {
//           type: 'thorchain/MsgSend',
//           value: {
//             from_address,
//             to_address,
//             amount: send_amount,
//           },
//         },
//       ],
//       fee,
//       signatures: null,
//       memo,
//     },
//   }
//   nock(url)
//     .post(`/bank/accounts/${to_address}/transfers`, (body) => {
//       expect(body.base_req.from).toEqual(from_address)
//       expect(body.base_req.memo).toEqual(memo)
//       expect(body.amount).toEqual(send_amount)
//       return true
//     })
//     .reply(200, result)
// }

// // http://13.250.144.124:1317/txs
// const mock_txsPost_api = (
//   url: string,
//   from_address: string,
//   to_address: string,
//   send_amount: Coin[],
//   memo: undefined | string,
//   result: any,
// ) => {
//   nock(url)
//     .post(`/txs`, (body) => {
//       expect(body.tx.msg.length).toEqual(1)
//       expect(body.tx.msg[0].type).toEqual('thorchain/MsgSend')
//       expect(body.tx.msg[0].value.from_address).toEqual(from_address)
//       expect(body.tx.msg[0].value.to_address).toEqual(to_address)
//       expect(body.tx.msg[0].value.amount).toEqual(send_amount)
//       expect(body.tx.memo).toEqual(memo)
//       return true
//     })
//     .reply(200, result)
// }

describe('Client Test', () => {
  let thorClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address = 'thor1xkc5syzd8mmsr5yjg0nrrwkyj7r9r5taj2c0s5'
  const testnet_address = 'tthor1xkc5syzd8mmsr5yjg0nrrwkyj7r9r5takaflf3'

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

  // it('has no balances', async () => {
  //   mock_accountsAddressGet_api(thorClient.getClientUrl(), mainnet_address, {
  //     height: 0,
  //     result: {
  //       coins: [],
  //       account_number: 0,
  //       sequence: 0,
  //     },
  //   })

  //   const result = await thorClient.getBalance()
  //   expect(result).toEqual([])
  // })

  // it('has balances', async () => {
  //   const expected_balances: Coin[] = [
  //     {
  //       denom: 'thor',
  //       amount: '21000',
  //     },
  //   ]
  //   mock_accountsAddressGet_api(thorClient.getClientUrl(), mainnet_address, {
  //     height: 0,
  //     result: {
  //       coins: expected_balances,
  //       account_number: 0,
  //       sequence: 0,
  //     },
  //   })

  //   const balances = await thorClient.getBalance()
  //   expect(balances).toEqual(expected_balances)
  // })

  // it('has an empty tx history', async () => {
  //   mock_txsGet_api(thorClient.getClientUrl(), mainnet_address, {
  //     count: 0,
  //     limit: 30,
  //     page_number: 1,
  //     page_total: 0,
  //     total_count: 0,
  //     txs: [],
  //   })

  //   const expect_result: PaginatedQueryTxs = {
  //     count: 0,
  //     limit: 30,
  //     page_number: 1,
  //     page_total: 0,
  //     total_count: 0,
  //     txs: [],
  //   }
  //   const transactions = await thorClient.getTransactions()
  //   expect(transactions).toEqual(expect_result)
  // })

  // it('has tx history', async () => {
  //   mock_txsGet_api(thorClient.getClientUrl(), mainnet_address, {
  //     count: 1,
  //     limit: 30,
  //     page_number: 1,
  //     page_total: 1,
  //     total_count: 1,
  //     txs: [
  //       {
  //         height: 1047,
  //         txhash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
  //         raw_log: 'transaction logs',
  //         logs: [],
  //         gas_wanted: '5000000000000000',
  //         gas_used: '148996',
  //         tx: {},
  //         timestamp: '2020-08-22T12:29:21Z',
  //       },
  //     ],
  //   })

  //   const expect_result: PaginatedQueryTxs = {
  //     count: 1,
  //     limit: 30,
  //     page_number: 1,
  //     page_total: 1,
  //     total_count: 1,
  //     txs: [
  //       {
  //         hash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
  //         height: 1047,
  //         tx: {},
  //         result: {
  //           log: 'transaction logs',
  //           gas_wanted: '5000000000000000',
  //           gas_used: '148996',
  //           tags: [],
  //         },
  //       },
  //     ],
  //   }

  //   const transactions = await thorClient.getTransactions()
  //   expect(transactions).toEqual(expect_result)
  // })

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

  //   mock_accountsAddressGet_api(thorClient.getClientUrl(), mainnet_address, {
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
  //     thorClient.getClientUrl(),
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
  //   mock_txsPost_api(thorClient.getClientUrl(), from_address, to_address, send_amount, memo, expected_txsPost_result)

  //   const result = await thorClient.transfer({
  //     asset: AssetRuneNative,
  //     recipient: to_address,
  //     amount: transferAmount,
  //   })
  //   expect(result).toEqual(expected_txsPost_result)
  // })
})
