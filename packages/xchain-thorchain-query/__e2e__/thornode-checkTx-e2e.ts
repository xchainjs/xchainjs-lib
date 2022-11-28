// import { Network } from '@xchainjs/xchain-client'
// import axios from 'axios'

import { ThorchainCache } from '../src/thorchain-cache'
import { TransactionStage } from '../src/thorchain-checktx'
// import { MidgardConfig } from '../src/types'
// import { Midgard } from '../src/utils/midgard'
// import { Thornode, ThornodeConfig } from '../src/utils/thornode'

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
const liveHash = [
  'E5A760EA5C5C0E89450598A63E65CBCCA71CBC52FBCC94098B85811ACAE0F279', // unkown transaction
  '508478AC13EA0F675A57BD980B964B2F89B9CCD3CEC6E16FA7A598163E17D422', // THOR in and ETH Out
  //  '991DFE33AC4482CC7A1E3BF1142E121A315EED18ED8E8FDDDC678E8F176DFCBA', // THOR in, ETH out
  '619F2005282F3EB501636546A8A3C3375495B0E9F04130D8945A6AF2158966BC', // BTC in, Synth BTC out
]

// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// axios.interceptors.response.use((response) => {
//   console.log('Response:', JSON.stringify(response, null, 2))
//   return response
// })

describe('Thorchain query checkTx Integration Tests', () => {
  //can't use delays inside a async callback :(
  it(`Should check transaction and return the stage`, async () => {
    const txStatus = await checkTxStage.checkTxProgress(liveHash[1], 0)
    console.log(txStatus)
    if (txStatus.progress >= 3) {
      console.log(`Done`, txStatus)
    } else {
      const afterdelay1 = await checkTxStage.checkTxProgress(liveHash[0], txStatus.progress)
      console.log(afterdelay1)
      const afterdelay2 = await checkTxStage.checkTxProgress(liveHash[0], afterdelay1.progress)
      console.log(afterdelay2)
    }
  })
})
