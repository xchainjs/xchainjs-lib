import { Network, TxsPage } from '@xchainjs/xchain-client'
import { CosmosSDKClient, RPCResponse, RPCTxSearchResult, TxResponse } from '@xchainjs/xchain-cosmos'
import {
  Asset,
  AssetBNB,
  AssetRuneNative,
  BNBChain,
  BaseAmount,
  assetAmount,
  assetToBase,
  baseAmount,
} from '@xchainjs/xchain-util'
import { BaseAccount, BroadcastTxCommitResult, Coin } from 'cosmos-client/api'
import nock from 'nock'

import { Client } from '../src/client'
import { ThorchainDepositResponse } from '../src/types'

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

const mockTendermintNodeInfo = (
  url: string,
  result: {
    default_node_info: {
      network: string
    }
  },
) => {
  nock(url).get('/cosmos/base/tendermint/v1beta1/node_info').reply(200, result)
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

  beforeEach(() => {
    thorClient = new Client({ phrase, network: Network.Testnet })
    thorMainClient = new Client({ phrase, network: Network.Mainnet })
  })

  afterEach(() => {
    thorClient.purgeClient()
    thorMainClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const thorClientEmptyMain = new Client({ phrase, network: Network.Mainnet })
    const addressMain = thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const thorClientEmptyTest = new Client({ phrase, network: Network.Testnet })
    const addressTest = thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnet_address_path0)
  })

  it('should derive address accordingly to the user param', async () => {
    const thorClientEmptyMain = new Client({
      phrase,
      network: Network.Mainnet /*, derivationPath: "44'/931'/0'/0/0" */,
    })
    const addressMain = thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const viaSetPhraseAddr1 = thorClientEmptyMain.getAddress(1 /*, "44'/931'/0'/0/1" */)
    expect(viaSetPhraseAddr1).toEqual(mainnet_address_path1)

    const thorClientEmptyTest = new Client({
      phrase,
      network: Network.Testnet /*, derivationPath: "44'/931'/0'/0/0"*/,
    })
    const addressTest = thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnet_address_path0)

    const viaSetPhraseAddr1Test = thorClientEmptyTest.getAddress(1 /*, "44'/931'/0'/0/1"*/)
    expect(viaSetPhraseAddr1Test).toEqual(testnet_address_path1)

    const thorClientEmptyMain1 = new Client({
      phrase,
      network: Network.Mainnet /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressMain1 = thorClientEmptyMain1.getAddress(1)
    expect(addressMain1).toEqual(mainnet_address_path1)

    const thorClientEmptyTest1 = new Client({
      phrase,
      network: Network.Testnet /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressTest1 = thorClientEmptyTest1.getAddress(1)
    expect(addressTest1).toEqual(testnet_address_path1)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new Client({ phrase: 'invalid phrase', network: Network.Mainnet })
    }).toThrow()

    expect(() => {
      new Client({ phrase: 'invalid phrase', network: Network.Testnet })
    }).toThrow()
  })

  it('should have right address', async () => {
    expect(thorClient.getAddress()).toEqual(testnet_address_path0)

    expect(thorMainClient.getAddress()).toEqual(mainnet_address_path0)
  })

  it('should allow to get the CosmosSDKClient', async () => {
    expect(thorClient.getCosmosClient()).toBeInstanceOf(CosmosSDKClient)
  })

  it('should update net', async () => {
    thorMainClient.setNetwork(Network.Testnet)
    expect(thorMainClient.getNetwork()).toEqual('testnet')

    const address = await thorMainClient.getAddress()
    expect(address).toEqual(testnet_address_path0)
  })

  it('should init, should have right prefix', async () => {
    expect(thorClient.validateAddress(thorClient.getAddress())).toBeTruthy()

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.validateAddress(thorClient.getAddress())).toBeTruthy()

    thorClient.setNetwork(Network.Stagenet)
    expect(thorClient.validateAddress(thorClient.getAddress())).toBeTruthy()
  })

  it('should have right client url', async () => {
    thorClient.setClientUrl({
      mainnet: {
        node: 'new mainnet client',
        rpc: 'new mainnet client',
      },
      stagenet: {
        node: 'new stagenet client',
        rpc: 'new stagenet client',
      },
      testnet: {
        node: 'new testnet client',
        rpc: 'new testnet client',
      },
    })

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getClientUrl().node).toEqual('new mainnet client')

    thorClient.setNetwork(Network.Testnet)
    expect(thorClient.getClientUrl().node).toEqual('new testnet client')

    thorClient.setNetwork(Network.Stagenet)
    expect(thorClient.getClientUrl().node).toEqual('new stagenet client')
  })

  it('returns private key', async () => {
    const privKey = thorClient.getPrivKey()
    expect(privKey.toBase64()).toEqual('CHCbyYWorMZVRFtfJzt72DigvZeRNi3jo2c3hGEQ46I=')
  })

  describe('chainId', () => {
    it('get chainId (testnet by default for testnetClient)', () => {
      const chainId = thorClient.getChainId()
      expect(chainId).toEqual('thorchain-v1')
    })
    it('update chainId (testnet by default for testnetClient)', () => {
      thorClient.setChainId('another-testnet-id')
      const chainId = thorClient.getChainId()
      expect(chainId).toEqual('another-testnet-id')
    })
    it('update chainId for testnet', () => {
      thorClient.setChainId('another-testnet-id', Network.Testnet)
      const chainId = thorClient.getChainId(Network.Testnet)
      expect(chainId).toEqual('another-testnet-id')
    })
    it('get default chainId for stagenet', () => {
      const chainId = thorClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('thorchain-stagenet')
    })
    it('update chainId for stagenet', () => {
      thorClient.setChainId('another-stagenet-id', Network.Stagenet)
      const chainId = thorClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('another-stagenet-id')
    })
    it('get default chainId for mainnet', () => {
      const chainId = thorClient.getChainId(Network.Mainnet)
      expect(chainId).toEqual('thorchain')
    })
    it('update chainId for mainnet', () => {
      thorClient.setChainId('another-mainnet-id', Network.Mainnet)
      const chainId = thorClient.getChainId(Network.Mainnet)
      expect(chainId).toEqual('another-mainnet-id')
    })

    it('set chainId by initialization of client', () => {
      const chainIds = {
        [Network.Mainnet]: 'mainnet-id',
        [Network.Stagenet]: 'stagenet-id',
        [Network.Testnet]: 'testnet-id',
      }
      const client = new Client({ phrase, network: Network.Testnet, chainIds })
      // chainId for testnet by default
      let chainId = client.getChainId()
      expect(chainId).toEqual('testnet-id')
      // ask testnet
      chainId = client.getChainId(Network.Testnet)
      expect(chainId).toEqual('testnet-id')
      // ask for mainnet
      chainId = client.getChainId(Network.Mainnet)
      expect(chainId).toEqual('mainnet-id')
      // ask for stagenet
      chainId = client.getChainId(Network.Stagenet)
      expect(chainId).toEqual('stagenet-id')
    })
  })

  it('returns public key', async () => {
    const pubKey = thorClient.getPubKey()
    expect(pubKey.toBase64()).toEqual('AsL4F+rvFMqDkZYpVVnZa0OBa0EXwscjNrODbBME42vC')
  })

  it('has no balances', async () => {
    mockAccountsBalance(thorClient.getClientUrl().node, testnet_address_path0, {
      height: 0,
      result: [],
    })
    const result = await thorClient.getBalance(thorClient.getAddress(0))
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    thorMainClient.setNetwork(Network.Mainnet)
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
    expect(balances[0].asset).toEqual(AssetRuneNative)
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
  })

  it('rune + synth balances', async () => {
    thorClient.setNetwork(Network.Testnet)
    mockAccountsBalance(thorClient.getClientUrl().node, 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg', {
      height: 0,
      result: [
        {
          denom: 'bnb/bnb',
          amount: '100',
        },
        {
          denom: 'bnb/busd-74e',
          amount: '200',
        },
        {
          denom: 'rune',
          amount: '200',
        },
      ],
    })

    const balances = await thorClient.getBalance('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg')
    expect(balances.length).toEqual(3)
    // BNB synth
    expect(balances[0].asset).toEqual({ ...AssetBNB, synth: true })
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount()))
    // BUSD synth
    expect(balances[1].asset).toEqual({ chain: 'BNB', symbol: 'BUSD-74E', ticker: 'BUSD', synth: true })
    expect(balances[1].amount.amount().isEqualTo(baseAmount(200).amount()))
    // RUNE
    expect(balances[2].asset).toEqual(AssetRuneNative)
    expect(balances[2].amount.amount().isEqualTo(baseAmount(300).amount()))
  })

  it('filter BUSD synth balances', async () => {
    const BUSD_ASSET_SYNTH: Asset = { chain: BNBChain, symbol: 'BUSD-74E', ticker: 'BUSD', synth: true }
    thorClient.setNetwork(Network.Testnet)
    mockAccountsBalance(thorClient.getClientUrl().node, 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg', {
      height: 0,
      result: [
        {
          denom: 'bnb/bnb',
          amount: '100',
        },
        {
          denom: 'bnb/busd-74e',
          amount: '200',
        },
        {
          denom: 'rune',
          amount: '200',
        },
      ],
    })

    const balances = await thorClient.getBalance('tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg', [BUSD_ASSET_SYNTH])
    expect(balances.length).toEqual(1)
    // BUSD synth
    expect(balances[0].asset).toEqual(BUSD_ASSET_SYNTH)
    expect(balances[0].amount.amount().isEqualTo(baseAmount(200).amount()))
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
    const historyData = require('../__mocks__/responses/tx_search/sender-tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f.json')
    const bondTxData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
    const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
    const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
    mockTxHistory(thorClient.getClientUrl().rpc, historyData)

    assertTxHashGet(thorClient.getClientUrl().node, txHash, bondTxData)

    const txs = await thorClient.getTransactions({
      address: 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f',
    })

    expect(txs.total).toEqual(1)

    const { type, hash, asset, from, to } = txs.txs[0]

    expect(type).toEqual('transfer')
    expect(hash).toEqual(txHash)
    expect(asset).toEqual(AssetRuneNative)
    expect(from[0].from).toEqual(address)
    expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(from[1].from).toEqual(address)
    expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
    expect(to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
    expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(to[1].to).toEqual('tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff')
    expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
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
      asset: AssetRuneNative,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('deposit', async () => {
    const send_amount: BaseAmount = baseAmount(10000, 8)
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
    mockTendermintNodeInfo(thorClient.getClientUrl().node, {
      default_node_info: {
        network: 'thorchain-v1',
      },
    })
    assertTxsPost(thorClient.getClientUrl().node, '', expected_txsPost_result)

    const result = await thorClient.deposit({
      asset: AssetRuneNative,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('get transaction data for BOND tx', async () => {
    const txData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
    const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
    const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
    assertTxHashGet(thorClient.getClientUrl().node, txHash, txData)
    const { type, hash, asset, from, to } = await thorClient.getTransactionData(txHash, address)

    expect(type).toEqual('transfer')
    expect(hash).toEqual(txHash)
    expect(asset).toEqual(AssetRuneNative)
    expect(from[0].from).toEqual(address)
    expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(from[1].from).toEqual(address)
    expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
    expect(to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
    expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(to[1].to).toEqual('tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff')
    expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
  })

  it('should return valid explorer url', () => {
    expect(thorClient.getExplorerUrl()).toEqual('https://viewblock.io/thorchain?network=testnet')

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getExplorerUrl()).toEqual('https://viewblock.io/thorchain')
  })

  it('should retrun valid explorer address url', () => {
    expect(thorClient.getExplorerAddressUrl('tthorabc')).toEqual(
      'https://viewblock.io/thorchain/address/tthorabc?network=testnet',
    )

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getExplorerAddressUrl('thorabc')).toEqual('https://viewblock.io/thorchain/address/thorabc')
  })

  it('should retrun valid explorer tx url', () => {
    expect(thorClient.getExplorerTxUrl('txhash')).toEqual('https://viewblock.io/thorchain/tx/txhash?network=testnet')

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getExplorerTxUrl('txhash')).toEqual('https://viewblock.io/thorchain/tx/txhash')
  })
})
