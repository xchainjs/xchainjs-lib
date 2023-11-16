import cosmosclient from '@cosmos-client/core'
import { AssetBNB, BNBChain } from '@xchainjs/xchain-binance'
import { Network, TxsPage } from '@xchainjs/xchain-client'
import { CosmosSDKClient, RPCResponse, RPCTxSearchResult, TxResponse } from '@xchainjs/xchain-cosmos'
import { Asset, BaseAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import nock from 'nock'

import { mockTendermintNodeInfo, mockTendermintSimulate } from '../__mocks__/thornode-api'
import { Client } from '../src/client'
import { AssetRuneNative, MAX_TX_COUNT_PER_FUNCTION_CALL, MAX_TX_COUNT_PER_PAGE } from '../src/const'

const chainIds = {
  [Network.Mainnet]: 'thorchain-mainnet-v1',
  [Network.Stagenet]: 'thorchain-stagenet-v2',
  [Network.Testnet]: 'deprecated',
}

// register9Rheader(axios)
// register9Rheader(cosmosclient.config.globalAxios)

const mockAccountsAddress = (
  url: string,
  address: string,
  result: {
    account: {
      '@type': string
      address: string
      pub_key?: {
        '@type': string
        key: string
      }
      account_number: string
      sequence: string
    }
  },
) => {
  nock(url).persist().get(`/cosmos/auth/v1beta1/accounts/${address}`).reply(200, result)
}

const mockGetChainId = (url: string, chainId: string) => {
  const response = {
    default_node_info: {
      network: chainId,
    },
  }
  nock(url).get('/cosmos/base/tendermint/v1beta1/node_info').reply(200, response)
}

const mockAccountsBalance = (
  url: string,
  address: string,
  result: {
    balances: cosmosclient.proto.cosmos.base.v1beta1.Coin[]
  },
) => {
  nock(url).get(`/cosmos/bank/v1beta1/balances/${address}`).reply(200, result)
}

const mockThorchainConstants = (url: string) => {
  const response = require('../__mocks__/responses/thorchain/constants.json')
  nock(url).get('/thorchain/constants').reply(200, response)
}

const assertTxsPost = (
  url: string,
  result: {
    tx_response: {
      txhash: string
      code: number
    }
  },
): void => {
  nock(url, { allowUnmocked: true })
    .post(`/cosmos/tx/v1beta1/txs`, (body) => {
      expect(body.mode).toEqual('BROADCAST_MODE_SYNC')
      expect(body.tx_bytes.length).toBeGreaterThan(0)
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

const assertTxHashGet = (url: string, hash: string, result: { tx_response: TxResponse }): void => {
  nock(url).get(`/cosmos/tx/v1beta1/txs/${hash}`).reply(200, result)
}

describe('Client Test', () => {
  let thorClient: Client
  let thorMainClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address_path0 = 'thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws'
  const mainnet_address_path1 = 'thor1hrf34g3lxwvpk7gjte0xvahf3txnq8ecgaf4nc'
  const stagenet_address_path0 = 'sthor19kacmmyuf2ysyvq3t9nrl9495l5cvktjykclcw'
  const stagenet_address_path1 = 'sthor1hrf34g3lxwvpk7gjte0xvahf3txnq8ecuy4r9x'

  beforeEach(() => {
    thorClient = new Client({ phrase, network: Network.Stagenet })
    thorMainClient = new Client({ phrase, network: Network.Mainnet })
    mockGetChainId(thorClient.getClientUrl().node, chainIds[Network.Stagenet])
  })

  afterEach(() => {
    thorClient.purgeClient()
    thorMainClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const thorClientEmptyMain = new Client({ phrase, network: Network.Mainnet })
    const addressMain = thorClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const thorClientEmptyTest = new Client({ phrase, network: Network.Stagenet })
    const addressTest = thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(stagenet_address_path0)
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
      network: Network.Stagenet /*, derivationPath: "44'/931'/0'/0/0"*/,
    })
    const addressTest = thorClientEmptyTest.getAddress()
    expect(addressTest).toEqual(stagenet_address_path0)

    const viaSetPhraseAddr1Test = thorClientEmptyTest.getAddress(1 /*, "44'/931'/0'/0/1"*/)
    expect(viaSetPhraseAddr1Test).toEqual(stagenet_address_path1)

    const thorClientEmptyMain1 = new Client({
      phrase,
      network: Network.Mainnet /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressMain1 = thorClientEmptyMain1.getAddress(1)
    expect(addressMain1).toEqual(mainnet_address_path1)

    const thorClientEmptyTest1 = new Client({
      phrase,
      network: Network.Stagenet /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressTest1 = thorClientEmptyTest1.getAddress(1)
    expect(addressTest1).toEqual(stagenet_address_path1)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new Client({ phrase: 'invalid phrase', network: Network.Mainnet })
    }).toThrow()

    expect(() => {
      new Client({ phrase: 'invalid phrase', network: Network.Stagenet })
    }).toThrow()
  })

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client({})
    }).not.toThrow()
  })

  it('should have right address', async () => {
    expect(thorClient.getAddress()).toEqual(stagenet_address_path0)

    expect(thorMainClient.getAddress()).toEqual(mainnet_address_path0)
  })

  it('should allow to get the CosmosSDKClient', async () => {
    expect(thorClient.getCosmosClient()).toBeInstanceOf(CosmosSDKClient)
  })

  it('should update net', async () => {
    thorMainClient.setNetwork(Network.Stagenet)
    expect(thorMainClient.getNetwork()).toEqual('stagenet')

    const address = await thorMainClient.getAddress()
    expect(address).toEqual(stagenet_address_path0)
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

    thorClient.setNetwork(Network.Stagenet)
    expect(thorClient.getClientUrl().node).toEqual('new stagenet client')
  })

  it('returns private key', async () => {
    const privKey = thorClient.getPrivateKey()
    expect(Buffer.from(privKey.bytes()).toString('base64')).toEqual('CHCbyYWorMZVRFtfJzt72DigvZeRNi3jo2c3hGEQ46I=')
  })

  describe('chainId', () => {
    it('get chainId', () => {
      const chainId = thorClient.getChainId()
      expect(chainId).toEqual('thorchain-stagenet-v2')
    })
    it('update chainId', () => {
      thorClient.setChainId('another-testnet-id')
      const chainId = thorClient.getChainId()
      expect(chainId).toEqual('another-testnet-id')
    })
    it('update chainId for testnet', () => {
      thorClient.setChainId('another-testnet-id', Network.Stagenet)
      const chainId = thorClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('another-testnet-id')
    })
    it('get default chainId for stagenet', () => {
      const chainId = thorClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('thorchain-stagenet-v2')
    })
    it('update chainId for stagenet', () => {
      thorClient.setChainId('another-stagenet-id', Network.Stagenet)
      const chainId = thorClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('another-stagenet-id')
    })
    it('get default chainId for mainnet', () => {
      const chainId = thorClient.getChainId(Network.Mainnet)
      expect(chainId).toEqual('thorchain-mainnet-v1')
    })
    it('update chainId for mainnet', () => {
      thorClient.setChainId('another-mainnet-id', Network.Mainnet)
      const chainId = thorClient.getChainId(Network.Mainnet)
      expect(chainId).toEqual('another-mainnet-id')
    })
  })

  it('returns public key', async () => {
    const pubKey = thorClient.getPubKey()
    const pkString = Buffer.from(pubKey.bytes()).toString('base64')
    expect(pkString).toEqual('AsL4F+rvFMqDkZYpVVnZa0OBa0EXwscjNrODbBME42vC')
  })

  it('has no balances', async () => {
    mockAccountsBalance(thorClient.getClientUrl().node, stagenet_address_path0, {
      balances: [],
    })
    const result = await thorClient.getBalance(thorClient.getAddress(0))
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    thorMainClient.setNetwork(Network.Mainnet)
    // mainnet - has balance: thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5
    // mainnet - 0: thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws
    mockAccountsBalance(thorMainClient.getClientUrl().node, 'thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5', {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'rune',
          amount: '100',
        }),
      ],
    })

    const balances = await thorMainClient.getBalance('thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5')
    expect(balances.length).toEqual(1)
    expect(balances[0].asset).toEqual(AssetRuneNative)
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
  })

  it('rune + synth balances', async () => {
    thorClient.setNetwork(Network.Stagenet)
    mockAccountsBalance(thorClient.getClientUrl().node, 'sthor13gym97tmw3axj3hpewdggy2cr288d3qfed2ken', {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'bnb/bnb',
          amount: '100',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'bnb/busd-74e',
          amount: '200',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'rune',
          amount: '200',
        }),
      ],
    })

    const balances = await thorClient.getBalance('sthor13gym97tmw3axj3hpewdggy2cr288d3qfed2ken')
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
    thorClient.setNetwork(Network.Stagenet)
    mockAccountsBalance(thorClient.getClientUrl().node, 'sthor13gym97tmw3axj3hpewdggy2cr288d3qfed2ken', {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'bnb/bnb',
          amount: '100',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'bnb/busd-74e',
          amount: '200',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'rune',
          amount: '200',
        }),
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

  it('has tx history with limit', async () => {
    const historyData = require('../__mocks__/responses/tx_search/sender-tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f.json')
    const bondTxData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')

    const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
    const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
    mockTxHistory(thorClient.getClientUrl().rpc, historyData)

    assertTxHashGet(thorClient.getClientUrl().node, txHash, { tx_response: bondTxData })

    const txs = await thorClient.getTransactions({
      address: 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f',
      limit: 1,
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

  it('get tx history with limit too high', async () => {
    const historyData = require('../__mocks__/responses/tx_search/sender-tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f.json')
    const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
    mockTxHistory(thorClient.getClientUrl().rpc, historyData)

    try {
      const txs = await thorClient.getTransactions({
        address,
        limit: MAX_TX_COUNT_PER_FUNCTION_CALL + 1,
      })
      expect(txs).toEqual({})
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`[Error: Maximum number of transaction per call is 500]`)
    }
  })

  it('get tx history with limit + offset too high', async () => {
    const historyData = require('../__mocks__/responses/tx_search/sender-tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f.json')
    const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
    mockTxHistory(thorClient.getClientUrl().rpc, historyData)

    try {
      const txs = await thorClient.getTransactions({
        address,
        limit: 1,
        offset: MAX_TX_COUNT_PER_PAGE * MAX_TX_COUNT_PER_PAGE,
      })
      expect(txs).toEqual({})
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`[Error: limit plus offset can not be grater than 1500]`)
    }
  })

  it('get tx history', async () => {
    const historyData = require('../__mocks__/responses/tx_search/sender-tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f.json')
    const bondTxData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
    const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
    const transactionData = require('../__mocks__/responses/txs/transactions.json')
    const txHashA = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
    const txHashB = '99C97CB3DAC2BABBF5EF2938C15E8D3AEA55A815BBD04FCB53D97FA044E941CC'
    mockTxHistory(thorClient.getClientUrl().rpc, historyData)
    thorClient.getTransactions = jest.fn().mockResolvedValue(transactionData)
    assertTxHashGet(thorClient.getClientUrl().node, txHashA, { tx_response: bondTxData })
    // assertTxHashGet(thorClient.getClientUrl().node, txHashB, { tx_response: bondTxData })

    const txs = await thorClient.getTransactions({
      address: 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f',
    })
    expect(txs.total).toEqual(2)

    const { type, hash, asset, from, to } = txs.txs[0]

    expect(type).toEqual('transfer')
    expect(hash).toEqual(txHashA)
    expect(asset).toEqual(AssetRuneNative)
    expect(from[0].from).toEqual(address)
    expect(from[1].from).toEqual(address)
    expect(to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
    expect(to[1].to).toEqual('tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff')
    expect(txs.txs[1].hash).toEqual(txHashB)
  })

  it('transfer', async () => {
    const to_address = thorClient.getAddress(1)
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result = {
      tx_response: {
        txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
        code: 0,
      },
    }

    const nodeUrl = thorClient.getClientUrl().node

    mockAccountsAddress(nodeUrl, stagenet_address_path0, {
      account: {
        '@type': '/cosmos.auth.v1beta1.BaseAccount',
        address: stagenet_address_path0,
        pub_key: {
          '@type': '/cosmos.crypto.secp256k1.PubKey',
          key: 'AyB84hKBjN2wsmdC2eF1Ppz6l3VxlfSKJpYsTaL4VrrE',
        },
        account_number: '0',
        sequence: '0',
      },
    })
    mockAccountsBalance(nodeUrl, stagenet_address_path0, {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'rune',
          amount: '210000000',
        }),
      ],
    })
    mockThorchainConstants(nodeUrl)
    mockTendermintSimulate(nodeUrl, {
      gas_info: {
        gas_used: '1000000',
      },
    })
    assertTxsPost(thorClient.getClientUrl().node, expected_txsPost_result)

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
      tx_response: {
        txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
        code: 0,
      },
    }

    const nodeUrl = thorClient.getClientUrl().node

    mockAccountsAddress(nodeUrl, stagenet_address_path0, {
      account: {
        '@type': '/cosmos.auth.v1beta1.BaseAccount',
        address: stagenet_address_path0,
        pub_key: {
          '@type': '/cosmos.crypto.secp256k1.PubKey',
          key: 'AyB84hKBjN2wsmdC2eF1Ppz6l3VxlfSKJpYsTaL4VrrE',
        },
        account_number: '0',
        sequence: '0',
      },
    })
    mockAccountsBalance(nodeUrl, stagenet_address_path0, {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'rune',
          amount: '210000000',
        }),
      ],
    })
    mockTendermintNodeInfo(nodeUrl, {
      default_node_info: {
        network: chainIds[Network.Stagenet],
      },
    })
    mockThorchainConstants(nodeUrl)
    mockTendermintSimulate(nodeUrl, {
      gas_info: {
        gas_used: '1000000',
      },
    })
    assertTxsPost(nodeUrl, expected_txsPost_result)

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
    assertTxHashGet(thorClient.getClientUrl().node, txHash, { tx_response: txData })
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
    expect(thorClient.getExplorerUrl()).toEqual('https://runescan.io?network=stagenet')

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getExplorerUrl()).toEqual('https://runescan.io')
  })

  it('should return valid explorer address url', () => {
    expect(thorClient.getExplorerAddressUrl('tthorabc')).toEqual(
      'https://runescan.io/address/tthorabc?network=stagenet',
    )

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getExplorerAddressUrl('thorabc')).toEqual('https://runescan.io/address/thorabc')
  })

  it('should return valid explorer tx url', () => {
    expect(thorClient.getExplorerTxUrl('txhash')).toEqual('https://runescan.io/tx/txhash?network=stagenet')

    thorClient.setNetwork(Network.Mainnet)
    expect(thorClient.getExplorerTxUrl('txhash')).toEqual('https://runescan.io/tx/txhash')
  })

  it('fetches fees from client', async () => {
    const url = thorClient.getClientUrl().node
    mockThorchainConstants(url)

    const fees = await thorClient.getFees()

    expect(fees.average.amount().toString()).toEqual('2000000')
    expect(fees.fast.amount().toString()).toEqual('2000000')
    expect(fees.fastest.amount().toString()).toEqual('2000000')
  })

  it('returns default fees if client is not available', async () => {
    const url = thorClient.getClientUrl().node
    nock(url).get('/thorchain/constants').reply(404)

    const fees = await thorClient.getFees()

    expect(fees.average.amount().toString()).toEqual('2000000')
    expect(fees.fast.amount().toString()).toEqual('2000000')
    expect(fees.fastest.amount().toString()).toEqual('2000000')
  })
})
