import nock from 'nock'

import { TxsPage } from '@xchainjs/xchain-client'
import { baseAmount, BaseAmount } from '@xchainjs/xchain-util'
import { RPCResponse, RPCTxSearchResult, TxResponse, CosmosSDKClient } from '@xchainjs/xchain-cosmos'
import { Msg } from 'cosmos-client'
import { StdTx } from 'cosmos-client/x/auth'
import { BroadcastTxCommitResult, Coin, BaseAccount, StdTxFee } from 'cosmos-client/api'
import { AssetRune, ThorchainDepositResponse } from '../src/types'
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

const mockThorchainDeposit = (url: string, result: ThorchainDepositResponse) => {
  nock(url).post('/thorchain/deposit').reply(200, result)
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

const mockTxHistory = (url: string, result: RPCResponse<RPCTxSearchResult>): void => {
  nock(url)
    .get(`/tx_search`)
    .twice()
    .query((_) => true)
    .reply(200, result)
}

const assertTxHashGet = (url: string, hash: string, result: TxResponse): void => {
  nock(url).get(`/txs/${hash}`).reply(200, result)
}

describe('Client Test', () => {
  let thorClient: Client
  let thorMainClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address_path0 = 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws'
  const mainnet_address_path1 = 'thor1hrf34g3lxwvpk7gjte0xvahf3txnq8ecgaf4nc'
  const testnet_address_path0 = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'
  const testnet_address_path1 = 'tthor1hrf34g3lxwvpk7gjte0xvahf3txnq8ecv2c92a'

  beforeEach(async () => {
    thorClient = await Client.create({ phrase, network: 'testnet' })
    thorMainClient = await Client.create({ phrase, network: 'mainnet' })
  })

  afterEach(async () => {
    await thorClient.purgeClient()
    await thorMainClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const thorClientEmptyMain = await Client.create({ phrase, network: 'mainnet' })
    const addressMain = await thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const thorClientEmptyTest = await Client.create({ phrase, network: 'testnet' })
    const addressTest = await thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnet_address_path0)
  })

  it('should derive address accordingly to the user param', async () => {
    const thorClientEmptyMain = await Client.create({
      phrase,
      network: 'mainnet' /*, derivationPath: "44'/931'/0'/0/0" */,
    })
    const addressMain = await thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const viaSetPhraseAddr1 = await thorClientEmptyMain.getAddress(1 /*, "44'/931'/0'/0/1" */)
    expect(viaSetPhraseAddr1).toEqual(mainnet_address_path1)

    const thorClientEmptyTest = await Client.create({
      phrase,
      network: 'testnet' /*, derivationPath: "44'/931'/0'/0/0"*/,
    })
    const addressTest = await thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnet_address_path0)

    const viaSetPhraseAddr1Test = await thorClientEmptyTest.getAddress(1 /*, "44'/931'/0'/0/1"*/)
    expect(viaSetPhraseAddr1Test).toEqual(testnet_address_path1)

    const thorClientEmptyMain1 = await Client.create({
      phrase,
      network: 'mainnet' /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressMain1 = await thorClientEmptyMain1.getAddress(1)
    expect(addressMain1).toEqual(mainnet_address_path1)

    const thorClientEmptyTest1 = await Client.create({
      phrase,
      network: 'testnet' /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressTest1 = await thorClientEmptyTest1.getAddress(1)
    expect(addressTest1).toEqual(testnet_address_path1)
  })

  it('throws an error passing an invalid phrase', async () => {
    await expect(Client.create({ phrase: 'invalid phrase', network: 'mainnet' })).rejects.toThrow()

    await expect(Client.create({ phrase: 'invalid phrase', network: 'testnet' })).rejects.toThrow()
  })

  it('should have right address', async () => {
    expect(await thorClient.getAddress()).toEqual(testnet_address_path0)

    expect(await thorMainClient.getAddress()).toEqual(mainnet_address_path0)
  })

  it('should allow to get the CosmosSDKClient', async () => {
    expect(thorClient.getCosmosClient()).toBeInstanceOf(CosmosSDKClient)
  })

  it('should update net', async () => {
    await thorMainClient.setNetwork('testnet')
    expect(thorMainClient.getNetwork()).toEqual('testnet')

    const address = await thorMainClient.getAddress()
    expect(address).toEqual(testnet_address_path0)
  })

  it('should init, should have right prefix', async () => {
    expect(await thorClient.validateAddress(await thorClient.getAddress())).toEqual(true)

    await thorClient.setNetwork('mainnet')
    expect(await thorClient.validateAddress(await thorClient.getAddress())).toEqual(true)
  })

  it('should have right client url', async () => {
    thorClient.setClientUrl({
      mainnet: {
        node: 'new mainnet client',
        rpc: 'new mainnet client',
      },
      testnet: {
        node: 'new testnet client',
        rpc: 'new testnet client',
      },
    })

    await thorClient.setNetwork('mainnet')
    expect(thorClient.getClientUrl().node).toEqual('new mainnet client')

    await thorClient.setNetwork('testnet')
    expect(thorClient.getClientUrl().node).toEqual('new testnet client')
  })

  it('has no balances', async () => {
    mockAccountsBalance(thorClient.getClientUrl().node, testnet_address_path0, {
      height: 0,
      result: [],
    })
    const result = await thorClient.getBalance(await thorClient.getAddress(0))
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    await thorMainClient.setNetwork('mainnet')
    // mainnet - has balance: thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5
    // mainnet - 0: thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws
    mockAccountsBalance(thorMainClient.getClientUrl().node, 'thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5', {
      height: 0,
      result: [
        {
          denom: 'rune',
          amount: '100',
        },
      ],
    })

    const balances = await thorMainClient.getBalance('thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5')
    expect(balances.length).toEqual(1)
    expect(balances[0].asset).toEqual(AssetRune)
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
  })

  it('has an empty tx history', async () => {
    const expected: TxsPage = {
      total: 0,
      txs: [],
    }

    mockTxHistory(thorClient.getClientUrl().rpc, {
      jsonrpc: '2.0',
      id: -1,
      result: {
        txs: [],
        total_count: '0',
      },
    })

    const transactions = await thorClient.getTransactions({
      address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
      limit: 1,
    })
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    mockTxHistory(thorClient.getClientUrl().rpc, {
      jsonrpc: '2.0',
      id: -1,
      result: {
        txs: [
          {
            height: '1047',
            hash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
            index: 0,
            tx_result: {
              code: 0,
              data: 'CgYKBHNlbmQ=',
              log:
                "[{'events:[{'type:'bond','attributes:[{'key:'amount','value:'100000000'},{'key:'bound_type','value:'\\u0000'},{'key:'id','value:'46A44C8556375FC41E7B44D1B796995DB2824D7F9C9FD25EA43B2A48493F365F'},{'key:'chain','value:'THOR'},{'key:'from','value:'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'},{'key:'to','value:'tthor1g98cy3n9mmjrpn0sxmn63lztelera37nrytwp2'},{'key:'coin','value:'100000000 THOR.RUNE'},{'key:'memo','value:'BOND:tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'}]},{'type:'message','attributes:[{'key:'action','value:'deposit'},{'key:'sender','value:'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'},{'key:'sender','value:'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'}]},{'type:'new_node','attributes:[{'key:'address','value:'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'}]},{'type:'transfer','attributes:[{'key:'recipient','value:'tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw'},{'key:'sender','value:'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'},{'key:'amount','value:'100000000rune'},{'key:'recipient','value:'tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff'},{'key:'sender','value:'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg'},{'key:'amount','value:'100000000rune'}]}]}]",
              info: '',
              gas_wanted: '100000000',
              gas_used: '134091',
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
              codespace: '',
            },
            tx:
              'CoEBCn8KES90eXBlcy5Nc2dEZXBvc2l0EmoKHwoSCgRUSE9SEgRSVU5FGgRSVU5FEgkxMDAwMDAwMDASMUJPTkQ6dHRob3IxM2d5bTk3dG13M2F4ajNocGV3ZGdneTJjcjI4OGQzcWZmcjhza2caFIoJsvl7dHppRuHLmoQRWBqOdsQJElcKTgpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQI7KJDfjLCF1rQl8Dkb+vy9y1HjyC3FM1Qor9zkqywxFRIECgIIfxIFEIDC1y8aQNjQOr84kb74rCRs8TrwVhN89ftC80/6ZC+E9Oh3PVHxS3ngq6vtS3e+jJQXJqf2+1UVSpNZPhxVgxWbIpQRodQ=',
          },
        ],
        total_count: '1',
      },
    })

    assertTxHashGet(
      thorClient.getClientUrl().node,
      '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
      {
        height: 0,
        txhash: '098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3',
        data: '0A060A0473656E64',
        raw_log: '',
        gas_wanted: '200000',
        gas_used: '35000',
        tx: {
          msg: [
            {
              type: 'thorchain/MsgSend',
              value: {
                from_address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
                to_address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
                amount: [
                  {
                    denom: 'rune',
                    amount: '100000000',
                  },
                ],
              },
            },
          ] as Msg[],
          fee: {
            gas: '200000',
            amount: [],
          } as StdTxFee,
          signatures: null,
          memo: '',
        } as StdTx,
        timestamp: new Date().toString(),
      },
    )

    const transactions = await thorClient.getTransactions({
      address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
    })
    expect(transactions.total).toEqual(1)

    expect(transactions.txs[0].type).toEqual('transfer')
    expect(transactions.txs[0].hash).toEqual('098E70A9529AC8F1A57AA0FE65D1D13040B0E803AB8BE7F3B32098164009DED3')
    expect(transactions.txs[0].asset).toEqual(AssetRune)
    expect(transactions.txs[0].from[0].from).toEqual('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    expect(transactions.txs[0].from[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
    expect(transactions.txs[0].to[0].to).toEqual('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    expect(transactions.txs[0].to[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
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

    mockAccountsAddress(thorClient.getClientUrl().node, testnet_address_path0, {
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
    mockAccountsBalance(thorClient.getClientUrl().node, testnet_address_path0, {
      height: 0,
      result: [
        {
          denom: 'rune',
          amount: '210000000',
        },
      ],
    })
    assertTxsPost(thorClient.getClientUrl().node, memo, expected_txsPost_result)

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

    mockAccountsAddress(thorClient.getClientUrl().node, testnet_address_path0, {
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
    mockAccountsBalance(thorClient.getClientUrl().node, testnet_address_path0, {
      height: 0,
      result: [
        {
          denom: 'rune',
          amount: '210000000',
        },
      ],
    })
    mockThorchainDeposit(thorClient.getClientUrl().node, {
      type: 'cosmos-sdk/StdTx',
      value: {
        msg: [
          {
            type: 'thorchain/MsgDeposit',
            value: {
              coins: [
                {
                  asset: 'THOR.RUNE',
                  amount: '10000',
                },
              ],
              memo: 'swap:BNB.BNB:tbnb1ftzhmpzr4t8ta3etu4x7nwujf9jqckp3th2lh0',
              signer: 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4',
            },
          },
        ],
        fee: {
          amount: [],
          gas: '100000000',
        },
        signatures: [],
        memo: '',
        timeout_height: '0',
      },
    })
    assertTxsPost(thorClient.getClientUrl().node, '', expected_txsPost_result)

    const result = await thorClient.deposit({
      asset: AssetRune,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('get transaction data', async () => {
    assertTxHashGet(
      thorClient.getClientUrl().node,
      '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
      {
        height: 0,
        txhash: '19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066',
        data: '0A060A0473656E64',
        raw_log: '',
        gas_wanted: '200000',
        gas_used: '35000',
        tx: {
          msg: [
            {
              type: 'thorchain/MsgSend',
              value: {
                from_address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
                to_address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
                amount: [
                  {
                    denom: 'rune',
                    amount: '100000000',
                  },
                ],
              },
            },
          ] as Msg[],
          fee: {
            gas: '200000',
            amount: [],
          } as StdTxFee,
          signatures: null,
          memo: '',
        } as StdTx,
        timestamp: new Date().toString(),
      },
    )
    const tx = await thorClient.getTransactionData('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.type).toEqual('transfer')
    expect(tx.hash).toEqual('19BFC1E8EBB10AA1EC6B82E380C6F5FD349D367737EA8D55ADB4A24F0F7D1066')
    expect(tx.asset).toEqual(AssetRune)
    expect(tx.from[0].from).toEqual('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    expect(tx.from[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
    expect(tx.to[0].to).toEqual('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    expect(tx.to[0].amount.amount().isEqualTo(baseAmount(100000000, DECIMAL).amount())).toEqual(true)
  })

  it('should return valid explorer url', async () => {
    expect(thorClient.getExplorerUrl()).toEqual('https://viewblock.io/thorchain?network=testnet')

    await thorClient.setNetwork('mainnet')
    expect(thorClient.getExplorerUrl()).toEqual('https://viewblock.io/thorchain')
  })

  it('should retrun valid explorer address url', async () => {
    expect(thorClient.getExplorerAddressUrl('tthorabc')).toEqual(
      'https://viewblock.io/thorchain/address/tthorabc?network=testnet',
    )

    await thorClient.setNetwork('mainnet')
    expect(thorClient.getExplorerAddressUrl('thorabc')).toEqual('https://viewblock.io/thorchain/address/thorabc')
  })

  it('should retrun valid explorer tx url', async () => {
    expect(thorClient.getExplorerTxUrl('txhash')).toEqual('https://viewblock.io/thorchain/tx/txhash?network=testnet')

    await thorClient.setNetwork('mainnet')
    expect(thorClient.getExplorerTxUrl('txhash')).toEqual('https://viewblock.io/thorchain/tx/txhash')
  })
})
