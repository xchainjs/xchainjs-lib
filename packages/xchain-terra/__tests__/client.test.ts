import { Network } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, eqAsset } from '@xchainjs/xchain-util'

import mockTerraApi from '../__mocks__/terra'
import { Client } from '../src/client'
import { AssetLUNA, AssetUST } from '../src/const'

// const mockAccountsAddress = (
//   url: string,
//   address: string,
//   result: {
//     height: number
//     result: BaseAccount
//   },
// ) => {
//   nock(url).get(`/auth/accounts/${address}`).reply(200, result)
// }

// const mockAccountsBalance = (
//   url: string,
//   address: string,
//   result: {
//     height: number
//     result: Coin[]
//   },
// ) => {
//   nock(url).get(`/bank/balances/${address}`).reply(200, result)
// }

// const mockThorchainDeposit = (url: string, result: ThorchainDepositResponse) => {
//   nock(url).post('/thorchain/deposit').reply(200, result)
// }

// const assertTxsPost = (url: string, memo: undefined | string, result: BroadcastTxCommitResult): void => {
//   nock(url)
//     .post(`/txs`, (body) => {
//       expect(body.tx.msg.length).toEqual(1)
//       expect(body.tx.memo).toEqual(memo)
//       return true
//     })
//     .reply(200, result)
// }

// const mockTxHistory = (url: string, result: RPCResponse<RPCTxSearchResult>): void => {
//   nock(url)
//     .get(`/tx_search`)
//     .twice()
//     .query((_) => true)
//     .reply(200, result)
// }

// const assertTxHashGet = (url: string, hash: string, result: TxResponse): void => {
//   nock(url).get(`/txs/${hash}`).reply(200, result)
// }

