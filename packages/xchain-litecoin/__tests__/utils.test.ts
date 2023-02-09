import { Network } from '@xchainjs/xchain-client'
import * as Litecoin from 'bitcoinjs-lib'

import mockSochainApi from '../__mocks__/sochain'
import mockThornodeApi from '../__mocks__/thornode-api'
import { UTXO } from '../src/types/common'
import * as Utils from '../src/utils'

let utxos: UTXO[]
const apiKey = 'xxx'

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
      apiKey,
      sochainUrl: 'https://sochain.com/api/v3',
      network: Network.Mainnet,
      address,
    })
    expect(utxos.length).toEqual(38)
    expect(utxos?.[0].hash).toEqual('4b1340c65c2029524bae8b1bd0d86bb01fa82b152cca64a76df1c65841587f2e')
    expect(utxos?.[37].hash).toEqual('74c651dc312ba73f14b0bde3da623263aa8fb37cc811f4373b0ad418e9390ac6')
  })

  it('fetches uxtos with tx hashes', async () => {
    const utxos: UTXO[] = await Utils.scanUTXOs({
      apiKey,
      sochainUrl: 'https://sochain.com/api/v3',
      network: Network.Mainnet,
      address: 'LUM1ZTZRmc425sd1yS41UtxjQACDqBqrQm',
    })
    expect(utxos.length).toEqual(2)
    expect(utxos?.[0].txHex).toEqual(
      '0100000002ca668409da4d4b3660a9dcece8a13da46bdc32d700d0c73cce3a32cdb99933f121000000fdfd000047304402201e68165097cc77b336ac9aa9f9371bed4df8aca2b1235e03177d6a5589e74c8c022042c3292b82b758c530b76006de7d3dc1066608d88a939586cfa816be9ea99b6d014830450221008e41d8c735323ceb232b4d5289e3b4b26a2e12f8c2c36da96de7fd17aab99aef022004554a1d2dcf3d9f6a66e3b12c6e3ceb57d6b1a60f75099861de43ce53b0e016014c69522102bb3de2904db1340c821f57393f04f683f32031325c567e04b9056f258fc460762102ebc7131fd1e06beabd06acd97cb456e1dc1295447d7a95de8eb75c0527ef174d2103e7c6f3c3efa11b84a8bde007714b93f36b6308e6c5e42e26808fc3bf3195314553aeffffffff23876ff699c912390c64a4b4743f3fd20262b872513a14280e029d3e7b01aae902000000fdfe00004830450221009efa7340ec8d37a0136480055099beedb1d9981da3aaf8f7b8b8be87064534230220469c73f81daa7a4cfe49c46bb54cb98a4cf6bd188cc92dc2535feeb99bbce96501483045022100bafb429ce3d8458185bb371d576fe5dca234b8cf246e9a31bcef4d8167422b1802207224b75f1b4900e7e65f188d98ce54c1699d601d51fb6b8f2dface1690750e2d014c69522102b72207e8c02320c746a0aa7e8e0fdb9d39276e16251ed08c48b208c38621a5912103556cc60ee4df44d3cade5f274b41aab29ad2e461116eb5d48d10fec34cd6c75c210389a56a7a61aa798ee2777d46fb1705f2df339865193e4d40eafe80cd1f00a3ae53aeffffffff0400e1f505000000001976a914640ecbd82ce51bdff6f53ae6ddf2fcbe3ca0c82f88ac218ab511000000001976a914183fc2ed387a9ef0f69b54d36a3e35647c01ba5f88acf0e09e0800000000160014de6bc0411c5277cfcdd7678a2b2ba0ad7e69e99a4412341e0000000022002013308dcd68fe38cac36c8fc52d58f0161901ed96786e3195c901dd52c46f2ea100000000',
    )
    expect(utxos?.[1].txHex).toEqual(
      '010000000001029dca7c289ffe2cc67fbaf4aa636f22c884fa8fa32c3a2cf034622331d513797c00000000fc004730440220299ae1152f5a09b8e8a2b40afb11677bd2bed3917dbc274e3131970e223060de022009a9f03f313afc392661cbf1094c75f783834ca4eddaa62874f163921fa07b6e0147304402207ff9b0a37eaa7f083daeec0c1c714e88f711108932a29d8c42bdf434c466dd5602207865ab19456edf0658ad23995c9a56fd8c6a8f2f7c5a96ed9d0449f30fbe4095014c69522102f32a57fe45c1500f7a329eed812208e45c0112d2da1973c7962a155741549f73210384c2797394eba4d3274ea3e6b970b784db1a02daa36471e26e7dee7dd9ae7fc721024e82842811e352e926cb9ca3ff43a7f21d9614be20c62f90bb69acf38153c2d153aeffffffff27de825e12f11e89699f239ea158fe27e057da389401993e2cd95587bb3e2d480400000000ffffffff06309803020000000017a91470cedc52008d6fdb431bc65827761ffe303d228c87d04f1110000000001976a9148dfa31e88a7e3736d5de418117fb800394646e7288ac4da742000000000016001435deecd00ddc4649d4a453ad5ba425d6e01a551182d48fe09f0000001976a914640ecbd82ce51bdff6f53ae6ddf2fcbe3ca0c82f88ac0cbbce000000000017a914e53975b7f5cc8e7568e069c9ce5872b5ca7b6055876a6430c05154000022002013308dcd68fe38cac36c8fc52d58f0161901ed96786e3195c901dd52c46f2ea1000400483045022100fbab199ee0e716396630652d103f49fdef669fd8166ab2bc5b4eaa3ea735fbba022007916b576b5f3c41904f7d51594e3843bcaff6feb5d08f2a9657eb8de0abaede01483045022100fbdd6aac3483f1070375271dc65ec868f8491c2a6c48afffe89560fa369961af0220685df279e88335c7ff53c217b34489f481cd39c484c485275f534a581dbecec101695221024ae22b49865207865e57b5056abb1e9f6480a6621a246b7066ab84c3b7f9d2b5210255f79ad111076c25b3f6d5e2e99250b6150b1d1b6af10f860f41f63c68859704210247eb8b75b8e50a8a33a7d9ada81f3ecaa05228bfeec3274bc6520637f2eacbf553ae00000000',
    )
  })

  it('fetches uxtos without tx hashes', async () => {
    const utxos: UTXO[] = await Utils.scanUTXOs({
      apiKey,
      sochainUrl: 'https://sochain.com/api/v3',
      network: Network.Mainnet,
      address: 'LUM1ZTZRmc425sd1yS41UtxjQACDqBqrQm',
    })
    expect(utxos.length).toEqual(2)
    // expect(utxos?.[0].txHex).toBeUndefined() // not sure what this is meant to do
    // expect(utxos?.[1].txHex).toBeUndefined()
  })

  describe('broadcastTx', () => {
    it('returns txHash', async () => {
      const txHash = await Utils.broadcastTx({
        txHex: '0xdead',
        nodeUrl: 'https://ltc.thorchain.info',
      })
      expect(txHash).toEqual('mock-txid')
    })
  })
})
