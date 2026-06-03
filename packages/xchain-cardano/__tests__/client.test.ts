import { Balance, Network, TxType } from '@xchainjs/xchain-client'
import { assetAmount, assetToBase, assetToString, baseAmount, eqAsset } from '@xchainjs/xchain-util'

import cardanoApi from '../__mocks__/cardano/api'
import { ADAAsset, Client, defaultAdaParams } from '../src'
import { chunkMemoUtf8 } from '../src/utils'
import { getCardano } from '../src/wasm'

// Inspects the auxiliary data the client attached to the most recently built transaction. The CSL
// mock records every builder it creates on __builders, and prepareTx builds exactly one, so the
// last builder is the one for the call under test. Returns the CIP-20 message decoded from metadata
// label 674 ({msg: [chunks]}), whether the legacy bare-text set_metadata path was used, and whether
// the Conway tag-259 (prefer-alonzo) form was requested. Real CBOR-byte validation against live
// MAYA is done manually in xchain-suite; the stub mock can't produce real serialization.
const inspectLastBuiltTx = async () => {
  const cardanoLib = await getCardano()
  const builders = (cardanoLib as unknown as { __builders: { _auxData?: AttachedAuxData; set_metadata: jest.Mock }[] })
    .__builders
  const builder = builders[builders.length - 1]
  const auxData = builder._auxData
  const legacyMetadataUsed = builder.set_metadata.mock.calls.length > 0
  if (!auxData) return { auxData: undefined, legacyMetadataUsed, preferAlonzo: false, msg: undefined }
  const metadatum = auxData.metadata()?.get(cardanoLib.BigNum.from_str('674'))
  const msg = metadatum
    ? (JSON.parse(
        cardanoLib.decode_metadatum_to_json_str(metadatum, cardanoLib.MetadataJsonSchema.BasicConversions),
      ) as { msg: string[] })
    : undefined
  return { auxData, legacyMetadataUsed, preferAlonzo: auxData._preferAlonzo, msg }
}

type AttachedAuxData = {
  _preferAlonzo: boolean
  metadata: () => { get: (label: { value: string }) => unknown } | undefined
}