describe('Client Test', () => {
  let terraClient: Client
  let terraMainClient: Client
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'

  // Note: Terra testnet/mainnet addresses are the same
  const address_path0 = 'terra1hf2j3w46zw8lg25awgan7x8wwsnc509sk0e6gr'
  const address_path1 = 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy'

  beforeEach(() => {
    mockTerraApi.init()

    terraClient = new Client({ phrase, network: Network.Testnet })
    terraMainClient = new Client({ phrase, network: Network.Mainnet })
  })

  afterEach(() => {
    mockTerraApi.restore()

    terraClient.purgeClient()
    terraMainClient.purgeClient()
  })

  it('should start with empty wallet', async () => {
    const terraClientEmptyMain = new Client({ phrase, network: 'mainnet' as Network })
    const addressMain = terraClientEmptyMain.getAddress()
    expect(addressMain).toEqual(address_path0)

    const terraClientEmptyTest = new Client({ phrase, network: 'testnet' as Network })
    const addressTest = terraClientEmptyTest.getAddress()
    expect(addressTest).toEqual(address_path0)
  })

  it('should derive address accordingly to the user param', async () => {
    const terraClientEmptyMain = new Client({
      phrase,
      network: Network.Mainnet /*, derivationPath: "44'/931'/0'/0/0" */,
    })
    const addressMain = terraClientEmptyMain.getAddress()
    expect(addressMain).toEqual(address_path0)

    const viaSetPhraseAddr1 = terraClientEmptyMain.getAddress(1 /*, "44'/931'/0'/0/1" */)
    expect(viaSetPhraseAddr1).toEqual(address_path1)

    const terraClientEmptyTest = new Client({
      phrase,
      network: 'testnet' as Network /*, derivationPath: "44'/931'/0'/0/0"*/,
    })
    const addressTest = terraClientEmptyTest.getAddress()
    expect(addressTest).toEqual(address_path0)

    const viaSetPhraseAddr1Test = terraClientEmptyTest.getAddress(1 /*, "44'/931'/0'/0/1"*/)
    expect(viaSetPhraseAddr1Test).toEqual(address_path1)

    const terraClientEmptyMain1 = new Client({
      phrase,
      network: 'mainnet' as Network /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressMain1 = terraClientEmptyMain1.getAddress(1)
    expect(addressMain1).toEqual(address_path1)

    const terraClientEmptyTest1 = new Client({
      phrase,
      network: 'testnet' as Network /*, derivationPath: "44'/931'/0'/0/1"*/,
    })
    const addressTest1 = terraClientEmptyTest1.getAddress(1)
    expect(addressTest1).toEqual(address_path1)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new Client({ phrase: 'invalid phrase', network: 'mainnet' as Network })
    }).toThrow()

    expect(() => {
      new Client({ phrase: 'invalid phrase', network: 'testnet' as Network })
    }).toThrow()
  })

  it('should not throw on a client without a phrase', () => {
    expect(() => {
      new Client({
        network: Network.Testnet,
      })
    }).not.toThrow()
  })

  it('should have right address', async () => {
    expect(terraClient.getAddress()).toEqual(address_path0)

    expect(terraMainClient.getAddress()).toEqual(address_path0)
  })

  it('should update net', async () => {
    terraMainClient.setNetwork('testnet' as Network)
    expect(terraMainClient.getNetwork()).toEqual('testnet')

    const address = await terraMainClient.getAddress()
    expect(address).toEqual(address_path0)
  })

  it('should init, should have right prefix', async () => {
    expect(terraClient.validateAddress(terraClient.getAddress())).toEqual(true)

    terraClient.setNetwork('mainnet' as Network)
    expect(terraClient.validateAddress(terraClient.getAddress())).toEqual(true)

    terraClient.setNetwork('stagenet' as Network)
    expect(terraClient.validateAddress(terraClient.getAddress())).toEqual(true)
  })

  // it('should have right client url', async () => {
  //   terraClient.setClientUrl({
  //     mainnet: {
  //       node: 'new mainnet client',
  //       rpc: 'new mainnet client',
  //     },
  //     stagenet: {
  //       node: 'new stagenet client',
  //       rpc: 'new stagenet client',
  //     },
  //     testnet: {
  //       node: 'new testnet client',
  //       rpc: 'new testnet client',
  //     },
  //   })

  //   terraClient.setNetwork('mainnet' as Network)
  //   expect(terraClient.getClientUrl().node).toEqual('new mainnet client')

  //   terraClient.setNetwork('testnet' as Network)
  //   expect(terraClient.getClientUrl().node).toEqual('new testnet client')

  //   terraClient.setNetwork('stagenet' as Network)
  //   expect(terraClient.getClientUrl().node).toEqual('new stagenet client')
  // })

  // it('returns private key', async () => {
  //   const privKey = terraClient.getPrivKey()
  //   expect(privKey.toBase64()).toEqual('CHCbyYWorMZVRFtfJzt72DigvZeRNi3jo2c3hGEQ46I=')
  // })

  // it('returns public key', async () => {
  //   const pubKey = terraClient.getPubKey()
  //   expect(pubKey.toBase64()).toEqual('AsL4F+rvFMqDkZYpVVnZa0OBa0EXwscjNrODbBME42vC')
  // })

  // it('has no balances', async () => {
  //   mockAccountsBalance(terraClient.getClientUrl().node, address_path0, {
  //     height: 0,
  //     result: [],
  //   })
  //   const result = await terraClient.getBalance(terraClient.getAddress(0))
  //   expect(result).toEqual([])
  // })

  // it('has balances', async () => {
  //   thorMainClient.setNetwork('mainnet' as Network)
  //   // mainnet - has balance: thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5
  //   // mainnet - 0: thor19kacmmyuf2ysyvq3t9nrl9495l5cvktjs0yfws
  //   mockAccountsBalance(thorMainClient.getClientUrl().node, 'thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5', {
  //     height: 0,
  //     result: [
  //       {
  //         denom: 'rune',
  //         amount: '100',
  //       },
  //     ],
  //   })

  //   const balances = await thorMainClient.getBalance('thor147jegk6e9sum7w3svy3hy4qme4h6dqdkgxhda5')
  //   expect(balances.length).toEqual(1)
  //   expect(balances[0].asset).toEqual(AssetRuneNative)
  //   expect(balances[0].amount.amount().isEqualTo(baseAmount(100).amount())).toBeTruthy()
  // })

  // it('has an empty tx history', async () => {
  //   const expected: TxsPage = {
  //     total: 0,
  //     txs: [],
  //   }

  //   mockTxHistory(terraClient.getClientUrl().rpc, {
  //     jsonrpc: '2.0',
  //     id: -1,
  //     result: {
  //       txs: [],
  //       total_count: '0',
  //     },
  //   })

  //   const transactions = await terraClient.getTransactions({
  //     address: 'tthor13gym97tmw3axj3hpewdggy2cr288d3qffr8skg',
  //     limit: 1,
  //   })
  //   expect(transactions).toEqual(expected)
  // })

  // it('has tx history', async () => {
  //   const historyData = require('../__mocks__/responses/tx_search/sender-tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f.json')
  //   const bondTxData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
  //   const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
  //   const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
  //   mockTxHistory(terraClient.getClientUrl().rpc, historyData)

  //   assertTxHashGet(terraClient.getClientUrl().node, txHash, bondTxData)

  //   const txs = await terraClient.getTransactions({
  //     address: 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f',
  //   })

  //   expect(txs.total).toEqual(1)

  //   const { type, hash, asset, from, to } = txs.txs[0]

  //   expect(type).toEqual('transfer')
  //   expect(hash).toEqual(txHash)
  //   expect(asset).toEqual(AssetRuneNative)
  //   expect(from[0].from).toEqual(address)
  //   expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
  //   expect(from[1].from).toEqual(address)
  //   expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
  //   expect(to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
  //   expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
  //   expect(to[1].to).toEqual('tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff')
  //   expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
  // })

  // it('transfer', async () => {
  //   const to_address = 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4'
  //   const send_amount: BaseAmount = baseAmount(10000, 6)
  //   const memo = 'transfer'

  //   const expected_txsPost_result = {
  //     check_tx: {},
  //     deliver_tx: {},
  //     txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
  //     height: 0,
  //     logs: [],
  //   }

  //   mockAccountsAddress(terraClient.getClientUrl().node, address_path0, {
  //     height: 0,
  //     result: {
  //       coins: [
  //         {
  //           denom: 'rune',
  //           amount: '210000000',
  //         },
  //       ],
  //       account_number: '0',
  //       sequence: '0',
  //     },
  //   })
  //   mockAccountsBalance(terraClient.getClientUrl().node, address_path0, {
  //     height: 0,
  //     result: [
  //       {
  //         denom: 'rune',
  //         amount: '210000000',
  //       },
  //     ],
  //   })
  //   assertTxsPost(terraClient.getClientUrl().node, memo, expected_txsPost_result)

  //   const result = await terraClient.transfer({
  //     asset: AssetRuneNative,
  //     recipient: to_address,
  //     amount: send_amount,
  //     memo,
  //   })

  //   expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  // })

  // it('deposit', async () => {
  //   const send_amount: BaseAmount = baseAmount(10000, 6)
  //   const memo = 'swap:BNB.BNB:tbnb1ftzhmpzr4t8ta3etu4x7nwujf9jqckp3th2lh0'

  //   const expected_txsPost_result = {
  //     check_tx: {},
  //     deliver_tx: {},
  //     txhash: 'EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D',
  //     height: 0,
  //     logs: [],
  //   }

  //   mockAccountsAddress(terraClient.getClientUrl().node, address_path0, {
  //     height: 0,
  //     result: {
  //       coins: [
  //         {
  //           denom: 'rune',
  //           amount: '210000000',
  //         },
  //       ],
  //       account_number: '0',
  //       sequence: '0',
  //     },
  //   })
  //   mockAccountsBalance(terraClient.getClientUrl().node, address_path0, {
  //     height: 0,
  //     result: [
  //       {
  //         denom: 'rune',
  //         amount: '210000000',
  //       },
  //     ],
  //   })
  //   mockThorchainDeposit(terraClient.getClientUrl().node, {
  //     type: 'cosmos-sdk/StdTx',
  //     value: {
  //       msg: [
  //         {
  //           type: 'thorchain/MsgDeposit',
  //           value: {
  //             coins: [
  //               {
  //                 asset: 'THOR.RUNE',
  //                 amount: '10000',
  //               },
  //             ],
  //             memo: 'swap:BNB.BNB:tbnb1ftzhmpzr4t8ta3etu4x7nwujf9jqckp3th2lh0',
  //             signer: 'tthor19kacmmyuf2ysyvq3t9nrl9495l5cvktj5c4eh4',
  //           },
  //         },
  //       ],
  //       fee: {
  //         amount: [],
  //         gas: '100000000',
  //       },
  //       signatures: [],
  //       memo: '',
  //       timeout_height: '0',
  //     },
  //   })
  //   assertTxsPost(terraClient.getClientUrl().node, '', expected_txsPost_result)

  //   const result = await terraClient.deposit({
  //     asset: AssetRuneNative,
  //     amount: send_amount,
  //     memo,
  //   })

  //   expect(result).toEqual('EA2FAC9E82290DCB9B1374B4C95D7C4DD8B9614A96FACD38031865EB1DBAE24D')
  // })

  // it('get transaction data for BOND tx', async () => {
  //   const txData = require('../__mocks__/responses/txs/bond-tn-9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C.json')
  //   const txHash = '9C175AF7ACE9FCDC930B78909FFF598C18CBEAF9F39D7AA2C4D9A27BB7E55A5C'
  //   const address = 'tthor137kees65jmhjm3gxyune0km5ea0zkpnj4lw29f'
  //   assertTxHashGet(terraClient.getClientUrl().node, txHash, txData)
  //   const { type, hash, asset, from, to } = await terraClient.getTransactionData(txHash, address)

  //   expect(type).toEqual('transfer')
  //   expect(hash).toEqual(txHash)
  //   expect(asset).toEqual(AssetRuneNative)
  //   expect(from[0].from).toEqual(address)
  //   expect(from[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
  //   expect(from[1].from).toEqual(address)
  //   expect(from[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
  //   expect(to[0].to).toEqual('tthor1dheycdevq39qlkxs2a6wuuzyn4aqxhve3hhmlw')
  //   expect(to[0].amount.amount().toString()).toEqual(assetToBase(assetAmount(0.02)).amount().toString())
  //   expect(to[1].to).toEqual('tthor17gw75axcnr8747pkanye45pnrwk7p9c3uhzgff')
  //   expect(to[1].amount.amount().toString()).toEqual(assetToBase(assetAmount(1700)).amount().toString())
  // })

  // it('should return valid explorer url', () => {
  //   expect(terraClient.getExplorerUrl()).toEqual('https://viewblock.io/thorchain?network=testnet')

  //   terraClient.setNetwork('mainnet' as Network)
  //   expect(terraClient.getExplorerUrl()).toEqual('https://viewblock.io/thorchain')
  // })

  // it('should return valid explorer address url', () => {
  //   expect(terraClient.getExplorerAddressUrl('tthorabc')).toEqual(
  //     'https://viewblock.io/thorchain/address/tthorabc?network=testnet',
  //   )

  //   terraClient.setNetwork('mainnet' as Network)
  //   expect(terraClient.getExplorerAddressUrl('thorabc')).toEqual('https://viewblock.io/thorchain/address/thorabc')
  // })

  // it('should return valid explorer tx url', () => {
  //   expect(terraClient.getExplorerTxUrl('txhash')).toEqual('https://viewblock.io/thorchain/tx/txhash?network=testnet')

  //   terraClient.setNetwork('mainnet' as Network)
  //   expect(terraClient.getExplorerTxUrl('txhash')).toEqual('https://viewblock.io/thorchain/tx/txhash')
  // })

  describe('getEstimatedFee', () => {
    it('LUNA asset + fees', async () => {
      const feeAsset = AssetLUNA
      const { amount, asset, gasLimit } = await terraClient.getEstimatedFee({
        asset: AssetLUNA,
        feeAsset,
        amount: assetToBase(assetAmount(1)),
        sender: terraClient.getAddress(0),
        recipient: 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy',
      })
      // gas price (uluna) * estimated gas (tx) * DEFAULT_GAS_ADJUSTMENT
      // 0.01133 * 100000 * 2
      expect(amount.amount().toString()).toEqual('2266')
      expect(eqAsset(asset, feeAsset)).toBeTruthy()
      expect(gasLimit.toFixed()).toEqual('200000')
    })

    it('LUNA asset + USDT fees', async () => {
      const feeAsset = AssetUST
      const { amount, asset, gasLimit } = await terraClient.getEstimatedFee({
        asset: AssetLUNA,
        feeAsset,
        amount: assetToBase(assetAmount(1)),
        sender: terraClient.getAddress(0),
        recipient: 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy',
      })

      // gas price (uusd) * estimated gas (tx) * DEFAULT_GAS_ADJUSTMENT
      // 0.15 * 100000 * 2
      expect(amount.amount().toString()).toEqual('30000')
      expect(eqAsset(asset, feeAsset)).toBeTruthy()
      expect(gasLimit.toFixed()).toEqual('200000')
    })

    it('USDT asset + fees', async () => {
      const feeAsset = AssetUST
      const { amount, asset, gasLimit } = await terraClient.getEstimatedFee({
        asset: AssetUST,
        feeAsset,
        amount: assetToBase(assetAmount(1)),
        sender: terraClient.getAddress(0),
        recipient: 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy',
      })

      // gas price (uusd) * estimated gas (tx) * DEFAULT_GAS_ADJUSTMENT
      // 0.15 * 100000 * 2
      expect(amount.amount().toString()).toEqual('30000')
      expect(eqAsset(asset, feeAsset)).toBeTruthy()
      expect(gasLimit.toFixed()).toEqual('200000')
    })

    it('USDT asset + LUNA fees', async () => {
      const feeAsset = AssetLUNA
      const { amount, asset, gasLimit } = await terraClient.getEstimatedFee({
        asset: AssetUST,
        feeAsset,
        amount: assetToBase(assetAmount(1)),
        sender: terraClient.getAddress(0),
        recipient: 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy',
      })

      // gas price (uluna) * estimated gas (tx) * DEFAULT_GAS_ADJUSTMENT
      // 0.01133 * 100000 * 2
      expect(amount.amount().toString()).toEqual('2266')
      expect(eqAsset(asset, feeAsset)).toBeTruthy()
      expect(gasLimit.toFixed()).toEqual('200000')
    })
  })

  describe('getFees', () => {
    it('LUNA fees', async () => {
      const result = await terraClient.getFees({
        asset: AssetUST,
        feeAsset: AssetLUNA,
        amount: assetToBase(assetAmount(1)),
        sender: terraClient.getAddress(0),
        recipient: 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy',
      })
      // gas price (uluna) * estimated gas (tx) * DEFAULT_GAS_ADJUSTMENT
      // 0.01133 * 100000 * 2
      expect(result.average.amount().toString()).toEqual('2266')
    })

    it('USDT fees', async () => {
      const result = await terraClient.getFees({
        asset: AssetUST,
        feeAsset: AssetUST,
        amount: assetToBase(assetAmount(1)),
        sender: terraClient.getAddress(0),
        recipient: 'terra1f5p4qskczjt6hww3c3c04vhpy7uwq76upufkcy',
      })

      // gas price (uusd) * estimated gas (tx) * DEFAULT_GAS_ADJUSTMENT
      // 0.15 * 100000 * 2
      expect(result.average.amount().toString()).toEqual('30000')
    })
  })
})
