// Exercises the REAL @chainflip/sdk (not the manual mock in __mocks__) for BSC.
// Only the transport is stubbed: `fetch` (state-chain RPC, backend /networkInfo, broker RPC)
// and the SDK's axios quote call. SDK request building, zod validation, address validation,
// amount limits and price scaling all run for real. No funds, keys, signing or broadcast.
jest.unmock('@chainflip/sdk/swap')

import { Chains, ChainflipIds } from '@chainflip/sdk/swap'
import { AssetBTC } from '@xchainjs/xchain-bitcoin'
import { AssetBSC, BSC_GAS_ASSET_DECIMAL } from '@xchainjs/xchain-bsc'
import { Network } from '@xchainjs/xchain-client'
import { CryptoAmount, TokenAsset, assetFromStringEx, assetToString, baseAmount } from '@xchainjs/xchain-util'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import BigNumber from 'bignumber.js'

import { Wallet } from '@xchainjs/xchain-wallet'

import { ChainflipProtocol } from '../src/protocols/chainflip'
import { ChainflipUnsupportedNetworkError } from '../src/protocols/chainflip/chainflipProtocol'
import { cChainToXChain, xChainToCChain } from '../src/protocols/chainflip/utils'

const BROKER_URL = 'http://chainflip-broker.invalid/rpc'
const STATE_CHAIN_RPC = 'https://rpc.mainnet.chainflip.io'
const STATE_CHAIN_RPC_PERSEVERANCE = 'https://archive.perseverance.chainflip.io'

const BSC_USDT_MAINNET = '0x55d398326f99059fF775485246999027B3197955'
const AssetBSCUSDT = assetFromStringEx(`BSC.USDT-${BSC_USDT_MAINNET}`) as TokenAsset

const BSC_ADDRESS = '0x00000000000000000000000000000000000000b5'
const BSC_DEPOSIT_ADDRESS = '0x00000000000000000000000000000000000000d3'
const BTC_ADDRESS = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
const BTC_DEPOSIT_ADDRESS = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'

const ONE_BNB = '1000000000000000000' // 18 decimals
const MIN_BNB = '10000000000000000' // 0.01 BNB
const MIN_BSC_USDT = '20000000000000000000' // 20 USDT, 18 decimals on BSC

// --- state-chain environment (cf_environment), shaped for @chainflip/rpc's zod parser ---
const ASSETS_BY_CHAIN: Record<string, string[]> = {
  Bitcoin: ['BTC'],
  Ethereum: ['ETH', 'USDC', 'FLIP', 'USDT', 'WBTC', 'CBBTC'],
  Arbitrum: ['ETH', 'USDC', 'USDT'],
  Solana: ['SOL', 'USDC', 'USDT'],
  Assethub: ['DOT', 'USDC', 'USDT'],
  Tron: ['TRX', 'USDT'],
  Bsc: ['BNB', 'USDT'],
}
const chainAssetMap = <T>(value: T, overrides: Record<string, Record<string, T>> = {}) =>
  Object.fromEntries(
    Object.entries(ASSETS_BY_CHAIN).map(([chain, assets]) => [
      chain,
      Object.fromEntries(assets.map((asset) => [asset, overrides[chain]?.[asset] ?? value])),
    ]),
  )
const chainMap = <T>(value: T) => Object.fromEntries(Object.keys(ASSETS_BY_CHAIN).map((chain) => [chain, value]))
const networkFee = { standard_rate_and_minimum: { rate: '0', minimum: '0' }, rates: chainAssetMap('0') }

