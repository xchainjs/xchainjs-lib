import { IndexedTx, Block, StdFee } from '@cosmjs/stargate'
import { AssetInfo, Network, PreparedTx } from '@xchainjs/xchain-client'
import { Asset, AssetType, baseAmount, assetToString } from '@xchainjs/xchain-util'

import Client, { CosmosSdkClientParams } from '../src/client'
import { CompatibleAsset } from '../src/types'

// --- Test asset ---
const AssetATOM: Asset = { chain: 'GAIA', symbol: 'ATOM', ticker: 'ATOM', type: AssetType.NATIVE }

// --- Concrete subclass for testing the abstract Client ---
class TestClient extends Client {
  getAssetDecimals(): number {
    return 6
  }
  protected getPrefix(): string {
    return 'cosmos'
  }
  getAddress(): string {
    return 'cosmos1sender'
  }
  getAddressAsync(): Promise<string> {
    return Promise.resolve('cosmos1sender')
  }
  transfer(): Promise<string> {
    return Promise.resolve('txhash')
  }
  prepareTx(): Promise<PreparedTx> {
    throw new Error('Not implemented')
  }
  protected getMsgTypeUrlByType(): string {
    return '/cosmos.bank.v1beta1.MsgSend'
  }
  protected getStandardFee(): StdFee {
    return { amount: [{ denom: 'uatom', amount: '5000' }], gas: '200000' }
  }
  getAssetInfo(): AssetInfo {
    return { asset: AssetATOM, decimal: 6 }
  }
  getDenom(asset: CompatibleAsset): string | null {
    if (asset.symbol === 'ATOM') return 'uatom'
    return null
  }
  assetFromDenom(denom: string): CompatibleAsset | null {
    if (denom === 'uatom') return AssetATOM
    return null
  }
  getExplorerUrl(): string {
    return ''
  }
  getExplorerAddressUrl(): string {
    return ''
  }
  getExplorerTxUrl(): string {
    return ''
  }
}

// --- Helpers ---

const mockBlock: Block = {
  id: 'blockid',
  header: {
    version: { block: '11', app: '0' },
    height: 100,
    chainId: 'cosmoshub-4',
    time: '2024-01-01T00:00:00Z',
  },
  txs: [],
} as unknown as Block

function makeTransferEvent(sender: string, recipient: string, amount: string) {
  return {
    type: 'transfer',
    attributes: [
      { key: 'sender', value: sender },
      { key: 'recipient', value: recipient },
      { key: 'amount', value: amount },
    ],
  }
}

function makeTxEvent() {
  return {
    type: 'tx',
    attributes: [
      { key: 'fee', value: '5000uatom' },
      { key: 'acc_seq', value: 'cosmos1sender/42' },
    ],
  }
}

function makeFeeTransferEvent() {
  return makeTransferEvent('cosmos1sender', 'cosmos1feepool', '5000uatom')
}

function makeIndexedTx(events: { type: string; attributes: { key: string; value: string }[] }[]): IndexedTx {
  return {
    height: 100,
    hash: 'ABCDEF1234567890',
    code: 0,
    events,
    rawLog: '',
    tx: new Uint8Array(),
    msgResponses: [],
    gasUsed: BigInt(100000),
    gasWanted: BigInt(200000),
  }
}

function createClient(): TestClient {
  const params: CosmosSdkClientParams = {
    network: Network.Mainnet,
    chain: 'GAIA',
    defaultDecimals: 6,
    prefix: 'cosmos',
    baseDenom: 'uatom',
    defaultFee: baseAmount(5000, 6),
    rootDerivationPaths: {
      [Network.Mainnet]: "44'/118'/0'/0/",
      [Network.Testnet]: "44'/118'/0'/0/",
      [Network.Stagenet]: "44'/118'/0'/0/",
    },
    clientUrls: {
      [Network.Mainnet]: ['https://rpc.cosmos.network'],
      [Network.Testnet]: ['https://rpc.cosmos.network'],
      [Network.Stagenet]: ['https://rpc.cosmos.network'],
    },
    registryTypes: [],
  }
  return new TestClient(params)
}

// --- Mock StargateClient ---
const mockGetTx = jest.fn()
const mockGetBlock = jest.fn()

