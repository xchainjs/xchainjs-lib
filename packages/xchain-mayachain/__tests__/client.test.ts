import cosmosclient from '@cosmos-client/core'
import { AssetBNB, BNBChain } from '@xchainjs/xchain-binance'
import { Network, TxsPage } from '@xchainjs/xchain-client'
import { CosmosSDKClient, RPCResponse, RPCTxSearchResult, TxResponse } from '@xchainjs/xchain-cosmos'
import { Asset, BaseAmount, assetAmount, assetToBase, baseAmount } from '@xchainjs/xchain-util'
import nock from 'nock'

import { mockTendermintNodeInfo, mockTendermintSimulate } from '../__mocks__/mayanode-api'
import { Client } from '../src/client'
import { AssetCacao, AssetMaya } from '../src/const'

const chainIds = {
  [Network.Mainnet]: 'mayachain-mainnet-v1',
  [Network.Stagenet]: 'mayachain-stagenet-v1',
  [Network.Testnet]: 'deprecated',
}

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

const mockMayachainConstants = (url: string) => {
  const response = require('../__mocks__/responses/mayachain/constants.json')
  nock(url).get('/mayachain/constants').reply(200, response)
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
  nock(url).persist().get(`/cosmos/tx/v1beta1/txs/${hash}`).reply(200, result)
}

