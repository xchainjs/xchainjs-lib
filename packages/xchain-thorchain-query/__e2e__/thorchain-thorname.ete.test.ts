import { ThorchainCache } from '../src/thorchain-cache'
import { ThorchainQuery } from '../src/thorchain-query'
import { AssetBTC, BTCChain } from '../src/utils'

const thorchainCache = new ThorchainCache()
const thorchainQuery = new ThorchainQuery(thorchainCache)

const btcAddress = 'bc1q3q6gfcg2n4c7hdzjsvpq5rp9rfv5t59t5myz5v'
const owner = 'thor1tqpyn3athvuj8dj7nu5fp0xm76ut86sjcl3pqu'

// Test User Functions - single and double swap using mock pool data
describe('Thorchain-query thorname Integration Tests', () => {
  it('should fetch thorname details', async () => {
    const thorname = await thorchainQuery.getThornameDetails('swapper')
    console.log(thorname)
  })
  it('Estimate update thorname with expirity', async () => {
    const thorname = await thorchainQuery.estimateThorname({
      thorname: 'hippo',
      isUpdate: true,
      chain: BTCChain,
      chainAddress: btcAddress,
      owner: owner,
      preferredAsset: AssetBTC,
      expirity: new Date(2024, 9, 11, 14, 30, 0, 0),
    })
    console.log(thorname.value.baseAmount.amount().toString())
    console.log(thorname.memo)
  })
  it('Estimate update thorname without expirity', async () => {
    const thorname = await thorchainQuery.estimateThorname({
      thorname: 'dx',
      isUpdate: true,
      chain: BTCChain,
      chainAddress: btcAddress,
      owner: owner,
      preferredAsset: AssetBTC,
    })
    console.log(thorname.value.baseAmount.amount().toString())
    console.log(thorname.memo)
  })
  it('Estimate not registered thorname without expirity', async () => {
    const thorname = await thorchainQuery.estimateThorname({
      thorname: 'hippo-2',
      chain: BTCChain,
      chainAddress: btcAddress,
      owner: owner,
      preferredAsset: AssetBTC,
    })
    console.log(thorname.value.baseAmount.amount().toString())
    console.log(thorname.memo)
  })
  it('Estimate register not prefered assets with expirity', async () => {
    const thorname = await thorchainQuery.estimateThorname({
      thorname: 'hippo-2',
      chain: BTCChain,
      chainAddress: btcAddress,
      owner: owner,
      expirity: new Date(2024, 8, 11, 14, 30, 0, 0),
    })
    console.log(thorname.value.baseAmount.amount().toString())
    console.log(thorname.memo)
  })
  it('Try to estimate already registered thorname', async () => {
    const thorname = await thorchainQuery.estimateThorname({
      thorname: 'dx',
      chain: BTCChain,
      chainAddress: btcAddress,
      owner: owner,
      preferredAsset: AssetBTC,
      expirity: new Date(2024, 8, 11, 14, 30, 0, 0),
    })
    console.log(thorname.value.baseAmount.amount().toString())
  })
})
