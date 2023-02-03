import { Network, TxHash } from '@xchainjs/xchain-client'

import mockBlockcypherApi from '../__mocks__/blockcypher'
import mockSochainApi from '../__mocks__/sochain'
import { UTXO } from '../src/types/common'
import * as Utils from '../src/utils'

let utxos: UTXO[]
const apiKey = 'xxx'

describe('Dogecoin Utils Test', () => {
  beforeEach(() => {
    mockSochainApi.init()
    mockBlockcypherApi.init()
  })
  afterEach(() => {
    mockSochainApi.restore()
    mockBlockcypherApi.restore()
  })

  const witness = {
    script: Buffer.from('0014123f6562aa047dae2d38537327596cd8e9e21932'),
    value: 10000,
  }

  utxos = []
  const utxo = {
    hash: '7fc1d2c1e4017a6aea030be1d4f5365d11abfd295f56c13615e49641c55c54b8',
    index: 0,
    value: witness.value,
    witnessUtxo: witness,
    txHex:
      '01000000000101233b5e27c30135274523c69c68558dddd265e63d9f2db1953e59c6ba6dc4912e0100000000ffffffff01dc410f0000000000160014ea0b3a147753eaf29d8aa820b335876daa0d61cb02483045022100c324931915f3215cbc4175e196a78b11333dcb08bc929c417bc98645acd638fc022028bb7bbb5da72f630aeba29a76a763407c3a98a7e8809c78ffab02f2d2a4eb0e012102dbc2fa9261379482e9ed484dc2c8b8a3ca7543391de90159a51e1791c4d2271b00000000',
  }
  utxos.push(utxo)

  it('get the right normal fee', () => {
    const fee = Utils.getFee(utxos, 1000, null)
    expect(fee).toEqual(227000)
  })

  it('should return a minimum fee of 1000', () => {
    const fee = Utils.getFee(utxos, 1)
    expect(fee).toEqual(100000)
  })

  // TODO: update getDefaultFees function to be filled with realistic values for DOGE
  it('should return default fees of a normal tx', async () => {
    const estimates = Utils.getDefaultFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })

  it('should fetch as many uxtos as are associated with an address', async () => {
    const address = 'DRapidDiBYggT1zdrELnVhNDqyAHn89cRi'
    const utxos: UTXO[] = await Utils.scanUTXOs({
      apiKey,
      sochainUrl: 'https://sochain.com/api/v3',
      network: Network.Mainnet,
      address,
    })
    expect(utxos.length).toEqual(1)
    expect(utxos?.[0].hash).toEqual('f65aa58332a0d491d7f96ccb96cc513ad622f18ad88cbe123096b23963569da0')
    expect(utxos?.[0].value).toEqual(100000000)
  })

  it('broadcastTx (mainnet / blockcypher)', async () => {
    const txHash: TxHash = await Utils.broadcastTx({
      nodeUrl: 'https://api.blockcypher.com/v1/txs/push',
      network: Network.Mainnet,
      txHex:
        '01000000011935b41d12936df99d322ac8972b74ecff7b79408bbccaf1b2eb8015228beac8000000006b483045022100921fc36b911094280f07d8504a80fbab9b823a25f102e2bc69b14bcd369dfc7902200d07067d47f040e724b556e5bc3061af132d5a47bd96e901429d53c41e0f8cca012102152e2bb5b273561ece7bbe8b1df51a4c44f5ab0bc940c105045e2cc77e618044ffffffff0240420f00000000001976a9145fb1af31edd2aa5a2bbaa24f6043d6ec31f7e63288ac20da3c00000000001976a914efec6de6c253e657a9d5506a78ee48d89762fb3188ac00000000',
    })
    expect(txHash).toEqual('mock-txid-blockcypher')
  })

  it('broadcastTx testnet sochain', async () => {
    const txHash: TxHash = await Utils.broadcastTx({
      nodeUrl: 'https://sochain.com/api/v3/broadcast_transaction/',
      network: Network.Testnet,
      txHex:
        '01000000011935b41d12936df99d322ac8972b74ecff7b79408bbccaf1b2eb8015228beac8000000006b483045022100921fc36b911094280f07d8504a80fbab9b823a25f102e2bc69b14bcd369dfc7902200d07067d47f040e724b556e5bc3061af132d5a47bd96e901429d53c41e0f8cca012102152e2bb5b273561ece7bbe8b1df51a4c44f5ab0bc940c105045e2cc77e618044ffffffff0240420f00000000001976a9145fb1af31edd2aa5a2bbaa24f6043d6ec31f7e63288ac20da3c00000000001976a914efec6de6c253e657a9d5506a78ee48d89762fb3188ac00000000',
    })
    expect(txHash).toEqual('mock-txid-sochain')
  })
})