const cfEnvironment = {
  ingress_egress: {
    minimum_deposit_amounts: chainAssetMap('1', { Bsc: { BNB: MIN_BNB, USDT: MIN_BSC_USDT } }),
    ingress_fees: chainAssetMap(null),
    egress_fees: chainAssetMap(null),
    witness_safety_margins: chainMap(null),
    egress_dust_limits: chainAssetMap('1'),
    channel_opening_fees: chainMap('0'),
    ingress_delays: chainMap(0),
    boost_delays: chainMap(0),
    boost_minimum_add_funds_amounts: chainAssetMap(null),
  },
  swapping: {
    maximum_swap_amounts: chainAssetMap(null),
    network_fee_hundredth_pips: 1000,
    swap_retry_delay_blocks: 5,
    max_swap_retry_duration_blocks: 600,
    max_swap_request_duration_blocks: 14400,
    minimum_chunk_size: chainAssetMap(null),
    network_fees: { regular_network_fee: networkFee, internal_swap_network_fee: networkFee },
    default_oracle_price_protection: chainAssetMap(null),
  },
  funding: { redemption_tax: '0', minimum_funding_amount: '0' },
  pools: { fees: chainAssetMap(null) },
}

const networkInfo = {
  assets: Object.values(ChainflipIds).map((asset) => ({
    asset,
    vaultSwapDepositsEnabled: true,
    depositChannelDepositsEnabled: true,
    depositChannelCreationEnabled: true,
    egressEnabled: true,
    boostDepositsEnabled: false,
    livePriceProtectionEnabled: false,
  })),
  cfBrokerCommissionBps: 0,
}

type RpcRequest = { id: string; jsonrpc: '2.0'; method: string; params: unknown[] }

const quoteFixture = (overrides: {
  srcAsset: { chain: string; asset: string }
  destAsset: { chain: string; asset: string }
  depositAmount: string
  egressAmount: string
  egressFee: string
  estimatedPrice: string
}) => ({
  type: 'REGULAR',
  srcAsset: overrides.srcAsset,
  destAsset: overrides.destAsset,
  isVaultSwap: false,
  isOnChain: false,
  depositAmount: overrides.depositAmount,
  egressAmount: overrides.egressAmount,
  includedFees: [
    { type: 'NETWORK', chain: 'Ethereum', asset: 'USDC', amount: '600000' },
    { type: 'EGRESS', ...overrides.destAsset, amount: overrides.egressFee },
  ],
  poolInfo: [],
  lowLiquidityWarning: false,
  estimatedDurationSeconds: 120,
  estimatedDurationsSeconds: { deposit: 30, swap: 12, egress: 78 },
  estimatedPrice: overrides.estimatedPrice,
  recommendedSlippageTolerancePercent: 1,
  recommendedRetryDurationMinutes: 10,
  recommendedLivePriceSlippageTolerancePercent: undefined,
})

// 1 BNB -> 0.01 BTC (BTC has 8 decimals)
const bnbToBtcQuote = quoteFixture({
  srcAsset: { chain: 'Bsc', asset: 'BNB' },
  destAsset: { chain: 'Bitcoin', asset: 'BTC' },
  depositAmount: ONE_BNB,
  egressAmount: '1000000',
  egressFee: '1500',
  estimatedPrice: '0.0101',
})

// 0.01 BTC -> 1000 USDT on BSC (BSC USDT has 18 decimals, not 6)
const btcToBscUsdtQuote = quoteFixture({
  srcAsset: { chain: 'Bitcoin', asset: 'BTC' },
  destAsset: { chain: 'Bsc', asset: 'USDT' },
  depositAmount: '1000000',
  egressAmount: '1000000000000000000000',
  egressFee: '50000000000000000',
  estimatedPrice: '100000',
})

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