describe('Cardano client', () => {
  let client: Client

  beforeAll(() => {
    client = new Client({
      apiKeys: {
        blockfrostApiKeys: [
          {
            mainnet: 'fakeApiKey',
            testnet: 'fakeApiKey',
            stagenet: 'fakeApiKey',
          },
        ],
      },
    })
  })

  beforeAll(() => {
    cardanoApi.init()
  })

  afterAll(() => {
    cardanoApi.restore()
  })

  it('Should get native asset', () => {
    const assetInfo = client.getAssetInfo()
    expect(assetToString(assetInfo.asset)).toBe('ADA.ADA')
    expect(assetInfo.decimal).toBe(6)
  })

  describe('Balance', () => {
    it('Should get native balance for address with balance', async () => {
      const address =
        'addr1q8y00208qsdrm9n3gcjtea9c9r9a80t7kn0v3q6n7pcemnk8n03nhutmws5h5m5ku2fh57uky59yesxzs7hkp7w2lz4qvp4h5h'
      const balances = await client.getBalance(address)
      expect(balances.some((balance) => eqAsset(balance.asset, ADAAsset))).toBeTruthy()
    })

    it('Should get native balance for address with no balance', async () => {
      const address =
        'addr1q9kjqjg3yfql7uspafzanp0xq4fvuqzgyewhqhcqnk94w4gk9jlajcx98yc9g8rxgw0zrdsprlkkjl4l2s9ls6hvxlsqj9j8fm-no-balance'
      const balances = await client.getBalance(address)
      expect(balances.some((balance) => eqAsset(balance.asset, ADAAsset))).toBeTruthy()
      expect(balances[0].amount.amount().toString()).toBe('0')
    })

    it('Should get native balance in correct format', async () => {
      const address =
        'addr1zyq0kyrml023kwjk8zr86d5gaxrt5w8lxnah8r6m6s4jp4g3r6dxnzml343sx8jweqn4vn3fz2kj8kgu9czghx0jrsyqqktyhv'
      const balances = await client.getBalance(address)
      const balance = balances.find((balance) => eqAsset(balance.asset, ADAAsset))
      expect(balance).toBeDefined()
      const adaBalance = balance as Balance
      expect(assetToString(adaBalance.asset)).toEqual('ADA.ADA')
      expect(adaBalance.amount.decimal).toEqual(6)
      expect(adaBalance.amount.amount().toString()).toEqual('133884551384')
    })
  })

  describe('Transaction', () => {
    it('Should get fees without memo', async () => {
      const fees = await client.getFees({
        sender:
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        amount: assetToBase(assetAmount(1, 6)),
      })

      expect(fees.average.amount().toString()).toBe('155381')
      expect(fees.fast.amount().toString()).toBe('194226')
      expect(fees.fastest.amount().toString()).toBe('233072')
    })

    it('Should get fees with memo', async () => {
      const fees = await client.getFees({
        sender:
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv',
        amount: assetToBase(assetAmount(1, 6)),
        memo: 'test',
      })

      expect(fees.average.amount().toString()).toBe('155381')
      expect(fees.fast.amount().toString()).toBe('194226')
      expect(fees.fastest.amount().toString()).toBe('233072')
    })

    it('Should prepare a tx when the balance comfortably covers amount + fee', async () => {
      const sender =
        'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv'

      const { rawUnsignedTx } = await client.prepareTx({
        sender,
        recipient: sender,
        amount: assetToBase(assetAmount(1, 6)),
      })

      expect(typeof rawUnsignedTx).toBe('string')
      expect(rawUnsignedTx.length).toBeGreaterThan(0)
    })

    const memoSender =
      'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv'

    it('Should not attach auxiliary data when no memo is given', async () => {
      await client.prepareTx({
        sender: memoSender,
        recipient: memoSender,
        amount: assetToBase(assetAmount(1, 6)),
      })

      const { auxData, legacyMetadataUsed } = await inspectLastBuiltTx()
      expect(auxData).toBeUndefined()
      expect(legacyMetadataUsed).toBe(false)
    })

    it('Should embed a short memo at CIP-20 label 674 as {msg: [chunks]} in Conway (prefer-alonzo) aux data', async () => {
      const memo = '=:ADA.ADA:addr1...:0/1/0'

      await client.prepareTx({
        sender: memoSender,
        recipient: memoSender,
        amount: assetToBase(assetAmount(1, 6)),
        memo,
      })

      const { msg: decoded, preferAlonzo, legacyMetadataUsed } = await inspectLastBuiltTx()
      expect(decoded).toEqual({ msg: [memo] })
      // prefer-alonzo emits the CBOR tag-259 form the MAYA Cardano observer reads the memo from.
      expect(preferAlonzo).toBe(true)
      // The legacy bare-text set_metadata path must no longer be used.
      expect(legacyMetadataUsed).toBe(false)
    })

    it('Should split a long memo into <=64-byte chunks at CIP-20 label 674', async () => {
      const longMemo = 'A'.repeat(150)

      await client.prepareTx({
        sender: memoSender,
        recipient: memoSender,
        amount: assetToBase(assetAmount(1, 6)),
        memo: longMemo,
      })

      const { msg: decoded } = await inspectLastBuiltTx()
      const chunks = decoded!.msg
      expect(chunks).toEqual(chunkMemoUtf8(longMemo))
      expect(chunks.join('')).toBe(longMemo)
      expect(chunks.length).toBe(3)
      expect(chunks.every((chunk) => new TextEncoder().encode(chunk).length <= 64)).toBe(true)
    })

    it('Should reject a prepareTx that drains the wallet (amount > balance - fee)', async () => {
      const sender =
        'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv'

      // Mocked UTXOs sum to 88_765_089_594_051 lovelace. Asking for the full balance leaves
      // nothing for the fee, which previously either threw an opaque CSL error or silently
      // collapsed the change into the fee. We now reject this with a clear message.
      await expect(
        client.prepareTx({
          sender,
          recipient: sender,
          amount: baseAmount('88765089594051', 6),
        }),
      ).rejects.toThrow(/Insufficient ADA/)
    })

    it('Should sweep the wallet via prepareMaxTx with maxAmount = balance - fee', async () => {
      const sender =
        'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv'

      const totalLovelace = 88_765_089_594_051n

      const result = await client.prepareMaxTx({ sender, recipient: sender })

      const fee = BigInt(result.fee.amount().toString())
      const maxAmount = BigInt(result.maxAmount.amount().toString())

      expect(fee).toBeGreaterThan(0n)
      expect(maxAmount).toBe(totalLovelace - fee)
      expect(typeof result.rawUnsignedTx).toBe('string')
      expect(result.rawUnsignedTx.length).toBeGreaterThan(0)
    })

    it('Should get native transaction data', async () => {
      const txId = '6b8cf522fd97792bbe0cb03a1c057ac41c5e26338a31515c2c022cb0bee9f2a2'
      const tx = await client.getTransactionData(txId)
      expect(tx.type).toBe(TxType.Transfer)
      expect(tx.hash).toBe(txId)
      expect(tx.date.getTime()).toBe(1720535411000)
      expect(assetToString(tx.asset)).toBe('ADA.ADA')
      expect(tx.from.length).toBe(1)
      expect(tx.from[0].from).toBe(
        'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
      )
      expect(tx.from[0].amount.amount().toString()).toBe('69382438882275')
      expect(tx.from[0].asset ? assetToString(tx.from[0].asset) : undefined).toBe('ADA.ADA')

      expect(tx.to.length).toBe(2)
      expect(tx.to[0].to).toBe(
        'addr1q8h6u88370nw2va448ukdj9spujm5an7nce8j0qg6hzg0kw5xxq3r3rcel85zeezwm5w9e3l449j0gudvge3c9tht68s2uw5gk',
      )
      expect(tx.to[0].amount.amount().toString()).toBe('49999788000000')
      expect(tx.to[0].asset ? assetToString(tx.to[0].asset) : undefined).toBe('ADA.ADA')

      expect(tx.to[1].to).toBe(
        'addr1q88p8j5jgpujpf33l5ja2rreearp3x9x59ju65hxkhu29jvctwav0g4zrrmq388yc7h22qehlyt4y556atrty5sfdq5q7plfz5',
      )
      expect(tx.to[1].amount.amount().toString()).toBe('19382650711776')
      expect(tx.to[1].asset ? assetToString(tx.to[1].asset) : undefined).toBe('ADA.ADA')
    })
  })

  describe('Explorers', () => {
    describe('Mainnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          apiKeys: {
            blockfrostApiKeys: [
              {
                mainnet: process.env.BLOCKFROST_API_KEY_MAINNET || '',
                testnet: process.env.BLOCKFROST_API_KEY_MAINNET || '',
                stagenet: process.env.BLOCKFROST_API_KEY_MAINNET || '',
              },
            ],
          },
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://adastat.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            'addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
          ),
        ).toBe(
          'https://adastat.net/addresses/addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3')).toBe(
          'https://adastat.net/transactions/f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3',
        )
      })
    })

    describe('Testnet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          network: Network.Testnet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://preprod.cardanoscan.io/')
      })
      it('Should get address url', () => {
        expect(client.getExplorerAddressUrl('addr_test1vpws8zs83y2egkx28rg9cc97cdr46gsrpu8q8r0w8ylsq3saapj3k')).toBe(
          'https://preprod.cardanoscan.io/address/addr_test1vpws8zs83y2egkx28rg9cc97cdr46gsrpu8q8r0w8ylsq3saapj3k',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('dd941e610df9c7504be85153477012c254a6a5a46bb2142c62dea3f170f13faa')).toBe(
          'https://preprod.cardanoscan.io/transaction/dd941e610df9c7504be85153477012c254a6a5a46bb2142c62dea3f170f13faa',
        )
      })
    })

    describe('Stagenet', () => {
      let client: Client
      beforeAll(() => {
        client = new Client({
          network: Network.Stagenet,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })
      it('Should get explorer url', () => {
        expect(client.getExplorerUrl()).toBe('https://adastat.net/')
      })
      it('Should get address url', () => {
        expect(
          client.getExplorerAddressUrl(
            'addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
          ),
        ).toBe(
          'https://adastat.net/addresses/addr1z8ax5k9mutg07p2ngscu3chsauktmstq92z9de938j8nqacuyrnkl6qpk3zlnk7qg8xpz7q8s73vmth5u4s2hyc6qtxqqrxvhh',
        )
      })
      it('Should get transaction url', () => {
        expect(client.getExplorerTxUrl('f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3')).toBe(
          'https://adastat.net/transactions/f479bd4b1a77a61ce90248065d903ccee8629351132d77fae90cda73731fd0d3',
        )
      })
    })
  })

  describe('chunkMemoUtf8', () => {
    it('Should return an empty array for an empty memo', () => {
      expect(chunkMemoUtf8('')).toEqual([])
    })

    it('Should keep a memo at or below 64 bytes as a single chunk', () => {
      const memo = 'A'.repeat(64)
      expect(chunkMemoUtf8(memo)).toEqual([memo])
    })

    it('Should split a 65-byte memo into two chunks', () => {
      const memo = 'A'.repeat(65)
      expect(chunkMemoUtf8(memo)).toEqual(['A'.repeat(64), 'A'])
    })

    it('Should chunk by UTF-8 byte length without splitting a multi-byte codepoint', () => {
      // '€' is 3 UTF-8 bytes. 63 'A' (63 bytes) + '€' would be 66 bytes, so the euro sign must
      // start a new chunk rather than being split across the 64-byte boundary.
      const memo = 'A'.repeat(63) + '€'
      const chunks = chunkMemoUtf8(memo)
      expect(chunks).toEqual(['A'.repeat(63), '€'])
      expect(chunks.every((chunk) => new TextEncoder().encode(chunk).length <= 64)).toBe(true)
    })
  })

  describe('Address', () => {
    describe('Mainnet', () => {
      beforeAll(() => {
        client = new Client({
          ...defaultAdaParams,
          apiKeys: {
            blockfrostApiKeys: [],
          },
        })
      })

      it('Should validate addresses correctly', async () => {
        // Test valid address
        const validAddress =
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhv'
        const validResult = client.validateAddress(validAddress)
        expect(validResult).toBeTruthy()

        // Test invalid address
        const invalidAddress =
          'addr1qy8ac7qqy0vtulyl7wntmsxc6wex80gvcyjy33qffrhm7sh927ysx5sftuw0dlft05dz3c7revpf7jx0xnlcjz3g69mq4afdhf'
        const invalidResult = client.validateAddress(invalidAddress)
        expect(invalidResult).toBeFalsy()
      })
    })
  })
})