jest.mock('@cosmjs/stargate', () => {
  const actual = jest.requireActual('@cosmjs/stargate')
  return {
    ...actual,
    StargateClient: {
      connect: jest.fn().mockResolvedValue({
        getTx: (...args: unknown[]) => mockGetTx(...args),
        getBlock: (...args: unknown[]) => mockGetBlock(...args),
      }),
    },
  }
})

describe('CosmosSDKClient mapIndexedTxToTx', () => {
  let client: TestClient

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetBlock.mockResolvedValue(mockBlock)
    client = createClient()
  })

  it('should parse a standard Cosmos transfer with tx + fee events before message events', async () => {
    // Typical Cosmos tx: several ante handler events, then a tx event, then message events
    const indexedTx = makeIndexedTx([
      // Ante handler events (fee-related)
      {
        type: 'coin_spent',
        attributes: [
          { key: 'spender', value: 'cosmos1sender' },
          { key: 'amount', value: '5000uatom' },
        ],
      },
      {
        type: 'coin_received',
        attributes: [
          { key: 'receiver', value: 'cosmos1feepool' },
          { key: 'amount', value: '5000uatom' },
        ],
      },
      makeFeeTransferEvent(),
      { type: 'message', attributes: [{ key: 'sender', value: 'cosmos1sender' }] },
      { type: 'tx', attributes: [{ key: 'fee', value: '5000uatom' }] },
      { type: 'tx', attributes: [{ key: 'acc_seq', value: 'cosmos1sender/0' }] },
      makeTxEvent(),
      // Message events (actual transfer)
      {
        type: 'coin_spent',
        attributes: [
          { key: 'spender', value: 'cosmos1sender' },
          { key: 'amount', value: '1000000uatom' },
        ],
      },
      {
        type: 'coin_received',
        attributes: [
          { key: 'receiver', value: 'cosmos1recipient' },
          { key: 'amount', value: '1000000uatom' },
        ],
      },
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '1000000uatom'),
      { type: 'message', attributes: [{ key: 'module', value: 'bank' }] },
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    expect(tx.hash).toBe('ABCDEF1234567890')
    expect(tx.from).toHaveLength(1)
    expect(tx.to).toHaveLength(1)
    expect(tx.from[0].from).toBe('cosmos1sender')
    expect(tx.to[0].to).toBe('cosmos1recipient')
    expect(tx.from[0].amount.amount().toString()).toBe('1000000')
    expect(tx.to[0].amount.amount().toString()).toBe('1000000')
    expect(assetToString(tx.asset)).toBe('GAIA.ATOM')
  })

  it('should handle transactions with few events (e.g. THORChain) — the original slice(7) bug', async () => {
    // Only 3 events total — the old .slice(7) would skip everything
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      makeTransferEvent('thor1sender', 'thor1recipient', '500000uatom'),
      { type: 'message', attributes: [{ key: 'module', value: 'bank' }] },
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    expect(tx.from).toHaveLength(1)
    expect(tx.to).toHaveLength(1)
    expect(tx.from[0].from).toBe('thor1sender')
    expect(tx.to[0].to).toBe('thor1recipient')
    expect(tx.from[0].amount.amount().toString()).toBe('500000')
  })

  it('should process all events when no tx-type event exists (fallback)', async () => {
    const indexedTx = makeIndexedTx([makeTransferEvent('cosmos1sender', 'cosmos1recipient', '100uatom')])

    mockGetTx.mockResolvedValue(indexedTx)

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    const tx = await client.getTransactionData('ABCDEF1234567890')
    warnSpy.mockRestore()

    expect(tx.from).toHaveLength(1)
    expect(tx.to).toHaveLength(1)
    expect(tx.from[0].amount.amount().toString()).toBe('100')
  })

  it('should use findLastIndex — skip all ante events when multiple tx events exist', async () => {
    const indexedTx = makeIndexedTx([
      // First tx event group
      makeTxEvent(),
      // Fee transfer between tx events — should be skipped
      makeTransferEvent('cosmos1sender', 'cosmos1feepool', '5000uatom'),
      // Second tx event group (last one)
      makeTxEvent(),
      // Actual message transfer — should be included
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '999uatom'),
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    // Only the transfer after the LAST tx event should be included
    expect(tx.from).toHaveLength(1)
    expect(tx.to).toHaveLength(1)
    expect(tx.to[0].to).toBe('cosmos1recipient')
    expect(tx.to[0].amount.amount().toString()).toBe('999')
  })

  it('should skip transfer events with missing attributes and log a warning', async () => {
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      // Transfer missing 'amount' attribute
      {
        type: 'transfer',
        attributes: [
          { key: 'sender', value: 'cosmos1sender' },
          { key: 'recipient', value: 'cosmos1recipient' },
        ],
      },
      // Valid transfer
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '100uatom'),
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    const tx = await client.getTransactionData('ABCDEF1234567890')

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Transfer event missing required attributes'))
    warnSpy.mockRestore()

    expect(tx.from).toHaveLength(1)
    expect(tx.to).toHaveLength(1)
    expect(tx.to[0].amount.amount().toString()).toBe('100')
  })

  it('should skip transfer events with empty attribute values', async () => {
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      {
        type: 'transfer',
        attributes: [
          { key: 'sender', value: '' },
          { key: 'recipient', value: 'cosmos1recipient' },
          { key: 'amount', value: '100uatom' },
        ],
      },
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '200uatom'),
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation()
    const tx = await client.getTransactionData('ABCDEF1234567890')
    warnSpy.mockRestore()

    expect(tx.from).toHaveLength(1)
    expect(tx.to[0].amount.amount().toString()).toBe('200')
  })

  it('should aggregate amounts for duplicate recipient+asset transfers (map key fix)', async () => {
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '100uatom'),
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '200uatom'),
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    // Should be aggregated into one entry, not two
    expect(tx.to).toHaveLength(1)
    expect(tx.from).toHaveLength(1)
    expect(tx.to[0].amount.amount().toString()).toBe('300')
    expect(tx.from[0].amount.amount().toString()).toBe('300')
  })

  it('should throw when no transfer events are found (empty results)', async () => {
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      // Only non-transfer events
      { type: 'message', attributes: [{ key: 'module', value: 'bank' }] },
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    await expect(client.getTransactionData('ABCDEF1234567890')).rejects.toThrow(
      'No transfer events found in tx ABCDEF1234567890',
    )
  })

  it('should handle multi-denom transfers in a single event', async () => {
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      {
        type: 'transfer',
        attributes: [
          { key: 'sender', value: 'cosmos1sender' },
          { key: 'recipient', value: 'cosmos1recipient' },
          { key: 'amount', value: '100uatom,200uatom' },
        ],
      },
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    // Both amounts are uatom, should be aggregated
    expect(tx.to).toHaveLength(1)
    expect(tx.to[0].amount.amount().toString()).toBe('300')
  })

  it('should skip unknown denominations', async () => {
    const indexedTx = makeIndexedTx([
      makeTxEvent(),
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '100unknowndenom'),
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '200uatom'),
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    // Only uatom should be parsed (unknowndenom returns null from assetFromDenom)
    expect(tx.to).toHaveLength(1)
    expect(tx.to[0].amount.amount().toString()).toBe('200')
    expect(assetToString(tx.asset)).toBe('GAIA.ATOM')
  })

  it('should return correct date from block header', async () => {
    const indexedTx = makeIndexedTx([makeTxEvent(), makeTransferEvent('cosmos1sender', 'cosmos1recipient', '100uatom')])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    expect(tx.date).toEqual(new Date('2024-01-01T00:00:00Z'))
  })

  it('should correctly exclude fee transfer before tx event boundary', async () => {
    // Simulates a real Cosmos tx where fee transfer happens before the tx event
    const indexedTx = makeIndexedTx([
      makeTransferEvent('cosmos1sender', 'cosmos1feepool', '5000uatom'), // fee — should be skipped
      makeTxEvent(),
      makeTransferEvent('cosmos1sender', 'cosmos1recipient', '1000uatom'), // actual — should be included
    ])

    mockGetTx.mockResolvedValue(indexedTx)

    const tx = await client.getTransactionData('ABCDEF1234567890')

    expect(tx.to).toHaveLength(1)
    expect(tx.to[0].to).toBe('cosmos1recipient')
    expect(tx.to[0].amount.amount().toString()).toBe('1000')
  })
})