describe('Chainflip protocol - BSC (real @chainflip/sdk)', () => {
  let axiosMock: MockAdapter
  let fetchSpy: jest.SpyInstance
  let brokerRequests: RpcRequest[]
  let quoteRequests: Record<string, string>[]

  beforeEach(() => {
    brokerRequests = []
    quoteRequests = []
    axiosMock = new MockAdapter(axios)
    axiosMock.onGet(/\/v2\/quote$/).reply((config) => {
      const params = config.params as Record<string, string>
      quoteRequests.push(params)
      if (params.srcChain === 'Bsc' && params.srcAsset === 'BNB') return [200, [bnbToBtcQuote]]
      if (params.destChain === 'Bsc' && params.destAsset === 'USDT') return [200, [btcToBscUsdtQuote]]
      return [404, { message: 'no fixture' }]
    })

    fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
      if (url.endsWith('/networkInfo')) return jsonResponse(networkInfo)
      if (url === STATE_CHAIN_RPC || url === STATE_CHAIN_RPC_PERSEVERANCE || url === BROKER_URL) {
        const batch = JSON.parse(init?.body as string) as RpcRequest[]
        return jsonResponse(
          batch.map((req) => {
            if (url !== BROKER_URL && req.method === 'cf_environment') {
              return { id: req.id, jsonrpc: '2.0', result: cfEnvironment }
            }
            if (url === BROKER_URL && req.method === 'broker_request_swap_deposit_address') {
              brokerRequests.push(req)
              const srcAsset = req.params[0] as { chain: string }
              return {
                id: req.id,
                jsonrpc: '2.0',
                result: {
                  address: srcAsset.chain === 'Bsc' ? BSC_DEPOSIT_ADDRESS : BTC_DEPOSIT_ADDRESS,
                  issued_block: 100,
                  channel_id: 7,
                  source_chain_expiry_block: '0x10',
                  channel_opening_fee: '0x0',
                },
              }
            }
            return { id: req.id, jsonrpc: '2.0', error: { code: -32601, message: `unexpected ${req.method}` } }
          }),
        )
      }
      throw new Error(`Unexpected network request in test: ${url}`)
    })
  })

  afterEach(() => {
    axiosMock.restore()
    fetchSpy.mockRestore()
  })

  const newProtocol = () => new ChainflipProtocol({ network: Network.Mainnet, brokerUrl: BROKER_URL })

  it('maps the SDK Bsc chain to xchainjs BSC and back, unknown chains stay unmapped', () => {
    expect(Chains.Bsc).toBe('Bsc')
    expect(cChainToXChain(Chains.Bsc)).toBe('BSC')
    expect(xChainToCChain('BSC')).toBe(Chains.Bsc)
    expect(cChainToXChain(Chains.Assethub)).toBeNull()
    expect(xChainToCChain('AVAX')).toBeNull()
    expect(xChainToCChain('BNB')).toBeNull()
  })

  it('reports BSC as a supported chain and drops chains without an xchainjs mapping', async () => {
    const chains = await newProtocol().getSupportedChains()
    expect(chains).toEqual(expect.arrayContaining(['BTC', 'ETH', 'ARB', 'SOL', 'TRON', 'BSC']))
    expect(chains).not.toContain(null)
    expect(chains).toHaveLength(6) // Assethub has no xchainjs chain and is filtered out
  })

  it('supports native BNB and BSC USDT, rejects other BSC tokens and look-alikes', async () => {
    const protocol = newProtocol()
    expect(assetToString(AssetBSC)).toBe('BSC.BNB')
    expect(await protocol.isAssetSupported(AssetBSC)).toBe(true)
    expect(await protocol.isAssetSupported(AssetBSCUSDT)).toBe(true)
    expect(
      await protocol.isAssetSupported(assetFromStringEx('BSC.USDC-0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d')),
    ).toBe(false)
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.BNB-0xB8c77482e45F1F44dE1745F52C74426C631bDD52')),
    ).toBe(false)
    expect(await protocol.isAssetSupported(assetFromStringEx('AVAX.AVAX'))).toBe(false)
  })

  it('binds BSC USDT to its contract: look-alike contracts and a bare ticker are not supported', async () => {
    const protocol = newProtocol()
    expect(await protocol.isAssetSupported(assetFromStringEx(`BSC.USDT-${BSC_USDT_MAINNET.toLowerCase()}`))).toBe(true)
    expect(await protocol.isAssetSupported(assetFromStringEx(`BSC.USDT-${BSC_USDT_MAINNET.toUpperCase()}`))).toBe(true)
    expect(
      await protocol.isAssetSupported(assetFromStringEx('BSC.USDT-0x00000000000000000000000000000000000000ff')),
    ).toBe(false)
    // A token asset claiming the native BNB ticker must not map to native BNB
    expect(
      await protocol.isAssetSupported(assetFromStringEx('BSC.BNB-0x00000000000000000000000000000000000000ff')),
    ).toBe(false)
    expect(await protocol.isAssetSupported(assetFromStringEx('BSC.USDT'))).toBe(false)
  })

  it('rejects a look-alike BSC USDT contract before requesting a quote or channel', async () => {
    const fakeUsdt = assetFromStringEx('BSC.USDT-0x00000000000000000000000000000000000000ff') as TokenAsset
    await expect(
      newProtocol().openDepositChannel({
        fromAsset: fakeUsdt,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(MIN_BSC_USDT, 18), fakeUsdt),
        fromAddress: BSC_ADDRESS,
        destinationAddress: BTC_ADDRESS,
      }),
    ).rejects.toThrow('USDT asset not supported in BSC chain')
    expect(quoteRequests).toHaveLength(0)
    expect(brokerRequests).toHaveLength(0)
  })

  it('quotes BNB -> BTC with BNB 18-decimal input and BTC 8-decimal output', async () => {
    const estimated = await newProtocol().estimateSwap({
      fromAsset: AssetBSC,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(ONE_BNB, BSC_GAS_ASSET_DECIMAL), AssetBSC),
    })

    expect(estimated.errors).toEqual([])
    expect(estimated.canSwap).toBe(true)
    expect(estimated.toAddress).toBe('')
    expect(quoteRequests).toHaveLength(1)
    expect(quoteRequests[0]).toMatchObject({
      srcChain: 'Bsc',
      srcAsset: 'BNB',
      destChain: 'Bitcoin',
      destAsset: 'BTC',
      amount: ONE_BNB,
    })
    expect(assetToString(estimated.expectedAmount.asset)).toBe('BTC.BTC')
    expect(estimated.expectedAmount.baseAmount.amount().toFixed()).toBe('1000000')
    expect(estimated.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(estimated.dustThreshold.asset)).toBe('BSC.BNB')
    expect(estimated.dustThreshold.baseAmount.amount().toFixed()).toBe(MIN_BNB)
    expect(estimated.dustThreshold.baseAmount.decimal).toBe(18)
    expect(estimated.fees.outboundFee.baseAmount.amount().toFixed()).toBe('1500')
    expect(estimated.fees.outboundFee.baseAmount.decimal).toBe(8)
  })

  it('quotes BTC -> BSC USDT with an 18-decimal USDT output', async () => {
    const estimated = await newProtocol().estimateSwap({
      fromAsset: AssetBTC,
      destinationAsset: AssetBSCUSDT,
      amount: new CryptoAmount(baseAmount('1000000', 8), AssetBTC),
    })

    expect(estimated.errors).toEqual([])
    expect(quoteRequests[0]).toMatchObject({
      srcChain: 'Bitcoin',
      srcAsset: 'BTC',
      destChain: 'Bsc',
      destAsset: 'USDT',
      amount: '1000000',
    })
    expect(assetToString(estimated.expectedAmount.asset)).toBe(`BSC.USDT-${BSC_USDT_MAINNET}`)
    expect(estimated.expectedAmount.baseAmount.decimal).toBe(18)
    expect(estimated.expectedAmount.baseAmount.amount().toFixed()).toBe('1000000000000000000000')
    expect(estimated.expectedAmount.assetAmount.amount().toFixed()).toBe('1000')
    expect(estimated.fees.outboundFee.baseAmount.decimal).toBe(18)
  })

  it('opens a BNB -> BTC deposit channel through the SDK broker request', async () => {
    const channel = await newProtocol().openDepositChannel({
      fromAsset: AssetBSC,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(ONE_BNB, BSC_GAS_ASSET_DECIMAL), AssetBSC),
      fromAddress: BSC_ADDRESS,
      destinationAddress: BTC_ADDRESS,
    })

    expect(brokerRequests).toHaveLength(1)
    const [srcAsset, destAsset, destAddress, commissionBps, , , , fok] = brokerRequests[0].params as [
      unknown,
      unknown,
      string,
      number,
      unknown,
      unknown,
      unknown,
      { refund_address: string; min_price: string; retry_duration: number },
    ]
    expect(srcAsset).toEqual({ chain: 'Bsc', asset: 'BNB' })
    expect(destAsset).toEqual({ chain: 'Bitcoin', asset: 'BTC' })
    expect(destAddress).toBe(BTC_ADDRESS)
    expect(commissionBps).toBe(0)
    expect(fok.refund_address).toBe(BSC_ADDRESS)
    expect(fok.retry_duration).toBe(100)
    // min price = 0.0101 BTC/BNB * (1 - 1%), in base units * 2^128: shift by (8 - 18) decimals
    const expectedMinPriceX128 = new BigNumber('0.0101')
      .times(0.99)
      .decimalPlaces(8)
      .times(new BigNumber(2).pow(128))
      .shiftedBy(8 - 18)
      .toFixed(0)
    expect(BigInt(fok.min_price).toString()).toBe(expectedMinPriceX128)

    expect(channel.depositAddress).toBe(BSC_DEPOSIT_ADDRESS)
    expect(channel.depositChannelId).toBe('100-Bsc-7')
    expect(channel.depositChannelExpiryBlock).toBe(BigInt(16))
    expect(channel.expectedAmount.baseAmount.amount().toFixed()).toBe('1000000')
    expect(channel.expectedAmount.baseAmount.decimal).toBe(8)
  })

  it('opens a BTC -> BSC USDT deposit channel with a BSC destination address', async () => {
    const channel = await newProtocol().openDepositChannel({
      fromAsset: AssetBTC,
      destinationAsset: AssetBSCUSDT,
      amount: new CryptoAmount(baseAmount('1000000', 8), AssetBTC),
      fromAddress: BTC_ADDRESS,
      destinationAddress: BSC_ADDRESS,
    })

    expect(brokerRequests).toHaveLength(1)
    const params = brokerRequests[0].params as [unknown, unknown, string, ...unknown[]]
    const fok = params[7] as { refund_address: string; min_price: string }
    expect(params[0]).toEqual({ chain: 'Bitcoin', asset: 'BTC' })
    expect(params[1]).toEqual({ chain: 'Bsc', asset: 'USDT' })
    expect(params[2]).toBe(BSC_ADDRESS)
    expect(fok.refund_address).toBe(BTC_ADDRESS)
    const expectedMinPriceX128 = new BigNumber('100000')
      .times(0.99)
      .decimalPlaces(18)
      .times(new BigNumber(2).pow(128))
      .shiftedBy(18 - 8)
      .toFixed(0)
    expect(BigInt(fok.min_price).toString()).toBe(expectedMinPriceX128)
    expect(channel.depositAddress).toBe(BTC_DEPOSIT_ADDRESS)
    expect(channel.expectedAmount.baseAmount.decimal).toBe(18)
  })

  it.each([
    ['BNB Beacon Chain address', 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'],
    ['Tron address', 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'],
    ['truncated EVM address', '0x00000000000000000000000000000000000000b'],
  ])('SDK rejects an invalid BSC destination (%s) before calling the broker', async (_label, destinationAddress) => {
    await expect(
      newProtocol().openDepositChannel({
        fromAsset: AssetBTC,
        destinationAsset: AssetBSCUSDT,
        amount: new CryptoAmount(baseAmount('1000000', 8), AssetBTC),
        fromAddress: BTC_ADDRESS,
        destinationAddress,
      }),
    ).rejects.toThrow(/is not a valid \W*Bsc\W* address for \W*mainnet/)
    expect(brokerRequests).toHaveLength(0)
  })

  it('SDK rejects an invalid BSC refund address before calling the broker', async () => {
    await expect(
      newProtocol().openDepositChannel({
        fromAsset: AssetBSC,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount(ONE_BNB, BSC_GAS_ASSET_DECIMAL), AssetBSC),
        fromAddress: BTC_ADDRESS,
        destinationAddress: BTC_ADDRESS,
      }),
    ).rejects.toThrow(/is not a valid \W*Bsc\W* address for \W*mainnet/)
    expect(brokerRequests).toHaveLength(0)
  })

  it('SDK rejects a BSC deposit below the state-chain minimum before calling the broker', async () => {
    axiosMock.onGet(/\/v2\/quote$/).reply(200, [{ ...bnbToBtcQuote, depositAmount: '1000' }])
    await expect(
      newProtocol().openDepositChannel({
        fromAsset: AssetBSC,
        destinationAsset: AssetBTC,
        amount: new CryptoAmount(baseAmount('1000', BSC_GAS_ASSET_DECIMAL), AssetBSC),
        fromAddress: BSC_ADDRESS,
        destinationAddress: BTC_ADDRESS,
      }),
    ).rejects.toThrow(`expected amount is below minimum swap amount (${MIN_BNB})`)
    expect(brokerRequests).toHaveLength(0)
  })

  it('throws for an unsupported chain without requesting a quote', async () => {
    await expect(
      newProtocol().estimateSwap({
        fromAsset: assetFromStringEx('AVAX.AVAX'),
        destinationAsset: AssetBSC,
        amount: new CryptoAmount(baseAmount('1', 18), assetFromStringEx('AVAX.AVAX')),
      }),
    ).rejects.toThrow('AVAX asset not supported in AVAX chain')
    expect(quoteRequests).toHaveLength(0)
  })

  it('keeps the prior ticker + chain matching for non-BSC tokens (unchanged by this patch)', async () => {
    const protocol = newProtocol()
    expect(
      await protocol.isAssetSupported(assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')),
    ).toBe(true)
    // Prior behaviour, intentionally not tightened here: non-BSC tokens still match on ticker + chain.
    expect(await protocol.isAssetSupported(assetFromStringEx('ETH.USDT'))).toBe(true)
  })

  const stubWallet = (network: Network) => {
    const transfer = jest.fn().mockResolvedValue('0xhash')
    const getExplorerTxUrl = jest.fn().mockResolvedValue('https://explorer.invalid/tx/0xhash')
    const wallet = { getNetwork: () => network, transfer, getExplorerTxUrl } as unknown as Wallet
    return { wallet, transfer, getExplorerTxUrl }
  }

  const bscSourceParams = {
    fromAsset: AssetBSC,
    destinationAsset: AssetBTC,
    amount: new CryptoAmount(baseAmount(ONE_BNB, BSC_GAS_ASSET_DECIMAL), AssetBSC),
    fromAddress: BSC_ADDRESS,
    destinationAddress: BTC_ADDRESS,
  }
  const bscDestinationParams = {
    fromAsset: AssetBTC,
    destinationAsset: AssetBSCUSDT,
    amount: new CryptoAmount(baseAmount('1000000', 8), AssetBTC),
    fromAddress: BTC_ADDRESS,
    destinationAddress: BSC_ADDRESS,
  }

  it('mainnet doSwap BNB -> BTC opens the channel and transfers BNB to the deposit address (stub wallet)', async () => {
    const { wallet, transfer } = stubWallet(Network.Mainnet)
    const protocol = new ChainflipProtocol({ network: Network.Mainnet, brokerUrl: BROKER_URL, wallet })
    const tx = await protocol.doSwap(bscSourceParams)
    expect(tx.hash).toBe('0xhash')
    expect(brokerRequests).toHaveLength(1)
    expect(transfer).toHaveBeenCalledTimes(1)
    const [call] = transfer.mock.calls[0]
    expect(call.recipient).toBe(BSC_DEPOSIT_ADDRESS)
    expect(call.asset).toBe(AssetBSC)
    expect(call.amount.amount().toFixed()).toBe(ONE_BNB)
    expect(call.amount.decimal).toBe(18)
  })

  describe('BSC is mainnet only', () => {
    const expectNoDispatch = (transfer?: jest.Mock) => {
      expect(fetchSpy).not.toHaveBeenCalled()
      expect(axiosMock.history.get).toHaveLength(0)
      expect(quoteRequests).toHaveLength(0)
      expect(brokerRequests).toHaveLength(0)
      if (transfer) expect(transfer).not.toHaveBeenCalled()
    }
    const stagenetError = /BSC is not supported by the Chainflip protocol on Chainflip network "perseverance"/

    it('xchainjs testnet has no Chainflip network, so no BSC request can be built', () => {
      expect(() => new ChainflipProtocol({ network: Network.Testnet, brokerUrl: BROKER_URL })).toThrow(
        'Chainflip has no testnet. Use mainnet or stagenet',
      )
      expectNoDispatch()
    })

    it('stagenet: BSC assets are unsupported without any network call', async () => {
      const protocol = new ChainflipProtocol({ network: Network.Stagenet, brokerUrl: BROKER_URL })
      expect(await protocol.isAssetSupported(AssetBSC)).toBe(false)
      expect(await protocol.isAssetSupported(AssetBSCUSDT)).toBe(false)
      expectNoDispatch()
    })

    it('stagenet: BSC is dropped from supported chains even when the SDK reports Bsc', async () => {
      const chains = await new ChainflipProtocol({
        network: Network.Stagenet,
        brokerUrl: BROKER_URL,
      }).getSupportedChains()
      expect(chains).toEqual(expect.arrayContaining(['BTC', 'ETH', 'ARB', 'SOL', 'TRON']))
      expect(chains).not.toContain('BSC')
      expect(fetchSpy).toHaveBeenCalled() // the real SDK did list Bsc from the stubbed perseverance data
    })

    it.each([
      ['source', bscSourceParams],
      ['destination', bscDestinationParams],
    ])(
      'stagenet: BSC %s rejects estimateSwap, openDepositChannel and doSwap before any dispatch',
      async (_side, params) => {
        const { wallet, transfer } = stubWallet(Network.Stagenet)
        const protocol = new ChainflipProtocol({ network: Network.Stagenet, brokerUrl: BROKER_URL, wallet })

        await expect(protocol.estimateSwap(params)).rejects.toThrow(ChainflipUnsupportedNetworkError)
        await expect(protocol.estimateSwap(params)).rejects.toThrow(stagenetError)
        await expect(protocol.openDepositChannel(params)).rejects.toThrow(stagenetError)
        await expect(protocol.doSwap(params)).rejects.toThrow(stagenetError)
        expectNoDispatch(transfer)
      },
    )

    it.each([
      ['source', Network.Stagenet, bscSourceParams],
      ['destination', Network.Stagenet, bscDestinationParams],
      ['source', Network.Testnet, bscSourceParams],
      ['destination', Network.Testnet, bscDestinationParams],
    ])(
      'mainnet protocol with a non-mainnet wallet: BSC %s doSwap (%s wallet) is rejected before any dispatch',
      async (_side, walletNetwork, params) => {
        const { wallet, transfer } = stubWallet(walletNetwork)
        const protocol = new ChainflipProtocol({ network: Network.Mainnet, brokerUrl: BROKER_URL, wallet })
        await expect(protocol.doSwap(params)).rejects.toThrow(
          `BSC is not supported by the Chainflip protocol with a "${walletNetwork}" wallet`,
        )
        expectNoDispatch(transfer)
      },
    )
  })
})
