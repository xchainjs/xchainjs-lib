// import { Network } from '@xchainjs/xchain-client'
// import axios from 'axios'

import { ThorchainCache } from '../src/thorchain-cache'
import { TransactionStage, TxType } from '../src/thorchain-checktx'

// const mc: MidgardConfig = {
//   apiRetries: 2,
//   midgardBaseUrls: ['https://eoiulqma2feqa8x.m.pipedream.net'],
// }
// const tc: ThornodeConfig = {
//   apiRetries: 2,
//   thornodeBaseUrls: ['https://eoiulqma2feqa8x.m.pipedream.net'],
// }
// const thorchainCache = new ThorchainCache(new Midgard(Network.Mainnet, mc), new Thornode(Network.Mainnet, tc))
const thorchainCache = new ThorchainCache()

const checkTxStage = new TransactionStage(thorchainCache)
// const liveHash = [
//   'E5A760EA5C5C0E89450598A63E65CBCCA71CBC52FBCC94098B85811ACAE0F279', // unkown transaction
//   '508478AC13EA0F675A57BD980B964B2F89B9CCD3CEC6E16FA7A598163E17D422', // THOR in and ETH Out
//   //  '991DFE33AC4482CC7A1E3BF1142E121A315EED18ED8E8FDDDC678E8F176DFCBA', // THOR in, ETH out
//   '619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC', // BTC in, Synth BTC out
// ]

// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// axios.interceptors.response.use((response) => {
//   console.log('Response:', JSON.stringify(response, null, 2))
//   return response
// })

describe('Thorchain query checkTx Integration Tests', () => {
  it(`Should check asymBTCAddLp `, async () => {
    const hash = 'E5C8AA800DD54F9D069E6822E99EC66DF8FA81DAE748CE534B9325AF2A4B1666'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.AddLP)
    console.log(progress)
  })
  it(`Should check swap BTC.BTC for ETH.FOX `, async () => {
    const hash = '508478AC13EA0F675A57BD980B964B2F89B9CCD3CEC6E16FA7A598163E17D422'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.Swap)
    console.log(progress)
  })
  it(`Should check swap unknown TX `, async () => {
    const hash = '508478AC13EA0F675A57BD980B964B2F89B9CCD3CEC6E16FA7A5981XXXXXXXXX'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.Unknown)
    console.log(progress)
  })
  it(`Should check swap from rune to asset `, async () => {
    const hash = 'ED631AF5CB1DD2294220FC62F01F6ECE2343A9ED8DD0B44CE9473A085B41F737'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.Swap)
    console.log(progress)
  })
  it(`Should check add lp asym `, async () => {
    const hash = '1D0CDFFA846D92B71FED3AE18056D1D3C3BD6FA221CC762B463F2CF28DC4D041'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.AddLP)
    console.log(progress)
  })
  it(`Should check add lp sym `, async () => {
    const hash = '95808713ED7B30CAAA2E19B458F581F63F3DB50669972E5B0DCD0402AC3F48F1'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.AddLP)
    console.log(progress)
  })
  it(`Should check add Savers `, async () => {
    const hash = '5DB63D41606C776360D86A8F3809738836F2917A2CE8ACA11F539EFEE9D72572'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.AddSaver)
    console.log(progress)
  })
  it(`Should check withdraw lp `, async () => {
    const hash = '51328FFAE99C0DF15CC5A43E299CDF6556F27B0D4E8F89EE380D5035541863FD'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.WithdrawLP)
    console.log(progress)
  })
  it(`Should check refund tx `, async () => {
    const hash = 'D7096ED62970D7523382ABBAF7D122CF7DD1EB8C4DF442D9E5B77948EB1F6CEC'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.Refund)
    console.log(progress)
  })
  it(`Should check random tx `, async () => {
    const hash = '3D19C242B4136CF6A936AA7FDB4896804BDF21816E9B268DF2696E950DA0A36D'
    const progress = await checkTxStage.checkTxProgress(hash)
    expect(progress?.txType).toBe(TxType.Refund)
    console.log(progress)
  })
})
