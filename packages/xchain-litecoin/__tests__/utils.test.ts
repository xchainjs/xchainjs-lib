import { Network } from '@xchainjs/xchain-client'
import * as Litecoin from 'bitcoinjs-lib'

import mockSochainApi from '../__mocks__/sochain'
import mockThornodeApi from '../__mocks__/thornode-api'
import { UTXO } from '../src/types/common'
import * as Utils from '../src/utils'

let utxos: UTXO[]

describe('Litecoin Utils Test', () => {
  beforeEach(() => {
    mockSochainApi.init()
    mockThornodeApi.init()
  })
  afterEach(() => {
    mockSochainApi.restore()
    mockThornodeApi.restore()
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
  const memo = 'SWAP:THOR.RUNE'
  const data = Buffer.from(memo, 'utf8') // converts MEMO to buffer
  const OP_RETURN = Litecoin.script.compile([Litecoin.opcodes.OP_RETURN, data]) // Compile OP_RETURN script

  it('get the right vault fee', () => {
    const fee = Utils.getFee(utxos, 10, OP_RETURN)
    expect(fee).toEqual(1890)
  })

  it('get the right normal fee', () => {
    const fee = Utils.getFee(utxos, 10, null)
    expect(fee).toEqual(1640)
  })

  it('should return a minimum fee of 1000', () => {
    const fee = Utils.getFee(utxos, 1)
    expect(fee).toEqual(1000)
  })

  it('should return default fees of a normal tx', async () => {
    const estimates = Utils.getDefaultFees()
    expect(estimates.fast).toBeDefined()
    expect(estimates.fastest).toBeDefined()
    expect(estimates.average).toBeDefined()
  })
  it('should fetch as many uxtos as are associated with an address', async () => {
    const address = 'M8T1B2Z97gVdvmfkQcAtYbEepune1tzGua'
    const utxos: UTXO[] = await Utils.scanUTXOs({
      sochainUrl: 'https://sochain.com/api/v2',
      network: Network.Mainnet,
      address,
    })
    expect(utxos.length).toEqual(213)
    expect(utxos?.[0].hash).toEqual('65b34acff41570854758adf6bdafc94c0c33f78194d7f49f1cf8d24314b4d47a')
    expect(utxos?.[212].hash).toEqual('f180c1cd0a8e719456f3f033c497bae2cedc482d87443b668c0a5a277272b2ba')
  })

  it('fetches uxtos with tx hashes', async () => {
    const utxos: UTXO[] = await Utils.scanUTXOs({
      sochainUrl: 'https://sochain.com/api/v2',
      network: Network.Mainnet,
      address: '3Gi2h7qawGV74cW14VstRXR5KXuszA1E4d',
      withTxHex: true,
    })
    expect(utxos.length).toEqual(2)
    expect(utxos?.[0].txHex).toEqual(
      '01000000000102b553e93f0c927d44b7b4916257b1ede3b7c651fa70527bad25f20db55c1b50aa0000000000fdffffff77b26316ac212fbebf3abc440278e5b603b60b1c5733ae621d3c6c003e73115c0000000000feffffff01a8405a000000000017a914a4baf1bae58d11536548d437713b99d47f9213f4870247304402201e13756ffd74f2c89542f6a4d022f298181d6dc5b7f84c8d76aa1afbac786fa30220561bff0da6037e3e9d2792a1b0a05dc00775858a437c8b644e9f401df9192739012103df2365318e86e7d4971a825b3265cc80b28235c0c77612d155968390b7ec57e502473044022042df93024ef970f2ef70fcb2f352266215fb1072069bf81bdfcb7e741c280b0e0220405f98570e0a462f11d89b4595e4811f5def3010a9858e7d5659052bb084a8c0012103df2365318e86e7d4971a825b3265cc80b28235c0c77612d155968390b7ec57e500000000',
    )
    expect(utxos?.[1].txHex).toEqual(
      '010000000001020d7a2258f321d17dc7571f18d55abe59f493c89138e8b5de43e3683e3085c8b60000000000fdffffff8d8e6f61a9732fe6bba7927591136d3b4004a28515420c25ff7ce8a1db8e6b600000000000feffffff01152c4e000000000017a914a4baf1bae58d11536548d437713b99d47f9213f48702483045022100ec4250332f0f2b9f05078ea1d58c1b577ec9614eff3e70249fd932774949d2d102207391e6b99391d899755be23b8592c4ac7798250c36691350d9c56b76fa395d3b012103d0635c580ef041ba12686d621d6cd193dc08dd1a627458222a84eae78a396658024830450221008638423e93857fc18cab6679184d21cf0d76b59f58e5ebffb2a3d02b7452419c022063d0b4e256c3d70d05ad4698c3ff463558a379349fee8188f477e40bc7dd0695012103d0635c580ef041ba12686d621d6cd193dc08dd1a627458222a84eae78a39665800000000',
    )
  })

  it('fetches uxtos without tx hashes', async () => {
    const utxos: UTXO[] = await Utils.scanUTXOs({
      sochainUrl: 'https://sochain.com/api/v2',
      network: Network.Mainnet,
      address: '3Gi2h7qawGV74cW14VstRXR5KXuszA1E4d',
    })
    expect(utxos.length).toEqual(2)
    expect(utxos?.[0].txHex).toBeUndefined()
    expect(utxos?.[1].txHex).toBeUndefined()
  })

  describe('broadcastTx', () => {
    it('returns txHash', async () => {
      const txHash = await Utils.broadcastTx({
        txHex: '0xdead',
        nodeUrl: 'https://ltc.thorchain.info',
        customRequestHeaders: { xxx: 'yyy' },
      })
      expect(txHash).toEqual('mock-txid')
    })
  })
})
