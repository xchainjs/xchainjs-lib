import { AssetBTC, Client as BtcClient, defaultBTCParams as defaultBtcParams } from '@xchainjs/xchain-bitcoin'
import { Network } from '@xchainjs/xchain-client'
import { Client as DashClient, defaultDashParams } from '@xchainjs/xchain-dash'
import { Client as EthClient, defaultEthParams } from '@xchainjs/xchain-ethereum'
import { Client as KujiraClient, defaultKujiParams } from '@xchainjs/xchain-kujira'
import { Client as MayaClient } from '@xchainjs/xchain-mayachain'
import { MayachainQuery } from '@xchainjs/xchain-mayachain-query'
import { AssetRuneNative, Client as ThorClient } from '@xchainjs/xchain-thorchain'
import { CryptoAmount, assetToString, baseAmount } from '@xchainjs/xchain-util'
import { Wallet } from '@xchainjs/xchain-wallet'

import mayanodeApi from '../__mocks__/mayanode-api/mayanode-api'
import midgarApi from '../__mocks__/midgard-api/midgard-api'
import { MayachainAMM } from '../src'

describe('Mayachain Client Test', () => {
  let mayachainAmm: MayachainAMM

  beforeAll(() => {
    const mayaChainQuery = new MayachainQuery()
    const wallet = new Wallet({
      BTC: new BtcClient({ ...defaultBtcParams, network: Network.Mainnet }),
      ETH: new EthClient({ ...defaultEthParams, network: Network.Mainnet }),
      DASH: new DashClient({ ...defaultDashParams, network: Network.Mainnet }),
      KUJI: new KujiraClient({ ...defaultKujiParams, network: Network.Mainnet }),
      THOR: new ThorClient({ network: Network.Mainnet }),
      MAYA: new MayaClient({ network: Network.Mainnet }),
    })
    mayachainAmm = new MayachainAMM(mayaChainQuery, wallet)
  })

  beforeEach(() => {
    mayanodeApi.init()
    midgarApi.init()
  })

  afterEach(() => {
    mayanodeApi.restore()
    midgarApi.restore()
  })

  it(`Should validate swap from Rune to BTC without errors with maya address`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
    })

    expect(errors.length).toBe(0)
  })

  it(`Should validate swap from Rune to BTC without errors with MAYAName`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'eld',
      destinationAddress: 'bc1q3gf722qm79433nycvuflh3uh37z72elrd73r7x',
    })
    expect(errors.length).toBe(0)
  })

  it(`Should validate swap from Rune to BTC with destination address error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      destinationAddress: 'randomDestinationAddress',
    })

    expect(errors.length).toBe(1)
    expect(errors[0]).toBe('destinationAddress randomDestinationAddress is not a valid address')
  })

  it(`Should validate swap from Rune to BTC with MAYAName error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'randomAffiliateAddress',
    })

    expect(errors.length).toBe(1)
    expect(errors[0]).toBe('affiliateAddress randomAffiliateAddress is not a valid MAYA address')
  })

  it(`Should validate swap from Rune to BTC with affiliateBps error`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateBps: -1,
    })

    expect(errors.length).toBe(1)
    expect(errors[0]).toBe('affiliateBps -1 out of range [0 - 10000]')
  })

  it(`Should validate swap from Rune to BTC with multiple errors`, async () => {
    const errors = await mayachainAmm.validateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      destinationAddress: 'randomDestinationAddress',
      affiliateAddress: 'randomAffiliateAddress',
      affiliateBps: -1,
    })

    expect(errors.length).toBe(3)
    expect(errors[0]).toBe('destinationAddress randomDestinationAddress is not a valid address')
    expect(errors[1]).toBe('affiliateAddress randomAffiliateAddress is not a valid MAYA address')
    expect(errors[2]).toBe('affiliateBps -1 out of range [0 - 10000]')
  })

  it(`Should quote swap without errors`, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz',
      affiliateBps: 300,
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
    })

    expect(quoteSwap.toAddress).toBe('thor1qtemwlu9ju3ts3da5l82qejnzdl3xfs309c9l6')
    expect(quoteSwap.memo).toBe(
      '=:BTC.BTC:bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj::maya18z343fsdlav47chtkyp0aawqt6sgxsh3vjy2vz:300',
    )
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('98647691')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(AssetRuneNative))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(AssetBTC))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('3061722')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('348000')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(undefined)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(undefined)
    expect(quoteSwap.outboundDelayBlocks).toBe(179)
    expect(quoteSwap.outboundDelaySeconds).toBe(107400)
    expect(quoteSwap.totalSwapSeconds).toBe(107400)
    expect(quoteSwap.slipBasisPoints).toBe(undefined)
    expect(quoteSwap.canSwap).toBe(true)
    expect(quoteSwap.errors.length).toBe(0)
    expect(quoteSwap.warning).toBe('')
  })

  it(`Should quote swap from Rune to BTC with MAYAName error`, async () => {
    const quoteSwap = await mayachainAmm.estimateSwap({
      fromAsset: AssetRuneNative,
      destinationAsset: AssetBTC,
      amount: new CryptoAmount(baseAmount(688598892692), AssetRuneNative),
      affiliateAddress: 'randomAffiliateAddress',
      affiliateBps: 300,
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
    })

    expect(quoteSwap.toAddress).toBe('')
    expect(quoteSwap.memo).toBe('')
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(AssetRuneNative))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(AssetBTC))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(AssetBTC))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(0)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(0)
    expect(quoteSwap.outboundDelayBlocks).toBe(0)
    expect(quoteSwap.outboundDelaySeconds).toBe(0)
    expect(quoteSwap.totalSwapSeconds).toBe(0)
    expect(quoteSwap.slipBasisPoints).toBe(0)
    expect(quoteSwap.canSwap).toBe(false)
    expect(quoteSwap.errors.length).toBe(1)
    expect(quoteSwap.errors[0]).toBe('affiliateAddress randomAffiliateAddress is not a valid MAYA address')
    expect(quoteSwap.warning).toBe('')
  })

  it('Should get MAYAName details', async () => {
    const details = await mayachainAmm.getMAYANameDetails('eld')
    expect(details).toBeTruthy()
    expect(details?.name).toBe('eld')
    expect(details?.expire).toBe('66751601')
    expect(details?.owner).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
    expect(details?.entries.length).toBe(6)
    expect(details?.entries[0].address).toBe('bc1qdjqcm3fsadjn9zth9wk30gy5su6hkwkhfr0re9')
    expect(details?.entries[0].chain).toBe('BTC')
    expect(details?.entries[1].address).toBe('XiKv7A7vVQmYwNUp4TjCq8ZamkjB8zZtsL')
    expect(details?.entries[1].chain).toBe('DASH')
    expect(details?.entries[2].address).toBe('0x1509b1fe69be4d508a62ce8109635e1d1cf29a4f')
    expect(details?.entries[2].chain).toBe('ETH')
    expect(details?.entries[3].address).toBe('kujira1mg9jt63eeww5ptnkw963z2sw6jzezxw0trns50')
    expect(details?.entries[3].chain).toBe('KUJI')
    expect(details?.entries[4].address).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
    expect(details?.entries[4].chain).toBe('MAYA')
    expect(details?.entries[5].address).toBe('thor1gnehec7mf4uytuw3wj4uwpptvkyvzclgqap7e4')
    expect(details?.entries[5].chain).toBe('THOR')
  })

  it('Should get the MAYAnames owned by an address', async () => {
    const mayaNames = await mayachainAmm.getMAYANamesByOwner('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
    expect(mayaNames.length).toBe(1)
    expect(mayaNames[0]?.name).toBe('eld')
    expect(mayaNames[0]?.expire).toBe('66751601')
    expect(mayaNames[0]?.owner).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
    expect(mayaNames[0]?.entries.length).toBe(6)
    expect(mayaNames[0]?.entries[0].address).toBe('bc1qdjqcm3fsadjn9zth9wk30gy5su6hkwkhfr0re9')
    expect(mayaNames[0]?.entries[0].chain).toBe('BTC')
    expect(mayaNames[0]?.entries[1].address).toBe('XiKv7A7vVQmYwNUp4TjCq8ZamkjB8zZtsL')
    expect(mayaNames[0]?.entries[1].chain).toBe('DASH')
    expect(mayaNames[0]?.entries[2].address).toBe('0x1509b1fe69be4d508a62ce8109635e1d1cf29a4f')
    expect(mayaNames[0]?.entries[2].chain).toBe('ETH')
    expect(mayaNames[0]?.entries[3].address).toBe('kujira1mg9jt63eeww5ptnkw963z2sw6jzezxw0trns50')
    expect(mayaNames[0]?.entries[3].chain).toBe('KUJI')
    expect(mayaNames[0]?.entries[4].address).toBe('maya1gnehec7mf4uytuw3wj4uwpptvkyvzclgq2lj09')
    expect(mayaNames[0]?.entries[4].chain).toBe('MAYA')
    expect(mayaNames[0]?.entries[5].address).toBe('thor1gnehec7mf4uytuw3wj4uwpptvkyvzclgqap7e4')
    expect(mayaNames[0]?.entries[5].chain).toBe('THOR')
  })
})