describe('Client Test', () => {
  let mayaClient: Client
  let mayaMainClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnet_address_path0 = 'maya19kacmmyuf2ysyvq3t9nrl9495l5cvktjsc69cq'
  const mainnet_address_path1 = 'maya1hrf34g3lxwvpk7gjte0xvahf3txnq8ecg2he9g'
  const stagenet_address_path0 = 'smaya19kacmmyuf2ysyvq3t9nrl9495l5cvktjypxnw7'
  const stagenet_address_path1 = 'smaya1hrf34g3lxwvpk7gjte0xvahf3txnq8ecunt0nk'

  beforeEach(() => {
    mayaClient = new Client({ phrase, network: Network.Stagenet })
    mayaMainClient = new Client({ phrase, network: Network.Mainnet })
    mockGetChainId(mayaClient.getClientUrl().node, chainIds[Network.Stagenet])
  })

  afterEach(() => {
    mayaClient.purgeClient()
    mayaMainClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const mayaClientEmptyMain = new Client({ phrase, network: Network.Mainnet })
    const addressMain = mayaClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const mayaClientEmptyTest = new Client({ phrase, network: Network.Stagenet })
    const addressTest = mayaClientEmptyTest.getAddress()
    expect(addressTest).toEqual(stagenet_address_path0)
  })

  it('should derive address accordingly to the user param', async () => {
    const mayaClientEmptyMain = new Client({
      phrase,
      network: Network.Mainnet /*, derivationPath: "44'/931'/0'/0/0" */,
    })
    const addressMain = mayaClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnet_address_path0)

    const viaSetPhraseAddr1 = mayaClientEmptyMain.getAddress(1 /*, "44'/931'/0'/0/1" */)
    expect(viaSetPhraseAddr1).toEqual(mainnet_address_path1)

    const mayaClientEmptyTest = new Client({
      phrase,
      network: Network.Stagenet /*, derivationPath: "44'/931'/0'/0/0"*/,
    })
    const addressTest = mayaClientEmptyTest.getAddress()
    expect(addressTest).toEqual(stagenet_address_path0)

    const viaSetPhraseAddr1Test = mayaClientEmptyTest.getAddress(1 /*, "44'/931'/0'/0/1"*/)
    expect(viaSetPhraseAddr1Test).toEqual(stagenet_address_path1)

    const mayaClientEmptyMain1 = new Client({
      phrase,
      network: Network.Mainnet /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressMain1 = mayaClientEmptyMain1.getAddress(1)
    expect(addressMain1).toEqual(mainnet_address_path1)

    const mayaClientEmptyTest1 = new Client({
      phrase,
      network: Network.Stagenet /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressTest1 = mayaClientEmptyTest1.getAddress(1)
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
    expect(mayaClient.getAddress()).toEqual(stagenet_address_path0)

    expect(mayaMainClient.getAddress()).toEqual(mainnet_address_path0)
  })

  it('should allow to get the CosmosSDKClient', async () => {
    expect(mayaClient.getCosmosClient()).toBeInstanceOf(CosmosSDKClient)
  })

  it('should update net', async () => {
    mayaMainClient.setNetwork(Network.Stagenet)
    expect(mayaMainClient.getNetwork()).toEqual('stagenet')

    const address = await mayaMainClient.getAddress()
    expect(address).toEqual(stagenet_address_path0)
  })

  it('should init, should have right prefix', async () => {
    expect(mayaClient.validateAddress(mayaClient.getAddress())).toBeTruthy()

    mayaClient.setNetwork(Network.Mainnet)
    expect(mayaClient.validateAddress(mayaClient.getAddress())).toBeTruthy()

    mayaClient.setNetwork(Network.Stagenet)
    expect(mayaClient.validateAddress(mayaClient.getAddress())).toBeTruthy()
  })

  it('should have right client url', async () => {
    mayaClient.setClientUrl({
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

    mayaClient.setNetwork(Network.Mainnet)
    expect(mayaClient.getClientUrl().node).toEqual('new mainnet client')

    mayaClient.setNetwork(Network.Stagenet)
    expect(mayaClient.getClientUrl().node).toEqual('new stagenet client')
  })

  it('returns private key', async () => {
    const privKey = mayaClient.getPrivateKey()
    expect(Buffer.from(privKey.bytes()).toString('base64')).toEqual('CHCbyYWorMZVRFtfJzt72DigvZeRNi3jo2c3hGEQ46I=')
  })

  describe('chainId', () => {
    it('get chainId', () => {
      const chainId = mayaClient.getChainId()
      expect(chainId).toEqual('mayachain-stagenet-v1')
    })
    it('update chainId', () => {
      mayaClient.setChainId('another-testnet-id')
      const chainId = mayaClient.getChainId()
      expect(chainId).toEqual('another-testnet-id')
    })
    it('update chainId for testnet', () => {
      mayaClient.setChainId('another-testnet-id', Network.Stagenet)
      const chainId = mayaClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('another-testnet-id')
    })
    it('get default chainId for stagenet', () => {
      const chainId = mayaClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('mayachain-stagenet-v1')
    })
    it('update chainId for stagenet', () => {
      mayaClient.setChainId('another-stagenet-id', Network.Stagenet)
      const chainId = mayaClient.getChainId(Network.Stagenet)
      expect(chainId).toEqual('another-stagenet-id')
    })
    it('get default chainId for mainnet', () => {
      const chainId = mayaClient.getChainId(Network.Mainnet)
      expect(chainId).toEqual('mayachain-mainnet-v1')
    })
    it('update chainId for mainnet', () => {
      mayaClient.setChainId('another-mainnet-id', Network.Mainnet)
      const chainId = mayaClient.getChainId(Network.Mainnet)
      expect(chainId).toEqual('another-mainnet-id')
    })
  })

  it('returns public key', async () => {
    const pubKey = mayaClient.getPubKey()
    const pkString = Buffer.from(pubKey.bytes()).toString('base64')
    expect(pkString).toEqual('AsL4F+rvFMqDkZYpVVnZa0OBa0EXwscjNrODbBME42vC')
  })

  it('has no balances', async () => {
    mockAccountsBalance(mayaClient.getClientUrl().node, stagenet_address_path0, {
      balances: [],
    })
    const result = await mayaClient.getBalance(mayaClient.getAddress(0))
    expect(result).toEqual([])
  })

  it('has balances', async () => {
    mayaMainClient.setNetwork(Network.Mainnet)
    // mainnet - has balance: thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5
    // mainnet - 0: maya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkgmwpuz
    mockAccountsBalance(mayaMainClient.getClientUrl().node, 'maya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkgmwpuz', {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'cacao',
          amount: '100',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'maya',
          amount: '100',
        }),
      ],
    })

    const balances = await mayaMainClient.getBalance('maya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkgmwpuz')
    expect(balances.length).toEqual(2)
    expect(balances[0].asset).toEqual(AssetCacao)
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
    expect(balances[1].asset).toEqual(AssetMaya)
    expect(balances[1].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
  })

  it('rune + synth balances', async () => {
    mayaClient.setNetwork(Network.Stagenet)
    mockAccountsBalance(mayaClient.getClientUrl().node, 'smaya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkuzjh2u', {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'BNB/BNB',
          amount: '100',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'BNB/BUSD-74E',
          amount: '200',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'RUNE',
          amount: '200',
        }),
      ],
    })

    const balances = await mayaClient.getBalance('smaya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkuzjh2u')

    expect(balances.length).toEqual(3)
    // BNB synth
    expect(balances[0].asset).toEqual({ ...AssetBNB, synth: true })
    expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount()))
    // BUSD synth
    expect(balances[1].asset).toEqual({ chain: 'BNB', symbol: 'BUSD-74E', ticker: 'BUSD', synth: true })
    expect(balances[1].amount.amount().isEqualTo(baseAmount(200).amount()))
    // RUNE
    expect(balances[2].asset).toEqual(AssetCacao)
    expect(balances[2].amount.amount().isEqualTo(baseAmount(300).amount()))
  })

  it('filter BUSD synth balances', async () => {
    const BUSD_ASSET_SYNTH: Asset = { chain: BNBChain, symbol: 'BUSD-74E', ticker: 'BUSD', synth: true }
    mayaClient.setNetwork(Network.Stagenet)
    mockAccountsBalance(mayaClient.getClientUrl().node, 'smaya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkuzjh2u', {
      balances: [
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'BNB/BNB',
          amount: '100',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'BNB/BUSD-74E',
          amount: '200',
        }),
        new cosmosclient.proto.cosmos.base.v1beta1.Coin({
          denom: 'RUNE',
          amount: '200',
        }),
      ],
    })

    const balances = await mayaClient.getBalance('smaya14e0zalymjxjxlwsmtwyvvtagm2hhw6jkuzjh2u', [BUSD_ASSET_SYNTH])
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

    mockTxHistory(mayaClient.getClientUrl().rpc, {
      jsonrpc: '2.0',
      id: -1,
      result: {
        txs: [],
        total_count: '0',
      },
    })

    const transactions = await mayaClient.getTransactions({
      address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
      limit: 1,
    })
    expect(transactions).toEqual(expected)
  })

  it('has tx history', async () => {
    const historyData = require('../__mocks__/responses/tx_search/sender-tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t.json')
    const bondTxData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
    const address = 'tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t'
    const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
    mockTxHistory(mayaClient.getClientUrl().rpc, historyData)

    assertTxHashGet(mayaClient.getClientUrl().node, txHash, { tx_response: bondTxData })

    const txs = await mayaClient.getTransactions({
      address: 'tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t',
    })

    expect(txs.total).toEqual(1)

    const { type, hash, asset, from, to } = txs.txs[0]

    expect(type).toEqual('transfer')
    expect(hash).toEqual(txHash)
    expect(asset).toEqual(AssetCacao)
    expect(from[0].from).toEqual(address)
    expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(from[1].from).toEqual(address)
    expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1)).amount().toString())
    expect(to[0].to).toEqual('tmaya1dheycdevq39qlkxs2a6wuuzyn4aqxhve3qfhf7')
    expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(to[1].to).toEqual('tmaya17gw75axcnr8747pkanye45pnrwk7p9c3uquyle')
    expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1)).amount().toString())
  })

  it('transfer', async () => {
    const to_address = mayaClient.getAddress(1)
    const send_amount: BaseAmount = baseAmount(10000, 6)
    const memo = 'transfer'

    const expected_txsPost_result = {
      tx_response: {
        txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
        code: 0,
      },
    }

    const nodeUrl = mayaClient.getClientUrl().node

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
    mockMayachainConstants(nodeUrl)
    mockTendermintSimulate(nodeUrl, {
      gas_info: {
        gas_used: '1000000',
      },
    })
    assertTxsPost(mayaClient.getClientUrl().node, expected_txsPost_result)

    const result = await mayaClient.transfer({
      asset: AssetCacao,
      recipient: to_address,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  })

  it('deposit', async () => {
    const send_amount: BaseAmount = baseAmount(10000, 8)
    const memo = 'swap:BNB.BNB:tbnb1gkx89nlh55urxht7tz7uw0z7whhyvvf8yuwrp7'

    const expected_txsPost_result = {
      tx_response: {
        txhash: '653E03EC0FE53E5402E5CC6D3D8FAD14E2CDF2BED4A8948BA1B0120B479A9D3E',
        code: 0,
      },
    }

    const nodeUrl = mayaClient.getClientUrl().node

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
          denom: 'cacao',
          amount: '210000000',
        }),
      ],
    })
    mockTendermintNodeInfo(nodeUrl, {
      default_node_info: {
        network: chainIds[Network.Stagenet],
      },
    })
    mockMayachainConstants(nodeUrl)
    mockTendermintSimulate(nodeUrl, {
      gas_info: {
        gas_used: '1000000',
      },
    })
    assertTxsPost(nodeUrl, expected_txsPost_result)

    const result = await mayaClient.deposit({
      asset: AssetCacao,
      amount: send_amount,
      memo,
    })

    expect(result).toEqual('653E03EC0FE53E5402E5CC6D3D8FAD14E2CDF2BED4A8948BA1B0120B479A9D3E')
  })

  it('get transaction data for BOND tx', async () => {
    const txData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
    const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
    const address = 'tmaya1gkx89nlh55urxht7tz7uw0z7whhyvvf822wv6t'
    assertTxHashGet(mayaClient.getClientUrl().node, txHash, { tx_response: txData })
    const { type, hash, asset, from, to } = await mayaClient.getTransactionData(txHash, address)

    expect(type).toEqual('transfer')
    expect(hash).toEqual(txHash)
    expect(asset).toEqual(AssetCacao)
    expect(from[0].from).toEqual(address)
    expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(from[1].from).toEqual(address)
    expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1)).amount().toString())
    expect(to[0].to).toEqual('tmaya1dheycdevq39qlkxs2a6wuuzyn4aqxhve3qfhf7')
    expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
    expect(to[1].to).toEqual('tmaya17gw75axcnr8747pkanye45pnrwk7p9c3uquyle')
    expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1)).amount().toString())
  })

  it('should return valid explorer url', () => {
    expect(mayaClient.getExplorerUrl()).toEqual('https://explorer.mayachain.info?network=stagenet')

    mayaClient.setNetwork(Network.Mainnet)
    expect(mayaClient.getExplorerUrl()).toEqual('https://explorer.mayachain.info')
  })

  it('should return valid explorer address url', () => {
    expect(mayaClient.getExplorerAddressUrl('tthorabc')).toEqual(
      'https://explorer.mayachain.info/address/tthorabc?network=stagenet',
    )

    mayaClient.setNetwork(Network.Mainnet)
    expect(mayaClient.getExplorerAddressUrl('thorabc')).toEqual('https://explorer.mayachain.info/address/thorabc')
  })

  it('should return valid explorer tx url', () => {
    expect(mayaClient.getExplorerTxUrl('txhash')).toEqual('https://explorer.mayachain.info/tx/txhash?network=stagenet')

    mayaClient.setNetwork(Network.Mainnet)
    expect(mayaClient.getExplorerTxUrl('txhash')).toEqual('https://explorer.mayachain.info/tx/txhash')
  })

  it('fetches fees from client', async () => {
    const url = mayaClient.getClientUrl().node
    mockMayachainConstants(url)

    const fees = await mayaClient.getFees()

    expect(fees.average.amount().toString()).toEqual('2000000')
    expect(fees.fast.amount().toString()).toEqual('2000000')
    expect(fees.fastest.amount().toString()).toEqual('2000000')
  })

  it('returns default fees if client is not available', async () => {
    const url = mayaClient.getClientUrl().node
    nock(url).get('/mayachain/constants').reply(404)

    const fees = await mayaClient.getFees()

    expect(fees.average.amount().toString()).toEqual('200000000')
    expect(fees.fast.amount().toString()).toEqual('200000000')
    expect(fees.fastest.amount().toString()).toEqual('200000000')
  })
})
